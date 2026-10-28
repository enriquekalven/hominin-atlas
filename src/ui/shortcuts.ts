/**
 * Global keyboard shortcuts and the Help dialog that documents them.
 * Shortcuts are ignored while typing, inside widgets that own their arrow keys, with modifier
 * keys held, or while a dialog is open (Esc and focus handling then belong to the dialog).
 */
import type { UICtx } from './context';
import { h } from './dom';
import { currentDialog, openDialog } from './dialogs';
import { stepSpecies } from './actions';
import { speciesName } from './format';

export const SHORTCUTS: readonly { keys: string[]; kids: string; clinician: string }[] = [
  { keys: ['←', '→'], kids: 'Previous / next relative', clinician: 'Previous / next taxon' },
  { keys: ['1', '2', '3'], kids: 'Fossil, clean bone or X-ray look', clinician: 'Render mode: fossil, clean bone, radiograph (simulated)' },
  { keys: ['B', 'S'], kids: 'Show the whole body or just the skull', clinician: 'Framing: body / skull' },
  { keys: ['R'], kids: 'Reset the camera', clinician: 'Reset camera' },
  { keys: ['F'], kids: 'Show or hide the body outline', clinician: 'Toggle soft-tissue outline' },
  { keys: ['L'], kids: 'Line everyone up by size', clinician: 'Toggle size line-up' },
  { keys: ['Q'], kids: 'Open the quiz', clinician: 'Open the quiz' },
  { keys: ['?'], kids: 'Show this help', clinician: 'Show this help' },
  { keys: ['Esc'], kids: 'Close a window or unselect', clinician: 'Close dialog / clear selection' },
];

const WIDGET_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="radio"], [role="tab"], ' +
  '[role="option"], [role="slider"], [role="listbox"], [role="combobox"], [role="menuitem"], .rail__item, .tl-bar, .tree__node';

export function openHelpDialog(ctx: UICtx): void {
  const audience = ctx.store.get().audience;
  const kids = audience === 'kids';
  openDialog({
    title: kids ? 'How to use the atlas' : 'Help and keyboard shortcuts',
    build(body) {
      body.append(
        h(
          'ul',
          { class: 'bullets' },
          h('li', null, kids ? 'Drag the skeleton to spin it. Scroll or pinch to zoom.' : 'Drag to orbit, scroll or pinch to zoom, right-drag to pan.'),
          h('li', null, kids ? 'Glowing markers show where a bone was hurt or sick. Tap one to learn its story.' : 'Hotspots mark lesions; select one to open its clinical summary.'),
          h('li', null, 'Skeletons are procedural reconstructions, not scans of the original fossils. Measurements are approximate.'),
        ),
        h('h3', { class: 'section-title' }, 'Keyboard shortcuts'),
        h(
          'table',
          { class: 'shortcuts' },
          h('caption', { class: 'sr-only' }, 'Keyboard shortcuts'),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Keys'), h('th', { scope: 'col' }, 'Action'))),
          h(
            'tbody',
            null,
            SHORTCUTS.map((sc) =>
              h(
                'tr',
                null,
                h('td', null, sc.keys.map((k, i) => [i > 0 ? ' ' : null, h('kbd', null, k)])),
                h('td', null, kids ? sc.kids : sc.clinician),
              ),
            ),
          ),
        ),
      );
    },
  });
}

export function mountShortcuts(ctx: UICtx, openHelp: () => void): void {
  const { store, events } = ctx;
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (currentDialog()) return;
    const target = e.target instanceof HTMLElement ? e.target : null;
    const inWidget = !!target?.closest(WIDGET_SELECTOR);
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const s = store.get();
    const act = (fn: () => void) => {
      e.preventDefault();
      fn();
    };

    if (key === 'Escape') {
      // Text fields keep Esc (clearing / closing native pickers); sliders and buttons do not.
      if (target?.matches('textarea, select, input:not([type]), input[type="text"], input[type="search"]')) return;
      if (s.selectedLesionId) act(() => store.set({ selectedLesionId: null }));
      else if (s.selectedBoneId) act(() => store.set({ selectedBoneId: null }));
      else if (s.tool !== 'orbit') act(() => store.set({ tool: 'orbit' }));
      else if (s.lineup) act(() => store.set({ lineup: false }));
      return;
    }
    if (inWidget) return;
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      // Plain buttons ignore arrows, so it is safe to step species from them too.
      return act(() => {
        const id = stepSpecies(ctx, key === 'ArrowLeft' ? -1 : 1);
        const sp = id ? ctx.byId.get(id) : undefined;
        if (sp) ctx.announce(`Showing ${speciesName(sp, store.get().audience)}`);
      });
    }
    switch (key) {
      case '1':
        return act(() => store.set({ renderMode: 'fossil' }));
      case '2':
        return act(() => store.set({ renderMode: 'bone' }));
      case '3':
        return act(() => store.set({ renderMode: 'xray' }));
      case 'b':
        return act(() => store.set({ framing: 'body' }));
      case 's':
        return act(() => store.set({ framing: 'skull' }));
      case 'r':
        return act(() => events.emit('ui:reset-camera', {}));
      case 'f':
        return act(() => store.set({ showFlesh: !s.showFlesh }));
      case 'l':
        return act(() => store.set({ lineup: !s.lineup }));
      case 'q':
        return act(() => store.set({ quizOpen: !s.quizOpen }));
      case '?':
        return act(openHelp);
      default:
        return;
    }
  });
}
