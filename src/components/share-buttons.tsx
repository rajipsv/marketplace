"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

/** WhatsApp share (how diaspora parents pass links around), copy link, and native share on phones. */
export function ShareButtons({ path, text }: { path: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && "share" in navigator), []);

  const url = () => {
    const u = new URL(path, window.location.origin);
    u.searchParams.set("utm_source", "share");
    return u.toString();
  };

  const btn =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">Share</span>
      <button
        type="button"
        className={btn}
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`, "_blank", "noopener")}
      >
        <svg viewBox="0 0 24 24" className="size-3.5 fill-[#25D366]" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        WhatsApp
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          await navigator.clipboard.writeText(url());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>
      {canShare && (
        <button type="button" className={btn} onClick={() => navigator.share({ title: text, url: url() }).catch(() => {})}>
          <Share2 className="size-3.5" aria-hidden /> More
        </button>
      )}
    </div>
  );
}
