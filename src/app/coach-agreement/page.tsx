import type { Metadata } from "next";
import Link from "next/link";
import { BusinessDetails, LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Coach agreement",
  description: "The terms for trainers and coaches teaching on the platform.",
};

// Reads the current commission and payout settings.
export const revalidate = 300;

export default async function CoachAgreementPage() {
  const { name, legal } = siteConfig;
  const s = await getSettings();
  return (
    <LegalPage title="Coach agreement">
      <p>
        This agreement is between you (the &quot;Coach&quot;) and <strong>{legal.businessName}</strong>, which operates {name}{" "}
        (&quot;we&quot;, &quot;us&quot;). It applies when you apply to teach and every time you teach on the Platform, together with
        our <Link href="/terms">Terms of service</Link>.
      </p>

      <h2>1. Your status</h2>
      <p>
        You are an independent professional, not our employee or agent. You decide how you teach, set your own weekly hours and
        prices, and are responsible for your own taxes and any registrations your work requires.
      </p>

      <h2>2. Your profile</h2>
      <ul>
        <li>Everything in your profile and application must be true and up to date, including your qualifications.</li>
        <li>We review applications before profiles go live and may ask for identity or qualification documents.</li>
        <li>A &quot;Verified&quot; badge is shown only after we have checked your documents. We may remove it if details change.</li>
        <li>You allow us to show your name, photo, intro video, bio and class descriptions on the Platform and in our marketing.</li>
      </ul>

      <h2>3. Classes and scheduling</h2>
      <ul>
        <li>Keep your weekly hours and session dates accurate. Families book the times you make available.</li>
        <li>Join every booked class on time, prepared, from a quiet place with a stable internet connection.</li>
        <li>
          If you must cancel, do it as early as possible from your dashboard and tell us. The family receives a full refund or a
          free reschedule. Repeated late cancellations or no-shows may lead to suspension.
        </li>
      </ul>

      <h2>4. Child safety and conduct</h2>
      <ul>
        <li>Treat every student and parent with respect. Harassment, discrimination or inappropriate content is never allowed.</li>
        <li>Communicate with families only through the Platform. Never ask a child for personal contact details or social media.</li>
        <li>For children&apos;s classes, a parent or guardian is responsible for supervision; keep classes appropriate for the age group.</li>
        <li>Do not record students without their (or their parent&apos;s) consent.</li>
        <li>Report any safety concern to us immediately. We may suspend accounts while we investigate.</li>
      </ul>

      <h2>5. Fees and earnings</h2>
      <ul>
        <li>
          Families pay us the class price. We keep a platform commission of <strong>{s.commissionPct}%</strong> and you earn{" "}
          <strong>{100 - s.commissionPct}%</strong>.
        </li>
        <li>
          {s.discountBasis === "list"
            ? "When we run promotions (for example a free first class), your earnings are calculated on the full class price — we fund the discount."
            : "When we run promotions (for example a free first class), your earnings are calculated on the amount the family actually paid."}
        </li>
        <li>
          Earnings become payable <strong>{s.holdDays} days</strong> after a class is completed (our refund window). If a class is
          refunded because you cancelled or did not attend, no earnings are due for it.
        </li>
        <li>
          We pay you in Indian rupees to your Indian bank account or UPI ID, normally weekly. Tax (TDS) is withheld as required by
          Indian law and shown on your statement; you need to give us your PAN before your first payout.
        </li>
        <li>We may change the commission with at least 30 days&apos; notice. Changes never apply to classes already booked.</li>
      </ul>

      <h2>6. Staying on the Platform</h2>
      <p>
        Families you meet through {name} must keep booking and paying through the Platform. Do not offer or accept classes or
        payments outside the Platform with them for 12 months after your last class together.
      </p>

      <h2>7. Your content</h2>
      <p>
        You keep ownership of your teaching materials. You confirm you have the right to use anything you share in class and that
        it does not infringe anyone else&apos;s rights.
      </p>

      <h2>8. Data and privacy</h2>
      <p>
        You will see limited information about students (first name, approximate age, parent notes). Use it only to teach your
        classes, keep it confidential and never share it. See our <Link href="/privacy">Privacy policy</Link>.
      </p>

      <h2>9. Ending the agreement</h2>
      <p>
        You can stop teaching at any time after completing or cancelling your booked classes. We may suspend or remove a profile
        that breaches this agreement. Earnings already due will be paid, less any refunds caused by the breach.
      </p>

      <h2>10. Governing law</h2>
      <p>This agreement is governed by the laws of India, and disputes are subject to the courts of {legal.jurisdiction}.</p>

      <h2>Contact</h2>
      <BusinessDetails />
    </LegalPage>
  );
}
