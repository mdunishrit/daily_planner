"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addPersonToCardAction,
  listPeopleAction,
  removePersonFromCardAction,
} from "@/app/actions/people";
import { FOCUS, INPUT } from "./ui";
import type { CardDetail, Person } from "@/lib/types";

/** The name being searched: text after the last `@`, or the whole input when there is no `@`. */
function mentionQuery(text: string): string | null {
  const at = text.lastIndexOf("@");
  const rest = at < 0 ? text : text.slice(at + 1);
  if (!rest.trim()) return null;
  return rest.trim();
}

/** People tags on a card plus an `@` mention picker with keyboard navigation. */
export default function PeopleTags({
  detail,
  onChanged,
  compact = false,
}: {
  detail: CardDetail | null;
  onChanged: () => void;
  compact?: boolean;
}) {
  const [all, setAll] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>(detail?.people ?? []);
  const [text, setText] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPeople(detail?.people ?? []);
  }, [detail]);

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
  const tagged = new Set(people.map((p) => p.id));
  const matches =
    query === null
      ? []
      : all.filter((p) => !tagged.has(p.id) && p.name.toLowerCase().includes(query.toLowerCase()));

  function run(next: Person[], work: () => Promise<void>) {
    const before = people;
    setPeople(next);
    setError(null);
    startTransition(async () => {
      try {
        await work();
        onChanged();
      } catch (e) {
        setError((e as Error).message);
        setPeople(before);
      }
    });
  }

  function pick(person: Person) {
    setText("");
    run([...people, person], () => addPersonToCardAction(cardId, person.id));
  }

  function remove(personId: string) {
    run(
      people.filter((p) => p.id !== personId),
      () => removePersonFromCardAction(cardId, personId),
    );
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
      {!compact && (
        <label className="mb-2 block text-xs text-muted " htmlFor="mention">
          People
        </label>
      )}
      <div className="mb-2 flex flex-wrap gap-1">
        {people.map((person) => (
          <span
            key={person.id}
            title={`${person.name} (${person.email})`}
            className="flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-xs text-ink  "
          >
            {person.name}
            <button
              type="button"
              onClick={() => remove(person.id)}
              aria-label={`Remove ${person.name}`}
              className={`text-muted hover:text-danger  ${FOCUS}`}
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
          placeholder={compact ? "Add person" : "Type a name to tag a person"}
          className={compact ? `${INPUT} px-2 py-1 text-[13px]` : INPUT}
        />
        {query !== null && (
          <ul
            id="mention-list"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-card text-sm shadow-md"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-muted ">No match. Add in People settings</li>
            ) : (
              matches.map((person, index) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => pick(person)}
                    title={person.email}
                    className={`block w-full px-3 py-2 text-left ${
                      index === highlight ? "bg-accent-soft text-accent  " : "text-ink "
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

      {error && <p className="mt-2 text-sm text-danger ">{error}</p>}
    </div>
  );
}
