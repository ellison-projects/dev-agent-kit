---
globs:
  - "tests/e2e/**"
  - "vitest.e2e.config.ts"
---

# E2E Gotchas (Puppeteer)

How to write Vitest + Puppeteer specs that don't go flaky. Every rule here exists because we paid for it once already.

For *strategy* (when to write E2E vs. unit/integration), see `docs/patterns/testing.md`.
For *unit/integration test formatting*, see `test-files.md`.

## The pattern

```ts
import { afterAll, afterEach, describe, expect, it } from "vitest"

import { baseUrl, getBrowser, newPage } from "./browser"

afterAll(async () => {
  const browser = await getBrowser()
  await browser.close()
})

describe("feature", () => {
  let pages: Awaited<ReturnType<typeof newPage>>[] = []

  afterEach(async () => {
    await Promise.all(pages.map((p) => p.close().catch(() => undefined)))
    pages = []
  })

  it("does the thing", async () => {
    const page = await newPage()
    pages.push(page)
    await page.goto(`${baseUrl()}/login`, { waitUntil: "networkidle2" })
    // ...
  })
})
```

Helpers live in `tests/e2e/browser.ts`:

- `getBrowser()` — lazy **per-worker** singleton browser. The E2E suite is configured to run in a single fork (`pool: "forks"` + `singleFork: true` or `fileParallelism: false`), so in practice there is one browser per suite run — but the singleton itself is process-local, not suite-wide.
- `newPage()` — opens a new tab on the singleton with a fresh BrowserContext (cookies/storage don't leak between tests), 1280×800 viewport.
- `baseUrl()` — the URL of the dev server booted in global setup.

## Rules

### 1. Use `localhost`, not `127.0.0.1`

Next.js dev mode treats requests from a different hostname than the server announced as cross-origin and blocks server actions. The dev server announces `http://localhost:PORT`, so tests must hit `localhost` too. `tests/e2e/global-setup.ts` already builds the URL this way; if you construct your own URL, mirror it.

### 2. Click via `ElementHandle.click()`, not `page.evaluate(() => el.click())`

A `.click()` from inside `evaluate` fires a synthetic JS event that React's event delegation may ignore if hydration hasn't finished. `ElementHandle.click()` goes through the CDP and fires a real mouse event React always picks up.

```ts
const button = await page.waitForSelector("button ::-p-text(Sign in)", {
  timeout: 15_000,
})
if (!button) throw new Error("Button not visible")
await Promise.all([
  page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60_000 }),
  button.click(),
])
```

### 3. Force `NODE_ENV=development` for the dev server

Vitest sets `NODE_ENV=test`, which makes Next skip `.env.local` loading. The global setup parses `.env.local` itself and overrides `NODE_ENV=development` when spawning `next dev` so the env validates and dev-only features (test buttons, dev logging) light up.

### 4. Use `waitUntil: "networkidle2"` on `goto`

`networkidle0` waits for zero in-flight requests, which never happens in `next dev` because the HMR websocket reconnects continuously in headless Chrome. `networkidle2` (≤2 in-flight) is enough to know the page rendered without blocking forever.

### 5. Capture the response — `page.goto()` doesn't throw on 4xx/5xx

`page.goto()` returns an `HTTPResponse` for non-OK statuses rather than throwing. A pathname-only assertion will silently pass on a 500 error page at the same URL. Capture the response, assert `response.ok()`, and ideally also wait for a known shell element to prove hydration completed.

```ts
const response = await page.goto(`${baseUrl()}/admin`, {
  waitUntil: "networkidle2",
})
if (!response) throw new Error("No HTTP response")
expect(response.ok()).toBe(true)
await page.waitForSelector("nav, [role='navigation']", { timeout: 10_000 })
```

### 6. Screenshot on failure

Wrap interaction code in `try/catch` and write `tests/e2e/.failure.png` (gitignored) on failure. Click failures vs hydration races vs server-action errors all look the same in stack traces; a screenshot makes triage instant.

```ts
try {
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60_000 }),
    button.click(),
  ])
} catch (err) {
  await page
    .screenshot({ path: "tests/e2e/.failure.png", fullPage: true })
    .catch(() => undefined)
  throw err
}
```

### 7. The runner owns the dev server

`tests/e2e/global-setup.ts` kills leftover `next-server` processes and cleans `.next/dev/` before each run. Don't add custom dev-server-startup code outside that file — one spawn per suite run, owned by the runner.

The `pkill` cleanup is deliberately broad (matches any `next-server` / `next dev` process) so the suite recovers cleanly from a crashed previous run. **Note:** on a machine running another `next dev` for an unrelated project, this can kill that process too. If you're running multiple Next apps locally, run the E2E suite in an isolated workspace or shut the other dev server first.

### 8. Use `--no-sandbox` for headless Chrome in cloud sandboxes

The Puppeteer launch in `browser.ts` passes `--no-sandbox --disable-setuid-sandbox` so the suite works when running as root (Vercel preview, GitHub Actions, Claude Code remote env).

## Don'ts

- ❌ Don't bypass `getBrowser()` and launch Puppeteer manually in a test file. The singleton + per-page lifecycle is what keeps the suite fast.
- ❌ Don't add a `dev` server outside `global-setup.ts`. One spawn per suite run, owned by the runner.
- ❌ Don't write an E2E for things a unit or integration test would cover. The suite is slow and fragile — keep it to flows you can't exercise any other way.
