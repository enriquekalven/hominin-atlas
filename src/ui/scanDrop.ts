/**
 * Local 3D scan loading: hidden file input + drag & drop onto the stage. Files are read in the
 * browser, validated with validateScan, then handed to the viewer ('scan:load'). Nothing is uploaded.
 */
import { MAX_SCAN_BYTES, validateScan } from '../app/scanFile';
import type { UICtx } from './context';
import { button, h } from './dom';
import { icon } from './icons';
import { openDialog, type DialogHandle } from './dialogs';
import { renderScanPresetsSection } from './scanPresets';

const ACCEPT = '.stl,.glb,.obj,.ply';

export interface ScanLoader {
  openDialog(): void;
  chip: HTMLElement;
}

export function mountScanLoader(ctx: UICtx, stage: HTMLElement, overlay: HTMLElement): ScanLoader {
  const input = h('input', { type: 'file', accept: ACCEPT, class: 'sr-only', tabindex: '-1', 'aria-hidden': 'true' });
  overlay.appendChild(input);
  const chip = h('div', { class: 'chip chip--status chip--scan', hidden: true });
  const dropHint = h('div', { class: 'drop-hint', 'aria-hidden': 'true' }, icon('upload'), h('p', null, 'Drop a 3D scan (.stl, .glb, .obj, .ply)'));
  overlay.appendChild(dropHint);
  let dialog: DialogHandle | null = null;
  let busy = false;

  const showChip = (name: string) => {
    chip.hidden = false;
    chip.replaceChildren(
      icon('layers'),
      h('span', { class: 'chip__label' }, '3D scan: '),
      h('strong', { class: 'chip__file' }, name),
      button('Clear scan', { class: 'chip__action' }, () => {
        ctx.events.emit('scan:clear', {});
        chip.hidden = true;
        chip.replaceChildren();
        ctx.announce('Scan cleared');
      }),
    );
  };

  ctx.events.on('scan:load', ({ name }) => {
    showChip(name);
    dialog?.close();
    ctx.toast(`Showing 3D scan “${name}”.`, 'success');
  });
  ctx.events.on('scan:preset-error', ({ message }) => {
    ctx.toast(message, 'error');
  });

  const load = async (file: File) => {
    if (busy) return;
    if (file.size > MAX_SCAN_BYTES) {
      ctx.toast('The file is larger than 150 MB.', 'error');
      return;
    }
    busy = true;
    ctx.announce('Reading file…');
    try {
      const buffer = await file.arrayBuffer();
      const result = validateScan(file.name, buffer);
      if (!result.ok) {
        ctx.toast(result.reason, 'error');
        return;
      }
      ctx.events.emit('scan:load', { name: result.safeName, format: result.format, buffer });
    } catch {
      ctx.toast('The file could not be read.', 'error');
    } finally {
      busy = false;
      input.value = '';
    }
  };

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) void load(file);
  });

  // Drag & drop onto the stage (files only).
  let depth = 0;
  const hasFiles = (e: DragEvent) => !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');
  stage.addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth += 1;
    stage.classList.add('is-dropping');
  });
  stage.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });
  stage.addEventListener('dragleave', () => {
    depth = Math.max(0, depth - 1);
    if (depth === 0) stage.classList.remove('is-dropping');
  });
  stage.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth = 0;
    stage.classList.remove('is-dropping');
    const file = e.dataTransfer?.files[0];
    if (file) void load(file);
  });

  window.addEventListener('dragover', (e) => {
    if (hasFiles(e)) e.preventDefault();
  });
  window.addEventListener('drop', (e) => {
    if (hasFiles(e)) e.preventDefault();
  });

  const open = () => {
    dialog = openDialog({
      title: 'Load a 3D museum or fossil scan',
      className: 'dialog--wide',
      description: 'Open a bundled CC0 Smithsonian specimen mesh, or drop your own .stl / .glb / .obj / .ply file (processed 100% locally in this tab).',
      build(body) {
        const pick = button([icon('upload'), h('span', { class: 'btn__label' }, 'Choose a local file…')], { class: 'btn btn--primary' }, () => input.click());
        const zone = h('div', { class: 'dropzone' }, icon('layers'), h('p', null, 'Or drop a local .stl, .glb, .obj, or .ply file here (max 150 MB).'));
        zone.addEventListener('dragover', (e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          zone.classList.add('is-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
        zone.addEventListener('drop', (e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          zone.classList.remove('is-over');
          const file = e.dataTransfer?.files[0];
          if (file) void load(file);
        });
        body.append(zone, h('div', { class: 'actions' }, pick), renderScanPresetsSection(ctx));
      },
      onClose: () => {
        dialog = null;
      },
    });
  };

  return { openDialog: open, chip };
}
