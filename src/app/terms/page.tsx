import type { Metadata } from "next";
import Link from "next/link";
import { BusinessDetails, LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  const { name, legal } = siteConfig;
  return (
    <LegalPage title="Terms of service">
      <p>
        These terms govern your use of {name} (the &quot;Platform&quot;), operated by <strong>{legal.businessName}</strong>{" "}
        (&quot;we&quot;, &quot;us&quot;). By creating an account or booking a class you agree to them.
      </p>

      <h2>1. What we do</h2>
      <p>
        {name} is an online marketplace that connects families, mostly in the United States, with independent teachers and
        coaches based in India for live online classes. Teachers set their own classes, schedules and prices and are
        responsible for the content of their teaching. They are independent professionals, not our employees.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least 18 years old to create an account. Parents and guardians book on behalf of children.</li>
        <li>Keep your login details confidential; you are responsible for activity on your account.</li>
        <li>Give accurate information, including your name, email and time zone.</li>
      </ul>

      <h2>3. Bookings</h2>
      <ul>
        <li>All class times are shown in your local time zone, with the teacher&apos;s India time (IST) for reference.</li>
        <li>A booking is confirmed when payment succeeds (or immediately for free classes and fully discounted bookings).</li>
        <li>Classes take place live over video in your web browser. You need a stable internet connection and a device with a camera and microphone.</li>
        <li>Please join on time. Late arrival does not extend the class.</li>
      </ul>

      <h2>4. Prices and payment</h2>
      <ul>
        <li>Prices are shown and charged in US dollars (USD) and include all platform fees. Your bank may apply its own charges.</li>
        <li>Payments are processed securely by our payment partner (Razorpay). We do not store your full card details.</li>
        <li>Offer codes have no cash value, cannot be combined, and may be withdrawn at any time.</li>
      </ul>

      <h2>5. Cancellations and refunds</h2>
      <p>
        See our <Link href="/refunds">Cancellation &amp; refund policy</Link>. In short: you can cancel up to 24 hours before a
        class for a full refund; if a teacher cancels or does not attend, you receive a full refund or a free reschedule.
      </p>

      <h2>6. Children&apos;s safety</h2>
      <ul>
        <li>Children&apos;s classes are booked and managed by a parent or guardian, who remains responsible for supervision.</li>
        <li>Teachers may only contact families through the Platform and must not request personal contact details from children.</li>
        <li>Report any concern to us immediately at the contact details below. We may suspend accounts while we investigate.</li>
      </ul>

      <h2>7. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>harass, abuse or discriminate against teachers, students or staff;</li>
        <li>record classes without everyone&apos;s consent, or share class content publicly;</li>
        <li>arrange or pay for classes outside the Platform with teachers you met here;</li>
        <li>misuse the Platform, attempt to access other accounts, or interfere with its operation.</li>
      </ul>

      <h2>8. Teachers</h2>
      <p>
        Teachers apply and are reviewed before their profile goes live. A &quot;Verified&quot; badge means we have checked the
        identity and qualifications they submitted; it is not a guarantee of results.
      </p>

      <h2>9. Content and intellectual property</h2>
      <p>
        The Platform&apos;s design, text and software belong to us. Teachers own their teaching materials and grant us permission
        to display their profile, photos and class descriptions on the Platform.
      </p>

      <h2>10. Disclaimers and liability</h2>
      <p>
        Classes are for learning, cultural, wellness and spiritual purposes and are not professional medical, psychological,
        legal or financial advice (see our <Link href="/disclaimer">Disclaimer</Link>). To the extent permitted by law, our total
        liability for any claim relating to a booking is limited to the amount you paid for that booking. We are not liable
        for indirect or consequential losses, or for interruptions caused by internet or service providers.
      </p>

      <h2>11. Suspension and termination</h2>
      <p>
        You may close your account at any time by contacting us. We may suspend or close accounts that breach these terms.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these terms. We will post the new version here with a new effective date, and notify you of material
        changes by email.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of India, and disputes are subject to the courts of {legal.jurisdiction}. This
        does not remove any rights you have under the consumer laws of your country of residence.
      </p>

      <h2>14. Contact</h2>
      <BusinessDetails />
    </LegalPage>
  );
}
