# soroban-ttl-doctor-frontend

Dashboard for [`soroban-ttl-doctor-backend`](https://github.com/soroban-doc-ttl/soroban-ttl-doctor-backend):
add contracts/entries to watch, see their TTL status at a glance, trigger
an immediate check, or remove a watch.

Part of a four-repo project:

- [`soroban-ttl-doctor`](https://github.com/soroban-doc-ttl/soroban-ttl-doctor) — the core checking library + CLI.
- [`soroban-ttl-doctor-backend`](https://github.com/soroban-doc-ttl/soroban-ttl-doctor-backend) — the scheduled monitoring API this frontend calls.
- **This repo** — the dashboard.
- [`soroban-ttl-doctor-action`](https://github.com/soroban-doc-ttl/soroban-ttl-doctor-action) — CI-native alternative that doesn't need this whole stack running.

Like [`sep24-conformance-frontend`](https://github.com/SEP-24-conform/sep24-conformance-frontend),
this repo has no logic of its own beyond presentation — every watch,
check, and verdict is real work done by the backend.

## Table of contents

- [What it does](#what-it-does)
- [Design system](#design-system)
- [Component tree](#component-tree)
- [Configuration](#configuration)
- [Running locally](#running-locally)
- [Verification](#verification)
- [Design decisions](#design-decisions)
- [FAQ](#faq)
- [License](#license)

## What it does

A single-page dashboard:

1. **Add a watch** — name, contract ID, target (contract instance, or a
   named `enum DataKey { Variant(T) }` entry), and a warn-days threshold.
2. **See every watch's status** — verdict badge (`ok` / `warn` / `expired`),
   estimated days remaining, when it was last checked.
3. **Check now** — trigger an immediate check outside the backend's
   schedule.
4. **Remove** a watch.

No polling/auto-refresh loop currently — the list refreshes after any
action taken through the UI (add, check, delete), not on a timer. See
[Design decisions](#design-decisions).

## Design system

Same "liquid glass" recipe as
[`sep24-conformance-frontend`](https://github.com/SEP-24-conform/sep24-conformance-frontend#design-system)
— translucent frosted panels, a CSS-only drifting backdrop (no video
asset), pill controls, hairline borders, a diagonal sweep highlight on
hover — reused deliberately rather than reinvented, since it's already a
verified, working design language. The one intentional difference: a
cooler slate/blue-violet backdrop palette here instead of that project's
warm parchment tone, so the two dashboards read as siblings from the same
toolmaker rather than the same product.

See that repo's README for the full token-by-token rationale (why the
blur amount, why the sweep gates behind hover instead of looping, why no
manual light/dark toggle yet) — it isn't repeated here since none of it
changed.

## Component tree

```text
app/
  layout.tsx        root layout, renders .backdrop-field once
  page.tsx           the entire dashboard: fetches watches, composes the pieces below
  globals.css         design tokens (see Design system)
components/
  Nav.tsx             top bar
  AddWatchForm.tsx     client component: instance vs. entry target, submits via lib/api
  WatchCard.tsx        one watch's status + check-now/remove actions
lib/
  api.ts               typed fetch wrappers matching the backend's WatchedEntry shape
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base URL of `soroban-ttl-doctor-backend`. |

## Running locally

```sh
cp .env.example .env.local   # only needed if your backend isn't on localhost:3001
npm install
npm run dev
```

Needs `soroban-ttl-doctor-backend` running — every piece of data on this
page comes from it.

## Verification

Same honest caveat as `sep24-conformance-frontend`: this was built without
a browser automation tool available, so verification was `next build`
succeeding, the served HTML containing the expected `backdrop-field` /
`glass sweep` markup (confirmed via `curl` against a locally running
instance), and a real watch created directly against a locally running
backend to confirm the two integrate. The visual result — whether the
glass/blur/sweep effect actually renders as intended — has not been
confirmed in an actual browser; run `npm run dev` and look before relying
on this for anything.

## Design decisions

**Why no auto-refresh polling?** The backend's own scheduler already
re-checks everything periodically (default every 6 hours — see its
README); polling the dashboard every few seconds for changes that happen
on an hours-long cadence would be all cost, no benefit. Refreshing after
a user-initiated action (add/check/delete) covers the case that actually
matters: seeing the result of something you just did.

**Why one page instead of separate add/list routes?** The CRUD surface
here is small enough (one form, one list) that splitting it across routes
would add navigation for no organizational benefit — unlike
`sep24-conformance-frontend`, which has two genuinely distinct concerns
(run a check vs. browse history).

## FAQ

**Does this show historical TTL trends over time?** No — the backend only
retains the latest status per watch (see its README), so there's no
history to chart. A watch's card shows its most recent check only.

**What happens if I add a watch with a typo'd variant name or wrong field
kind?** The backend can't distinguish "wrong key" from "genuinely
expired" — both look like `found: false` / verdict `expired`. Double-check
the target fields against the contract's actual Rust source if a newly
added watch immediately shows `expired`.

## License

Apache-2.0
