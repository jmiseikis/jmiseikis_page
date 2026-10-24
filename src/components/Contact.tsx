import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { z } from "zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ENQUIRY_OPTIONS, LINKEDIN_URL, isEnquiryIntent, type EnquiryIntent } from "@/lib/site";
import { MESSAGE_LIMIT, composeMessage } from "@/lib/contact";
import { Eyebrow, TextLink } from "@/components/site/primitives";

// Cloudflare Turnstile site key - this is a PUBLIC key, safe to include in code
const TURNSTILE_SITE_KEY = "0x4AAAAAACdRLN4Eb1C9KeHc";


const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(100, "Name must be less than 100 characters."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(255, "Email must be less than 255 characters."),
    organization: z.string().trim().max(100, "Organisation must be less than 100 characters."),
    intent: z.enum(ENQUIRY_OPTIONS.map((option) => option.value) as [EnquiryIntent, ...EnquiryIntent[]]),
    message: z.string().trim().min(10, "Please write at least 10 characters."),
  })
  .superRefine((data, ctx) => {
    if (composeMessage(data.intent, data.message).length > MESSAGE_LIMIT) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Please shorten your message (about 1,900 characters maximum).",
      });
    }
  });

type FormValues = z.input<typeof contactSchema>;
type FieldErrors = Partial<Record<keyof FormValues | "captcha", string>>;
type Status = { type: "idle" } | { type: "sending" } | { type: "sent" } | { type: "error" };

const emptyForm: FormValues = { name: "", email: "", organization: "", intent: "advisory", message: "" };

const fieldClass =
  "mt-2 block w-full max-w-full border border-input bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground md:text-[15px]";

