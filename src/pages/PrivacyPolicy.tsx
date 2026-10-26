import LegalPageLayout, { LegalList, LegalSection, LegalSubsection } from "@/components/LegalPageLayout";

// Publication date of this version. Update it whenever the policy text changes, and update the
// policy in the same pull request whenever the site adds analytics, embeds, forms or third-party services.
const LAST_UPDATED = { iso: "2026-10-24", label: "24 October 2026" };

const providers = [
  {
    name: "Lovable and its cloud backend (Supabase)",
    purpose: "Website hosting, visitor statistics, backend functions and database",
    location: "EU and/or USA",
  },
  { name: "Cloudflare", purpose: "Spam protection (Turnstile)", location: "Global network, including the USA" },
  { name: "Resend", purpose: "Delivery of contact-form emails", location: "USA" },
  { name: "Google", purpose: "Fonts, directory data, video thumbnails, email inbox", location: "Global, including the USA" },
];

const strong = (text: string) => <strong className="font-semibold text-foreground">{text}</strong>;

const PrivacyPolicy = () => (
  <LegalPageLayout
    heading="Privacy Policy"
    path="/privacy"
    lastUpdated={LAST_UPDATED}
  >
    <p>
      This website, jmiseikis.com, is run by Dr. Justinas Mišeikis, based in Zurich, Switzerland ("I", "me"). This
      policy explains what personal data the website processes, why, and what choices you have. It is written for the
      Swiss Federal Act on Data Protection (FADP) and, where it applies to visitors in the EU or EEA, the General Data
      Protection Regulation (GDPR).
    </p>

    <LegalSection title="Who is responsible">
      <p>
        Dr. Justinas Mišeikis, Zurich, Switzerland.
        <br />
        Contact for privacy matters: dr.miseikis@gmail.com
      </p>
    </LegalSection>

    <LegalSection title="The short version">
      <LegalList
        items={[
          "No advertising or tracking cookies are set by this website, and no third-party analytics service is added to it. The hosting provider compiles aggregate visitor statistics, described below.",
          "If you use the contact form, your details are used to answer your enquiry and, if we work together, for that engagement.",
          "Every page loads a typeface from Google, and some pages load further content from third parties (directory data, video thumbnails and the contact form's spam check), which means those providers receive your IP address when your browser requests the content.",
        ]}
      />
    </LegalSection>

    <LegalSection title="What is processed, and why">
      <LegalSubsection title="Visiting the website">
        <p>
          When you open a page, the hosting and backend providers process technical data that every web request
          contains: IP address, browser and device type, the page requested, the referring page and the time. This is
          needed to deliver the website, keep it secure and investigate errors. These logs are kept by the providers for
          a limited period under their own retention rules.
        </p>
        <p>
          The hosting provider, Lovable, also uses this data to compile visitor statistics for me, such as the number of
          visitors and page views, time spent on the site, referring websites, device type and country. I only see these
          figures in aggregate, not information about individual visitors.
        </p>
        <p>
          Legal basis (GDPR): my legitimate interest in delivering a secure website and understanding how it is used.
        </p>
      </LegalSubsection>

      <LegalSubsection title="The contact form">
        <p>
          If you send a message, I receive your name, email address, optional organisation and your message. The form
          is protected by Cloudflare Turnstile, which checks that the submission comes from a person and not an
          automated script. Your IP address is used briefly to limit repeated submissions, and it is recorded in the
          server logs if a submission is blocked as too frequent or fails the spam check.
        </p>
        <p>
          The message is not stored in a website database. It is delivered by email to my inbox through the email
          service Resend. I use it to answer your enquiry and, if we start working together, for that engagement. I
          delete enquiries that do not lead to further contact when they are no longer needed, and keep business
          correspondence for as long as legal record-keeping rules require.
        </p>
        <p>
          Legal basis (GDPR): steps taken at your request before a possible contract, and my legitimate interest in
          answering enquiries.
        </p>
      </LegalSubsection>

      <LegalSubsection title="Content loaded from third parties">
        <p>
          To show certain content, your browser connects directly to these services, which receive your IP address and
          standard browser information:
        </p>
        <LegalList
          items={[
            <>{strong("Google Fonts")} (Google): the Inter typeface, on every page.</>,
            <>{strong("Google Sheets")} (Google): the data behind the robotics, investor and events directories.</>,
            <>{strong("YouTube image servers")} (Google): video thumbnails on the Speaking page.</>,
            <>{strong("Cloudflare Turnstile")} (Cloudflare): the spam check for the contact form, which loads with the home page.</>,
          ]}
        />
        <p>
          The list of recent videos is fetched by the website's server from YouTube's public video feeds, without any
          visitor data. Links to YouTube, LinkedIn, Google Scholar, Google Patents and other external sites only send
          data to those sites when you click them, and their own privacy policies then apply.
        </p>
        <p>Legal basis (GDPR): my legitimate interest in presenting the website's content reliably.</p>
      </LegalSubsection>

      <LegalSubsection title="Information stored in your browser">
        <p>
          The website does not set analytics or advertising cookies. It may store small technical preferences in your
          browser, such as your choice of light or dark theme. These stay on your device and can be cleared in your
          browser settings. Cloudflare Turnstile processes
          browser signals to tell people and bots apart when the contact form is shown.
        </p>
        <p>
          The robotics calculator processes your financial assumptions in your browser. It does not submit them to a
          server. Selecting "Save in this browser" stores your scenario on that device until you remove the saved copy
          or clear browser storage. JSON and CSV exports contain the assumptions and results you choose to download;
          consider their contents before sharing them.
        </p>
      </LegalSubsection>

      <LegalSubsection title="Swiss Tech Pulse (discontinued)">
        <p>
          The website previously offered the Swiss Tech Pulse digest, which has been discontinued. No new subscriptions
          are accepted, no further digests are sent, and no subscriber data is held.
        </p>
      </LegalSubsection>
    </LegalSection>

    <LegalSection title="Service providers and international transfers">
      <p>
        I use these providers to run the website. They process data on my behalf or as independent providers of the
        services described above:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-border text-foreground">
              <th scope="col" className="py-3 pr-4 font-bold">
                Provider
              </th>
              <th scope="col" className="py-3 pr-4 font-bold">
                Purpose
              </th>
              <th scope="col" className="py-3 font-bold">
                Location of processing
              </th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.name} className="border-b border-border align-top">
                <td className="py-3 pr-4 text-foreground">{p.name}</td>
                <td className="py-3 pr-4">{p.purpose}</td>
                <td className="py-3">{p.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Where data is transferred to a country without an adequate level of data protection as recognised by
        Switzerland or the EU, the transfer relies on recognised safeguards, such as the Swiss-US and EU-US Data Privacy
        Framework where the provider is certified, or standard contractual clauses.
      </p>
    </LegalSection>

    <LegalSection title="Your rights">
      <p>
        You can ask to access, correct or delete your personal data, object to or restrict its processing, and, where
        applicable, receive it in a portable format. Use the contact details above. You also have the right to complain
        to a supervisory authority: in Switzerland, the Federal Data Protection and Information Commissioner (FDPIC); in
        the EU, the authority in your country of residence.
      </p>
      <p>No automated decision-making or profiling takes place on this website.</p>
    </LegalSection>

    <LegalSection title="Changes">
      <p>
        I update this policy when the website changes in a way that affects personal data. The date at the top shows the
        latest version.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default PrivacyPolicy;
