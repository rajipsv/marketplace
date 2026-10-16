import type { Metadata } from "next";
import { BusinessDetails, LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  const { name, legal } = siteConfig;
  return (
    <LegalPage title="Privacy policy">
      <p>
        This policy explains what personal information {name}, operated by <strong>{legal.businessName}</strong>, collects,
        why, and the choices you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your name, email address, password (stored only as a secure hash) and time zone.</li>
        <li><strong>Family profiles:</strong> children&apos;s first names, optional birth year and any notes you add for teachers.</li>
        <li><strong>Bookings:</strong> classes booked, dates, prices, offer codes used and cancellation history.</li>
        <li><strong>Payments:</strong> processed by our payment partner. We receive confirmation, amount and a reference — not your full card number.</li>
        <li><strong>Class requests and messages</strong> you send us.</li>
        <li><strong>Teachers:</strong> profile details, photo, intro video, qualifications and identity documents, and bank/tax details for payouts.</li>
        <li><strong>Technical data:</strong> IP address, browser type and sign-in session information needed to keep your account secure.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>to provide the service: accounts, bookings, scheduling across time zones, classes and support;</li>
        <li>to process payments, refunds and teacher payouts, and meet tax and accounting obligations;</li>
        <li>to keep the Platform safe, including verifying teachers and preventing fraud and abuse;</li>
        <li>to send service messages (booking confirmations, reminders, policy updates). Marketing emails only with your consent, and you can unsubscribe at any time.</li>
      </ul>

      <h2>What teachers see</h2>
      <p>
        For your bookings, teachers see the attendee&apos;s first name, approximate age (from birth year, if given), your notes,
        and the parent&apos;s first name. They do not see your email address, phone number or payment details.
      </p>

      <h2>Children</h2>
      <p>
        Accounts are for adults (18+). Children do not create accounts and we do not knowingly collect personal information
        directly from children. A parent or guardian provides any child information and can edit or delete it at any time
        from <strong>My family</strong>.
      </p>

      <h2>Service providers</h2>
      <p>We share data only with providers that help us run the Platform, under contracts that protect it:</p>
      <ul>
        <li>hosting and content delivery (Vercel), database (Neon), file storage (Cloudflare R2);</li>
        <li>payments (Razorpay); and, when enabled, video classes, email delivery and analytics providers.</li>
      </ul>
      <p>
        Some providers process data outside your country, including in the United States and India. We do not sell your
        personal information.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and secure. If we add analytics, we will update this policy and, where
        required, ask for your consent.
      </p>

      <h2>How long we keep data</h2>
      <p>
        We keep account data while your account is active. Booking and payment records are kept as long as tax and accounting
        laws require (generally up to 8 years). Teacher identity documents are deleted or archived once no longer needed for
        verification or legal purposes.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, correct or delete your personal information, or ask us to stop certain uses, by contacting us. Residents
        of California and other US states, and users in India under the Digital Personal Data Protection Act, 2023, have these
        rights under local law; we will not discriminate against you for using them. We respond within 30 days.
      </p>

      <h2>Security</h2>
      <p>
        We use encryption in transit, hashed passwords, access controls, and private storage with short-lived links for
        sensitive documents. No system is perfectly secure; please tell us immediately if you suspect misuse of your account.
      </p>

      <h2>Changes</h2>
      <p>We will post updates here with a new effective date and notify you of material changes by email.</p>

      <h2>Contact / grievance officer</h2>
      <p>For privacy questions or requests, contact {legal.operatorName}:</p>
      <BusinessDetails />
    </LegalPage>
  );
}
