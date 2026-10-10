import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isMissing } from "@/lib/sheets";
import { safeExternalUrl } from "@/lib/site";

export interface DirectoryFilter<T> {
  key: string;
  label: string;
  allLabel: string;
  /** Values this record contributes to the filter options (multi-value fields are split on commas). */
  values: (record: T) => string[];
}

const PAGE_SIZE = 12;

const fieldClass =
  "mt-2 block w-full max-w-full border border-input bg-background px-3 py-2.5 text-base font-normal text-foreground md:text-[13px] max-[450px]:px-2";

export const Tags = ({ items }: { items: string[] }) => {
  const visible = items.filter((item) => !isMissing(item));
  if (!visible.length) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {visible.map((item) => (
        <span key={item} className="border border-border px-2 py-0.5 text-[10px] leading-normal text-muted-foreground">
          {item}
        </span>
      ))}
    </div>
  );
};

export const Meta = ({ label, value }: { label: string; value?: string }) =>
  isMissing(value) ? null : (
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
      <b className="text-foreground">{label}</b> {value}
    </p>
  );

/** External link from remote data. Unsafe or missing URLs render nothing. */
export const SourceLink = ({ href, children }: { href?: string; children: ReactNode }) => {
  const safe = safeExternalUrl(href);
  if (!safe) return null;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className="text-link text-xs">
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
};

/** Two-column directory entry: identity and facts on the left, description and links on the right. */
export const DirectoryItem = ({ aside, children }: { aside: ReactNode; children: ReactNode }) => (
  <article className="directory-item grid min-w-0 grid-cols-1 gap-4 border-b border-border py-6 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.45fr)] md:gap-10 md:py-7">
    <div className="min-w-0">{aside}</div>
    <div className="flex min-w-0 flex-col text-sm leading-relaxed text-muted-foreground">{children}</div>
  </article>
);

export const EmptyState = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <div className="mt-8 border border-border bg-muted px-5 py-11 text-center md:px-7 md:py-16">
    <span aria-hidden="true" className="mb-4 block text-3xl text-primary">
      ○
    </span>
    <h2 className="mx-auto max-w-[25ch] text-[27px] md:text-3xl">{title}</h2>
    <p className="mx-auto my-5 max-w-[54ch] text-[15px] text-muted-foreground">{text}</p>
    {action}
  </div>
);

const PlainButton = ({ children, onClick, className }: { children: ReactNode; onClick: () => void; className?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn("min-h-11 border-b border-primary bg-transparent px-0 py-2 text-xs text-foreground hover:text-primary", className)}
  >
    {children}
  </button>
);

