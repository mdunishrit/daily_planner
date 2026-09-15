"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPersonAction,
  deletePersonAction,
  updatePersonAction,
} from "@/app/actions/people";
import { BUTTON_PRIMARY, BUTTON_QUIET, FOCUS, INPUT } from "./ui";
import type { Person } from "@/lib/types";

const CELL = "px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200";

export default function PeopleTable({ people }: { people: Person[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(work: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await work();
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function add() {
    if (!name.trim() || !email.trim()) return;
    run(async () => {
      await createPersonAction(name.trim(), email.trim());
      setName("");
      setEmail("");
    });
  }

  function startEdit(person: Person) {
    setEditId(person.id);
    setEditName(person.name);
    setEditEmail(person.email);
  }

  function saveEdit(personId: string) {
    run(async () => {
      await updatePersonAction(personId, { name: editName.trim(), email: editEmail.trim() });
      setEditId(null);
    });
  }

  function remove(personId: string) {
    run(async () => {
      await deletePersonAction(personId);
      setConfirmId(null);
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className={`${INPUT} w-48`}
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className={`${INPUT} w-64`}
        />
        <button type="button" onClick={add} disabled={pending} className={BUTTON_PRIMARY}>
          Add person
        </button>
      </div>

      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th className="px-4 py-2 font-normal">Name</th>
              <th className="px-4 py-2 font-normal">Email</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr
                key={person.id}
                className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
              >
                {editId === person.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editEmail}
                        onChange={(event) => setEditEmail(event.target.value)}
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => saveEdit(person.id)}
                        disabled={pending}
                        className={`mr-2 ${BUTTON_PRIMARY}`}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className={`rounded-lg px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 ${FOCUS}`}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={CELL}>{person.name}</td>
                    <td className={CELL}>{person.email}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(person)}
                        className={`mr-2 ${BUTTON_QUIET}`}
                      >
                        Edit
                      </button>
                      {confirmId === person.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => remove(person.id)}
                            disabled={pending}
                            className={`mr-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 ${FOCUS}`}
                          >
                            Confirm remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className={`rounded-lg px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 ${FOCUS}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(person.id)}
                          className={`rounded-lg px-3 py-2 text-sm text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 ${FOCUS}`}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {people.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  No people yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
