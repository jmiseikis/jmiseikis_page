import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Filter, List, LayoutGrid, Loader2, AlertCircle, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet-async";
import { buildOgImageUrl } from "@/lib/ogImage";


interface Company {
  name: string;
  type: string;
  category: string;
  website: string;
  headquarters: string;
  founded: string;
  teamSize: string;
  description: string;
  achievements: string;
}

const SHEET_ID = "1CL3fGiT1QvDAWQ_Itn1ixw-lvJc07ABUr3cjJHnvIRs";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const categoryColors: Record<string, string> = {
  "Robotics & Autonomous Systems": "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-500/40",
  "Software & Components": "bg-green-500/10 text-green-800 border-green-200 dark:text-green-300 dark:border-green-500/40",
  "Universities & Academic Research": "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-500/40",
  "Autonomous Flying & Diving": "bg-sky-500/10 text-sky-700 border-sky-200 dark:text-sky-300 dark:border-sky-500/40",
  "Networks, Regulators & Connectors": "bg-orange-500/10 text-orange-800 border-orange-200 dark:text-orange-300 dark:border-orange-500/40",
  "Medtech Robotics": "bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-300 dark:border-rose-500/40",
  "Autonomous Driving": "bg-amber-500/10 text-amber-800 border-amber-200 dark:text-amber-300 dark:border-amber-500/40",
  "Computer Vision for Robotics": "bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:text-indigo-300 dark:border-indigo-500/40",
};

