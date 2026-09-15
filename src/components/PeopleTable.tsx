"use client";

import { useEffect, useState, useTransition } from "react";
import { createPersonAction, deletePersonAction, updatePersonAction } from "@/app/actions/people";
import { BUTTON_PRIMARY, BUTTON_QUIET, FOCUS, INPUT } from "./ui";
import type { Person } from "@/lib/types";

const CELL = "px-4 py-3 text-sm text-ink ";

export default function PeopleTable({ people }: { people: Person[] }) {
  const [list, setList] = useState(people);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setList(people);
  }, [people]);

  function run(next: Person[], work: () => Promise<unknown>) {
    const before = list;
    setList(next);
    setError(null);
    startTransition(async () => {
      try {
        await work();
      } catch (e) {
        setError((e as Error).message);
        setList(before);
      }
    });
  }

  function add() {
    const n = name.trim();
    const m = email.trim();
    if (!n || !m) return;
    const temp: Person = {
      id: `temp-${Date.now()}`,
      name: n,
      email: m,
      created_at: new Date().toISOString(),
    };
    setName("");
    setEmail("");
    run([...list, temp], () => createPersonAction(n, m));
  }

  function startEdit(person: Person) {
    setEditId(person.id);
    setEditName(person.name);
    setEditEmail(person.email);
  }

  function saveEdit(personId: string) {
    const n = editName.trim();
    const m = editEmail.trim();
    setEditId(null);
    if (!n || !m) return;
    run(
      list.map((p) => (p.id === personId ? { ...p, name: n, email: m } : p)),
      () => updatePersonAction(personId, { name: n, email: m }),
    );
  }

  function remove(personId: string) {
    setConfirmId(null);
    run(
      list.filter((p) => p.id !== personId),
      () => deletePersonAction(personId),
    );
  }

  return (
    <div className="max-w-3xl">
      <form
        className="mb-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
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
        <button type="submit" className={BUTTON_PRIMARY}>
          Add person
        </button>
      </form>

      {error && <p className="mb-2 text-sm text-danger ">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-line bg-card shadow-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-xs text-muted  ">
              <th className="px-4 py-2 font-normal">Name</th>
              <th className="px-4 py-2 font-normal">Email</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {list.map((person) => (
              <tr key={person.id} className="border-b border-line last:border-0 ">
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
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveEdit(person.id);
                        }}
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => saveEdit(person.id)}
                        className={`mr-2 ${BUTTON_PRIMARY}`}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className={`rounded-lg px-3 py-2 text-sm text-muted  ${FOCUS}`}
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
                      {!person.id.startsWith("temp-") && (
                        <>
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
                                className={`mr-2 rounded-lg border border-danger px-3 py-2 text-sm text-danger     ${FOCUS}`}
                              >
                                Confirm remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmId(null)}
                                className={`rounded-lg px-3 py-2 text-sm text-muted  ${FOCUS}`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmId(person.id)}
                              className={`rounded-lg px-3 py-2 text-sm text-muted hover:text-danger   ${FOCUS}`}
                            >
                              Remove
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-sm text-muted ">
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
