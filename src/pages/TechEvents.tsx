import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink, Filter, List, LayoutGrid, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CalendarDropdown from "@/components/tech-events/CalendarDropdown";

interface TechEvent {
  name: string;
  startDate: string;
  finishDate: string;
  location: string;
  category: string;
  officialUrl: string;
  ticketPrice: string;
  size: string;
  logoUrl: string;
  targetAudience: string;
  scope: string;
  description: string;
}

const SHEET_ID = "1k4vfFfSX9Pmi5tNVuijUmubuTPSoFvBnIxC1kH_25x4";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

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

const TechEvents = () => {
  const [events, setEvents] = useState<TechEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Parse the JSONP response from Google Sheets
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
        if (!jsonMatch) {
          throw new Error("Failed to parse Google Sheets response");
        }
        
        const data = JSON.parse(jsonMatch[1]);
        const rows = data.table.rows;
        
        // Skip header row (index 0) and map data
        const parsedEvents: TechEvent[] = rows.slice(1).map((row: { c: Array<{ v: string | null }> }) => {
          const cells = row.c;
          return {
            name: cells[0]?.v || "",
            startDate: cells[1]?.v || "",
            finishDate: cells[2]?.v || "",
            location: cells[3]?.v || "",
            category: cells[4]?.v || "",
            officialUrl: cells[5]?.v || "",
            ticketPrice: cells[6]?.v || "",
            size: cells[7]?.v || "",
            logoUrl: cells[8]?.v || "",
            targetAudience: cells[9]?.v || "",
            scope: cells[10]?.v || "",
            description: cells[11]?.v || "",
          };
        }).filter((event: TechEvent) => event.name);

        setEvents(parsedEvents);
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(events.map(e => e.category).filter(Boolean))];
    const sizes = [...new Set(events.map(e => e.size).filter(Boolean))];
    const locations = [...new Set(events.map(e => {
      const parts = e.location.split(", ");
      return parts[parts.length - 1]; // Get canton code
    }).filter(Boolean))];
    const scopes = [...new Set(events.map(e => e.scope).filter(Boolean))];
    
    return { categories, sizes, locations, scopes };
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
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
      if (locationFilter !== "all") {
        const canton = event.location.split(", ").pop();
        if (canton !== locationFilter) return false;
      }
      
      // Scope filter
      if (scopeFilter !== "all" && event.scope !== scopeFilter) return false;
      
      // Price filter
      if (priceFilter !== "all") {
        const price = event.ticketPrice.toLowerCase();
        if (priceFilter === "free" && !price.includes("free")) return false;
        if (priceFilter === "paid" && (price.includes("free") || price.includes("invite"))) return false;
        if (priceFilter === "invite" && !price.includes("invite")) return false;
      }
      
      return true;
    });
  }, [events, searchQuery, categoryFilter, sizeFilter, locationFilter, scopeFilter, priceFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      // Handle "Date(year,month,day)" format from Google Sheets
      const dateMatch = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        const date = new Date(parseInt(year), parseInt(month), parseInt(day));
        return date.toLocaleDateString("en-CH", { month: "short", day: "numeric" });
      }
      // Handle regular date string
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-CH", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
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
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || sizeFilter !== "all" || 
    locationFilter !== "all" || scopeFilter !== "all" || priceFilter !== "all";

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

            {/* Filter Row */}
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

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="container px-4 py-6">
        <p className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> of{" "}
          <span className="font-semibold text-foreground">{events.length}</span> events
        </p>
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
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
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
                    <span className="text-sm font-medium text-primary">
                      {event.ticketPrice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    {event.officialUrl && event.officialUrl !== "[URL]" && (
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
                    <span className="text-lg font-bold text-primary">
                      {event.ticketPrice}
                    </span>
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
                      {event.officialUrl && event.officialUrl !== "[URL]" && (
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
