import Link from "next/link";
import ConnectionError from "@/components/ConnectionError";
import PeopleTable from "@/components/PeopleTable";
import ThemeToggle from "@/components/ThemeToggle";
import { BUTTON_QUIET } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";
import { listPeople } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  if (!getSupabase()) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">People</h1>
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Supabase not configured. Add .env.local
        </p>
      </main>
    );
  }

  let people;
  try {
    people = await listPeople();
  } catch (e) {
    return <ConnectionError message={(e as Error).message} href="/people" />;
  }

  return (
    <main className="min-h-screen bg-surface font-sans dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-base font-semibold text-brand-700 dark:text-brand-400">People</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className={BUTTON_QUIET}>
            Board
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="px-6 py-6">
        <PeopleTable people={people} />
      </div>
    </main>
  );
}
