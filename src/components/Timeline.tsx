"use client";

import { useState, useTransition } from "react";
import { addNoteAction } from "@/app/actions/activities";
import { BUTTON_PRIMARY, INPUT } from "./ui";
import type { CardDetail } from "@/lib/types";

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

export default function Timeline({
  detail,
  onChanged,
}: {
  detail: CardDetail | null;
  onChanged: () => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!detail) return null;

  const cardId = detail.card.id;
  const entries = [...detail.activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  function add() {
    const note = text.trim();
    if (!note) return;
    setError(null);
    startTransition(async () => {
      try {
        await addNoteAction(cardId, note);
        setText("");
        onChanged();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div data-slot="timeline">
      <h3 className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">Timeline</h3>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        placeholder="Add a note"
        className={INPUT}
      />
      <button
        type="button"
        onClick={add}
        disabled={pending || !text.trim()}
        className={`mt-2 ${BUTTON_PRIMARY}`}
      >
        Add note
      </button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <ul className="mt-4 space-y-4 border-l border-neutral-200 pl-4 dark:border-neutral-800">
        {entries.map((entry) => (
          <li key={entry.id} className="relative">
            <span
              className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${
                entry.kind === "note" ? "bg-brand-500" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            />
            <span
              title={new Date(entry.created_at).toLocaleString()}
              className="block text-xs text-neutral-400 dark:text-neutral-500"
            >
              {relativeTime(entry.created_at)}
            </span>
            <span className="block text-sm text-neutral-700 dark:text-neutral-200">
              {entry.text}
            </span>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="text-sm text-neutral-400 dark:text-neutral-500">No activity yet</li>
        )}
      </ul>
    </div>
  );
}
