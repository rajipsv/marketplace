import Link from "next/link";
import {
  Activity,
  Flame,
  GraduationCap,
  Heart,
  Languages,
  Leaf,
  Music,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";

const icons: Record<string, LucideIcon> = {
  Activity,
  Flame,
  GraduationCap,
  Heart,
  Languages,
  Leaf,
  Music,
  Sparkles,
};

export function CategoryTile({ category }: { category: Category }) {
  const Icon = icons[category.icon] ?? Sparkles;
  return (
    <Link
      href={`/explore?category=${category.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent hover:shadow-md"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-accent/20 text-accent-strong group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <span className="font-display text-lg font-semibold">{category.name}</span>
      <span className="text-sm text-muted">{category.blurb}</span>
      <span className="mt-auto text-xs text-muted">{category.examples.join(" · ")}</span>
    </Link>
  );
}
