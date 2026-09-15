"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addChecklistItemAction,
  deleteChecklistItemAction,
  reorderChecklistAction,
  toggleChecklistItemAction,
  updateChecklistItemAction,
} from "@/app/actions/checklist";
import { BUTTON_PRIMARY, FOCUS, INPUT } from "./ui";
import type { CardDetail, ChecklistItem } from "@/lib/types";

/** Card checklist: tick, inline edit, add, delete, and move items up or down. */
export default function ChecklistSection({
  detail,
  onChanged,
}: {
  detail: CardDetail | null;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(detail?.checklist ?? []);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(detail?.checklist ?? []);
  }, [detail]);

  if (!detail) return null;

  const cardId = detail.card.id;
  const doneCount = items.filter((i) => i.is_done).length;

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

  function add() {
    const text = draft.trim();
    if (!text) return;
    run(async () => {
      const item = await addChecklistItemAction(cardId, text);
      setItems((list) => [...list, item]);
      setDraft("");
    });
  }

  function toggle(id: string) {
    run(async () => {
      const item = await toggleChecklistItemAction(id);
      setItems((list) => list.map((i) => (i.id === id ? item : i)));
    });
  }

  function commitEdit(id: string) {
    const text = editText.trim();
    setEditingId(null);
    const current = items.find((i) => i.id === id);
    if (!text || !current || text === current.text) return;
    run(async () => {
      const item = await updateChecklistItemAction(id, text);
      setItems((list) => list.map((i) => (i.id === id ? item : i)));
    });
  }

  function remove(id: string) {
    run(async () => {
      await deleteChecklistItemAction(id);
      setItems((list) => list.filter((i) => i.id !== id));
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setItems(next);
    run(async () => {
      await reorderChecklistAction(cardId, next.map((i) => i.id));
    });
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Checklist</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {doneCount}/{items.length}
        </span>
      </div>

      <ul className="mb-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              checked={item.is_done}
              disabled={pending}
              onChange={() => toggle(item.id)}
              className={`h-4 w-4 accent-brand-500 ${FOCUS}`}
            />
            {editingId === item.id ? (
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => commitEdit(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(item.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className={`${INPUT} flex-1 py-1`}
              />
            ) : (
              <span
                onClick={() => {
                  setEditingId(item.id);
                  setEditText(item.text);
                }}
                className={`flex-1 cursor-text ${item.is_done ? "text-neutral-400 line-through dark:text-neutral-500" : "text-neutral-700 dark:text-neutral-200"}`}
              >
                {item.text}
              </span>
            )}
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={pending || index === 0}
              aria-label="Move up"
              className={`rounded px-1 text-xs text-neutral-500 disabled:opacity-30 dark:text-neutral-400 ${FOCUS}`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={pending || index === items.length - 1}
              aria-label="Move down"
              className={`rounded px-1 text-xs text-neutral-500 disabled:opacity-30 dark:text-neutral-400 ${FOCUS}`}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(item.id)}
              disabled={pending}
              aria-label="Delete item"
              className={`rounded px-1 text-xs text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 ${FOCUS}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={draft}
          placeholder="Add checklist item"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          className={`${INPUT} flex-1`}
        />
        <button
          type="button"
          onClick={add}
          disabled={pending}
          className={BUTTON_PRIMARY}
        >
          Add
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </section>
  );
}
