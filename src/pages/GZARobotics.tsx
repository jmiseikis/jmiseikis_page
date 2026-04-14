import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Filter, List, LayoutGrid, Loader2, AlertCircle, ChevronDown, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet-async";
import gzaLogo from "@/assets/gza-logo.png";

interface Company {
  name: string;
  officialUrl: string;
  category: string;
  description: string;
}

const SHEET_ID = "1Cq5A7EpMKbHlQWBoped7iFY0Bqn35y9MLQIuh6xeZgw";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const categoryColors: Record<string, string> = {
  "Robotics": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Software & Components": "bg-green-500/10 text-green-600 border-green-200",
  "Universities & Academic Research": "bg-purple-500/10 text-purple-600 border-purple-200",
  "Autonomous Flying & Diving": "bg-sky-500/10 text-sky-600 border-sky-200",
  "Networks, Regulators & Connectors": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Medtech Robotics": "bg-rose-500/10 text-rose-600 border-rose-200",
  "Autonomous Driving": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Computer Vision for Robotics": "bg-indigo-500/10 text-indigo-600 border-indigo-200",
};

const GZARobotics = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEET_URL);
        const text = await response.text();

        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
        if (!jsonMatch) throw new Error("Failed to parse response");

        const data = JSON.parse(jsonMatch[1]);
        const rows = data.table.rows;

        const parsed: Company[] = rows.slice(1).map((row: { c: Array<{ v: string | null }> }) => {
          const cells = row.c;
          return {
            name: cells[0]?.v || "",
            officialUrl: cells[1]?.v || "",
            category: cells[2]?.v || "",
            description: cells[3]?.v || "",
          };
        }).filter((c: Company) => c.name);

        setCompanies(parsed);
        setError(null);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filterOptions = useMemo(() => {
    const categories = [...new Set(companies.map(c => c.category).filter(Boolean))].sort();
    return { categories };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!company.name.toLowerCase().includes(query) &&
            !company.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (categoryFilter !== "all" && company.category !== categoryFilter) return false;
      return true;
    });
  }, [companies, searchQuery, categoryFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  const formatUrl = (url: string) => {
    if (!url || url === "N/A") return null;
    if (url.startsWith("https://www.google.com/search")) return null;
    return url.startsWith("http") ? url : `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Robotics in the Greater Zurich Area | Dr. Justinas Mišeikis</title>
        <meta name="description" content="Discover 140+ robotics companies, research labs, and autonomous systems innovators in the Greater Zurich Area — curated by Greater Zurich Area." />
      </Helmet>

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
            <div className="flex items-center gap-4 mb-6">
              <img src={gzaLogo} alt="Greater Zurich Area" className="h-16 md:h-20" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Robotics in the <span className="text-primary">Greater Zurich Area</span>
            </h1>
            <p className="text-xl text-background/70 max-w-2xl">
              Curated by Greater Zurich Area
            </p>
          </div>
        </div>
      </header>

      {/* Intro Section */}
      <section className="container px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Greater Zurich Area has attracted leading technology firms and talent and encouraged entrepreneurship
            in the region, leading to unmatched opportunities for intelligent &amp; autonomous systems companies.
            Explore the comprehensive directory of robotics innovators, research labs, and technology leaders
            shaping the future of autonomy in one of the world's most dynamic innovation ecosystems.
          </p>
        </div>
      </section>

      {/* Embedded PDF */}
      <section className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Robotics &amp; Autonomous Systems Map</h2>
          <div className="w-full border border-border rounded-lg overflow-hidden" style={{ height: "80vh", minHeight: "600px" }}>
            <iframe
              src="https://www.greaterzuricharea.com/sites/default/files/2026-04/Robotics%20Autonomous%20Systems%20in%20the%20Greater%20Zurich%20Area%20Map%20Overview%20Map.pdf"
              title="Robotics & Autonomous Systems in the Greater Zurich Area"
              className="w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Input
                  type="search"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 h-10"
                />
              </div>

              <div className="flex items-center gap-2">
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
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                  </Button>
                )}

                <div className="flex border border-border">
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="rounded-none">
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-none">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isMobile ? (
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="flex flex-wrap gap-3 items-center pt-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {filterOptions.categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">Clear all</Button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <div className="flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[240px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">Clear all</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="container px-4 py-6">
        <p className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCompanies.length}</span> of{" "}
          <span className="font-semibold text-foreground">{companies.length}</span> companies & institutions
        </p>
      </section>

      {/* Content */}
      <section className="container px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading directory...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No companies match your filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <Card key={index} className="group hover:border-primary transition-all duration-300 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={categoryColors[company.category] || ""}>
                      {company.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {company.description}
                  </p>
                  {formatUrl(company.officialUrl) && (
                    <div className="pt-3 border-t border-border">
                      <a
                        href={formatUrl(company.officialUrl)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <span>Visit website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company, index) => (
              <div key={index} className="group bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className={categoryColors[company.category] || ""}>
                        {company.category}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{company.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    {formatUrl(company.officialUrl) && (
                      <a
                        href={formatUrl(company.officialUrl)!}
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
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">
              Data curated by Greater Zurich Area. Updates automatically.
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

export default GZARobotics;
