import type { Metadata } from "next";
import { BusinessDetails, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Cancellation & refund policy" };

export default function RefundsPage() {
  return (
    <LegalPage title="Cancellation & refund policy">
      <p>We want booking to feel safe. Here is exactly what happens if plans change.</p>

      <h2>If you cancel</h2>
      <ul>
        <li><strong>24 hours or more before the class:</strong> cancel from <strong>My sessions</strong> for a full refund.</li>
        <li><strong>Less than 24 hours before:</strong> the booking is non-refundable, because the teacher has reserved that time for you.</li>
        <li><strong>Missed class (no-show):</strong> non-refundable.</li>
        <li>For weekly classes, each session is cancelled and refunded individually under the same rule.</li>
      </ul>

      <h2>If the teacher cancels or doesn&apos;t attend</h2>
      <p>
        You choose: a <strong>full refund</strong>, or a <strong>free reschedule</strong> with the same teacher or another
        teacher of your choice.
      </p>

      <h2>Technical problems</h2>
      <p>
        If a class cannot go ahead or is seriously disrupted because of a problem on our side or the teacher&apos;s side,
        contact us within 48 hours and we will refund or reschedule the class.
      </p>

      <h2>How refunds are paid</h2>
      <ul>
        <li>Refunds go back to the original payment method in Indian rupees (INR). If your card is in another currency, the converted amount may differ slightly from what you paid because of exchange rates.</li>
        <li>We start the refund within 2 business days; your bank usually shows it within 5–10 business days.</li>
        <li>Classes booked free or with a 100% offer code have no cash value and are not refunded in cash.</li>
      </ul>

      <h2>Questions or a refund request</h2>
      <BusinessDetails />
    </LegalPage>
  );
}
