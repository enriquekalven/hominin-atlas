# Hominin Atlas — UI guide

Owner: UI engineer. Scope: `src/ui/**`, `public/styles.css`, `public/favicon.svg`, `public/_headers`,
`docs/UI.md`, `tests/ui.*.test.ts`. Read [CONTRACT.md](./CONTRACT.md) first.

## Principles

- **State lives in the store.** Every control writes `AppState` (`src/app/store.ts`); the viewer and the
  UI react to it. One-shot notifications use the event bus (`src/app/events.ts`).
- **Fine-grained updates.** Regions subscribe with `store.select` (or the `watch` helper that also runs
  immediately). The info panel re-renders a tab only when it is visible *and* its dependency key changes.
- **Safe DOM only.** `src/ui/dom.ts` (`h`, `s`, `button`, `externalLink`) builds everything with
  `createElement(NS)`/`setAttribute`/text nodes. `h()` throws on `on*` and `style` attributes and on unsafe
  URLs (`isSafeUrl`). No `innerHTML`, no inline styles in markup, no CSS from TS, no runtime network calls.
  `tests/ui.security.test.ts` enforces this statically.
- **Empty data is normal.** Every view renders a meaningful empty state when `species`, glossary, quiz,
  specimens or lesions are missing, and `null` numbers render as `—`.
- **Two audiences.** `#app[data-audience]` (also set on `#toast-root`, `#modal-root` and each `<dialog>`)
  switches the type scale and hit targets (≥ 44 px for kids). Kids mode hides catalogue numbers,
  citations, dating methods and clinician tools (rendered conditionally, not just hidden with CSS).

## Module map

| Module | Responsibility |
|---|---|
| `index.ts` | `mountUI(deps)`: builds the context, mounts every region, overlay layers, dialogs, shortcuts |
| `context.ts` | `UICtx` (store, events, species, `announce`, `toast`, `expandPanel`) + `watch()` |
| `actions.ts` | Shared store actions: `selectSpecies`, `stepSpecies`, `selectLesion`, `selectSpecimen`, `openTab` |
| `dom.ts`, `icons.ts`, `widgets.ts` | DOM builders, SVG icon set, segmented radio group, toggles, badges, taxon names, empty states |
| `format.ts`, `filters.ts`, `timeScale.ts`, `treeLayout.ts`, `mapProjection.ts`, `quizLogic.ts`, `download.ts` | Pure, DOM-free logic (unit-tested) |
| `labels.ts` | Audience vocabulary (tabs, clade groups, evidence, timing/healing, render modes, captions) |
| `topbar.ts`, `combobox.ts` | Wordmark (only `h1`), audience toggle, species search combobox, tool buttons |
| `rail.ts`, `portrait.ts` | Species rail grouped by clade, portrait thumbnails with monogram fallback |
| `panel/*` | Info panel shell (tabs + mobile bottom sheet) and the Overview, Injuries, Specimens (+ site map), Compare, Tree and Glossary tabs |
| `timeline.ts`, `timelineAxis.ts`, `timelineScrub.ts` | Log time axis, species bars, playhead scrubber with alive-at list and kids caption |
| `tree.ts`, `treeChart.ts` | Family-tree dialog: SVG range chart + screen-reader nested list |
| `overlay.ts`, `overlayStatus.ts` | Viewport toolbar, clinician tools, progress bar, chips, caption, kids animations, snapshot download |
| `scanDrop.ts` | File picker + drag & drop, `validateScan`, `scan:load` / `scan:clear` |
| `quiz.ts` | Quiz dialog bound to `store.quizOpen`, best score + badges |
| `speech.ts` | Read-aloud (Web Speech API, feature-detected) |
| `dialogs.ts`, `toast.ts` | Native `<dialog>` manager (focus wrap, Esc, return focus) and toasts |
| `shortcuts.ts` | Global keyboard shortcuts + Help dialog |
| `worldPath.ts` | Natural Earth 110 m land outline as one SVG path (public domain, bundled) |

## Store fields written by the UI

`audience`, `speciesId` (+ resets `specimenId`, `selectedLesionId`, `selectedBoneId`, `healingT`, `morphT`),
`specimenId`, `renderMode`, `framing`, `showFlesh`, `showReconstructed`, `autoRotate`, `panel`,
`compareSpeciesId`, `compareMode`, `morphT`, `healingT` (reset to 1 on lesion change), `selectedLesionId`,
`selectedBoneId` (cleared from the chip / Esc), `tool` (forced to `orbit` in kids mode), `sectionLevel`,
`lineup`, `quizOpen`, `quizBest`, `badges`.

