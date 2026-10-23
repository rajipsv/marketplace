import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { FileText, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { db } from "@/db";
import { category, coach, coachCategory, credential, offering, user } from "@/db/schema";
import { requireRole } from "@/lib/authz";
import { presignDownload, r2Configured } from "@/lib/r2";
import { coachLocation, formatInr, mediaUrl } from "@/lib/utils";
import { getPayoutDetailsForAdmin } from "@/server/services/payout-account";
import { setCoachPayoutVerified, setCoachStatus, setCoachVerified, setCredentialVerified } from "../../actions";

export const metadata: Metadata = { title: "Review teacher · Admin" };

export default async function AdminCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(["admin"], `/admin/coaches/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [c] = await db
    .select({ coach, email: user.email, accountName: user.name, joined: user.createdAt })
    .from(coach)
    .innerJoin(user, eq(coach.userId, user.id))
    .where(eq(coach.id, id));
  if (!c) notFound();
  const t = c.coach;

  const [cats, creds, classes] = await Promise.all([
    db
      .select({ name: category.name })
      .from(coachCategory)
      .innerJoin(category, eq(coachCategory.categorySlug, category.slug))
      .where(eq(coachCategory.coachId, t.id)),
    db.select().from(credential).where(eq(credential.coachId, t.id)).orderBy(asc(credential.createdAt)),
    db
      .select({ title: offering.title, priceInrPaise: offering.priceInrPaise, isActive: offering.isActive, slug: offering.slug })
      .from(offering)
      .where(eq(offering.coachId, t.id)),
  ]);

  // Full payout details are decrypted only here, for the admin making the transfer.
  let payoutDetails: Awaited<ReturnType<typeof getPayoutDetailsForAdmin>> = null;
  let payoutError: string | null = null;
  try {
    payoutDetails = await getPayoutDetailsForAdmin(t.id);
  } catch {
    payoutError = "Saved details can't be read — check PAYOUT_ENCRYPTION_KEY in Vercel.";
  }

  // Private documents: short-lived links generated per page view.
  const docLinks = r2Configured()
    ? await Promise.all(creds.map((cr) => (cr.documentKey ? presignDownload(cr.documentKey, 600) : null)))
    : creds.map(() => null);

  return (
    <div className="space-y-8">
      <Link href={`/admin/coaches?status=${t.status}`} className="text-sm text-muted hover:text-foreground">
        ← Back to {t.status} teachers
      </Link>

      <header className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 sm:flex-row">
        <Avatar name={t.displayName} src={mediaUrl(t.photoKey)} className="size-32 shrink-0 rounded-2xl text-4xl" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status: {t.status}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">{t.displayName}</h1>
          <p className="text-muted">{t.title}</p>
          <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Row label="Account">{c.accountName} · {c.email}</Row>
            <Row label="Joined">{c.joined.toLocaleDateString("en-US", { dateStyle: "medium" })}</Row>
            <Row label="Location">{coachLocation(t.city)}</Row>
            <Row label="Experience">{t.yearsExperience ? `${t.yearsExperience} years` : "—"}</Row>
            <Row label="Languages">{t.languages.join(", ") || "—"}</Row>
            <Row label="Categories">{cats.map((x) => x.name).join(", ") || "—"}</Row>
            <Row label="Coach agreement">
              {t.agreementAcceptedAt ? `Accepted ${t.agreementAcceptedAt.toLocaleDateString("en-US", { dateStyle: "medium" })}` : "Not accepted"}
            </Row>
          </dl>
          {t.introVideoKey && (
            <a
              href={mediaUrl(t.introVideoKey)!}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Watch intro video ↗
            </a>
          )}
        </div>
      </header>

      <section>
        <h2 className="font-display text-xl font-semibold">About</h2>
        <p className="mt-2 whitespace-pre-line text-muted">{t.bio || "No bio provided."}</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Qualifications</h2>
        {creds.length ? (
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
            {creds.map((cr, i) => (
              <li key={cr.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <FileText className="size-5 text-muted" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{cr.title}</span>
                  <span className="text-sm text-muted">{[cr.issuer, cr.year].filter(Boolean).join(" · ") || "—"}</span>
                </span>
                {docLinks[i] ? (
                  <a href={docLinks[i]!} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                    View document ↗
                  </a>
                ) : (
                  <span className="text-sm text-muted">No document</span>
                )}
                <form action={setCredentialVerified}>
                  <input type="hidden" name="credentialId" value={cr.id} />
                  <input type="hidden" name="verified" value={cr.verifiedAt ? "false" : "true"} />
                  <button className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted">
                    {cr.verifiedAt ? "✓ Verified — undo" : "Mark verified"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">None submitted.</p>
        )}
        <p className="mt-2 text-xs text-muted">Only verified qualifications are shown on the public profile.</p>
      </section>

      {classes.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold">Classes</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {classes.map((o) => (
              <li key={o.slug}>
                {o.title} · {formatInr(o.priceInrPaise / 100)} {o.isActive ? "" : "(inactive)"}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="payout" className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">Payout details</h2>
        {payoutError ? (
          <p className="mt-2 text-sm text-kumkum">{payoutError}</p>
        ) : payoutDetails ? (
          <>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <Row label="Method">{payoutDetails.method === "bank" ? "Bank transfer" : "UPI"}</Row>
              <Row label="Account holder">{payoutDetails.accountHolderName}</Row>
              {payoutDetails.method === "bank" ? (
                <>
                  <Row label="Account no.">{payoutDetails.bankAccount}</Row>
                  <Row label="IFSC">{payoutDetails.ifsc}</Row>
                </>
              ) : (
                <Row label="UPI ID">{payoutDetails.upi}</Row>
              )}
              <Row label="PAN">{payoutDetails.pan}</Row>
              <Row label="Status">{payoutDetails.verifiedAt ? "Verified" : "Not verified"}</Row>
            </dl>
            <form action={setCoachPayoutVerified} className="mt-4">
              <input type="hidden" name="coachId" value={t.id} />
              <input type="hidden" name="verified" value={payoutDetails.verifiedAt ? "false" : "true"} />
              <button className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted">
                {payoutDetails.verifiedAt ? "Mark as not verified" : "Mark verified (after ₹1 test transfer)"}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">The coach hasn&apos;t added payout details yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">Decision</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {t.status !== "approved" && <StatusButton coachId={t.id} status="approved" label="Approve" primary />}
          {t.status === "pending" && <StatusButton coachId={t.id} status="rejected" label="Reject" />}
          {t.status === "approved" && <StatusButton coachId={t.id} status="suspended" label="Suspend" />}
          <form action={setCoachVerified}>
            <input type="hidden" name="coachId" value={t.id} />
            <input type="hidden" name="verified" value={t.verified ? "false" : "true"} />
            <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted">
              <ShieldCheck className="size-4" aria-hidden />
              {t.verified ? "Remove Verified badge" : "Give Verified badge"}
            </button>
          </form>
        </div>
        <p className="mt-3 text-xs text-muted">
          Approving makes the profile public and lets the teacher create classes. Give the Verified badge only after
          checking ID and qualifications.
        </p>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted">{label}:</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
  );
}

function StatusButton({ coachId, status, label, primary }: { coachId: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={setCoachStatus}>
      <input type="hidden" name="coachId" value={coachId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
            : "cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
        }
      >
        {label}
      </button>
    </form>
  );
}
