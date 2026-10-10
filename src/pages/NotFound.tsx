import SiteLayout from "@/components/site/SiteLayout";
import { Actions, ButtonLink, PageHero, TextLink } from "@/components/site/primitives";

const NotFound = () => (
  <SiteLayout path="*">
    <PageHero
      eyebrow="404 | Page not found"
      title="Let's get you to the right place."
      lead="The page you are looking for is not available here."
    >
      <Actions>
        <ButtonLink href="/">Return home</ButtonLink>
        <ButtonLink href="/resources" variant="secondary">
          Explore resources
        </ButtonLink>
      </Actions>
    </PageHero>
    <section className="site-wrap section-y" aria-label="Popular pages">
      <Actions className="mt-0">
        <TextLink href="/advisory">Advisory</TextLink>
        <TextLink href="/speaking">Speaking</TextLink>
        <TextLink href="/publications">Publications & patents</TextLink>
        <TextLink href="/about">About</TextLink>
      </Actions>
    </section>
  </SiteLayout>
);

export default NotFound;
