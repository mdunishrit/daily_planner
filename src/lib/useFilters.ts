"use client";

import { usePathname, useSearchParams } from "next/navigation";

/** Board filter state kept in the URL query string. Updates the URL without a server round trip. */
export function useFilters() {
  const pathname = usePathname();
  const params = useSearchParams();

  function get(key: string) {
    return params?.get(key) ?? "";
  }

  function set(key: string, value: string) {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    window.history.pushState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  function toggle(key: string, value: string) {
    set(key, get(key) === value ? "" : value);
  }

  function clear() {
    window.history.pushState(null, "", pathname);
  }

  const active = ["person", "section", "priority", "today", "archived"].some((key) => get(key));

  return { get, set, toggle, clear, active };
}
