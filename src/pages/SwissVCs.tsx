import { useCallback } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactCta, PageHero } from "@/components/site/primitives";
import { Directory, DirectoryItem, Meta, SourceLink, Tags, type DirectoryFilter } from "@/components/site/Directory";
import { useInvestorDirectory } from "@/hooks/use-directory";
import { isMissing, splitList as multi, type InvestorRecord } from "@/lib/sheets";

const FILTERS: DirectoryFilter<InvestorRecord>[] = [
  { key: "sector", label: "Sectors", allLabel: "All sectors", values: (r) => multi(r.sector) },
  { key: "investmentRounds", label: "Stages", allLabel: "All stages", values: (r) => multi(r.investmentRounds) },
  { key: "targetGeography", label: "Geographies", allLabel: "All geographies", values: (r) => multi(r.targetGeography) },
  { key: "targetAudience", label: "Audiences", allLabel: "All audiences", values: (r) => [r.targetAudience.trim()] },
];

const searchText = (r: InvestorRecord) =>
  [r.name, r.description, r.sector, r.investmentRounds, r.targetGeography, r.targetAudience].join(" ");

const SwissVCs = () => {
  const { data, isLoading, error, refetch } = useInvestorDirectory();

  const renderItem = useCallback(
    (vc: InvestorRecord) => (
      <DirectoryItem
        aside={
          <>
            <Tags items={multi(vc.sector)} />
            <h2 className="text-[22px] md:text-[23px]">{vc.name}</h2>
            <Meta label="Stage:" value={vc.investmentRounds} />
            <Meta label="Geography:" value={vc.targetGeography} />
            <Meta label="Audience:" value={vc.targetAudience} />
          </>
        }
      >
        <p>{vc.description}</p>
        {!isMissing(vc.estimatedFundSize) && (
          <details className="mt-3 text-[13px] text-muted-foreground">
            <summary className="py-2">Financial figure from source</summary>
            <p className="mt-1">
              {vc.estimatedFundSize}. Labelled “Estimated Fund Size” in the original directory; definition and reference date
              need confirmation.
            </p>
          </details>
        )}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <SourceLink href={vc.officialUrl}>Website</SourceLink>
          <SourceLink href={vc.linkedinUrl}>LinkedIn</SourceLink>
          <SourceLink href={vc.crunchbaseUrl}>Crunchbase</SourceLink>
          <SourceLink href={vc.pitchbookUrl}>PitchBook</SourceLink>
        </div>
      </DirectoryItem>
    ),
    [],
  );

  return (
    <SiteLayout path="/swiss-vcs">
      <PageHero
        breadcrumb={{ to: "/resources", label: "Resources" }}
        eyebrow="Resources | Swiss ecosystem"
        title="Swiss VCs & funds."
        lead="Explore investors by sector, investment stage, geography and audience. Use the original sources to deepen your research."
      />
      <section className="site-wrap pb-12 pt-4 md:pb-20" aria-label="Investor directory">
        <Directory
          records={data}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          noun={{ singular: "investor", plural: "investors" }}
          searchLabel="Search investors"
          searchPlaceholder="Name, sector or description"
          searchText={searchText}
          filters={FILTERS}
          getKey={(r) => r.name}
          renderItem={renderItem}
          sourceNote={
            <p>
              Live data from the existing curated directory. A listing is a research starting point, not a verified current
              mandate; check each investor's own sources.
            </p>
          }
        />
        <p className="fine mt-6 max-w-[80ch]">
          Financial figures are reproduced from the existing directory's “Estimated Fund Size” field. Definitions and dates
          vary; they are not presented as current assets under management.
        </p>
      </section>
      <ContactCta
        title="Need a focused view of the ecosystem?"
        lead="Explore the technologies, partnerships and technical questions relevant to your investment or strategy priorities."
        intent="diligence"
        label="Discuss an assessment"
      />
    </SiteLayout>
  );
};

export default SwissVCs;
