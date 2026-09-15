"use client";

import type { BoardCard, Person } from "@/lib/types";
import { initials } from "../ui";

export type CardRowProps = {
  card: BoardCard;
  onOpen: (card: BoardCard) => void;
  dense?: boolean;
  trailing?: React.ReactNode;
};

export const T = "transition-all duration-150";

export const PRIORITY_SQUARE: Record<string, string> = {
  high: "bg-accent",
  normal: "bg-muted/50",
  low: "bg-line",
};

/** Circular checklist progress drawn as inline SVG. Hidden when the card has no items. */
export function Ring({ done, total }: { done: number; total: number }) {
  if (total === 0) return null;
  const r = 6;
  const c = 2 * Math.PI * r;
  return (
    <span
      title={`Checklist ${done} of ${total} done`}
      className="flex shrink-0 items-center gap-1 text-[11px] text-muted"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <circle
          cx="8"
          cy="8"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${(done / total) * c} ${c}`}
          transform="rotate(-90 8 8)"
          className="text-accent"
        />
      </svg>
      <span className="tabular-nums">
        {done}/{total}
      </span>
    </span>
  );
}

/** Up to three overlapping initials circles, then a +n badge for the rest. */
export function Avatars({ people }: { people: Person[] }) {
  if (people.length === 0) return null;
  const shown = people.slice(0, 3);
  const rest = people.length - shown.length;
  return (
    <span className="flex shrink-0 -space-x-1.5">
      {shown.map((person) => (
        <span
          key={person.id}
          title={`${person.name} · ${person.email}`}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-card bg-accent-soft text-[9px] font-medium text-accent"
        >
          {initials(person.name)}
        </span>
      ))}
      {rest > 0 && (
        <span
          title={people
            .slice(3)
            .map((person) => person.name)
            .join(", ")}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-card bg-bg text-[9px] font-medium tabular-nums text-muted"
        >
          +{rest}
        </span>
      )}
    </span>
  );
}

/** One card line used by both views: priority square, title, avatars, checklist ring. */
export default function CardRow({ card, onOpen, dense, trailing }: CardRowProps) {
  const pending = card.id.startsWith("temp-");
  const base = dense
    ? `flex w-full items-center gap-3 border-b border-line px-1 py-2.5 text-left ${T} hover:bg-accent-soft/40`
    : `flex w-full items-center gap-2.5 rounded-lg border border-line bg-card px-3 py-3 text-left ${T} hover:-translate-y-px hover:border-accent/40 hover:shadow-card active:scale-[0.99]`;

  return (
    <button
      type="button"
      onClick={() => !pending && onOpen(card)}
      className={`${base} ${pending ? "opacity-60" : ""}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-[2px] ${PRIORITY_SQUARE[card.priority]}`} />
      <span className="min-w-0 flex-1 truncate text-[13px]">{card.title}</span>
      <span className="hidden shrink-0 text-[11px] text-muted sm:block">{card.section_name}</span>
      <Avatars people={card.people} />
      <Ring done={card.checklist_done} total={card.checklist_total} />
      {trailing}
    </button>
  );
}
