import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./term.css";

export const TERM_DEFINITIONS = {
  raas: { label: "Robots as a Service (RaaS)", description: "Access to a robotic system through recurring fees. Check the supplier's quote to see which maintenance, software and support are included." },
  npv: { label: "Net present value (NPV)", description: "Future cash savings minus costs, expressed in today's money using your discount rate. It includes upfront payments. A positive value means the modelled benefits exceed the costs at that rate." },
  payback: { label: "Cash payback", description: "The first month when accumulated savings recover the cash spent. It does not describe the total return, and later costs can make the balance negative again." },
  netCash: { label: "Net cash benefit", description: "Total cash saved minus additional cash spent compared with manual operation over your chosen period. It includes upfront and final payments, without discounting future amounts." },
  discountRate: { label: "Discount rate", description: "The annual return you require when valuing future cash in today's money. Use your organisation's required return if you know it. This is not an extra fee or an assumption that sales will grow." },
  residualValue: { label: "Resale proceeds", description: "Cash you expect to receive from selling the system at the end of the comparison. Use an evidenced resale estimate, rather than its accounting book value. The example assumes zero." },
  ramp: { label: "Ramp-up", description: "The period after deployment when the system gradually reaches the performance you entered. Benefits increase during this time; subscription payments can already be due." },
  escalation: { label: "Annual cost increase", description: "The expected yearly percentage increase in a cost, such as wages or subscription fees. The calculator spreads this increase across the monthly cash flows." },
  baseline: { label: "Manual baseline", description: "The current manual operation used as the point of comparison. The purchase and RaaS cases use the same workload, so their extra costs and savings can be compared fairly." },
  roi: { label: "Return on investment (ROI)", description: "How the benefits of an investment compare with its costs. This calculator shows net cash benefit, payback and net present value so you can assess both the amount and timing of the return." },
} as const;

export type TermKey = keyof typeof TERM_DEFINITIONS;
export interface TermProps { term: TermKey; children?: ReactNode; className?: string }

// The initial render is closed on both server and browser. No portal is emitted by SSR.
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** A short glossary explanation: hover/focus to read, click/tap to keep open. */
export default function Term({ term, children, className = "" }: TermProps) {
  const entry = TERM_DEFINITIONS[term];
  const tooltipId = `${useId()}-term`;
  const trigger = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const pinned = useRef(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== undefined) clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }, []);
  const show = () => { cancelClose(); setOpen(true); };
  const dismiss = useCallback(() => {
    cancelClose();
    pinned.current = false;
    hovered.current = false;
    setOpen(false);
    setPosition(null);
  }, [cancelClose]);
  const leave = () => {
    cancelClose();
    // A short bridge lets the pointer cross the gap into the explanation.
    closeTimer.current = setTimeout(() => {
      if (!pinned.current && !focused.current && !hovered.current) dismiss();
    }, 120);
  };

  useEffect(() => cancelClose, [cancelClose]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !trigger.current?.contains(target) && !tooltip.current?.contains(target)) dismiss();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, dismiss]);

  useClientLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current || !tooltip.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      const margin = 12;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const width = Math.max(0, Math.min(320, viewportWidth - margin * 2));
      tooltip.current.style.width = `${width}px`;
      const height = tooltip.current.getBoundingClientRect().height;
      const preferredTop = anchor.top - height - 8 >= margin ? anchor.top - height - 8 : anchor.bottom + 8;
      const left = Math.max(margin, Math.min(anchor.left + anchor.width / 2 - width / 2, viewportWidth - width - margin));
      const top = Math.max(margin, Math.min(preferredTop, viewportHeight - height - margin));
      setPosition({ left, top, width });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, term]);

  return <>
    <button ref={trigger} type="button" className={`roi-term ${className}`.trim()}
      aria-expanded={open} aria-describedby={open ? tooltipId : undefined}
      onPointerEnter={() => { hovered.current = true; show(); }}
      onPointerLeave={() => { hovered.current = false; leave(); }}
      onFocus={() => { focused.current = true; show(); }}
      onBlur={() => { focused.current = false; leave(); }}
      onClick={() => {
        if (pinned.current) dismiss();
        else { pinned.current = true; show(); }
      }}>
      {children ?? entry.label}
    </button>
    {open && typeof document !== "undefined" && createPortal(
      <div ref={tooltip} id={tooltipId} role="tooltip" className="roi-term-tooltip"
        style={{ left: position?.left ?? 0, top: position?.top ?? 0, width: position?.width, visibility: position ? "visible" : "hidden" }}
        onPointerEnter={() => { hovered.current = true; cancelClose(); }}
        onPointerLeave={() => { hovered.current = false; leave(); }}>
        <strong>{entry.label}</strong>
        <p>{entry.description}</p>
      </div>, document.body,
    )}
  </>;
}
