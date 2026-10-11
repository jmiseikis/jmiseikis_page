import { Link } from "react-router-dom";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";

// Publication date of this version. Update it whenever the terms change.
const LAST_UPDATED = { iso: "2026-10-11", label: "11 October 2026" };

const TermsOfUse = () => (
  <LegalPageLayout
    heading="Terms of Use"
    description="Terms for using jmiseikis.com: general information only, the RaaS ROI calculator, directories, external links, intellectual property, liability and Swiss law."
    path="/terms"
    lastUpdated={LAST_UPDATED}
  >
    <p>
      These terms apply to your use of jmiseikis.com, run by Dr. Justinas Mišeikis, Zurich, Switzerland. By using the
      website you accept them.
    </p>

    <LegalSection title="Information only">
      <p>
        The content on this website, including guides, articles, directories and the RaaS ROI calculator, is general
        information. It is not professional, financial, investment, legal or tax advice, and it is no substitute for
        advice on your specific situation.
      </p>
      <p>
        Advisory, due diligence, speaking and other services are provided only under a separate written agreement.
        Nothing on this website is an offer to provide services on particular terms. Fees are available on request.
      </p>
    </LegalSection>

    <LegalSection title="Calculator and illustrative examples">
      <p>
        The RaaS ROI calculator and any worked examples are illustrative models built on the inputs you enter and on the
        model's assumptions. Results are not forecasts, guarantees or recommendations, and currency symbols are labels
        only: amounts are not converted between currencies. Check any result against your own data before making a
        decision.
      </p>
    </LegalSection>

    <LegalSection title="Directories and third-party information">
      <p>
        The robotics, investor and events directories bring together information from public sources and from other
        organisations, credited where shown. Listings change and may be incomplete or out of date. A listing is not an
        endorsement, recommendation or partnership, and fund figures are estimates that have not been independently
        verified. Confirm details with the organisation concerned.
      </p>
    </LegalSection>

    <LegalSection title="Links to other websites">
      <p>
        The website links to external sites such as YouTube, LinkedIn, Google Scholar and organisations in the
        directories. I am not responsible for their content, availability or privacy practices.
      </p>
    </LegalSection>

    <LegalSection title="Intellectual property">
      <p>
        The text, design and original materials on this website belong to Dr. Justinas Mišeikis unless stated otherwise.
        Third-party names, logos, data and media belong to their owners.
      </p>
      <p>
        You may use any downloadable worksheets and templates freely within your own organisation. You may quote short
        extracts of the content with attribution and a link. Any other reproduction or redistribution needs prior
        permission.
      </p>
    </LegalSection>

    <LegalSection title="Acceptable use">
      <p>
        Do not misuse the website, including by attempting to break its security, overloading it, scraping it in a way
        that harms its operation, or sending spam or unlawful content through the contact form.
      </p>
    </LegalSection>

    <LegalSection title="Liability">
      <p>
        The website is provided as it is, without any guarantee of accuracy, completeness or availability. To the extent
        permitted by law, I am not liable for any loss arising from use of the website or reliance on its content.
        Liability for intent and gross negligence is not excluded.
      </p>
    </LegalSection>

    <LegalSection title="Privacy">
      <p>
        How personal data is handled is described in the{" "}
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalSection>

    <LegalSection title="Changes and governing law">
      <p>
        I may update these terms. The version published on this page applies. These terms are governed by Swiss law. The
        courts of Zurich, Switzerland have jurisdiction, subject to any mandatory rules that protect consumers.
      </p>
    </LegalSection>

    <LegalSection title="Contact">
      <p>dr.miseikis@gmail.com</p>
    </LegalSection>
  </LegalPageLayout>
);

export default TermsOfUse;
