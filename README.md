# Hominin Atlas — Interactive 3D Atlas of Human Evolution & Paleopathology

**Live App:** [https://hominin-atlas.web.app](https://hominin-atlas.web.app)

An offline-first, zero-network interactive 3D web atlas of human evolution built for **curious kids (ages 7–14)** and **clinicians / osteologists**. Explore 17 hominin and hominid taxa across 7 million years, inspect 40 catalogued fossil specimens, click 24 paleopathological fractures and bone lesions sculpted directly into the 3D osteological meshes, and scrub a fracture-healing timeline from the moment of injury to the fossil as discovered.

## Quick Start

```bash
cd /Users/enriq/.gemini/jetski/scratch/hominin-atlas
npm install
npm run dev          # http://127.0.0.1:5173
npm run typecheck    # TypeScript strict typecheck (tsc --noEmit)
npm test             # Vitest unit, data-integrity, engine & security tests
npm run build        # Production bundle in dist/
npm run smoke        # Headless Chromium end-to-end smoke + screenshot verification
npm run deploy       # Build & deploy to https://hominin-atlas.web.app
```

Deep links (validated against strict allow-lists on load and updated via `history.replaceState`):

- `?species=homo-neanderthalensis&audience=clinician&panel=injuries&lesion=shanidar-1-left-orbit`
- `?species=homo-floresiensis&audience=kids&mode=bone&frame=skull`
- `?species=australopithecus-afarensis&compare=homo-sapiens&cmode=side-by-side`
- `?species=homo-neanderthalensis&lang=ar` (supports `en`, `ar`, `de`, `nl`, `es`, `fr`, `it`, `pt`, `zh`, `yue`, `ja`, `ko`)
- `?species=homo-sapiens&lineup=1`

## Dataset at a Glance

| Collection | Count | Source / Location |
|---|---:|---|
| Taxa (`SPECIES_IDS`) | **17** | [`src/data/species/`](src/data/species/index.ts) — *S. tchadensis*, *Ar. ramidus*, *Au. afarensis*, *Au. africanus*, *Au. sediba*, *P. boisei*, *P. robustus*, *H. habilis*, *H. erectus*, *H. heidelbergensis*, *H. naledi*, *H. floresiensis*, *H. luzonensis*, *Denisovans*, *H. neanderthalensis*, *H. sapiens*, plus living outgroup *Pan troglodytes* |
| Catalogued fossil specimens | **40** | Flagship + secondary specimens with museum accession codes, discovery coordinates, taphonomic palettes, and per-bone completeness (`found` / `partial` / `reconstructed`) |
| Paleopathological lesions | **24** | Fractures, antemortem callus, cranial depression trauma, sharp-force/projectile injuries, hypervitaminosis A / periostitis, osteoma, fibrous dysplasia, and alveolar resorption |
| Supported languages (`LANG_CODES`) | **12** | [`src/i18n/`](src/i18n/index.ts) — English (`en`), Arabic (`ar`, RTL), German (`de`), Dutch (`nl`), Spanish (`es`), French (`fr`), Italian (`it`), Portuguese (`pt`), Simplified Chinese (`zh`), Cantonese (`yue`), Japanese (`ja`), and Korean (`ko`) |
| Chirp 3 HD studio narrations | **984** | [`public/audio/`](public/audio/) — Pre-synthesized Google Cloud **Chirp 3 HD (`Aoede`)** studio MP3s across all 12 languages for both Kids and Clinician modes (all 17 species + 24 lesions), with localized Web Speech fallback |
| Primary-literature citations | **150** | [`src/data/citations.ts`](src/data/citations.ts) (94 with Crossref DOIs, 56 with Scholar title-search links) |
| Dual-register glossary terms | **69** | [`src/data/glossary.ts`](src/data/glossary.ts) (`kids` + `clinician` definitions) |
| Quiz questions | **44** | [`src/data/quiz.ts`](src/data/quiz.ts) (21 kids, 15 clinician, 8 both) |
| Museum-grade portraits & 3D figures | **51** | [`public/portraits/`](public/portraits/), [`public/figures/`](public/figures/), [`public/reconstructions/`](public/reconstructions/) & [`docs/PORTRAITS.md`](docs/PORTRAITS.md) |

## Architecture

```text
src/
├── anatomy/
│   ├── bones.ts          # 64 canonical BoneIds, bilateral/axial expansion, kids + clinician names
│   └── sites.ts          # Named osteological landmarks (BoneAnchor) and FDI tooth codes
├── app/
│   ├── store.ts          # Typed reactive store with allow-listed localStorage persistence
│   ├── events.ts         # Typed EventBus decoupling UI and 3D WebGL viewer
│   ├── url.ts            # Allow-listed URL query-string parser and serializer (?species, ?lang, ...)
│   ├── analytics.ts      # Privacy-hardened GA4 telemetry (G-SV6BEEVQZX, host-gated)
│   └── scanFile.ts       # Magic-byte, extension, and size validation for local 3D scans
├── i18n/
│   ├── index.ts          # Public localization & Chirp 3 HD clip path helpers
│   ├── ui.ts             # 12-language UI chrome, RTL document direction & BCP-47/Chirp voice map
│   └── catalog.ts        # 12-language species & paleopathology translations
├── data/
│   ├── types.ts          # Scientific schema (Measure, Lesion, Specimen, Species, Citation)
│   ├── species/          # 17 per-taxon modules
│   ├── citations.ts      # 150 bibliographic records
│   ├── glossary.ts       # 69 osteological & paleopathological terms
│   └── quiz.ts           # 44 dual-audience questions
├── mesher/
│   └── surfaceNets.ts    # Narrow-Band Surface Nets isosurface extractor with AO, curvature & tags
├── morph/
│   └── params.ts         # 17-taxon osteometric parameter vectors & continuous morph interpolation
├── sdf/
│   ├── core.ts           # Signed distance primitives, smooth booleans, Bezier tubes, value noise
│   ├── skull.ts          # Cranium, brow ridge, zygomatic arch, sagittal crest, mandible, dentition
│   ├── postcrania.ts     # Vertebrae, ribs, sternum, clavicle, scapula, pelvis, sacrum, limbs, hands/feet
│   ├── layout.ts         # True-scale anatomical rig hierarchy (S-curved spine, pelvic tilt, carrying angle)
│   ├── lesions.ts        # 3D SDF modifiers for fractures, callus, depression trauma, periostitis & tooth loss
│   └── build.ts          # Per-bone SDF + paleopathology builder
├── viewer/
│   ├── index.ts          # Three.js WebGL2 lifecycle, on-demand render loop, ResizeObserver, store/event bindings
│   ├── stage.ts          # Primary, compare (side-by-side / overlay / morph), and size-lineup coordinator
│   ├── rig.ts            # Hierarchical SkeletonActor, bone mounting, completeness & chomp/walk poses
│   ├── lifelike.ts       # Photorealistic 3D life reconstruction mesh mounting, caching & pose animation
│   ├── photoMesh.ts      # Volumetric 3D mesh & anisotropic texture synthesis from front/back studio renders
│   ├── materials.ts      # Fossil taphonomy, clean osteological bone, and simulated X-ray materials
│   ├── hotspots.ts       # 3D-to-2D projected <button class="hotspot"> markers with occlusion & collision spacing
│   ├── camera.ts         # Damped orbital camera rig with first-frame snap and lesion/bone fly-to
│   ├── tools.ts          # Raycast bone & figure picking, clinician two-point caliper (mm), and section plane
│   ├── scanLoader.ts     # Local zero-network STL, OBJ, PLY, and GLB parser
│   ├── pool.ts           # Web Worker pool with LRU mesh cache and batch cancellation
│   └── worker.ts         # Off-main-thread SDF + Surface Nets worker
└── ui/
    ├── index.ts          # Accessible UI shell (topbar, timeline, species rail, right drawer, modals)
    ├── speech.ts         # Chirp 3 HD studio MP3 read-aloud player with localized Web Speech fallback
    └── ...               # Modular (<200 lines/file) tabs: overview, injuries, specimens, compare, tree, glossary, quiz
```

## Security, Analytics & Scientific Integrity

- **Zero unsafe DOM sinks**: Enforced by [`tests/ui.security.test.ts`](tests/ui.security.test.ts) and [`tests/engine.viewer.test.ts`](tests/engine.viewer.test.ts)—no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, inline `style=""` attributes, or `alert/confirm/prompt`.
- **Strict Content Security Policy & Privacy-First GA4 (`G-SV6BEEVQZX`)**: Identical CSP across [`vite.config.ts`](vite.config.ts), [`public/_headers`](public/_headers), and [`firebase.json`](firebase.json) with zero `'unsafe-inline'`. GA4 runs with `anonymize_ip: true`, `allow_google_signals: false`, `allow_ad_personalization_signals: false`, and `restricted_data_processing: true`, and disables network beacons outside production hosts unless `?debug_ga=1` is passed.
- **Null-honest osteometrics & explicit debate badges**: Unknown measurements are `null` (never `0` or an unlabelled extrapolation), contested diagnoses carry `evidence: 'debated'` with a mandatory `debateNote`, and every procedural 3D skeleton and portrait carries an explicit reconstruction disclosure. See [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md), [`docs/PORTRAITS.md`](docs/PORTRAITS.md), [`docs/UI.md`](docs/UI.md), and [`docs/CONTRACT.md`](docs/CONTRACT.md).
