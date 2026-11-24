# Sehat Sathi — 60-Second Demo Script

*Buildathon pitch script. One phone, one story, one patient (Ahmed).
One app, one sidebar: Dashboard → My Records → Report Result → SOS Card → Doctor Prep.
Updated 2026-11-24 to match the rebuilt unified app — every tap below is a real control on the live screens.*

---

### 0:00–0:10 — The hook: the plastic bag

> "In Pakistan, your medical history lives in a plastic bag. Crumpled lab
> reports, handwritten prescriptions, receipts from five different labs.
> When a doctor orders a test you already paid for last month — nobody
> knows. Sehat Sathi turns that plastic bag into one proper file."

*(Hold up the phone on the Dashboard: "Assalam-o-Alaikum, Ahmed — Your File is ready.")*

### 0:10–0:22 — Snap: a real upload, then the digitised result

> "Ahmed gets a new prescription. He doesn't type anything — he just
> adds the photo to his file."

*(Sidebar → **My Records**. Tap the dropzone — "Drop reports here" — and add a report photo or PDF. It files into his record list with a preview, right there.)*

> "And this is what comes back from a messy handwritten report."

*(Sidebar → **Report Result**. CBC and HbA1c ordered at Chughtai — a Tier 3 accredited lab, verified.)*

*(Presenter note: the upload files the report; live Qwen-VL reading of a just-uploaded photo is tomorrow's ModelScope wiring. The result on screen is the pre-loaded demo case. If a judge asks, say so plainly — the API answers 503 without a token and never fakes a result.)*

### 0:22–0:35 — The Shield: Rs 1,200

> "But watch — the Duplicate Test Shield fires. HbA1c was already done
> 10 days ago at Aga Khan. The Shield checks the last 60 days of his
> file and stops him paying twice: **he saves Rs 1,200** — on one test,
> on one visit."

*(Point at the red DUPLICATE stamp and the "You save Rs 1,200" stat.)*

### 0:35–0:47 — Medicines a patient can actually follow + Sasta Badal: Rs 350

> "The prescription is explained in simple Roman Urdu — *'Augmentin ki
> ek goli din mein teen baar, khanay ke baad.'* And the warning that
> matters is front and centre: Brufen — never on an empty stomach.
> Then Sasta Badal finds the same salts cheaper: Augmentin and Brufen
> swapped for their generics save another **Rs 350**."

*(Still on Report Result — scroll Medicines → Sasta Badal card.)*

### 0:47–0:56 — SOS

> "And if Ahmed is ever in an accident, this speaks for him."

*(Sidebar → **SOS Card**.)*

> "Blood group B+, allergic to Sulfa, Type 2 Diabetes — and a real QR
> any responder can scan with any phone. No login. No internet. It just
> works."

*(If a judge has a phone out, invite them to scan it live.)*

### 0:56–1:00 — The close: Qwen only

> "One model family did all of this — Qwen, hosted on ModelScope:
> vision to read, reasoning to protect, Roman Urdu to explain.
> Sehat Sathi: explain, don't diagnose — and never pay twice."

---

## Fallback plan — if the venue internet fails

The demo is **built to survive dead Wi-Fi**: every number on screen is
computed locally from the deterministic demo logic, not from a live
model call. Steps:

1. **Before leaving:** run `npm run build && npm start` on the demo
   laptop and open all five screens once (`/`, `/records`, `/demo`,
   `/sos`, `/doctor-prep`) so everything is warm. Keep the laptop + phone on
   the same hotspot or use the laptop screen directly.
2. **If the deployed site is unreachable:** present from the local
   production server (`http://localhost:3000`) — identical pages,
   identical numbers (Shield Rs 1,200, Sasta Badal Rs 350).
3. **If live Qwen extraction is asked about:** be honest — the scripted
   flow uses demo data; live extraction (`POST /api/extract`, Prompt A
   on Qwen2.5-VL via ModelScope API-Inference) needs a
   `MODELSCOPE_API_TOKEN` and a connection. Without a token the API
   answers 503 — it never fakes a result. That honesty is a feature:
   say so.
4. **If the laptop fails entirely:** the four board screenshots in
   `~/workspace/sehat-sathi/design-v3/` plus this script carry the same
   story — narrate over the boards.
5. **QR still works:** the SOS QR is generated with the page and scans
   offline — it is the one demo moment that needs no network at all.