const Contact = () => {
  const { toast } = useToast();
  const { search } = useLocation();
  const { resolvedTheme } = useTheme();
  const formId = useId();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // The spam check could not run at all (script blocked, or this hostname not allowed for the site key).
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  // The widget follows the site theme, not the device setting. It renders again when the theme changes,
  // which needs a fresh check.
  const widgetTheme = resolvedTheme === "dark" ? "dark" : "light";
  const renderedTheme = useRef(widgetTheme);
  useEffect(() => {
    if (renderedTheme.current === widgetTheme) return;
    renderedTheme.current = widgetTheme;
    setCaptchaToken(null);
  }, [widgetTheme]);

  // Preselect the purpose from ?enquiry=... without touching anything already typed. Unknown values are ignored.
  useEffect(() => {
    const intent = new URLSearchParams(search).get("enquiry");
    if (isEnquiryIntent(intent)) setValues((prev) => (prev.intent === intent ? prev : { ...prev, intent }));
  }, [search]);

  const update =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      if (status.type === "sent" || status.type === "error") setStatus({ type: "idle" });
    };

  const resetCaptcha = () => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  // errorCode is Cloudflare's code, e.g. 110200 = this hostname is not allowed for the site key.
  const handleTurnstileError = (errorCode?: string) => {
    console.error("Turnstile error:", errorCode ?? "script failed to load");
    setCaptchaToken(null);
    setCaptchaFailed(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = contactSchema.safeParse(values);
    const nextErrors: FieldErrors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
    }
    if (!captchaToken && !captchaFailed) nextErrors.captcha = "Please complete the verification check.";
    setErrors(nextErrors);
    if (!result.success || !captchaToken) {
      const first = Object.keys(nextErrors)[0];
      if (first && first !== "captcha") document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }

    setStatus({ type: "sending" });
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: result.data.name,
          email: result.data.email,
          organization: result.data.organization || undefined,
          message: composeMessage(result.data.intent, result.data.message),
          captchaToken,
        },
      });
      if (error) throw error;

      setStatus({ type: "sent" });
      toast({ title: "Message sent", description: "Thank you for getting in touch. I will reply as soon as I can." });
      setValues((prev) => ({ ...emptyForm, intent: prev.intent }));
      resetCaptcha();
    } catch (error) {
      // Never log form contents.
      console.error("Contact form submission failed", error instanceof Error ? error.message : "unknown error");
      setStatus({ type: "error" });
      // Turnstile tokens are single-use; request a fresh check before retrying.
      resetCaptcha();
    }
  };

  const describedBy = (field: keyof FieldErrors, extra?: string) =>
    [errors[field] ? `${formId}-${field}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  const ErrorText = ({ field }: { field: keyof FieldErrors }) =>
    errors[field] ? (
      <p id={`${formId}-${field}-error`} className="mt-2 text-sm font-medium text-destructive">
        {errors[field]}
      </p>
    ) : null;

  const label = "block text-[13px] font-semibold text-foreground";

  return (
    <section id="contact" className="section-y border-t-[3px] border-primary bg-muted" aria-labelledby="contact-title">
      <div className="site-wrap grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-20">
        <div>
          <Eyebrow>Start with your priorities</Eyebrow>
          <h2 id="contact-title" className="h2 max-w-[19ch]">
            What decision are you working towards?
          </h2>
          <p className="lead mt-5">
            Tell me about your objectives and timing. We can define a focused project, recurring support or a speaking
            engagement.
          </p>
          <p className="mt-5 text-muted-foreground">Based in Switzerland. Working internationally in English.</p>
          <div className="mt-5">
            <TextLink href={LINKEDIN_URL}>Connect on LinkedIn</TextLink>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Contact form"
          aria-describedby={`${formId}-required`}
          className="flex min-w-0 flex-col gap-5"
        >
          <p id={`${formId}-required`} className="fine">
            Fields marked * are required.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor={`${formId}-name`} className={label}>
                Name <span aria-hidden="true">*</span>
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={describedBy("name")}
                value={values.name}
                onChange={update("name")}
                className={fieldClass}
              />
              <ErrorText field="name" />
            </div>
            <div className="min-w-0">
              <label htmlFor={`${formId}-email`} className={label}>
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={describedBy("email")}
                value={values.email}
                onChange={update("email")}
                className={fieldClass}
              />
              <ErrorText field="email" />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-organization`} className={label}>
              Organisation
            </label>
            <input
              id={`${formId}-organization`}
              name="organization"
              autoComplete="organization"
              aria-invalid={!!errors.organization}
              aria-describedby={describedBy("organization")}
              value={values.organization}
              onChange={update("organization")}
              className={fieldClass}
            />
            <ErrorText field="organization" />
          </div>

          <div>
            <label htmlFor={`${formId}-intent`} className={label}>
              Enquiry type
            </label>
            <select
              id={`${formId}-intent`}
              name="intent"
              value={values.intent}
              onChange={update("intent")}
              className={fieldClass}
            >
              {ENQUIRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${formId}-message`} className={label}>
              Message <span aria-hidden="true">*</span>
            </label>
            <textarea
              id={`${formId}-message`}
              name="message"
              rows={6}
              required
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={describedBy("message", `${formId}-message-help`)}
              value={values.message}
              onChange={update("message")}
              className={cn(fieldClass, "resize-y")}
            />
            <p id={`${formId}-message-help`} className="fine mt-2">
              What would you like to achieve, and when? For speaking, include your event date, location or format, and
              audience. Please do not include confidential data in a first message.
            </p>
            <ErrorText field="message" />
          </div>

          <div>
            <Turnstile
              key={widgetTheme}
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              options={{ theme: widgetTheme }}
              onSuccess={(token) => {
                setCaptchaToken(token);
                setCaptchaFailed(false);
                setErrors((prev) => ({ ...prev, captcha: undefined }));
              }}
              onExpire={() => setCaptchaToken(null)}
              onError={handleTurnstileError}
              scriptOptions={{ onError: () => handleTurnstileError() }}
            />
            <ErrorText field="captcha" />
            {captchaFailed && (
              <p role="alert" className="mt-2 max-w-md text-sm text-destructive">
                The spam check could not load, so the form cannot be sent right now. Please try again later or{" "}
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  message me on LinkedIn
                </a>
                .
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status.type === "sending"}
            className="inline-flex min-h-12 items-center justify-between gap-5 self-start border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-wait disabled:opacity-60 max-[374px]:w-full"
          >
            {status.type === "sending" ? "Sending…" : "Send enquiry"}
            <span aria-hidden="true" className="text-[19px] leading-none">
              ↗
            </span>
          </button>

          <div aria-live="polite" role="status">
            {status.type === "sent" && (
              <div className="border-l-2 border-primary bg-background p-5">
                <p className="font-semibold text-foreground">Thank you. Your message has been sent.</p>
                <p className="mt-2 text-sm text-muted-foreground">I will reply to the email address you provided.</p>
              </div>
            )}
          </div>
          {status.type === "error" && (
            <div role="alert" className="border-l-2 border-destructive bg-background p-5">
              <p className="font-semibold text-foreground">
                Your message could not be sent. Please try again, or contact me via LinkedIn.
              </p>
              <div className="mt-3">
                <TextLink href={LINKEDIN_URL}>Contact via LinkedIn</TextLink>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
