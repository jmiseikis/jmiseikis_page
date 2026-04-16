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
import gzaLogo from "@/assets/gza-logo.png";

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
  "Robotics & Autonomous Systems": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Software & Components": "bg-green-500/10 text-green-600 border-green-200",
  "Universities & Academic Research": "bg-purple-500/10 text-purple-600 border-purple-200",
  "Autonomous Flying & Diving": "bg-sky-500/10 text-sky-600 border-sky-200",
  "Networks, Regulators & Connectors": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Medtech Robotics": "bg-rose-500/10 text-rose-600 border-rose-200",
  "Autonomous Driving": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Computer Vision for Robotics": "bg-indigo-500/10 text-indigo-600 border-indigo-200",
};

const typeColors: Record<string, string> = {
  "Large Corp": "bg-slate-500/10 text-slate-600 border-slate-200",
  "Scale-up": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "Startup": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  "Corporate R&D": "bg-violet-500/10 text-violet-600 border-violet-200",
  "University": "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200",
  "Network": "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  "Government": "bg-red-500/10 text-red-600 border-red-200",
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
    if (!teamSize || teamSize === "—" || teamSize === "N/A") return "unknown";
    const num = parseInt(teamSize.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return "unknown";
    if (num <= 50) return "small";
    if (num <= 250) return "medium";
    return "large";
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
    if (!url || url === "N/A" || url === "—") return null;
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
          {company.founded && company.founded !== "—" && <span>🗓 {company.founded}</span>}
          {company.teamSize && company.teamSize !== "—" && <span>👥 {company.teamSize}</span>}
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
            {company.founded && company.founded !== "—" && <span>🗓 {company.founded}</span>}
            {company.teamSize && company.teamSize !== "—" && <span>👥 {company.teamSize}</span>}
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
          <SelectItem value="small">Small (≤50)</SelectItem>
          <SelectItem value="medium">Medium (51–250)</SelectItem>
          <SelectItem value="large">Large (250+)</SelectItem>
        </SelectContent>
      </Select>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">Clear all</Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Robotics Companies in Greater Zurich Area — 150+ Startups, Labs & Innovators</title>
        <meta name="description" content="Explore 150+ robotics companies, autonomous systems startups, research labs, and AI innovators in the Greater Zurich Area. Filterable directory curated by Greater Zurich Area — covering medtech robotics, autonomous driving, computer vision, and more." />
        <meta name="keywords" content="robotics companies Zurich, Greater Zurich Area robotics, Swiss robotics startups, autonomous systems Switzerland, robotics directory Zurich, medtech robotics Switzerland, autonomous driving Zurich, computer vision robotics, robotics research labs ETH, Swiss robotics ecosystem, GZA robotics map" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/gza-robotics" />
        <meta property="og:title" content="Robotics in the Greater Zurich Area — 150+ Companies & Labs Directory" />
        <meta property="og:description" content="Filterable directory of 150+ robotics companies, autonomous systems startups, and research labs in the Greater Zurich Area. Curated by GZA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jmiseikis.lovable.app/gza-robotics" />
        <meta property="og:image" content="https://jmiseikis.lovable.app/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": "Robotics Companies in the Greater Zurich Area",
          "description": "A curated directory of 150+ robotics companies, autonomous systems startups, university research labs, and technology innovators operating in the Greater Zurich Area of Switzerland.",
          "url": "https://jmiseikis.lovable.app/gza-robotics",
          "creator": { "@type": "Organization", "name": "Greater Zurich Area", "url": "https://www.greaterzuricharea.com" },
          "keywords": ["robotics", "autonomous systems", "Greater Zurich Area", "Switzerland", "startups", "research labs", "medtech robotics", "autonomous driving", "computer vision"],
          "spatialCoverage": { "@type": "Place", "name": "Greater Zurich Area, Switzerland" },
          "isAccessibleForFree": true
        })}</script>
      </Helmet>

      {/* Header */}
      <header className="bg-foreground text-background py-16 md:py-24">
        <div className="container px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-background/70 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Robotics in the <span className="text-primary">Greater Zurich Area</span>
                </h1>
                <p className="text-xl text-background/70 max-w-2xl">Curated by Greater Zurich Area</p>
              </div>
              <img src={gzaLogo} alt="Greater Zurich Area" className="h-16 md:h-24 shrink-0 hidden sm:block" />
            </div>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="container px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
            Greater Zurich Area has attracted leading technology firms and talent and encouraged entrepreneurship
            in the region, leading to unmatched opportunities for intelligent &amp; autonomous systems companies.
            Explore the comprehensive directory of robotics innovators, research labs, and technology leaders
            shaping the future of autonomy in one of the world's most dynamic innovation ecosystems.
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
              href="https://www.greaterzuricharea.com/sites/default/files/2026-04/Robotics%20Autonomous%20Systems%20in%20the%20Greater%20Zurich%20Area%20Map%20Overview%20Map.pdf"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open PDF</span>
            </a>
          </div>
          <div className="w-full border border-border rounded-lg overflow-hidden" style={{ height: "80vh", minHeight: "600px" }}>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent("https://www.greaterzuricharea.com/sites/default/files/2026-04/Robotics%20Autonomous%20Systems%20in%20the%20Greater%20Zurich%20Area%20Map%20Overview%20Map.pdf")}&embedded=true`}
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
      <footer className="bg-foreground text-background py-8">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">Data curated by Greater Zurich Area. Updates automatically.</p>
            <Link to="/" className="text-primary hover:underline text-sm">Back to Dr. Justinas Mišeikis</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GZARobotics;
