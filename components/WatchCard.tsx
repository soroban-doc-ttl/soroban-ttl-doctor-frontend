"use client";

import { useState } from "react";
import { deleteWatch, triggerCheck, type WatchedEntry } from "@/lib/api";

const VERDICT_STYLE: Record<string, string> = {
  ok: "bg-pass/15 text-pass",
  warn: "bg-warn/15 text-warn",
  expired: "bg-fail/15 text-fail",
};

function targetSummary(watch: WatchedEntry): string {
  if (watch.target.kind === "instance") return "instance";
  return `${watch.target.variant}(${watch.target.field.value})`;
}

export function WatchCard({ watch, onChanged }: { watch: WatchedEntry; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  async function handleCheck() {
    setBusy(true);
    try {
      await triggerCheck(watch.name);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteWatch(watch.name);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass sweep flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{watch.name}</p>
          {watch.lastVerdict && (
            <span className={`pill px-2.5 py-0.5 text-xs font-medium ${VERDICT_STYLE[watch.lastVerdict]}`}>
              {watch.lastVerdict}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted">
          {watch.contractId} · {targetSummary(watch)}
        </p>
        {watch.lastStatus?.estimatedDaysRemaining !== undefined && (
          <p className="text-xs text-muted">~{watch.lastStatus.estimatedDaysRemaining.toFixed(1)} days remaining</p>
        )}
        {!watch.lastCheckedAt && <p className="text-xs text-muted">Never checked yet</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleCheck}
          disabled={busy}
          className="pill glass-strong sweep px-4 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          Check now
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="pill px-4 py-1.5 text-xs font-medium text-fail hover:bg-fail/10 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
