"use client";

import { useCallback, useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { AddWatchForm } from "@/components/AddWatchForm";
import { WatchCard } from "@/components/WatchCard";
import { listWatches, ApiError, type WatchedEntry } from "@/lib/api";

export default function Home() {
  const [watches, setWatches] = useState<WatchedEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listWatches()
      .then(setWatches)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not reach the backend."));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-6 py-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Watched contracts</h1>
          <p className="mt-3 max-w-xl text-muted">
            Every entry here is re-checked on a schedule by{" "}
            <a
              className="underline hover:text-ink"
              href="https://github.com/soroban-doc-ttl/soroban-ttl-doctor-backend"
              target="_blank"
              rel="noreferrer"
            >
              soroban-ttl-doctor-backend
            </a>
            . Add one below, or trigger an immediate check on an existing watch.
          </p>
        </div>

        <AddWatchForm onAdded={refresh} />

        <div className="space-y-3">
          {error && <div className="glass border-fail/40 p-4 text-sm text-fail">{error}</div>}
          {!error && watches === null && <p className="text-muted">Loading…</p>}
          {watches?.length === 0 && <p className="text-muted">No watches yet — add one above.</p>}
          {watches?.map((watch) => <WatchCard key={watch.name} watch={watch} onChanged={refresh} />)}
        </div>
      </main>
    </>
  );
}
