import type { Person } from "@/lib/types";

export const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950";

export const INPUT =
  `w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 ` +
  `dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 ${FOCUS}`;

export const BUTTON_PRIMARY =
  `rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600 disabled:opacity-40 ${FOCUS}`;

export const BUTTON_QUIET =
  `rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors duration-150 hover:border-brand-500 hover:text-brand-700 ` +
  `dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-brand-400 ${FOCUS}`;

export const CHIP =
  `rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors duration-150 hover:border-brand-500 hover:text-brand-700 ` +
  `dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-brand-400 ${FOCUS}`;

export const CHIP_ON =
  `rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ` +
  `dark:bg-brand-500/15 dark:text-brand-400 ${FOCUS}`;

export const COUNT_PILL =
  "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";

export const PRIORITY_BAR = {
  high: "bg-brand-500",
  normal: "bg-neutral-300 dark:bg-neutral-700",
  low: "bg-neutral-200 dark:bg-neutral-800",
} as const;

export const PRIORITY_LABEL = { high: "High", normal: "Normal", low: "Low" } as const;

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
          className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-brand-50 text-[10px] font-medium text-brand-700 dark:border-neutral-900 dark:bg-brand-500/20 dark:text-brand-400"
        >
          {initials(person.name)}
        </span>
      ))}
    </span>
  );
}