const OutlineButton = ({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="min-h-11 border border-foreground bg-transparent px-3 text-xs font-semibold text-foreground hover:bg-foreground hover:text-background disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground md:px-4"
  >
    {children}
  </button>
);

export interface DirectoryProps<T> {
  records: T[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  noun: { singular: string; plural: string };
  searchLabel: string;
  searchPlaceholder: string;
  searchText: (record: T) => string;
  filters: DirectoryFilter<T>[];
  renderItem: (record: T) => ReactNode;
  getKey: (record: T) => string;
  /** Extra controls (for example dates) rendered inside the filter grid. */
  extraFilters?: ReactNode;
  /** Controls rendered beside "Clear filters" (for example "Include past events"). */
  inlineControls?: ReactNode;
  /** Additional predicate combined with search and select filters. */
  extraPredicate?: (record: T) => boolean;
  /** Called when "Clear filters" resets everything, so callers can reset their own controls. */
  onReset?: () => void;
  /** Changes whenever caller-owned filters change, so pagination returns to page 1. */
  extraKey?: string;
  sourceNote?: ReactNode;
}

export function Directory<T>({
  records,
  isLoading,
  error,
  onRetry,
  noun,
  searchLabel,
  searchPlaceholder,
  searchText,
  filters,
  renderItem,
  getKey,
  extraFilters,
  inlineControls,
  extraPredicate,
  onReset,
  extraKey = "",
  sourceNote,
}: DirectoryProps<T>) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const countRef = useRef<HTMLParagraphElement>(null);

  const options = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const filter of filters) {
      const values = new Set<string>();
      for (const record of records ?? []) for (const value of filter.values(record)) if (!isMissing(value)) values.add(value);
      result[filter.key] = [...values].sort((a, b) => a.localeCompare(b));
    }
    return result;
  }, [records, filters]);

  // Keep a selection only while the refreshed data still offers it.
  useEffect(() => {
    setSelected((prev) => {
      const next = Object.fromEntries(Object.entries(prev).filter(([key, value]) => !value || options[key]?.includes(value)));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return (records ?? []).filter((record) => {
      if (q && !searchText(record).toLocaleLowerCase().includes(q)) return false;
      for (const filter of filters) {
        const value = selected[filter.key];
        if (value && !filter.values(record).includes(value)) return false;
      }
      return extraPredicate ? extraPredicate(record) : true;
    });
  }, [records, query, selected, filters, searchText, extraPredicate]);

  useEffect(() => setPage(1), [query, selected, extraKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const reset = () => {
    setQuery("");
    setSelected({});
    onReset?.();
  };

  const goTo = (next: number) => {
    setPage(next);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    countRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    countRef.current?.focus({ preventScroll: true });
  };

  const total = records?.length ?? 0;
  let status = "Loading directory…";
  if (!isLoading && error) status = "Directory unavailable";
  else if (!isLoading)
    status = `${filtered.length} of ${total} ${total === 1 ? noun.singular : noun.plural}${
      filtered.length ? ` | Showing ${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)}` : ""
    }`;

  return (
    <div>
      <div className="mb-5 mt-6 flex flex-col items-stretch gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <label className="block min-w-0 flex-1 text-[13px] font-semibold text-foreground md:max-w-[570px]">
          {searchLabel}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn(fieldClass, "py-3")}
          />
        </label>
        <div role="group" aria-label="Display style" className="flex self-start border border-border md:self-auto">
          {(["list", "grid"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={cn(
                "min-h-11 px-4 text-xs capitalize",
                view === mode ? "bg-foreground text-background" : "bg-transparent text-foreground hover:bg-muted",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[375px]:grid-cols-2 md:grid-cols-4 md:gap-3.5">
        {filters.map((filter) => (
          <label key={filter.key} className="block min-w-0 text-[13px] font-semibold text-foreground">
            {filter.label}
            <select
              value={selected[filter.key] ?? ""}
              onChange={(event) => setSelected((prev) => ({ ...prev, [filter.key]: event.target.value }))}
              className={fieldClass}
            >
              <option value="">{filter.allLabel}</option>
              {(options[filter.key] ?? []).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
        {extraFilters}
      </div>

      <div className="mt-5 flex flex-col gap-0 border-b border-border pb-2 md:flex-row md:items-center md:justify-between md:gap-5">
        <p ref={countRef} tabIndex={-1} role="status" className="scroll-anchor my-2 text-[13px] text-muted-foreground md:my-3">
          {status}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 md:justify-end">
          {inlineControls}
          <PlainButton onClick={reset}>Clear filters</PlainButton>
        </div>
      </div>
      {sourceNote && <div className="fine mt-3">{sourceNote}</div>}

      {isLoading && (
        <div aria-hidden="true" className="mt-5 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid gap-4 border-b border-border py-6 md:grid-cols-[0.8fr_1.45fr] md:gap-10">
              <div className="h-6 w-2/3 bg-muted" />
              <div className="space-y-2">
                <div className="h-3 bg-muted" />
                <div className="h-3 w-5/6 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !!error && (
        <EmptyState
          title="The directory could not load."
          text={
            error instanceof Error && error.name === "SheetFormatError"
              ? `${error.message} The listing is paused rather than shown with mismatched fields.`
              : "The source could not be reached. Your filters are kept. Please try again."
          }
          action={<OutlineButton onClick={onRetry}>Retry</OutlineButton>}
        />
      )}

      {!isLoading && !error && total === 0 && (
        <EmptyState title="No entries yet." text="The source directory is currently empty. Please check back later." />
      )}

      {!isLoading && !error && total > 0 && filtered.length === 0 && (
        <EmptyState
          title="No matching results."
          text="Try a broader search or clear the filters."
          action={<OutlineButton onClick={reset}>Clear filters</OutlineButton>}
        />
      )}

      {!isLoading && !error && pageItems.length > 0 && (
        <div
          className={cn(
            "mt-5",
            view === "grid" &&
              "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 [&_.directory-item]:flex [&_.directory-item]:flex-col [&_.directory-item]:gap-4 [&_.directory-item]:border [&_.directory-item]:p-5",
          )}
        >
          {pageItems.map((record) => (
            <div key={getKey(record)} className="contents">
              {renderItem(record)}
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <nav aria-label="Pagination" className="mb-3 mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-5">
          <OutlineButton onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>
            ← Previous
          </OutlineButton>
          <span className="text-[11px] text-muted-foreground md:text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <OutlineButton onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>
            Next →
          </OutlineButton>
        </nav>
      )}
    </div>
  );
}
