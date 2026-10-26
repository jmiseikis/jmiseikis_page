import { useEffect, useId, useState } from "react";
import PageMeta, { type RoutePath } from "@/components/site/PageMeta";
import { Actions, ButtonLink, PageHero, TextLink } from "@/components/site/primitives";
import { WORKSHEETS, worksheetPath, worksheetPdf, type WorksheetField, type WorksheetSlug } from "@/content/worksheets";
import { contactPath } from "@/lib/site";
import { cn } from "@/lib/utils";

type Row = Record<string, string>;
type Answers = Record<string, string | boolean | Row[]>;

const MAX_ROWS = 25;
const storageKey = (slug: WorksheetSlug) => `jm-worksheet:${slug}:v1`;

// Answers stay in this browser only. Storage can be unavailable (private windows, blocked site data).
const load = (slug: WorksheetSlug): Answers => {
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};
const save = (slug: WorksheetSlug, answers: Answers) => {
  try {
    if (Object.keys(answers).length) window.localStorage.setItem(storageKey(slug), JSON.stringify(answers));
    else window.localStorage.removeItem(storageKey(slug));
    return true;
  } catch {
    return false;
  }
};

const inputClass =
  "block w-full border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring md:text-sm";
// On paper, text fields print as ruled boxes with the answer, since textareas cannot grow when printed.
const printBox = "hidden whitespace-pre-wrap border border-border px-3 py-2 text-sm text-foreground print:block";

const FieldHead = ({ id, label, prompt }: { id?: string; label: string; prompt?: string }) => (
  <>
    <h2 id={id} className="text-[20px] leading-tight md:text-[22px] print:text-base">
      {label}
    </h2>
    {prompt && <p className="mt-1.5 max-w-[70ch] text-sm text-muted-foreground print:text-xs">{prompt}</p>}
  </>
);

