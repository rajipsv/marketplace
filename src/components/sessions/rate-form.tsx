"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function RateForm({ bookingId, action }: { bookingId: string; action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const [state, formAction] = useActionState(action, {});
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState(false);

  if (state.ok) return <FormMessage state={state} />;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="cursor-pointer text-sm font-semibold text-primary hover:underline">
        ★ Rate this class
      </button>
    );

  return (
    <form action={formAction} className="w-full space-y-3 rounded-xl bg-surface-muted p-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
            onClick={() => setRating(i)}
            className="cursor-pointer"
          >
            <Star className={cn("size-7", i <= rating ? "fill-accent text-accent" : "text-muted")} aria-hidden />
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium">How was it? (optional)</span>
        <textarea
          name="comment"
          rows={3}
          maxLength={1000}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="What did your child enjoy? Would you recommend this teacher?"
        />
      </label>
      <p className="text-xs text-muted">Your first name and rating are shown publicly as a verified booking.</p>
      <FormMessage state={state} />
      {rating > 0 ? (
        <SubmitButton>Submit rating</SubmitButton>
      ) : (
        <p className="text-sm text-muted">Tap the stars to rate.</p>
      )}
    </form>
  );
}
