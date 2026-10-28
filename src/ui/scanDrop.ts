/**
 * Local 3D scan loading: hidden file input + drag & drop onto the stage. Files are read in the
 * browser, validated with validateScan, then handed to the viewer ('scan:load'). Nothing is uploaded.
 */
import { MAX_SCAN_BYTES, validateScan } from '../app/scanFile';
import type { UICtx } from './context';
import { button, h } from './dom';
import { icon } from './icons';
import { openDialog, type DialogHandle } from './dialogs';

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
      h('span', { class: 'chip__label' }, 'Your scan: '),
      h('strong', { class: 'chip__file' }, name),
      button('Clear scan', { class: 'chip__action' }, () => {
        ctx.events.emit('scan:clear', {});
        chip.hidden = true;
        chip.replaceChildren();
        ctx.announce('Scan cleared');
      }),
    );
  };

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
      showChip(result.safeName);
      dialog?.close();
      ctx.toast(`Showing your scan “${result.safeName}”.`, 'success');
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

  // Never let a stray drop navigate the tab away to the file.
  window.addEventListener('dragover', (e) => {
    if (hasFiles(e)) e.preventDefault();
  });
  window.addEventListener('drop', (e) => {
    if (hasFiles(e)) e.preventDefault();
  });

  const open = () => {
    dialog = openDialog({
      title: 'Load your own 3D scan',
      description: 'Your file is opened only in this browser tab. It never leaves your device: nothing is uploaded or stored.',
      build(body) {
        const pick = button([icon('upload'), h('span', { class: 'btn__label' }, 'Choose a file…')], { class: 'btn btn--primary' }, () => input.click());
        const zone = h('div', { class: 'dropzone' }, icon('layers'), h('p', null, 'Or drop a file here.'));
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
        body.append(
          h(
            'ul',
            { class: 'bullets' },
            h('li', null, 'Formats: STL, binary glTF (.glb), OBJ, PLY.'),
            h('li', null, 'Maximum size: 150 MB.'),
            h('li', null, 'The file is checked before it is shown. Unsupported or damaged files are rejected.'),
          ),
          zone,
          h('div', { class: 'actions' }, pick),
        );
      },
      onClose: () => {
        dialog = null;
      },
    });
  };

  return { openDialog: open, chip };
}
