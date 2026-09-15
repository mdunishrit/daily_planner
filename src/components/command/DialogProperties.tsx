"use client";

import PeopleTags from "../PeopleTags";
import { FOCUS } from "../ui";
import type { Card, CardDetail, Priority, Section, Status } from "@/lib/types";

const STATUSES: Array<{ value: Status; label: string }> = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITIES: Priority[] = ["high", "normal", "low"];

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  normal: "Normal",
  low: "Low",
};

const T = "transition-all duration-150";
const LABEL = "text-[11px] uppercase tracking-[0.12em] text-muted";
const SELECT = `w-full rounded-lg border border-line bg-card px-2 py-1 text-[13px] text-ink ${T} hover:border-accent ${FOCUS}`;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Short relative time such as "2h ago". */
function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  return `${Math.floor(diff / DAY)}d ago`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
      <span className={LABEL}>{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export type DialogPropertiesProps = {
  current: Card;
  detail: CardDetail | null;
  sections: Section[];
  link: string;
  onLinkChange: (value: string) => void;
  onLinkBlur: () => void;
  onStatusChange: (status: Status) => void;
  onSectionChange: (sectionId: string) => void;
  onPriorityChange: (priority: Priority) => void;
  onChanged: () => void;
};

/** Right column of the card dialog: label and value rows plus the people picker. */
export default function DialogProperties({
  current,
  detail,
  sections,
  link,
  onLinkChange,
  onLinkBlur,
  onStatusChange,
  onSectionChange,
  onPriorityChange,
  onChanged,
}: DialogPropertiesProps) {
  return (
    <div className="space-y-3 text-[13px]">
      <Row label="Status">
        <select
          aria-label="Status"
          value={current.status}
          onChange={(event) => onStatusChange(event.target.value as Status)}
          className={SELECT}
        >
          {STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Section">
        <select
          aria-label="Section"
          value={current.section_id}
          onChange={(event) => onSectionChange(event.target.value)}
          className={SELECT}
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Priority">
        <div className="flex rounded-lg border border-line p-0.5">
          {PRIORITIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPriorityChange(value)}
              aria-pressed={current.priority === value}
              className={`flex-1 rounded-md px-1 py-1 text-[11px] ${T} ${FOCUS} ${
                current.priority === value
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-muted hover:text-ink"
              }`}
            >
              {PRIORITY_LABEL[value]}
            </button>
          ))}
        </div>
      </Row>

      <Row label="People">
        <PeopleTags detail={detail} onChanged={onChanged} compact />
      </Row>

      <Row label="Link">
        <div className="flex items-center gap-1">
          <input
            aria-label="Link"
            value={link}
            placeholder="https://"
            onChange={(event) => onLinkChange(event.target.value)}
            onBlur={onLinkBlur}
            className={`min-w-0 flex-1 rounded-lg border border-line bg-card px-2 py-1 text-[13px] text-ink placeholder:text-muted ${T} hover:border-accent ${FOCUS}`}
          />
          {link.trim() ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open link in a new tab"
              title="Open link in a new tab"
              className={`rounded-lg p-1 text-muted ${T} hover:text-accent ${FOCUS}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 4h6v6" />
                <path d="M20 4l-9 9" />
                <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          ) : null}
        </div>
      </Row>

      <Row label="Created">
        <span title={new Date(current.created_at).toLocaleString()} className="text-muted">
          {relativeTime(current.created_at)}
        </span>
      </Row>

      <Row label="Updated">
        <span title={new Date(current.updated_at).toLocaleString()} className="text-muted">
          {relativeTime(current.updated_at)}
        </span>
      </Row>
    </div>
  );
}
