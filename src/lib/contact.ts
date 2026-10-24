import { ENQUIRY_OPTIONS, type EnquiryIntent } from "@/lib/site";

// The send-contact-email function accepts up to 2000 characters. The enquiry type is prepended to the
// message so it reaches the inbox without changing the server contract.
export const MESSAGE_LIMIT = 2000;

const intentLabel = (intent: EnquiryIntent) =>
  ENQUIRY_OPTIONS.find((option) => option.value === intent)?.label ?? "Other enquiry";

export const composeMessage = (intent: EnquiryIntent, message: string) =>
  `Enquiry type: ${intentLabel(intent)}\n\n${message.trim()}`;
