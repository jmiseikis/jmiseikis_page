import { useCallback } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactCta, PageHero, TextLink } from "@/components/site/primitives";
import { Directory, DirectoryItem, Meta, SourceLink, Tags, type DirectoryFilter } from "@/components/site/Directory";
import { useRoboticsDirectory } from "@/hooks/use-directory";
import { isMissing, type RoboticsRecord } from "@/lib/sheets";
import { GZA_MAP_PDF, GZA_URL } from "@/lib/site";

const FILTERS: DirectoryFilter<RoboticsRecord>[] = [
  { key: "category", label: "Categories", allLabel: "All categories", values: (r) => [r.category] },
  { key: "type", label: "Types", allLabel: "All types", values: (r) => [r.type] },
  { key: "teamSize", label: "Sizes", allLabel: "All sizes", values: (r) => [r.teamSize] },
];

const searchText = (r: RoboticsRecord) =>
  [r.name, r.description, r.category, r.type, r.headquarters, r.achievements].join(" ");

const GZARobotics = () => {
  const { data, isLoading, error, refetch } = useRoboticsDirectory();

  const renderItem = useCallback(
    (org: RoboticsRecord) => (
      <DirectoryItem
        aside={
          <>
            <Tags items={[org.category, org.type]} />
            <h2 className="text-[22px] md:text-[23px]">{org.name}</h2>
            <Meta label="Location:" value={org.headquarters} />
            <Meta label="Founded:" value={org.founded} />
            <Meta label="Team size:" value={org.teamSize} />
          </>
        }
      >
        <p>{org.description}</p>
        {!isMissing(org.achievements) && (
          <details className="mt-3 text-[13px] text-muted-foreground">
            <summary className="py-2">Products & achievements</summary>
            <p className="mt-1">{org.achievements}</p>
          </details>
        )}
        <div className="mt-4">
          <SourceLink href={org.website}>Visit website</SourceLink>
        </div>
      </DirectoryItem>
    ),
    [],
  );

  return (
    <SiteLayout path="/gza-robotics">
      <PageHero
        breadcrumb={{ to: "/resources", label: "Resources" }}
        eyebrow="Resources | GZA ecosystem"
        title="Robotics in the Greater Zurich Area."
        lead="Explore robotics companies, research labs and autonomous systems organisations. Filter the directory to find a relevant starting point."
      />
      <div className="site-wrap mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
        <span>
          Data curated by <TextLink href={GZA_URL}>Greater Zurich Area</TextLink>
        </span>
        <TextLink href={GZA_MAP_PDF}>Robotics & autonomous systems map (PDF)</TextLink>
      </div>
      <section className="site-wrap pb-12 pt-2 md:pb-20" aria-label="Robotics directory">
        <Directory
          records={data}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          noun={{ singular: "organisation", plural: "organisations" }}
          searchLabel="Search organisations"
          searchPlaceholder="Name, technology or location"
          searchText={searchText}
          filters={FILTERS}
          getKey={(r) => r.name}
          renderItem={renderItem}
          sourceNote={
            <p>
              Live data from the Greater Zurich Area directory. Source entries are preserved; check the original websites for
              current details.
            </p>
          }
        />
      </section>
      <ContactCta
        title="Which organisations fit your brief?"
        lead="A focused scouting engagement can assess relevance and define the companies, technologies and research groups to explore."
        intent="scouting"
        label="Discuss technology scouting"
      />
    </SiteLayout>
  );
};

export default GZARobotics;
