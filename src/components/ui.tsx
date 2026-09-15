import type { Person } from "@/lib/types";

export const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg";

export const INPUT = `w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted ${FOCUS}`;

export const BUTTON_PRIMARY = `rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-40 ${FOCUS}`;

export const BUTTON_QUIET = `rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors duration-150 hover:border-accent hover:text-accent ${FOCUS}`;

export const CHIP = `rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors duration-150 hover:border-accent hover:text-accent ${FOCUS}`;

export const CHIP_ON = `rounded-full border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent ${FOCUS}`;

export const COUNT_PILL = "rounded-full bg-bg px-2 py-0.5 text-xs font-normal text-muted";

export const PRIORITY_BAR = {
  high: "bg-accent",
  normal: "bg-line",
  low: "bg-bg",
} as const;

export const PRIORITY_LABEL = {
  high: "High",
  normal: "Normal",
  low: "Low",
} as const;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Overlapping circles of people initials; the full name and email show on hover. */
export function Initials({ people }: { people: Person[] }) {
  if (people.length === 0) return null;
  return (
    <span className="flex -space-x-1">
      {people.map((person) => (
        <span
          key={person.id}
          title={`${person.name} (${person.email})`}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-card bg-accent-soft text-[10px] font-medium text-accent   "
        >
          {initials(person.name)}
        </span>
      ))}
    </span>
  );
}
