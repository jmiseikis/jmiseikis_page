import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ENQUIRY_OPTIONS, LINKEDIN_URL, isEnquiryIntent, type EnquiryIntent } from "@/lib/site";
import { Eyebrow, TextLink } from "@/components/site/primitives";

// Cloudflare Turnstile site key - this is a PUBLIC key, safe to include in code
const TURNSTILE_SITE_KEY = "0x4AAAAAACdRLN4Eb1C9KeHc";

// The send-contact-email function accepts up to 2000 characters; the enquiry type is
// prepended to the message so it reaches the inbox without changing the server contract.
const MESSAGE_LIMIT = 2000;
const intentLabel = (intent: EnquiryIntent) => ENQUIRY_OPTIONS.find((o) => o.value === intent)?.label ?? "Other enquiry";
const composeMessage = (intent: EnquiryIntent, message: string) => `Enquiry type: ${intentLabel(intent)}\n\n${message.trim()}`;

const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(100, "Name must be less than 100 characters."),
    email: z.string().trim().email("Please enter a valid email address.").max(255, "Email must be less than 255 characters."),
    organization: z.string().trim().max(100, "Organisation must be less than 100 characters."),
    intent: z.enum(ENQUIRY_OPTIONS.map((o) => o.value) as [EnquiryIntent, ...EnquiryIntent[]]),
    message: z.string().trim().min(10, "Please write at least 10 characters."),
  })
  .superRefine((data, ctx) => {
    if (composeMessage(data.intent, data.message).length > MESSAGE_LIMIT) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Please shorten your message (about 1,900 characters maximum)." });
    }
  });

type FormValues = z.input<typeof contactSchema>;
type FieldErrors = Partial<Record<keyof FormValues | "captcha", string>>;
type Status = { type: "idle" } | { type: "sending" } | { type: "sent" } | { type: "error"; message: string };

const emptyForm: FormValues = { name: "", email: "", organization: "", intent: "advisory", message: "" };

const fieldClass =
  "mt-2 block w-full max-w-full border border-input bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-[15px]";

const Contact = () => {
  const { toast } = useToast();
  const { search } = useLocation();
  const formId = useId();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  // Preselect the purpose from ?enquiry=... without touching anything already typed.
  useEffect(() => {
    const intent = new URLSearchParams(search).get("enquiry");
    if (isEnquiryIntent(intent)) setValues((prev) => (prev.intent === intent ? prev : { ...prev, intent }));
  }, [search]);

  const update = (field: keyof FormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status.type === "sent" || status.type === "error") setStatus({ type: "idle" });
  };

  const resetCaptcha = () => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
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
    if (!captchaToken) nextErrors.captcha = "Please complete the verification check.";
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
      setStatus({
        type: "error",
        message: "Your message could not be sent. Please try again, or contact me via LinkedIn.",
      });
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

  return (
    <section id="contact" className="section-y border-t-[3px] border-primary bg-muted">
      <div className="site-wrap grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-20">
        <div>
          <Eyebrow>Start with your priorities</Eyebrow>
          <h2 className="h2 max-w-[19ch]">What decision are you working towards?</h2>
          <p className="lead mt-5">
            Tell me about your objectives and timing. We can define a focused project, recurring support or a speaking
            engagement.
          </p>
          <p className="mt-5 text-muted-foreground">Based in Switzerland. Working internationally in English.</p>
          <div className="mt-5">
            <TextLink href={LINKEDIN_URL}>Connect on LinkedIn</TextLink>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-describedby={`${formId}-required`} className="flex min-w-0 flex-col gap-5">
          <p id={`${formId}-required`} className="fine">
            Fields marked * are required.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor={`${formId}-name`} className="block text-[13px] font-semibold text-foreground">
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
              <label htmlFor={`${formId}-email`} className="block text-[13px] font-semibold text-foreground">
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
            <label htmlFor={`${formId}-organization`} className="block text-[13px] font-semibold text-foreground">
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
            <label htmlFor={`${formId}-intent`} className="block text-[13px] font-semibold text-foreground">
              Enquiry type
            </label>
            <select id={`${formId}-intent`} name="intent" value={values.intent} onChange={update("intent")} className={fieldClass}>
              {ENQUIRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${formId}-message`} className="block text-[13px] font-semibold text-foreground">
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
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => {
                setCaptchaToken(token);
                setErrors((prev) => ({ ...prev, captcha: undefined }));
              }}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
            <ErrorText field="captcha" />
          </div>

          <button
            type="submit"
            disabled={status.type === "sending"}
            className="inline-flex min-h-12 items-center justify-between gap-5 self-start border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-90 disabled:cursor-wait disabled:opacity-60 max-[374px]:w-full"
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
          <div aria-live="assertive">
            {status.type === "error" && (
              <div role="alert" className="border-l-2 border-destructive bg-background p-5">
                <p className="font-semibold text-foreground">{status.message}</p>
                <div className="mt-3">
                  <TextLink href={LINKEDIN_URL}>Contact via LinkedIn</TextLink>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
