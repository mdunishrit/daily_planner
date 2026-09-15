"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ChecklistSection from "./ChecklistSection";
import PeopleTags from "./PeopleTags";
import Timeline from "./Timeline";
import { FOCUS, INPUT } from "./ui";
import { deleteCardAction, getCardDetailAction, updateCardAction } from "@/app/actions/cards";
import type { BoardCard, CardDetail, Priority, Section, UpdateCardInput } from "@/lib/types";

const LABEL = "mb-1 block text-xs text-neutral-500 dark:text-neutral-400";
const GROUP = "border-t border-neutral-200 py-4 dark:border-neutral-800";

/** Card detail panel. It slides in from the right and saves each field on blur. */
export default function CardPanel({
  card,
  sections,
  onClose,
}: {
  card: BoardCard;
  sections: Section[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [link, setLink] = useState(card.link ?? "");
  const [sectionId, setSectionId] = useState(card.section_id);
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setDetail(await getCardDetailAction(card.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [card.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onChanged = useCallback(() => {
    void load();
    router.refresh();
  }, [load, router]);

  const save = useCallback(
    (patch: UpdateCardInput) => {
      setError(null);
      startTransition(async () => {
        try {
          await updateCardAction(card.id, patch);
          onChanged();
        } catch (e) {
          setError((e as Error).message);
        }
      });
    },
    [card.id, onChanged],
  );

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteCardAction(card.id);
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  const current = detail?.card ?? card;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className="fade-in fixed inset-0 z-30 bg-neutral-900/20 dark:bg-black/50"
      />
      <aside
        className="panel-in fixed right-0 top-0 z-40 h-full w-full max-w-md overflow-y-auto border-l border-neutral-200 bg-white px-6 py-4 font-sans shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Card</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close card"
            className={`rounded-lg px-2 py-1 text-sm text-neutral-500 hover:text-brand-700 dark:text-neutral-400 dark:hover:text-brand-400 ${FOCUS}`}
          >
            ✕
          </button>
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (title.trim() && title !== current.title) save({ title: title.trim() });
          }}
          aria-label="Title"
          className={`w-full border-0 bg-transparent px-0 py-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100 ${FOCUS}`}
        />

        <div className={GROUP}>
          <label className={LABEL} htmlFor="card-description">
            Description
          </label>
          <textarea
            id="card-description"
            value={description}
            rows={4}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => {
              if (description !== (current.description ?? "")) {
                save({ description: description || null });
              }
            }}
            className={INPUT}
          />

          <label className={`${LABEL} mt-3`} htmlFor="card-link">
            Link
          </label>
          <input
            id="card-link"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onBlur={() => {
              if (link !== (current.link ?? "")) save({ link: link || null });
            }}
            className={INPUT}
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="card-section">
                Section
              </label>
              <select
                id="card-section"
                value={sectionId}
                onChange={(event) => {
                  setSectionId(event.target.value);
                  save({ sectionId: event.target.value });
                }}
                className={INPUT}
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="card-priority">
                Priority
              </label>
              <select
                id="card-priority"
                value={priority}
                onChange={(event) => {
                  const next = event.target.value as Priority;
                  setPriority(next);
                  save({ priority: next });
                }}
                className={INPUT}
              >
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className={GROUP}>
          <ChecklistSection detail={detail} onChanged={onChanged} />
        </div>
        <div className={GROUP}>
          <PeopleTags detail={detail} onChanged={onChanged} />
        </div>
        <div className={GROUP}>
          <Timeline detail={detail} onChanged={onChanged} />
        </div>

        {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className={`${GROUP} flex items-center gap-2`}>
          {confirmDelete ? (
            <>
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className={`rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 ${FOCUS}`}
              >
                Confirm delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className={`rounded-lg px-2 py-2 text-sm text-neutral-500 dark:text-neutral-400 ${FOCUS}`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={`rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:border-red-300 hover:text-red-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-red-400 ${FOCUS}`}
            >
              Delete
            </button>
          )}
          {pending && <span className="text-xs text-neutral-400">Saving…</span>}
        </div>

        <p className="pb-4 text-xs text-neutral-400 dark:text-neutral-500">
          Created {new Date(current.created_at).toLocaleString()} · Updated{" "}
          {new Date(current.updated_at).toLocaleString()}
        </p>
      </aside>
    </>
  );
}
