import { useCallback, useMemo, useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactCta, PageHero } from "@/components/site/primitives";
import { Directory, DirectoryItem, Meta, SourceLink, Tags, type DirectoryFilter } from "@/components/site/Directory";
import CalendarDropdown from "@/components/tech-events/CalendarDropdown";
import { useEventsDirectory } from "@/hooks/use-directory";
import { compareEvents, isPastEvent, zurichToday, type TechEventRecord } from "@/lib/sheets";

const formatDay = (iso: string) => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const dateRange = (event: TechEventRecord) => {
  if (!event.startDate) return "Date to confirm";
  const start = formatDay(event.startDate);
  return event.finishDate && event.finishDate !== event.startDate ? `${start} - ${formatDay(event.finishDate)}` : start;
};

const BASE_FILTERS: DirectoryFilter<TechEventRecord>[] = [
  { key: "category", label: "Categories", allLabel: "All categories", values: (e) => [e.category] },
  { key: "size", label: "Sizes", allLabel: "All sizes", values: (e) => [e.size] },
  { key: "canton", label: "Cantons", allLabel: "All cantons", values: (e) => [e.canton] },
  { key: "scope", label: "Scopes", allLabel: "All scopes", values: (e) => [e.scope] },
];
// Only offered if the source sheet regains a ticket price column; missing prices are never treated as free.
const PRICE_FILTER: DirectoryFilter<TechEventRecord> = {
  key: "ticketPrice",
  label: "Tickets",
  allLabel: "All ticket types",
  values: (e) => [e.ticketPrice ?? ""],
};

const searchText = (e: TechEventRecord) => [e.name, e.description, e.location, e.category, e.targetAudience, e.scope].join(" ");

const dateInputClass =
  "mt-2 block w-full max-w-full border border-input bg-background px-3 py-2 text-base font-normal text-foreground md:text-[13px]";

const TechEvents = () => {
  const { data, isLoading, error, refetch } = useEventsDirectory();
  const [showPast, setShowPast] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const today = zurichToday();

  const events = useMemo(() => (data ? [...data.events].sort(compareEvents) : undefined), [data]);
  const filters = useMemo(() => (data?.hasTicketPrice ? [...BASE_FILTERS, PRICE_FILTER] : BASE_FILTERS), [data?.hasTicketPrice]);
  const pastCount = useMemo(() => (events ?? []).filter((e) => isPastEvent(e, today)).length, [events, today]);

  const predicate = useCallback(
    (event: TechEventRecord) => {
      if (!showPast && isPastEvent(event, today)) return false;
      const end = event.finishDate || event.startDate;
      if ((from || to) && !event.startDate) return false;
      if (from && end < from) return false;
      if (to && event.startDate > to) return false;
      return true;
    },
    [showPast, today, from, to],
  );

  const resetExtra = useCallback(() => {
    setShowPast(false);
    setFrom("");
    setTo("");
  }, []);

  const renderItem = useCallback(
    (event: TechEventRecord) => {
      const past = isPastEvent(event, today);
      return (
        <DirectoryItem
          aside={
            <>
              <Tags items={[event.category, event.startDate ? (past ? "Past event" : "Upcoming") : "Date to confirm", event.scope]} />
              <h2 className="text-[22px] md:text-[23px]">{event.name}</h2>
              <Meta label="Date:" value={dateRange(event)} />
              <Meta label="Location:" value={event.location} />
              <Meta label="Size:" value={event.size} />
              {event.ticketPrice !== undefined && <Meta label="Tickets:" value={event.ticketPrice} />}
            </>
          }
        >
          <p>{event.description}</p>
          <Meta label="Audience:" value={event.targetAudience} />
          {event.sourceVariants?.length ? (
            <p className="fine mt-2">
              Listed {event.sourceVariants.length + 1} times in the source with the same name, dates and website; shown once
              here.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <SourceLink href={event.officialUrl}>Event website</SourceLink>
            {event.startDate && !past && (
              <CalendarDropdown
                variant="text"
                event={{
                  name: event.name,
                  startDate: event.startDate,
                  finishDate: event.finishDate || event.startDate,
                  location: event.location,
                  description: event.description,
                  officialUrl: event.officialUrl,
                }}
              />
            )}
          </div>
        </DirectoryItem>
      );
    },
    [today],
  );

  return (
    <SiteLayout path="/tech-events">
      <PageHero
        breadcrumb={{ to: "/resources", label: "Resources" }}
        eyebrow="Resources | Swiss ecosystem"
        title="Swiss technology events."
        lead="Conferences, summits and ecosystem gatherings across Switzerland. Plan your research, meetings and local presence."
      />
      <section className="site-wrap pb-12 pt-4 md:pb-20" aria-label="Event directory">
        <Directory
          records={events}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          noun={{ singular: "event", plural: "events" }}
          searchLabel="Search events"
          searchPlaceholder="Event, topic or location"
          searchText={searchText}
          filters={filters}
          getKey={(e) => `${e.name}|${e.startDate}|${e.officialUrl}`}
          renderItem={renderItem}
          extraPredicate={predicate}
          extraKey={`${showPast}|${from}|${to}`}
          onReset={resetExtra}
          extraFilters={
            <>
              <label className="block min-w-0 text-[13px] font-semibold text-foreground">
                From
                <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={dateInputClass} />
              </label>
              <label className="block min-w-0 text-[13px] font-semibold text-foreground">
                To
                <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={dateInputClass} />
              </label>
            </>
          }
          inlineControls={
            <label className="flex min-h-11 items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={showPast}
                onChange={(e) => setShowPast(e.target.checked)}
                className="h-[18px] w-[18px] accent-[hsl(var(--primary))]"
              />
              Include past events{pastCount ? ` (${pastCount})` : ""}
            </label>
          }
          sourceNote={
            <p>
              Live data from the existing event database. Upcoming and past events follow Zurich calendar dates. Confirm
              schedules, tickets and participation directly with organisers.
            </p>
          }
        />
        <p className="fine mt-6 max-w-[80ch]">
          Entries with the same name, dates and website are shown once; every source row is kept in the database.
          {data && !data.hasTicketPrice && " The source currently has no ticket price field, so prices are not shown or filtered."}
        </p>
      </section>
      <ContactCta
        title="Planning your Swiss conference presence?"
        lead="Agree a brief for local attendance, company representation, technical messaging and follow-up. Sponsorship, access and speaking opportunities depend on organisers."
        intent="representation"
        label="Discuss event representation"
      />
    </SiteLayout>
  );
};

export default TechEvents;
