---
globs:
  - "**/*.test.{ts,tsx}"
---

# Test Files Rules

Conventions for writing unit and integration tests so they stay easy to scan, maintain, and run.

For *strategy* (when to write unit vs. integration vs. E2E), see `docs/patterns/testing.md`.
For *E2E gotchas* (Puppeteer pitfalls), see `e2e-gotchas.md`.

## Framework

Use **Vitest** (not Jest):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"
```

Match the surrounding repo's formatter — semicolons vs. no-semicolons, quote style, etc. Don't fight prettier.

## File Naming

- Test files: `*.test.ts` or `*.test.tsx`
- Co-located with source where the existing repo convention is colocation: `src/middleware.test.ts` next to `src/middleware.ts`
- Or grouped under `tests/` if that's the repo's convention — match what's already there

## Mobile-Friendly Format

**Critical:** format test data arrays with one object per line so they're scannable on a phone.

### Bad — single-line objects (horizontal scroll):

```ts
it.each([
  { input: "value-a", expected: "result-a", description: "case a" },
  { input: "value-b", expected: "result-b", description: "case b" },
])
```

### Good — one object per line:

```ts
it.each([
  {
    input: "value-a",
    expected: "result-a",
    description: "case a",
  },
  {
    input: "value-b",
    expected: "result-b",
    description: "case b",
  },
])
```

## Table-Driven Tests

Reach for `it.each()` whenever you'd otherwise copy-paste the same `it()` block with different inputs:

```ts
describe("formatPhone", () => {
  it.each([
    {
      input: "5551234567",
      expected: "(555) 123-4567",
      description: "10 digits, no separators",
    },
    {
      input: "+1 555 123 4567",
      expected: "(555) 123-4567",
      description: "country code + spaces",
    },
  ])("$input → $expected ($description)", ({ input, expected }) => {
    expect(formatPhone(input)).toBe(expected)
  })
})
```

### Benefits

- Easy to add new cases — one object, not a new `it()`
- Clear input → output mapping in the test name
- Vertical scanning works on small screens

## Test Structure

Group tests by logical section:

```ts
describe("ComponentName", () => {
  // Section 1: helpers
  describe("helperFunction", () => {
    it.each([...])("...", () => {})
  })

  // Section 2: full flows
  describe("Integration: full flow", () => {
    it.each([...])("...", () => {})
  })

  // Section 3: error paths
  describe("Error handling", () => {
    it("returns null on DB error", () => {})
  })
})
```

Use section headers only when a file has enough variety to need them — small files don't.

## Visual Separators in `it.each`

Use comments to split happy-path from edge cases:

```ts
it.each([
  // ✅ Valid cases
  { input: "valid-a", expected: true, description: "..." },
  { input: "valid-b", expected: true, description: "..." },

  // ❌ Invalid cases (return null/false)
  { input: "invalid-a", expected: null, description: "..." },
  { input: "invalid-b", expected: null, description: "..." },
])
```

## Test Names

Test names show up in the terminal — make them descriptive:

```ts
// Good: shows input → output
"$input → $expected ($description)"
// → '(555) 123-4567' ('10 digits, no separators')

// Good: shows scenario → result
"$scenario → $expectedType"
// → 'authenticated user on protected page' → 'render'

// Bad: generic
"should work correctly"
```

## Mocking

The strategy doc (`docs/patterns/testing.md`) covers *when* to mock. This section covers *how*, given that you've decided to.

### Module mocks

```ts
vi.mock("@/path/to/module", () => ({
  exportedFn: vi.fn(),
}))

import { exportedFn } from "@/path/to/module"

// In a test:
vi.mocked(exportedFn).mockResolvedValue({ id: "123" })
```

The exact import paths depend on the repo (`@/lib/db`, `@/db/sql`, `@/services/...`). Mirror existing tests in the same repo when in doubt.

### Next.js mocks

```ts
vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(),
    redirect: vi.fn(),
    rewrite: vi.fn(),
  },
}))
```

```ts
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
```

### Auth / session mocks

The auth helper varies per repo — `@/auth`, `@/lib/auth`, `@/lib/session`, etc. Match the surrounding tests.

```ts
vi.mock("@/lib/session", () => ({
  getCurrentUser: vi.fn(),
}))
```

## Setup and Cleanup

```ts
describe("suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // tests
})
```

For integration tests that hit a real DB, the repo's `tests/helpers/` typically exposes a `truncateAll()` or equivalent — use it in `beforeEach`.

## What Each Test File Should Cover

A test file doesn't need to cover everything below — match the shape of the code under test.

- **Pure logic** (formatters, parsers, validators) — happy-path + edge cases + invalid inputs. No DB, no errors-from-elsewhere.
- **Server actions / route handlers** — happy-path + validation failure + auth failure + downstream error path.
- **Components** — render with representative props + key interaction(s). Not every prop combination.

Don't pad files with "test for completeness" cases that don't reflect a real failure mode.

## Quick Reference Documentation

For complex test files, a sibling markdown doc helps mobile reading:

```markdown
# Component Test Cases

| Input | Expected | Description |
|-------|----------|-------------|
| `valid-input` | `expected-output` | what this proves |
```

Optional — only when the file has enough cases to justify it.

## Running Tests

```bash
npm test                  # full suite (unit + integration where applicable)
npm run test:watch        # watch mode
npm run test:ui           # Vitest UI (where available)
npm test -- --reporter=verbose   # see all test names
```

E2E (Puppeteer) lives in `tests/e2e/` and runs via `npm run test:e2e` — kept separate from the default `npm test` so unit + integration stay fast.

## Example: minimal test file

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/path/to/dependency", () => ({
  someDep: vi.fn(),
}))

import { myFunction } from "./my-module"
import { someDep } from "@/path/to/dependency"

describe("myFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    // ✅ Valid inputs
    {
      input: "valid-a",
      expected: "result-a",
      description: "simple case",
    },
    {
      input: "valid-b",
      expected: "result-b",
      description: "complex case",
    },
    // ❌ Invalid inputs
    {
      input: "invalid",
      expected: null,
      description: "returns null",
    },
  ])("$input → $expected ($description)", ({ input, expected }) => {
    expect(myFunction(input)).toBe(expected)
  })

  it("handles dependency errors gracefully", async () => {
    vi.mocked(someDep).mockRejectedValue(new Error("nope"))
    const result = await myFunction("x")
    expect(result).toBeNull() // fail-open
  })
})
```

## Why These Rules

- **Mobile-first** — developer can review tests on a phone
- **Scannable** — see all cases at a glance, no horizontal scroll
- **Maintainable** — easy to add or modify cases
- **Honest names** — terminal output makes failures obvious
