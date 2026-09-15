"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Priority } from "@/lib/types";
import type { BoardFilters } from "./types";

const DEBOUNCE_MS = 200;

export type BoardFilterKey = keyof BoardFilters;

function readFilters(params: URLSearchParams | null): BoardFilters {
  const priority = params?.get("priority") ?? "";
  return {
    person: params?.get("person") || undefined,
    section: params?.get("section") || undefined,
    priority: (["high", "normal", "low"] as const).includes(priority as Priority)
      ? (priority as Priority)
      : undefined,
    today: params?.get("today") === "1",
    archived: params?.get("archived") === "1",
    q: params?.get("q") ?? "",
    view: params?.get("view") === "list" ? "list" : "board",
  };
}

function writeUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
}

/** Board filters kept in the URL. `q` updates instantly and writes the URL after 200ms. */
export function useBoardFilters() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const urlFilters = useMemo(() => readFilters(params), [params]);
  const [q, setQ] = useState(urlFilters.q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const set = useCallback(
    (key: BoardFilterKey, value: string | boolean | undefined) => {
      const next = new URLSearchParams(params?.toString() ?? "");
      const text =
        typeof value === "boolean" ? (value ? "1" : "") : value == null ? "" : String(value);
      if (text) next.set(key, text);
      else next.delete(key);

      if (key === "q") {
        setQ(text);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => writeUrl(pathname, next), DEBOUNCE_MS);
        return;
      }
      if (key === "archived") {
        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        return;
      }
      writeUrl(pathname, next);
    },
    [params, pathname, router],
  );

  const clear = useCallback(() => {
    setQ("");
    if (timer.current) clearTimeout(timer.current);
    const next = new URLSearchParams();
    if (params?.get("view") === "list") next.set("view", "list");
    const query = next.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (params?.get("archived") === "1") router.replace(url, { scroll: false });
    else writeUrl(pathname, next);
  }, [params, pathname, router]);

  const filters: BoardFilters = useMemo(() => ({ ...urlFilters, q }), [urlFilters, q]);
  const active =
    Boolean(filters.person) ||
    Boolean(filters.section) ||
    Boolean(filters.priority) ||
    filters.today ||
    filters.archived ||
    filters.q.trim() !== "";

  return { filters, set, clear, active };
}
