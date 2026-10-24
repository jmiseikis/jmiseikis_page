import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Actions, ButtonLink, PageHero, TextLink } from "@/components/site/primitives";

// Unknown and retired URLs land here. No canonical, and kept out of search results.
const NotFound = () => {
  const { pathname } = useLocation();

  // Kept from the original template: broken links show up in the browser console and error monitoring.
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>Page not found | Dr. Justinas Mišeikis</title>
        <meta name="description" content="Find the right page on the website of Dr. Justinas Mišeikis." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
    </>
  );
};

export default NotFound;