const WorksheetPage = ({ slug }: { slug: WorksheetSlug }) => {
  const sheet = WORKSHEETS[slug];
  const formId = useId();
  const [answers, setAnswers] = useState<Answers>(() => load(slug));
  const [saved, setSaved] = useState<boolean | null>(null);

  useEffect(() => {
    setSaved(save(slug, answers));
  }, [slug, answers]);

  const text = (key: string) => (typeof answers[key] === "string" ? (answers[key] as string) : "");
  const rows = (key: string) => (Array.isArray(answers[key]) ? (answers[key] as Row[]) : []);
  const set = (key: string, value: Answers[string]) =>
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      if (value === "" || value === false || (Array.isArray(value) && value.length === 0)) delete next[key];
      return next;
    });

  const clear = () => {
    if (window.confirm("Clear all answers on this worksheet? This cannot be undone.")) setAnswers({});
  };

  const renderField = (field: WorksheetField) => {
    const headId = `${formId}-${field.id}`;
    switch (field.type) {
      case "text": {
        const value = text(field.id);
        return (
          <section key={field.id} aria-labelledby={headId} className="break-inside-avoid">
            <FieldHead id={headId} label={field.label} prompt={field.prompt} />
            <textarea
              aria-labelledby={headId}
              rows={field.rows ?? 4}
              value={value}
              onChange={(e) => set(field.id, e.target.value)}
              className={cn(inputClass, "mt-3 resize-y print:hidden")}
            />
            <div className={printBox} style={{ minHeight: `${(field.rows ?? 4) * 1.6}rem` }}>
              {value}
            </div>
          </section>
        );
      }
      case "choice": {
        const value = text(field.id);
        return (
          <fieldset key={field.id} className="min-w-0 break-inside-avoid">
            <legend className="p-0">
              <FieldHead label={field.label} prompt={field.prompt} />
            </legend>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {field.options.map((option) => (
                <label key={option} className="inline-flex min-h-11 items-center gap-2 text-sm text-foreground print:min-h-0">
                  <input
                    type="radio"
                    name={`${formId}-${field.id}`}
                    value={option}
                    checked={value === option}
                    onChange={() => set(field.id, option)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        );
      }
      case "checklist":
        return (
          <fieldset key={field.id} className="min-w-0">
            <legend className="p-0">
              <FieldHead label={field.label} prompt={field.prompt} />
            </legend>
            <ul className="mt-3 list-none space-y-3 p-0">
              {field.items.map((item, index) => {
                const key = `${field.id}.${index}`;
                const note = text(`${key}.note`);
                const checkId = `${formId}-${key}`;
                return (
                  <li key={key} className="break-inside-avoid border-b border-border pb-3">
                    <label htmlFor={checkId} className="flex items-start gap-3 text-[15px] text-foreground print:text-sm">
                      <input
                        id={checkId}
                        type="checkbox"
                        checked={answers[key] === true}
                        onChange={(e) => set(key, e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                      />
                      <span>{item}</span>
                    </label>
                    <input
                      type="text"
                      aria-label={`Notes: ${item}`}
                      placeholder="Evidence received, gaps, next request"
                      value={note}
                      onChange={(e) => set(`${key}.note`, e.target.value)}
                      className={cn(inputClass, "ml-7 mt-2 w-[calc(100%-1.75rem)] py-1.5 print:hidden")}
                    />
                    <div className={cn(printBox, "ml-7 min-h-[1.6rem] py-1")}>{note}</div>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      case "rows": {
        const current = rows(field.id);
        const shown = current.length ? current : [{}];
        const filled = current.filter((row) => Object.values(row).some(Boolean));
        const printed = filled.length ? filled : Array.from({ length: field.blankRows }, () => ({}) as Row);
        const update = (index: number, column: string, value: string) => {
          const next = shown.map((row, i) => (i === index ? { ...row, [column]: value } : row));
          set(field.id, next.some((row) => Object.values(row).some(Boolean)) ? next : []);
        };
        return (
          <section key={field.id} aria-labelledby={headId}>
            <FieldHead id={headId} label={field.label} prompt={field.prompt} />
            <ol className="mt-3 list-none space-y-4 p-0 print:hidden">
              {shown.map((row, index) => (
                <li key={index} className="border border-border p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold">
                      {field.label}: entry {index + 1}
                    </h3>
                    {shown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set(field.id, shown.filter((_, i) => i !== index))}
                        className="min-h-11 text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                      >
                        Remove entry {index + 1}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {field.columns.map((column) => {
                      const id = `${formId}-${field.id}-${index}-${column.id}`;
                      return (
                        <div key={column.id} className="min-w-0">
                          <label htmlFor={id} className="mb-1 block text-xs font-semibold text-foreground">
                            {column.label}
                          </label>
                          {column.options ? (
                            <select
                              id={id}
                              value={row[column.id] ?? ""}
                              onChange={(e) => update(index, column.id, e.target.value)}
                              className={cn(inputClass, "min-h-10")}
                            >
                              <option value="">Select</option>
                              {column.options.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={id}
                              type="text"
                              value={row[column.id] ?? ""}
                              onChange={(e) => update(index, column.id, e.target.value)}
                              className={cn(inputClass, "min-h-10")}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
            {shown.length < MAX_ROWS && (
              <button
                type="button"
                onClick={() => set(field.id, [...shown, {}])}
                className="mt-3 min-h-11 border-b border-primary text-sm text-foreground hover:text-primary print:hidden"
              >
                Add another entry
              </button>
            )}
            {/* Printed as compact label/value boxes, blank rows when nothing has been entered. */}
            <div className="mt-3 hidden space-y-2 print:block">
              {printed.map((row, index) => (
                <div key={index} className="break-inside-avoid border border-border">
                  <div className="grid grid-cols-2">
                    {field.columns.map((column) => (
                      <div key={column.id} className="min-h-[2.4rem] border-b border-r border-border px-2 py-1 text-xs">
                        <span className="block text-[9px] uppercase tracking-wide text-muted-foreground">{column.label}</span>
                        {row[column.id] ?? (column.options ? column.options.join(" / ") : "")}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }
    }
  };

  const header = [
    { key: "meta.project", label: "Company or project", type: "text" },
    { key: "meta.owner", label: "Prepared by", type: "text" },
    { key: "meta.date", label: "Date", type: "date" },
  ];

  return (
    <>
      <PageMeta path={worksheetPath(slug) as RoutePath} />
      <p className="site-wrap hidden pt-2 text-[10px] text-muted-foreground print:block">
        Dr. Justinas Mišeikis | jmiseikis.com{worksheetPath(slug)} | Working template, October 2026
      </p>
      <PageHero
        breadcrumb={{ to: sheet.guide.href, label: sheet.guide.label }}
        eyebrow="Working template"
        title={`${sheet.title}.`}
        lead={sheet.lead}
      >
        <div className="print:hidden">
          <Actions>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Print or save as PDF
            </button>
            <ButtonLink href={worksheetPdf(slug)} download variant="secondary">
              Download printable PDF
            </ButtonLink>
          </Actions>
          <p className="fine mt-5 max-w-[70ch]" role="status">
            {saved === false
              ? "Your browser is not saving answers here, so print or save the page before you leave."
              : "Answers are saved in this browser only. Nothing is sent to the website."}
          </p>
        </div>
      </PageHero>

      <form
        aria-label={sheet.title}
        onSubmit={(e) => e.preventDefault()}
        className="site-wrap space-y-10 pb-14 pt-10 md:pb-20 print:space-y-5 print:pb-0 print:pt-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 print:grid-cols-3">
          {header.map((item) => {
            const id = `${formId}-${item.key}`;
            return (
              <div key={item.key} className="min-w-0">
                <label htmlFor={id} className="mb-1 block text-xs font-semibold text-foreground">
                  {item.label}
                </label>
                <input
                  id={id}
                  type={item.type}
                  value={text(item.key)}
                  onChange={(e) => set(item.key, e.target.value)}
                  className={cn(inputClass, "min-h-10 print:hidden")}
                />
                <div className={cn(printBox, "min-h-[2rem]")}>{text(item.key)}</div>
              </div>
            );
          })}
        </div>

        {sheet.fields.map(renderField)}

        <p className="fine max-w-[70ch] border-l-[3px] border-primary pl-4">{sheet.note}</p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Print or save as PDF
          </button>
          <button
            type="button"
            onClick={clear}
            className="min-h-11 text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Clear answers
          </button>
          <TextLink href={sheet.guide.href}>Back to the {sheet.guide.label}</TextLink>
        </div>

        <div className="border-l-[3px] border-primary bg-muted px-5 py-5 md:px-7 print:hidden">
          <h2 className="text-lg leading-tight">Discuss this brief</h2>
          <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
            In the contact form, describe the decision, your main uncertainty and your timing. Your answers on this page
            are not copied into the form or sent anywhere.
          </p>
          <ButtonLink href={contactPath(sheet.intent)} className="mt-4">
            Discuss this brief
          </ButtonLink>
        </div>
      </form>
    </>
  );
};

export default WorksheetPage;
