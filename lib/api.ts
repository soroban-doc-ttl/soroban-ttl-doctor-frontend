const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Verdict = "ok" | "warn" | "expired";
export type FieldKind = "string" | "symbol" | "u64" | "address";

export type WatchTarget =
  | { kind: "instance" }
  | {
      kind: "entry";
      variant: string;
      field: { kind: FieldKind; value: string };
      durability?: "persistent" | "temporary";
    };

export interface TtlStatus {
  contractId: string;
  durability: "persistent" | "temporary";
  keyXdr: string;
  currentLedger: number;
  liveUntilLedgerSeq?: number;
  ledgersRemaining?: number;
  estimatedDaysRemaining?: number;
  found: boolean;
}

export interface WatchedEntry {
  name: string;
  contractId: string;
  target: WatchTarget;
  warnDays: number;
  createdAt: string;
  lastCheckedAt?: string;
  lastVerdict?: Verdict;
  lastStatus?: TtlStatus;
}

export interface CreateWatchInput {
  name: string;
  contractId: string;
  target: WatchTarget;
  warnDays?: number;
}

export class ApiError extends Error {}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function listWatches(): Promise<WatchedEntry[]> {
  return fetch(`${API_URL}/api/watches`).then((res) => handle<WatchedEntry[]>(res));
}

export function createWatch(input: CreateWatchInput): Promise<WatchedEntry> {
  return fetch(`${API_URL}/api/watches`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) => handle<WatchedEntry>(res));
}

export function deleteWatch(name: string): Promise<void> {
  return fetch(`${API_URL}/api/watches/${encodeURIComponent(name)}`, { method: "DELETE" }).then((res) =>
    handle<void>(res),
  );
}

export function triggerCheck(name: string): Promise<WatchedEntry> {
  return fetch(`${API_URL}/api/watches/${encodeURIComponent(name)}/check`, { method: "POST" }).then((res) =>
    handle<WatchedEntry>(res),
  );
}
