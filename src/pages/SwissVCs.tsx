import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Filter, List, LayoutGrid, Loader2, AlertCircle, ChevronDown, Globe, Linkedin, Building2, Target, DollarSign, Users, Search, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface VC {
  name: string;
  sector: string;
  investmentRounds: string;
  targetGeography: string;
  targetAudience: string;
  officialUrl: string;
  crunchbaseUrl: string;
  pitchbookUrl: string;
  linkedinUrl: string;
  estimatedFundSize: string;
  description: string;
}

const SHEET_ID = "1FqX_G9qw9srGHumCWfQH1L4RCDlW4EtJ8-iXTfzsblI";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const sectorColors: Record<string, string> = {
  "DeepTech": "bg-blue-500/10 text-blue-600 border-blue-200",
  "AI": "bg-violet-500/10 text-violet-600 border-violet-200",
  "FinTech": "bg-green-500/10 text-green-600 border-green-200",
  "Health/Bio": "bg-rose-500/10 text-rose-600 border-rose-200",
  "Climate": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "SaaS": "bg-sky-500/10 text-sky-600 border-sky-200",
  "Robotics": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Industrial": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Consumer": "bg-pink-500/10 text-pink-600 border-pink-200",
  "FoodTech": "bg-lime-500/10 text-lime-600 border-lime-200",
  "Cybersecurity": "bg-red-500/10 text-red-600 border-red-200",
  "Hardware": "bg-slate-500/10 text-slate-600 border-slate-200",
  "EdTech": "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  "Logistics": "bg-teal-500/10 text-teal-600 border-teal-200",
};

const getSectorColor = (sector: string) => {
  for (const [key, value] of Object.entries(sectorColors)) {
    if (sector.includes(key)) return value;
  }
  return "bg-muted text-muted-foreground";
};

