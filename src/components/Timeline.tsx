"use client";

import { useEffect, useState, useTransition } from "react";
import { addNoteAction } from "@/app/actions/activities";
import { BUTTON_PRIMARY, BUTTON_QUIET, INPUT } from "./ui";
import type { Activity, CardDetail } from "@/lib/types";

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
  const [entries, setEntries] = useState<Activity[]>(detail?.activities ?? []);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setEntries(detail?.activities ?? []);
  }, [detail]);

  if (!detail) return null;

  const cardId = detail.card.id;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  function add() {
    const note = text.trim();
    if (!note) return;
    const temp: Activity = {
      id: `temp-${Date.now()}`,
      card_id: cardId,
      kind: "note",
      text: note,
      created_at: new Date().toISOString(),
    };
    const before = entries;
    setEntries([temp, ...entries]);
    setText("");
    setError(null);
    startTransition(async () => {
      try {
        await addNoteAction(cardId, note);
        onChanged();
      } catch (e) {
        setError((e as Error).message);
        setEntries(before);
        setText(note);
      }
    });
  }

  return (
    <div data-slot="timeline">
      <h3 className="mb-2 text-xs text-muted ">Timeline</h3>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            add();
          }
        }}
        rows={2}
        placeholder="Add a note"
        className={INPUT}
      />
      <button
        type="button"
        onClick={add}
        disabled={!text.trim()}
        className={`mt-2 ${BUTTON_PRIMARY}`}
      >
        Add note
      </button>
      {error && <p className="mt-2 text-sm text-danger ">{error}</p>}

      <button
        type="button"
        onClick={() => setShowHistory((value) => !value)}
        aria-expanded={showHistory}
        className={`mt-4 ${BUTTON_QUIET}`}
      >
        {showHistory ? "Hide history" : `Show history (${sorted.length})`}
      </button>

      {showHistory && (
        <ul className="mt-4 space-y-4 border-l border-line pl-4 ">
          {sorted.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${
                  entry.kind === "note" ? "bg-accent" : "bg-line "
                }`}
              />
              <span
                title={new Date(entry.created_at).toLocaleString()}
                className="block text-xs text-muted "
              >
                {relativeTime(entry.created_at)}
              </span>
              <span className="block whitespace-pre-wrap break-words text-sm text-ink ">
                {entry.text}
              </span>
            </li>
          ))}
          {sorted.length === 0 && <li className="text-sm text-muted ">No activity yet</li>}
        </ul>
      )}
    </div>
  );
}
