# docs/integrations/

How third-party services are wired into this project — the "I need to set up Neon from scratch" or "where does the Resend API key come from?" reference.

What belongs here:

- **Account setup**: which account owns this service, who has access, where billing lives.
- **Environment variables** the service needs (names and where they're set — Vercel project settings, `.env.local`, etc. — never the values themselves).
- **Configuration that lives in the service's dashboard** rather than in code: webhook endpoints, allowed origins, sender domains, IAM roles, bucket policies.
- **Quirks and gotchas** specific to the integration: rate limits, sandbox-vs-production differences, regional constraints, known bugs.

What doesn't belong here:

- Actual secrets — never commit credentials. Reference the env var name; the value lives in Vercel/1Password/wherever.
- How the project *uses* the service in code → `../systems/<feature>.md`.
- Why this service was chosen over alternatives → `../decisions/`.

One file per service: `vercel.md`, `neon.md`, `resend.md`, `s3.md`, `anthropic.md`. Treat each as "everything a new contributor needs to know to operate the integration end-to-end."

If a setup step has to be run in a dashboard rather than in code, that's exactly the thing that belongs here — code is self-documenting, dashboards aren't.