const SwissVCs = () => {
  const [vcs, setVcs] = useState<VC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [roundFilter, setRoundFilter] = useState<string>("all");
  const [geoFilter, setGeoFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");

  useEffect(() => {
    const fetchVCs = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEET_URL);
        const text = await response.text();

        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
        if (!jsonMatch) throw new Error("Failed to parse Google Sheets response");

        const data = JSON.parse(jsonMatch[1]);
        const rows = data.table.rows;

        // Row 0 is empty, row 1 is headers, data starts at row 2
        const parsed: VC[] = rows.slice(2).map((row: { c: Array<{ v: string | null } | null> }) => {
          const cells = row.c;
          return {
            name: cells[0]?.v || "",
            sector: cells[1]?.v || "",
            investmentRounds: cells[2]?.v || "",
            targetGeography: cells[3]?.v || "",
            targetAudience: cells[4]?.v || "",
            estimatedFundSize: cells[5]?.v || "",
            officialUrl: cells[6]?.v || "",
            crunchbaseUrl: cells[7]?.v || "",
            pitchbookUrl: cells[8]?.v || "",
            linkedinUrl: cells[9]?.v || "",
            description: cells[10]?.v || "",
          };
        }).filter((vc: VC) => vc.name);

        setVcs(parsed);
        setError(null);
      } catch (err) {
        console.error("Error fetching VCs:", err);
        setError("Failed to load VC data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchVCs();
  }, []);

  // Extract unique sectors (split by comma)
  const filterOptions = useMemo(() => {
    const allSectors = new Set<string>();
    const allRounds = new Set<string>();
    const allGeos = new Set<string>();
    const allAudiences = new Set<string>();

    vcs.forEach(vc => {
      vc.sector.split(",").map(s => s.trim()).filter(Boolean).forEach(s => allSectors.add(s));
      vc.investmentRounds.split(",").map(s => s.trim()).filter(Boolean).forEach(s => allRounds.add(s));
      vc.targetGeography.split(",").map(s => s.trim()).filter(Boolean).forEach(s => allGeos.add(s));
      if (vc.targetAudience) allAudiences.add(vc.targetAudience.trim());
    });

    return {
      sectors: [...allSectors].sort(),
      rounds: [...allRounds].sort(),
      geos: [...allGeos].sort(),
      audiences: [...allAudiences].sort(),
    };
  }, [vcs]);

  const filteredVCs = useMemo(() => {
    return vcs.filter(vc => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!vc.name.toLowerCase().includes(q) &&
            !vc.description.toLowerCase().includes(q) &&
            !vc.sector.toLowerCase().includes(q)) return false;
      }
      if (sectorFilter !== "all" && !vc.sector.includes(sectorFilter)) return false;
      if (roundFilter !== "all" && !vc.investmentRounds.includes(roundFilter)) return false;
      if (geoFilter !== "all" && !vc.targetGeography.includes(geoFilter)) return false;
      if (audienceFilter !== "all" && !vc.targetAudience.includes(audienceFilter)) return false;
      return true;
    });
  }, [vcs, searchQuery, sectorFilter, roundFilter, geoFilter, audienceFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSectorFilter("all");
    setRoundFilter("all");
    setGeoFilter("all");
    setAudienceFilter("all");
  };

  const hasActiveFilters = searchQuery || sectorFilter !== "all" || roundFilter !== "all" ||
    geoFilter !== "all" || audienceFilter !== "all";

  const isValidUrl = (url: string) => url && url !== "N/A" && url.startsWith("http");

  const FilterControls = () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Filter className="w-4 h-4 text-muted-foreground" />

      <Select value={sectorFilter} onValueChange={setSectorFilter}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Sector" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sectors</SelectItem>
          {filterOptions.sectors.map(s => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={roundFilter} onValueChange={setRoundFilter}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {filterOptions.rounds.map(r => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={geoFilter} onValueChange={setGeoFilter}>
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Geography" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Geographies</SelectItem>
          {filterOptions.geos.map(g => (
            <SelectItem key={g} value={g}>{g}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={audienceFilter} onValueChange={setAudienceFilter}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Audience" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Audiences</SelectItem>
          {filterOptions.audiences.map(a => (
            <SelectItem key={a} value={a}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          Clear all
        </Button>
      )}
    </div>
  );

  const LinkButtons = ({ vc }: { vc: VC }) => (
    <div className="flex flex-wrap items-center gap-2">
      {isValidUrl(vc.officialUrl) && (
        <a href={vc.officialUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Globe className="w-3.5 h-3.5" />
          <span>Website</span>
        </a>
      )}
      {isValidUrl(vc.crunchbaseUrl) && (
        <a href={vc.crunchbaseUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:underline">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Crunchbase</span>
        </a>
      )}
      {isValidUrl(vc.pitchbookUrl) && (
        <a href={vc.pitchbookUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:underline">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Pitchbook</span>
        </a>
      )}
      {isValidUrl(vc.linkedinUrl) && (
        <a href={vc.linkedinUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:underline">
          <Linkedin className="w-3.5 h-3.5" />
          <span>LinkedIn</span>
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-foreground text-background py-16 md:py-24">
        <div className="container px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-background/70 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="max-w-4xl">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Living Directory
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Swiss <span className="text-primary">VCs and Funds</span>
            </h1>
            <p className="text-xl text-background/70 max-w-2xl">
              A comprehensive directory of venture capital firms investing in Swiss startups.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Input
                  type="search"
                  placeholder="Search VCs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 h-10"
                />
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
                  <div className="pt-2">
                    <FilterControls />
                  </div>
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
          Showing <span className="font-semibold text-foreground">{filteredVCs.length}</span> of{" "}
          <span className="font-semibold text-foreground">{vcs.length}</span> venture capital firms
        </p>
      </section>

      {/* VC Content */}
      <section className="container px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading VCs...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredVCs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No VCs match your filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVCs.map((vc, index) => (
              <Card key={index} className="group hover:border-primary transition-all duration-300 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {vc.sector.split(",").slice(0, 3).map(s => (
                      <Badge key={s.trim()} variant="outline" className={getSectorColor(s.trim())}>
                        {s.trim()}
                      </Badge>
                    ))}
                    {vc.sector.split(",").length > 3 && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        +{vc.sector.split(",").length - 3}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {vc.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      {vc.investmentRounds}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      {vc.targetGeography}
                    </span>
                    {vc.estimatedFundSize && vc.estimatedFundSize !== "N/A" && (
                      <span className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5" />
                        {vc.estimatedFundSize}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {vc.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{vc.targetAudience}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <LinkButtons vc={vc} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVCs.map((vc, index) => (
              <div key={index} className="group bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {vc.sector.split(",").map(s => (
                        <Badge key={s.trim()} variant="outline" className={getSectorColor(s.trim())}>
                          {s.trim()}
                        </Badge>
                      ))}
                      <Badge variant="outline">{vc.targetAudience}</Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {vc.name}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {vc.investmentRounds}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Target className="w-4 h-4" />
                        {vc.targetGeography}
                      </span>
                      {vc.estimatedFundSize && vc.estimatedFundSize !== "N/A" && (
                        <span className="flex items-center gap-1.5">
                          <Banknote className="w-4 h-4" />
                          {vc.estimatedFundSize}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground line-clamp-2">{vc.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[160px]">
                    <LinkButtons vc={vc} />
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

export default SwissVCs;
