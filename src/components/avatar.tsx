import { cn, initials } from "@/lib/utils";

// Placeholder until coaches upload photos: deterministic warm gradient + initials.
const gradients = [
  "from-amber-300 to-orange-500",
  "from-teal-400 to-cyan-700",
  "from-rose-300 to-pink-600",
  "from-lime-300 to-emerald-600",
  "from-indigo-300 to-indigo-600",
  "from-yellow-200 to-amber-500",
];

function pick(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return gradients[h % gradients.length];
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-gradient-to-br font-display font-semibold text-white",
        pick(name),
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
