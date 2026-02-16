import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  organization: z.string().max(100).optional(),
  message: z.string().trim().min(10).max(2000),
  captchaToken: z.string().min(1, "CAPTCHA verification required")
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

// Sanitize HTML to prevent injection
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Verify Cloudflare Turnstile token
async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
               req.headers.get("x-real-ip") || 
               "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.log("Rate limit exceeded for IP:", ip);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data",
          details: validationResult.error.errors[0].message 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, organization, message, captchaToken } = validationResult.data;

    // Verify CAPTCHA
    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      console.log("CAPTCHA verification failed for IP:", ip);
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed. Please try again." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing contact form submission");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Unable to process request. Please try again later." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize all user inputs for HTML email
    const sanitizedName = sanitizeHtml(name);
    const sanitizedEmail = sanitizeHtml(email);
    const sanitizedOrg = organization ? sanitizeHtml(organization) : null;
    const sanitizedMessage = sanitizeHtml(message).replace(/\n/g, '<br>');

    // Use Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["j.miseikis@gmail.com"],
        reply_to: email,
        subject: "PERSONAL WEBSITE CONTACT",
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          ${sanitizedOrg ? `<p><strong>Organization:</strong> ${sanitizedOrg}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage}</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Unable to send message. Please try again later." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process request. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
