/**
 * Read-aloud with the Web Speech API (feature-detected; no network, no voices downloaded by us).
 * One utterance at a time. Speech stops when the owning view re-renders, the species changes,
 * or the page is hidden.
 */
import { button, h } from './dom';
import { icon } from './icons';

interface Active {
  btn: HTMLButtonElement;
  utterance: SpeechSynthesisUtterance;
}

let active: Active | null = null;

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

function render(btn: HTMLButtonElement, speaking: boolean): void {
  const label = speaking ? 'Stop reading' : btn.dataset.label ?? 'Read aloud';
  btn.replaceChildren(icon(speaking ? 'stop' : 'speaker'), h('span', { class: 'btn__label' }, label));
  btn.classList.toggle('is-speaking', speaking);
}

function reset(): void {
  if (active && active.btn.isConnected) render(active.btn, false);
  active = null;
}

/** Cancel any speech in progress. Safe to call when unsupported. */
export function stopSpeaking(): void {
  if (!speechSupported()) return;
  if (active || window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  reset();
}

/** Stop speech whose button is no longer in the document (its view re-rendered or unmounted). */
export function stopIfDetached(): void {
  if (active && !active.btn.isConnected) stopSpeaking();
}

/**
 * "Read aloud" button that speaks `getText()` and toggles to "Stop reading" while speaking.
 * Returns null when the browser has no speech synthesis (the UI simply omits the button).
 */
export function readAloudButton(getText: () => string, opts: { prominent: boolean; label?: string }): HTMLButtonElement | null {
  if (!speechSupported()) return null;
  const btn = button(null, {
    class: `btn btn--speak ${opts.prominent ? 'btn--primary' : 'btn--quiet'}`,
    'data-label': opts.label ?? 'Read aloud',
  });
  render(btn, false);
  btn.addEventListener('click', () => {
    if (active?.btn === btn) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    const text = getText().replace(/\s+/g, ' ').trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    const done = () => {
      if (active?.utterance === utterance) reset();
    };
    utterance.addEventListener('end', done);
    utterance.addEventListener('error', done);
    active = { btn, utterance };
    render(btn, true);
    window.speechSynthesis.speak(utterance);
  });
  return btn;
}

let lifecycleBound = false;
/** Stop speech when the tab is hidden or the page is being unloaded. */
export function bindSpeechLifecycle(): void {
  if (lifecycleBound || !speechSupported()) return;
  lifecycleBound = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSpeaking();
  });
  window.addEventListener('pagehide', () => stopSpeaking());
}
