import type { Metadata } from "next";
import Link from "next/link";
import { BusinessDetails, LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Service delivery policy" };

export default function DeliveryPage() {
  return (
    <LegalPage title="Service delivery policy">
      <p>
        {siteConfig.name} provides <strong>live online classes</strong>. Nothing is shipped — there are no physical goods.
      </p>

      <h2>How classes are delivered</h2>
      <ul>
        <li>After booking, your class appears in <strong>My sessions</strong> with the date and time in your own time zone.</li>
        <li>A confirmation email is sent to your registered email address.</li>
        <li>The join link appears in My sessions shortly before the class. Classes run in your web browser; no app is needed.</li>
        <li>Each class is delivered live by the teacher at the booked time, for the stated duration.</li>
      </ul>

      <h2>Delivery timeline</h2>
      <p>
        Access to a booked class is immediate on confirmation. The service itself is delivered on the scheduled date and time
        you chose when booking.
      </p>

      <h2>If something goes wrong</h2>
      <p>
        If you can&apos;t join or the class doesn&apos;t take place, see our <Link href="/refunds">Cancellation &amp; refund policy</Link>{" "}
        or contact us:
      </p>
      <BusinessDetails />
    </LegalPage>
  );
}
