# Hominin Atlas: build contract

This file is the coordination contract for everyone working on the codebase at the same time.
Read it before editing anything. Stay inside the files you own.

## Product in one paragraph

A static, offline-capable web app (Vite + TypeScript + Three.js, no backend) that lets **kids** and
**clinicians** explore human evolution through bones. Every taxon gets a procedurally sculpted,
true-scale 3D skeleton (signed-distance-field bones, realistic fossil materials). Real
paleopathology (healed fractures, perimortem breaks, predator punctures, arthritis, tumours,
tooth loss) is sculpted onto the bones and clickable. There's an audience toggle: Kids mode uses plain
language, read-aloud and a quiz. Clinician mode shows catalogue numbers, differential diagnoses,
modern analogues, dating methods and citations.

## Ownership (do not edit files you do not own)

| Area | Owner | Files |
|---|---|---|
| Shared contracts (read-only for everyone else) | engine lead | `src/anatomy/*.ts`, `src/data/types.ts`, `src/app/*.ts`, `src/main.ts`, `src/data/index.ts`, `index.html`, `vite.config.ts`, `package.json` |
| 3D engine | engine lead | `src/viewer/**`, `src/sdf/**`, `src/mesher/**`, `src/morph/**` |
| Scientific data | data curator | `src/data/species/**`, `src/data/citations.ts`, `src/data/glossary.ts`, `src/data/quiz.ts`, `docs/DATA_SOURCES.md` |
| UI | UI engineer | `src/ui/**`, `public/styles.css`, `public/favicon.svg`, `public/_headers`, `docs/UI.md` |
| Portraits | portrait artist | `public/portraits/**`, `docs/PORTRAITS.md` |
| Tests | each owner for their area | `tests/<area>.*.test.ts` |

If you need a change in a file you do not own, describe the change in your final report.
Do not make the change yourself.

## Runtime wiring

```
UI (src/ui)  ──writes──▶  Store (src/app/store.ts)  ◀──reads/writes──  Viewer (src/viewer)
     ▲                         │ subscribe/select                          │
     └──────────── EventBus (src/app/events.ts): progress, picks, focus, scans ──┘
```

- `mountUI({ store, events, species })` builds every DOM region except `#viewport`.
- `createViewer({ container: #viewport, store, events, species })` owns the canvas.
- DOM regions (from `index.html`): `#topbar`, `#rail`, `#stage` > `#viewport` + `#viewport-overlay`,
  `#panel`, `#timeline`, `#modal-root`, `#toast-root`. The UI may place floating controls in
  `#viewport-overlay` (it sits above the canvas; use `pointer-events: none` on the overlay itself and
  `pointer-events: auto` on controls).
- The viewer creates 3D lesion hotspots itself (HTML buttons with class `hotspot` inside `#viewport`).
  Clicking one sets `store.selectedLesionId`. When `selectedLesionId` changes, the viewer flies the
  camera to it. The UI shows details in `#panel`.

## Security rules (mandatory)

- Never use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`. Build DOM with
  `createElement`, `textContent`, `setAttribute`, `replaceChildren`. Inline SVG icons must use
  `document.createElementNS`.
- No `eval`, `new Function`, inline `<script>`, inline `style=""` attributes in HTML strings, or
  `alert/confirm/prompt`. Setting `el.style.foo` from JS is fine.
- CSS lives in `public/styles.css` (linked statically). Do not import CSS from TS (CSP is `style-src 'self'`).
- External links: only `https:` URLs, `rel="noopener noreferrer"`, `target="_blank"`.
- No network calls at runtime, no third-party fonts or CDNs, no analytics. Everything is bundled locally.
- Do not log state objects. Log short messages only.

## Science rules (mandatory)

- No fabrication. Unknown numbers are `null`, not 0 or a guess. Mark contested ideas `debated` and
  explain the debate in `debateNote`.
- Every lesion has at least one real citation (DOI preferred) and an evidence level.
- The 3D skeletons are procedural reconstructions. The UI must label them that way. They are not
  scans of the original fossils, and measurements on them are approximate.
- Kids text: short sentences, about a 9-year-old reading level, no gore. Violence and death are
  described gently ("he was hurt badly and did not survive").

## Commands

- `npm run dev` serves on http://127.0.0.1:5173 (localhost only)
- `npm run typecheck`, `npm test`, `npm run build`