## Events

| Event | Direction | UI behaviour |
|---|---|---|
| `viewer:progress` | in | `role=progressbar` in the overlay; hides when `done ≥ total` or on `viewer:ready` |
| `viewer:ready` | in | hides the progress bar |
| `viewer:error` | in | error toast (message shown as plain text) |
| `viewer:measure` | in | "Last measurement" read-out (clinician, measure tool) |
| `viewer:snapshot` | in | decodes the PNG/JPEG/WebP data URL locally and downloads it |
| `ui:focus-lesion` | out | emitted when a lesion is picked in the panel |
| `ui:reset-camera`, `ui:snapshot` | out | toolbar buttons, `R` shortcut |
| `ui:animate` | out | "Chomp!" / "Mastication" and "Walk" / "Gait" toggles (`none` to stop) |
| `scan:load`, `scan:clear` | out | after `validateScan` succeeds / from the scan chip |

## Contract for viewer-owned DOM

The viewer creates lesion hotspots as `<button class="hotspot">` inside `#viewport`. `styles.css`
styles them (CSS cannot be injected from TS under the CSP):

- Put the hotspot's **top-left at the projected point** (`style.left/top` or `transform: translate(…)`);
  CSS centres it with negative margins (26 px, 44 px in kids mode).
- Selected state: `.is-selected`, `aria-pressed="true"` or `aria-current="true"`.
- Occluded / behind bone: `.is-hidden` or `data-occluded="true"` (dimmed).
- Give each hotspot an `aria-label` (lesion title). The pulse animation stops under reduced motion.
- `#viewport canvas` is stretched to the container; `.viewer-stub` is styled for the loading placeholder.

## Keyboard

`←/→` previous/next species · `1/2/3` render mode · `B/S` framing · `R` reset camera · `F` skin & attire ·
`L` size line-up · `Q` quiz · `?` help · `Esc` close dialog, else clear lesion → bone → tool → line-up.
Shortcuts are ignored while typing, with modifiers, inside widgets that own arrow keys (rail, tabs, radio
groups, sliders, timeline bars, tree nodes) and while a dialog is open. The rail and timeline use a roving
tabindex; tabs and segmented controls follow the ARIA tabs / radio-group patterns.

## Layout

| Width | Layout |
|---|---|
| ≥ 1200 px | rail (248) · viewport · panel (384); timeline under rail + viewport; panel full height |
| 1024–1199 | icon rail (88) with short names; top-bar tool labels collapse to icons |
| 768–1023 | two-row top bar; panel 320 px |
| < 768 | top bar wraps (search behind a toggle), horizontal rail scroller, compact timeline, panel as a bottom sheet with a drag/tap handle (peek ⇄ open) |

The overlay toolbar uses a container query on `#stage`: labels collapse to icons below 760 px of stage
width and the toolbar becomes one scrollable row below 560 px.

## Design tokens

Slate base `#0B1220` / `#0F172A`, panels `#111A2E`, ivory text `#EDE6D6`, secondary `#9AA5B8`
(≥ 6.9:1 on panels). One warm accent, amber `#F2A93B`, for injuries/lesions and primary actions; teal
`#5EC4B6` for selection and focus rings. Evidence: established (green, check icon, solid border), probable
(blue, half-disc icon), debated (salmon, arrows icon, dashed border) — always with text. Spacing 4 px scale,
radii 2/4/8 px, tabular numerals everywhere, binomials in italic serif (`Iowan Old Style`, Palatino,
Georgia), body in the system UI stack. No web fonts, no gradients except a faint spotlight behind the
canvas, no drop shadows.

## Science-facing labels

- Permanent overlay caption: "Procedural 3D reconstruction — not a scan of the original fossil".
- Portrait caption: "AI-generated artistic impression; skin, hair and eye colour are unknown".
- X-ray mode is labelled "Radiograph (simulated)" for clinicians; measurements are "approximate,
  reconstruction scale".
- The healing slider is a labelled what-if visualisation, offered only for fractures with recorded healing.
- The kids timeline caption is computed from the data ("at least N kinds of humans"); living relatives
  are not counted as humans.

## Testing

`npx vitest run tests/ui.*` covers the pure modules (time scale, formatting, filters, tree layout, quiz,
map/download) and static security guards (forbidden APIs, module size < 200 lines, `_headers` ↔
`vite.config.ts` CSP parity). Layout was checked with Playwright screenshots at 360, 768, 1024 and 1440 px.
