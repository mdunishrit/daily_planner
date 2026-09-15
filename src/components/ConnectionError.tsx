import Link from "next/link";

/** Shown when the server cannot reach Supabase. Offers a plain reload link. */
export default function ConnectionError({ message, href }: { message: string; href: string }) {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Daily Planner</h1>
      <div className="mt-4 max-w-xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <p className="font-medium">Cannot reach the database.</p>
        <p className="mt-1">
          The server could not connect to Supabase. This is usually the network or DNS on this
          machine, not the app.
        </p>
        <p className="mt-2 break-all font-mono text-xs opacity-80">{message}</p>
        <Link
          href={href}
          className="mt-3 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          Retry
        </Link>
      </div>
    </main>
  );
}
