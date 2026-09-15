"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ChecklistSection from "../ChecklistSection";
import Timeline from "../Timeline";
import { FOCUS } from "../ui";
import {
  deleteCardAction,
  getCardDetailAction,
  moveCardAction,
  updateCardAction,
} from "@/app/actions/cards";
import type { CardDetail, Priority, Status, UpdateCardInput } from "@/lib/types";
import DialogProperties from "./DialogProperties";
import type { CardDialogProps } from "./types";

const T = "transition-all duration-150";
const END_OF_COLUMN = 9999;

/** Centred two-column modal: content on the left, properties and timeline on the right. */
export default function CardDialog({ card, sections, onClose }: CardDialogProps) {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [link, setLink] = useState(card.link ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shown, setShown] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    returnRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      setShown(true);
      titleRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      returnRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const flashSaved = useCallback(() => {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1400);
  }, []);

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
          flashSaved();
          onChanged();
        } catch (e) {
          setError((e as Error).message);
        }
      });
    },
    [card.id, flashSaved, onChanged],
  );

  const current = detail?.card ?? card;
  const baseline = useRef({
    title: card.title,
    description: card.description ?? "",
    link: card.link ?? "",
  });

  function saveTitle() {
    const next = title.trim();
    if (!next || next === baseline.current.title) return;
    baseline.current.title = next;
    save({ title: next });
  }

  function saveDescription() {
    if (description === baseline.current.description) return;
    baseline.current.description = description;
    save({ description: description || null });
  }

  function saveLink() {
    if (link === baseline.current.link) return;
    baseline.current.link = link;
    save({ link: link || null });
  }

  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [description]);

  function changeStatus(status: Status) {
    if (status === current.status) return;
    setError(null);
    startTransition(async () => {
      try {
        await moveCardAction(card.id, status, END_OF_COLUMN);
        flashSaved();
        onChanged();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function changeSection(sectionId: string) {
    if (sectionId === current.section_id) return;
    save({ sectionId });
  }

  function changePriority(priority: Priority) {
    if (priority === current.priority) return;
    save({ priority });
  }

  function remove() {
    startTransition(async () => {
      try {
        await deleteCardAction(card.id);
        router.refresh();
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/30 p-4 py-12 backdrop-blur-sm ${T} ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      <div role="presentation" onClick={onClose} className="fixed inset-0" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        className={`relative z-10 w-full max-w-2xl rounded-lg border border-line bg-surface shadow-lg ${T} ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
            {card.section_name}
          </span>
          <span className="flex items-center gap-3">
            <span
              aria-live="polite"
              className={`text-[11px] text-muted ${T} ${saved ? "opacity-100" : "opacity-0"}`}
            >
              Saved
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`rounded-lg px-2 py-1 text-muted ${T} hover:text-accent ${FOCUS}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </span>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <input
              ref={titleRef}
              value={title}
              aria-label="Title"
              onChange={(event) => setTitle(event.target.value)}
              onBlur={saveTitle}
              className={`w-full border-0 bg-transparent px-0 text-xl font-semibold leading-snug text-ink ${FOCUS}`}
            />
            <textarea
              ref={textareaRef}
              value={description}
              rows={3}
              aria-label="Description"
              placeholder="Add a description…"
              onChange={(event) => setDescription(event.target.value)}
              onBlur={saveDescription}
              className={`mt-3 w-full resize-none overflow-hidden border-0 bg-transparent px-0 text-[13px] leading-relaxed text-muted placeholder:text-muted ${FOCUS}`}
            />
            <div className="mt-4 border-t border-line pt-4">
              <ChecklistSection detail={detail} onChanged={onChanged} />
            </div>
          </div>

          <div className="min-w-0">
            <DialogProperties
              current={current}
              detail={detail}
              sections={sections}
              link={link}
              onLinkChange={setLink}
              onLinkBlur={saveLink}
              onStatusChange={changeStatus}
              onSectionChange={changeSection}
              onPriorityChange={changePriority}
              onChanged={onChanged}
            />
            <div className="mt-4 border-t border-line pt-4">
              <Timeline detail={detail} onChanged={onChanged} />
            </div>
          </div>
        </div>

        {error ? <p className="px-6 pb-3 text-[13px] text-danger">{error}</p> : null}

        <div className="flex items-center gap-2 border-t border-line px-6 py-3">
          {confirmDelete ? (
            <>
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className={`rounded-lg border border-danger px-3 py-1.5 text-[13px] text-danger ${T} hover:bg-danger hover:text-white disabled:opacity-40 ${FOCUS}`}
              >
                Confirm delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className={`rounded-lg px-2 py-1.5 text-[13px] text-muted ${T} hover:text-ink ${FOCUS}`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={`rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted ${T} hover:border-danger hover:text-danger ${FOCUS}`}
            >
              Delete
            </button>
          )}
          {pending ? <span className="text-[11px] text-muted">Saving…</span> : null}
        </div>
      </div>
    </div>
  );
}
