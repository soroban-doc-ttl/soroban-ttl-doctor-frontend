"use client";

import { useState, type FormEvent } from "react";
import { createWatch, ApiError, type CreateWatchInput, type FieldKind } from "@/lib/api";

export function AddWatchForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [contractId, setContractId] = useState("");
  const [kind, setKind] = useState<"instance" | "entry">("instance");
  const [variant, setVariant] = useState("");
  const [fieldKind, setFieldKind] = useState<FieldKind>("string");
  const [fieldValue, setFieldValue] = useState("");
  const [warnDays, setWarnDays] = useState("7");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateWatchInput = {
        name: name.trim(),
        contractId: contractId.trim(),
        warnDays: warnDays ? Number(warnDays) : undefined,
        target:
          kind === "instance"
            ? { kind: "instance" }
            : { kind: "entry", variant: variant.trim(), field: { kind: fieldKind, value: fieldValue.trim() } },
      };
      await createWatch(input);
      setName("");
      setContractId("");
      setVariant("");
      setFieldValue("");
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the backend.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong space-y-4 p-6">
      <h2 className="text-lg font-semibold">Add a watch</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
            placeholder="registry-instance"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Contract ID
          <input
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            required
            className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
            placeholder="C..."
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Target
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as "instance" | "entry")}
          className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
        >
          <option value="instance">Contract instance</option>
          <option value="entry">Named entry (enum DataKey variant)</option>
        </select>
      </label>

      {kind === "entry" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Variant
            <input
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              required
              className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
              placeholder="Attestation"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Field kind
            <select
              value={fieldKind}
              onChange={(e) => setFieldKind(e.target.value as FieldKind)}
              className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
            >
              <option value="string">string</option>
              <option value="symbol">symbol</option>
              <option value="u64">u64</option>
              <option value="address">address</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Field value
            <input
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              required
              className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
              placeholder="testanchor.stellar.org"
            />
          </label>
        </div>
      )}

      <label className="flex max-w-[10rem] flex-col gap-1 text-sm text-muted">
        Warn days
        <input
          type="number"
          min={1}
          value={warnDays}
          onChange={(e) => setWarnDays(e.target.value)}
          className="glass rounded-xl bg-transparent px-3 py-2 text-ink outline-none"
        />
      </label>

      {error && <p className="text-sm text-fail">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="pill glass sweep px-6 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add watch"}
      </button>
    </form>
  );
}
