"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addPersonToCardAction,
  listPeopleAction,
  removePersonFromCardAction,
} from "@/app/actions/people";
import { FOCUS, INPUT } from "./ui";
import type { CardDetail, Person } from "@/lib/types";

function mentionQuery(text: string): string | null {
  const at = text.lastIndexOf("@");
  if (at < 0) return null;
  const rest = text.slice(at + 1);
  if (rest.includes(" ")) return null;
  return rest;
}

/** People tags on a card plus an `@` mention picker with keyboard navigation. */
export default function PeopleTags({
  detail,
  onChanged,
}: {
  detail: CardDetail | null;
  onChanged: () => void;
}) {
  const [all, setAll] = useState<Person[]>([]);
  const [text, setText] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!detail) return;
    listPeopleAction()
      .then(setAll)
      .catch((e: Error) => setError(e.message));
  }, [detail]);

  useEffect(() => {
    setHighlight(0);
  }, [text]);

  if (!detail) return null;

  const cardId = detail.card.id;
  const query = mentionQuery(text);
  const tagged = new Set(detail.people.map((p) => p.id));
  const matches =
    query === null
      ? []
      : all.filter(
          (p) => !tagged.has(p.id) && p.name.toLowerCase().includes(query.toLowerCase()),
        );

  function run(work: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await work();
        onChanged();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function pick(person: Person) {
    run(async () => {
      await addPersonToCardAction(cardId, person.id);
      setText("");
    });
  }

  function remove(personId: string) {
    run(async () => {
      await removePersonFromCardAction(cardId, personId);
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (query === null || matches.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(matches[highlight] ?? matches[0]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setText("");
    }
  }

  return (
    <div>
      <label className="mb-2 block text-xs text-neutral-500 dark:text-neutral-400" htmlFor="mention">
        People
      </label>
      <div className="mb-2 flex flex-wrap gap-1">
        {detail.people.map((person) => (
          <span
            key={person.id}
            title={`${person.name} (${person.email})`}
            className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {person.name}
            <button
              type="button"
              onClick={() => remove(person.id)}
              disabled={pending}
              aria-label={`Remove ${person.name}`}
              className={`text-neutral-500 hover:text-red-600 dark:hover:text-red-400 ${FOCUS}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          id="mention"
          value={text}
          role="combobox"
          aria-expanded={query !== null}
          aria-controls="mention-list"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type @ to tag a person"
          className={INPUT}
        />
        {query !== null && (
          <ul
            id="mention-list"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                No match. Add in People settings
              </li>
            ) : (
              matches.map((person, index) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => pick(person)}
                    disabled={pending}
                    title={person.email}
                    className={`block w-full px-3 py-2 text-left ${
                      index === highlight
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                        : "text-neutral-700 dark:text-neutral-200"
                    }`}
                  >
                    {person.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
