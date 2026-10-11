import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink, Filter, List, LayoutGrid, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CalendarDropdown from "@/components/tech-events/CalendarDropdown";
import DateRangeFilter from "@/components/tech-events/DateRangeFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTechEvents } from "@/hooks/use-tech-events";
import { SheetFormatError, isPastEvent, zurichToday } from "@/lib/sheets";

// Only allow http(s) links so a compromised sheet can't inject `javascript:` URLs.
const isSafeUrl = (url: string | undefined | null): url is string =>
  !!url && url !== "[URL]" && /^https?:\/\//i.test(url);

const categoryColors: Record<string, string> = {
  "Industry": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Startup": "bg-green-500/10 text-green-600 border-green-200",
  "Research": "bg-purple-500/10 text-purple-600 border-purple-200",
  "Other": "bg-orange-500/10 text-orange-600 border-orange-200",
};

const sizeColors: Record<string, string> = {
  "Small": "bg-muted text-muted-foreground",
  "Medium": "bg-primary/10 text-primary",
  "Large": "bg-primary/20 text-primary font-semibold",
};

// A date picked in the date range filter, as a YYYY-MM-DD calendar date.
const toCalendarDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const TechEvents = () => {
  const { data, isPending, fetchStatus, error: loadError, refetch, isFetching } = useTechEvents();
  const events = useMemo(() => data?.events ?? [], [data]);
  const hasTicketPrice = data?.hasTicketPrice ?? false;
  const combinedRows = data ? data.sourceCount - data.events.length : 0;
  // React Query pauses the request while the browser is offline; it resumes when the connection is back.
  const offline = isPending && fetchStatus === "paused";
  const loading = isPending && !offline;
  // Keep showing cached events if a background refresh fails.
  const error = data
    ? null
    : loadError instanceof SheetFormatError
      ? "The events directory has changed format and cannot be shown right now."
      : loadError
        ? "Failed to load events. Please try again later."
        : offline
          ? "You appear to be offline. The events will load when your connection is back."
          : null;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO: title, description, canonical, OG/Twitter tags, JSON-LD
  useEffect(() => {
    const TITLE = "Tech Events Switzerland 2026 | AI and Robotics";
    const DESC = "Curated 2026 Swiss tech events calendar for AI, robotics, deep tech, startups, and VCs. Filter by topic, city and date.";
    const URL = "https://jmiseikis.lovable.app/tech-events";
    const prev = document.title;
    document.title = TITLE;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", DESC);
    setMeta("keywords", "tech events Switzerland 2026, AI conferences Switzerland, robotics events Zurich, startup events Switzerland, VC events Zurich, deep tech conferences Europe, tech calendar Switzerland, GenAI Zürich, Web Summit Europe, Davos WEF 2026, tech meetups Zurich Geneva Lausanne Basel");
    setMeta("og:title", TITLE, "property");
    setMeta("og:description", DESC, "property");
    setMeta("og:url", URL, "property");
    setMeta("og:type", "website", "property");
    const techEventsOg = (() => {
      const pid = (import.meta as unknown as { env: { VITE_SUPABASE_PROJECT_ID?: string } }).env.VITE_SUPABASE_PROJECT_ID;
      if (!pid) return "https://jmiseikis.lovable.app/og-image.png";
      const p = new URLSearchParams({
        title: "Tech Events Switzerland 2026",
        subtitle: "AI · ROBOTICS · DEEP TECH · STARTUPS",
      });
      return `https://${pid}.supabase.co/functions/v1/og-image?${p.toString()}`;
    })();
    setMeta("og:image", techEventsOg, "property");
    setMeta("twitter:image", techEventsOg);
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", TITLE);
    setMeta("twitter:description", DESC);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = URL;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Tech Events Switzerland 2026",
      "url": URL,
      "description": DESC,
      "isPartOf": { "@type": "WebSite", "name": "Dr. Justinas Mišeikis", "url": "https://jmiseikis.lovable.app" },
      "about": ["AI conferences", "Robotics events", "Startup events", "Venture capital events", "Deep tech"],
      "inLanguage": "en"
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);

    return () => { document.title = prev; s.remove(); };
  }, []);

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(events.map(e => e.category).filter(Boolean))];
    const sizes = [...new Set(events.map(e => e.size).filter(Boolean))];
    const locations = [...new Set(events.map(e => e.canton).filter(Boolean))];
    const scopes = [...new Set(events.map(e => e.scope).filter(Boolean))];
    
    return { categories, sizes, locations, scopes };
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    const today = zurichToday();

    return events.filter(event => {
      // Hide past events unless toggled (an event is past once its finish date is before today in Zurich)
      if (!showPastEvents && isPastEvent(event, today)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!event.name.toLowerCase().includes(query) &&
            !event.description.toLowerCase().includes(query) &&
            !event.location.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Category filter
      if (categoryFilter !== "all" && event.category !== categoryFilter) return false;
      
      // Size filter
      if (sizeFilter !== "all" && event.size !== sizeFilter) return false;
      
      // Location filter
      if (locationFilter !== "all" && event.canton !== locationFilter) return false;
      
      // Scope filter
      if (scopeFilter !== "all" && event.scope !== scopeFilter) return false;
      
      // Price filter (only offered when the sheet has a ticket price column)
      if (hasTicketPrice && priceFilter !== "all") {
        const price = (event.ticketPrice ?? "").toLowerCase();
        if (priceFilter === "free" && !price.includes("free")) return false;
        if (priceFilter === "paid" && (price.includes("free") || price.includes("invite"))) return false;
        if (priceFilter === "invite" && !price.includes("invite")) return false;
      }

      // Date range filter
      if (startDateFilter || endDateFilter) {
        if (!event.startDate || !event.finishDate) return false;

        // Check if event overlaps with the filter range (YYYY-MM-DD strings compare as dates)
        if (startDateFilter && event.finishDate < toCalendarDate(startDateFilter)) return false;
        if (endDateFilter && event.startDate > toCalendarDate(endDateFilter)) return false;
      }
      
      return true;
    });
  }, [events, hasTicketPrice, searchQuery, categoryFilter, sizeFilter, locationFilter, scopeFilter, priceFilter, startDateFilter, endDateFilter, showPastEvents]);

  // Dates arrive as YYYY-MM-DD calendar dates; build a local date so the day never shifts.
  const formatDate = (dateStr: string) => {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return "";
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-CH", { month: "short", day: "numeric" });
  };

  const formatDateRange = (start: string, finish: string) => {
    const startFormatted = formatDate(start);
    const finishFormatted = formatDate(finish);
    
    if (startFormatted === finishFormatted) return startFormatted;
    return `${startFormatted} - ${finishFormatted}`;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSizeFilter("all");
    setLocationFilter("all");
    setScopeFilter("all");
    setPriceFilter("all");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || sizeFilter !== "all" || 
    locationFilter !== "all" || scopeFilter !== "all" || priceFilter !== "all" ||
    startDateFilter !== undefined || endDateFilter !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-foreground text-background py-16 md:py-24">
        <div className="container px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-background/70 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="max-w-4xl">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Live Directory
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Tech Events <span className="text-primary">Switzerland 2026</span>
            </h1>
            <p className="text-xl text-background/70 max-w-2xl">
              Your comprehensive guide to technology conferences, summits, and meetups 
              across Switzerland. Updated regularly from our curated database.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Input
                  type="search"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 h-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {/* Mobile filter toggle */}
                {isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="h-9 gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        !
                      </Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                  </Button>
                )}
                
                <div className="flex border border-border">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Row - Collapsible on mobile, always visible on desktop */}
            {isMobile ? (
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="flex flex-wrap gap-3 items-center pt-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {filterOptions.categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sizeFilter} onValueChange={setSizeFilter}>
                      <SelectTrigger className="w-[110px] h-9">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        {filterOptions.sizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-[110px] h-9">
                        <SelectValue placeholder="Canton" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cantons</SelectItem>
                        {filterOptions.locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={scopeFilter} onValueChange={setScopeFilter}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scopes</SelectItem>
                        {filterOptions.scopes.map(scope => (
                          <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {hasTicketPrice && (
                      <Select value={priceFilter} onValueChange={setPriceFilter}>
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue placeholder="Price" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Prices</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="invite">Invite Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <DateRangeFilter
                      startDate={startDateFilter}
                      endDate={endDateFilter}
                      onStartDateChange={setStartDateFilter}
                      onEndDateChange={setEndDateFilter}
                    />

                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                        Clear all
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <div className="flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-muted-foreground" />
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="w-[110px] h-9">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {filterOptions.sizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[110px] h-9">
                    <SelectValue placeholder="Canton" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cantons</SelectItem>
                    {filterOptions.locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={scopeFilter} onValueChange={setScopeFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    {filterOptions.scopes.map(scope => (
                      <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasTicketPrice && (
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="invite">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <DateRangeFilter
                  startDate={startDateFilter}
                  endDate={endDateFilter}
                  onStartDateChange={setStartDateFilter}
                  onEndDateChange={setEndDateFilter}
                />

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                    Clear all
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="container px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> of{" "}
            <span className="font-semibold text-foreground">{events.length}</span> events
            {combinedRows > 0 && (
              <span className="text-sm">
                {" "}({combinedRows} duplicate {combinedRows === 1 ? "listing" : "listings"} combined)
              </span>
            )}
          </p>
          <Button
            variant={showPastEvents ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            {showPastEvents ? "Hide past events" : "Show past events"}
          </Button>
        </div>
      </section>

      {/* Events Content */}
      <section className="container px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading events...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No events match your filters</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <Card key={index} className="group hover:border-primary transition-all duration-300 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={categoryColors[event.category] || ""}
                    >
                      {event.category}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={sizeColors[event.size] || ""}
                    >
                      {event.size}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {event.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateRange(event.startDate, event.finishDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{event.scope}</span>
                    </div>
                    {event.ticketPrice && (
                      <span className="text-sm font-medium text-primary">
                        {event.ticketPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                     {isSafeUrl(event.officialUrl) && (
                      <a
                        href={event.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <span>Visit website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <CalendarDropdown
                      event={{
                        name: event.name,
                        startDate: event.startDate,
                        finishDate: event.finishDate,
                        location: event.location,
                        description: event.description,
                        officialUrl: event.officialUrl,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div
                key={index}
                className="group bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={categoryColors[event.category] || ""}
                      >
                        {event.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={sizeColors[event.size] || ""}
                      >
                        {event.size}
                      </Badge>
                      <Badge variant="outline">{event.scope}</Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDateRange(event.startDate, event.finishDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {event.targetAudience}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    {event.ticketPrice && (
                      <span className="text-lg font-bold text-primary">
                        {event.ticketPrice}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarDropdown
                        event={{
                          name: event.name,
                          startDate: event.startDate,
                          finishDate: event.finishDate,
                          location: event.location,
                          description: event.description,
                          officialUrl: event.officialUrl,
                        }}
                        variant="text"
                      />
                       {isSafeUrl(event.officialUrl) && (
                        <a
                          href={event.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">
              Data sourced from curated Google Sheets database. Updates automatically.
            </p>
            <Link to="/" className="text-primary hover:underline text-sm">
              Back to Dr. Justinas Mišeikis
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechEvents;
