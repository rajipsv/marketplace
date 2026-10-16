import type { Metadata } from "next";
import { BusinessDetails, LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        Classes on {siteConfig.name} are offered for <strong>learning, cultural, wellness and spiritual purposes</strong>.
      </p>
      <ul>
        <li>
          They are <strong>not medical, psychological, legal or financial advice</strong>, and are not a substitute for a
          licensed professional. Teachers and coaches on the Platform are not licensed to practise therapy or medicine in the
          United States.
        </li>
        <li>
          Yoga, fitness and dance involve physical activity. Check with your doctor before starting, especially if you are
          pregnant or have a health condition, and stop if you feel pain or discomfort.
        </li>
        <li>Nutrition and Ayurveda sessions offer general guidance only. Do not stop or change prescribed treatment without your doctor.</li>
        <li>Astrology, tarot and similar readings are offered as spiritual guidance and for personal reflection.</li>
        <li>Results from coaching, tutoring or practice depend on many factors and are not guaranteed.</li>
      </ul>
      <p>
        Teachers are independent professionals responsible for their own teaching content. Views they express are their own.
      </p>
      <BusinessDetails />
    </LegalPage>
  );
}
