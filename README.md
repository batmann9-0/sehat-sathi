# Sehat Sathi — AI Patient Advocate for Pakistan

**Built with Qwen only.** Every AI capability in this project is a Qwen
model, published on ModelScope and served through Alibaba DashScope.
Development was assisted by Qwen Coder. There is no other AI provider
anywhere in the code, the prompts, the dependencies, or this document.

> **Safety rule: Explain, don't diagnose.** Sehat Sathi explains a
> patient's own documents in plain words. It never diagnoses, never
> suggests changing a prescribed treatment, and always points the
> patient back to their doctor or pharmacist for decisions.

## The regional problem

Pakistan has no national electronic health record. A patient's medical
history lives in a plastic bag: crumpled lab reports, handwritten
prescriptions, and receipts from half a dozen labs. The consequences
are local and concrete:

- The same test is ordered and paid for again because nobody can see
  it was done last month.
- Prescriptions are written in jargon and abbreviations a low-literacy
  patient cannot follow, so medicines are taken wrong.
- Branded medicines are bought at full price when the same salt is
  available as a cheap generic.
- In an emergency, a first responder knows nothing about the patient —
  no blood group, no allergies, no conditions.

Sehat Sathi is the patient's own advocate against all four, in the
language the patient actually speaks: simple Roman Urdu.

## Built with Qwen only — capability map

| Capability | Qwen component | Where |
|---|---|---|
| Vision extraction from report / prescription photos | Qwen vision model (`QWEN_VL_MODEL`, default `qwen-vl-max`), from ModelScope via DashScope | Prompt A, `src/lib/qwen.ts` → `POST /api/extract` |
| Reasoning: duplicate detection support, lab trust, SOS updates | Qwen chat model (`QWEN_MODEL`, default `qwen-max`), from ModelScope via DashScope | Prompt B, `src/lib/qwen.ts` → `POST /api/process` |
| Roman Urdu medication translation | Qwen chat model (Prompt B) | `POST /api/process` |
| Code development | Qwen Coder–assisted development | this repository |
| Deterministic core (no model call needed) | Pure TypeScript: 60-day Duplicate Shield, Sasta Badal lookup, SOS card builder | `src/lib/demo-logic.ts` |

Model IDs are configurable in `.env` (see `.env.example`); the defaults
are the Qwen models listed above.

## The 7 locked features

1. **Snap & Digitize** — photo a messy, handwritten report or
   prescription; the Qwen vision model extracts structured data
   (tests, values, medicines, allergies). It extracts only what is
   visible: unclear fields come back `"unclear"`, missing fields `null`.
2. **Duplicate Test Shield** — a test ordered again within 60 days is
   flagged with the previous date and lab, and the PKR the patient
   saves by not repeating it.
3. **Vernacular Medication Translator** — prescription jargon becomes
   simple Roman Urdu instructions in everyday words, with the safety
   warnings from the document kept front and centre.
4. **Auto-SOS Emergency Card** — blood group, allergies, chronic
   conditions and an emergency contact on one card a first responder
   can read at a glance (payload is QR-ready plain text).
5. **Lab Trust & Benchmarking** — the lab on the document is checked
   against Pakistani lab trust tiers; for critical tests at a Tier 1–2
   lab, the patient is gently pointed at a Tier 3 accredited lab.
6. **Sasta Badal** — a branded medicine is matched to its generic
   alternative (same salt) with the PKR saving. Every answer carries:
   *confirm with your pharmacist.*
7. **Doctor Visit Prep** — the patient describes symptoms in Roman
   Urdu; Sehat Sathi structures them into a short professional English
   summary the doctor can read in seconds. Structuring only — never a
   diagnosis.

## Architecture

- **Next.js 15 + React 19 + TypeScript** (App Router), mobile-first web.
- **Prisma + Postgres** — 6 models: `User`, `PatientProfile`,
  `Document`, `TestResult`, `Medication`, `SymptomNote`
  (`prisma/schema.prisma`).
- **Qwen layer** — `src/lib/qwen.ts` calls DashScope's compatible
  chat-completions endpoint with plain `fetch` (no SDK). Prompt A
  (extractor) and Prompt B (reasoner) live in `src/lib/prompts.ts` and
  both demand strict JSON.
- **Deterministic core** — `src/lib/demo-logic.ts` implements the
  Shield, Sasta Badal and SOS card as pure functions, so the demo and
  the tests never depend on a live model call.
- **Regional data** — `data/pakistan_labs.json` (Chughtai, Aga Khan,
  IDC, Shaukat Khanum, Excel — trust tiers and PKR test prices) and
  `data/pakistan_generics.json` (Panadol, Augmentin, Brufen,
  Glucophage → their generics).

### API

| Route | What it does |
|---|---|
| `POST /api/extract` | `{ imageUrl }` → Prompt A extraction. Validates input with zod. Answers **503** when `DASHSCOPE_API_KEY` is unset — it never invents a result. |
| `POST /api/process` | `{ newData, existingProfile?, history? }` → duplicate alerts, generic alternatives, SOS card, and Prompt B reasoning when a key is set (otherwise `qwenReasoning: null`). |
| `GET /api/generics` | All mappings, or `?brand=Brufen 400` for one entry plus its saving. |

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and DASHSCOPE_API_KEY
npx prisma generate
npx prisma db push     # when a database is configured
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm start`,
`npm test` (vitest), `npm run typecheck`.

Without a `DASHSCOPE_API_KEY`, the deterministic demo on the home page
and the `/api/process` core still run fully; only the live model calls
are disabled, honestly reported as 503 / `qwenReasoning: null`.

## Mock data note

The lab prices in `data/pakistan_labs.json` and the medicine prices in
`data/pakistan_generics.json` are **illustrative mock prices** for the
buildathon demo — medicine prices are per 10-tablet strip. They are
labelled mock data everywhere they surface, and Sasta Badal answers
always carry the "confirm with your pharmacist" note. They are not a
verified market price list.

## Status

Foundation build: scaffold, schema, regional data, Qwen layer, prompts,
deterministic logic, API routes, unit tests, and a minimal app shell
that renders the computed demo values. The designed product UI is a
separate, design-approved step.