const typeColors: Record<string, string> = {
  "Large Corp": "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-300 dark:border-slate-500/40",
  "Scale-up": "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-500/40",
  "Startup": "bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:text-cyan-300 dark:border-cyan-500/40",
  "Corporate R&D": "bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-300 dark:border-violet-500/40",
  "University": "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-200 dark:text-fuchsia-300 dark:border-fuchsia-500/40",
  "Network": "bg-yellow-500/10 text-yellow-800 border-yellow-200 dark:text-yellow-300 dark:border-yellow-500/40",
  "Government": "bg-red-500/10 text-red-700 border-red-200 dark:text-red-300 dark:border-red-500/40",
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
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");

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

        const parsed: Company[] = rows.slice(1).map((row: { c: Array<{ v: string | null } | null> }) => {
          const cell = (i: number) => row.c[i]?.v || "";
          return {
            name: cell(0),
            type: cell(1),
            category: cell(2),
            website: cell(3),
            headquarters: cell(4),
            founded: cell(5),
            teamSize: cell(6),
            description: cell(7),
            achievements: cell(8),
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
    const types = [...new Set(companies.map(c => c.type).filter(Boolean))].sort();
    return { categories, types };
  }, [companies]);

  const getCompanySize = (teamSize: string): string => {
    if (!teamSize || teamSize === "\u2014" || teamSize === "N/A") return "unknown";
    const lower = teamSize.toLowerCase().trim();
    if (lower === "small") return "small";
    if (lower === "medium") return "medium";
    if (lower === "large") return "large";
    return "unknown";
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!company.name.toLowerCase().includes(q) &&
            !company.description.toLowerCase().includes(q) &&
            !company.achievements.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (categoryFilter !== "all" && company.category !== categoryFilter) return false;
      if (typeFilter !== "all" && company.type !== typeFilter) return false;
      if (sizeFilter !== "all" && getCompanySize(company.teamSize) !== sizeFilter) return false;
      return true;
    });
  }, [companies, searchQuery, categoryFilter, typeFilter, sizeFilter]);

  // Group by category for separator display
  const groupedCompanies = useMemo(() => {
    const groups: { category: string; companies: Company[] }[] = [];
    let currentCategory = "";
    for (const company of filteredCompanies) {
      if (company.category !== currentCategory) {
        currentCategory = company.category;
        groups.push({ category: currentCategory, companies: [] });
      }
      groups[groups.length - 1].companies.push(company);
    }
    return groups;
  }, [filteredCompanies]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setSizeFilter("all");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || typeFilter !== "all" || sizeFilter !== "all";

  const formatUrl = (url: string) => {
    if (!url || url === "N/A" || url === "\u2014") return null;
    return url.startsWith("http") ? url : `https://${url}`;
  };

  const renderCompanyCard = (company: Company, index: number) => (
    <Card key={index} className="group hover:border-primary transition-all duration-300 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <Badge variant="outline" className={categoryColors[company.category] || ""}>
            {company.category}
          </Badge>
          <Badge variant="outline" className={typeColors[company.type] || ""}>
            {company.type}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {company.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{company.description}</p>
        {company.achievements && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <span className="font-semibold text-foreground">Key achievements:</span>{" "}
            <span className="line-clamp-3">{company.achievements}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-auto pt-2">
          {company.headquarters && <span>📍 {company.headquarters}</span>}
          {company.founded && company.founded !== "\u2014" && <span>🗓 {company.founded}</span>}
          {company.teamSize && company.teamSize !== "\u2014" && <span>👥 {company.teamSize}</span>}
        </div>
        {formatUrl(company.website) && (
          <div className="pt-3 border-t border-border">
            <a href={formatUrl(company.website)!} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <span>Visit website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCompanyListItem = (company: Company, index: number) => (
    <div key={index} className="group bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={categoryColors[company.category] || ""}>
              {company.category}
            </Badge>
            <Badge variant="outline" className={typeColors[company.type] || ""}>
              {company.type}
            </Badge>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {company.name}
          </h3>
          <p className="text-muted-foreground mb-2">{company.description}</p>
          {company.achievements && (
            <p className="text-sm text-muted-foreground italic">
              <span className="font-semibold not-italic text-foreground">Key achievements:</span> {company.achievements}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-3">
            {company.headquarters && <span>📍 {company.headquarters}</span>}
            {company.founded && company.founded !== "\u2014" && <span>🗓 {company.founded}</span>}
            {company.teamSize && company.teamSize !== "\u2014" && <span>👥 {company.teamSize}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          {formatUrl(company.website) && (
            <a href={formatUrl(company.website)!} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <span>Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const FilterControls = () => (
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
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {filterOptions.types.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sizeFilter} onValueChange={setSizeFilter}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sizes</SelectItem>
          <SelectItem value="small">Small</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="large">Large</SelectItem>
        </SelectContent>
      </Select>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">Clear all</Button>
      )}
    </div>
  );

  return (
    <div className="bg-background">
      <Helmet>
        <title>GZA Robotics Directory | Dr. Justinas Mišeikis</title>
        <meta name="description" content="Explore 150+ robotics companies, startups, labs, and AI innovators in Greater Zurich. Filterable directory listed with the agreement of Greater Zurich Area." />
        <meta name="keywords" content="robotics companies Zurich, Greater Zurich Area robotics, Swiss robotics startups, autonomous systems Switzerland, robotics directory Zurich, medtech robotics Switzerland, autonomous driving Zurich, computer vision robotics, robotics research labs ETH, Swiss robotics ecosystem, GZA robotics map, Swisscom Ventures robotics" />
        <link rel="canonical" href="https://jmiseikis.com/gza-robotics" />
        <meta property="og:title" content="GZA Robotics Directory | Dr. Justinas Mišeikis" />
        <meta property="og:description" content="Filterable directory of 150+ robotics companies, autonomous systems startups, and research labs in the Greater Zurich Area. Listed with the agreement of Greater Zurich Area (GZA)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jmiseikis.com/gza-robotics" />
        <meta property="og:image" content={buildOgImageUrl({ title: "Robotics in the Greater Zurich Area", subtitle: "DIRECTORY · 150+ COMPANIES" })} />
        <meta name="twitter:image" content={buildOgImageUrl({ title: "Robotics in the Greater Zurich Area", subtitle: "DIRECTORY · 150+ COMPANIES" })} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": "Robotics Companies in the Greater Zurich Area",
          "description": "A curated directory of 150+ robotics companies, autonomous systems startups, university research labs, and technology innovators operating in the Greater Zurich Area of Switzerland. Listed with the agreement of Greater Zurich Area (GZA).",
          "url": "https://jmiseikis.com/gza-robotics",
          "creator": { "@type": "Organization", "name": "Greater Zurich Area", "url": "https://www.greaterzuricharea.com/en" },
          "publisher": { "@type": "Person", "name": "Dr. Justinas Miseikis", "url": "https://jmiseikis.com" },
          "keywords": ["robotics", "autonomous systems", "Greater Zurich Area", "GZA", "Switzerland", "startups", "research labs", "medtech robotics", "autonomous driving", "computer vision", "ETH Zurich"],
          "spatialCoverage": { "@type": "Place", "name": "Greater Zurich Area, Switzerland" },
          "isAccessibleForFree": true
        })}</script>
      </Helmet>

      {/* Header */}
      <header className="bg-foreground text-background py-16 md:py-24">
        <div className="container px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-background/70 hover:text-primary-inverse transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Robotics in the <a href="https://www.greaterzuricharea.com/en" target="_blank" rel="noopener noreferrer" className="text-primary-inverse hover:underline">Greater Zurich Area</a>
            </h1>
            <p className="text-xl text-background/70 max-w-2xl">Curated by <a href="https://www.greaterzuricharea.com/en" target="_blank" rel="noopener noreferrer" className="text-primary-inverse hover:underline">Greater Zurich Area</a></p>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="container px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Greater Zurich Area has attracted leading technology firms and talent and encouraged entrepreneurship
            in the region, leading to unmatched opportunities for intelligent &amp; autonomous systems companies.
            Explore this comprehensive directory of robotics innovators, research labs, and technology leaders
            shaping the future of autonomy in one of the world's most dynamic innovation ecosystems,
            listed with the agreement of <a href="https://www.greaterzuricharea.com/en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Greater Zurich Area</a>.
          </p>
          <a href="#company-list" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            ↓ Jump to the company list
          </a>
        </div>
      </section>

      {/* Embedded PDF */}
      <section className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Robotics &amp; Autonomous Systems Map</h2>
            <a
              href="/gza-robotics-map.pdf"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open PDF</span>
            </a>
          </div>
          <div className="w-full border border-border rounded-lg overflow-hidden bg-muted" style={{ height: "80vh", minHeight: "600px" }}>
            <object
              data="/gza-robotics-map.pdf#view=FitH"
              type="application/pdf"
              className="w-full h-full"
            >
              <iframe
                src="/gza-robotics-map.pdf#view=FitH"
                title="Robotics & Autonomous Systems in the Greater Zurich Area"
                className="w-full h-full"
                style={{ border: "none" }}
              />
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Your browser doesn't support inline PDF viewing.
                </p>
                <a
                  href="/gza-robotics-map.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open the PDF in a new tab</span>
                </a>
              </div>
            </object>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card sticky top-[var(--header-h)] z-40">
        <div className="container px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Input type="search" placeholder="Search companies..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="pl-4 pr-4 h-10" />
              </div>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="h-9 gap-2">
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
                  <div className="pt-2"><FilterControls /></div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <FilterControls />
            )}
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section id="company-list" className="scroll-mt-36 container px-4 py-6">
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
        ) : (
          <div className="space-y-10">
            {groupedCompanies.map((group, gi) => (
              <div key={group.category}>
                {gi > 0 && <Separator className="mb-8" />}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Badge variant="outline" className={`text-sm px-3 py-1 ${categoryColors[group.category] || ""}`}>
                      {group.category}
                    </Badge>
                    <span className="text-muted-foreground text-base font-normal">
                      ({group.companies.length})
                    </span>
                  </h2>
                </div>
                {viewMode === "grid" ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.companies.map((company, i) => renderCompanyCard(company, i))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.companies.map((company, i) => renderCompanyListItem(company, i))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
    </div>
  );
};

export default GZARobotics;
