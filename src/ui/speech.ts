/**
 * Read-aloud narration controller:
 * 1) Primary: pre-synthesized Google Cloud Chirp 3 HD (`Aoede`) studio MP3s in `/audio/<lang>/<clipId>.mp3`
 *    across all 12 supported languages (including Arabic, German, and Dutch).
 * 2) Fallback: localized chunked Web Speech API (`SpeechSynthesis`) with ranked natural voice selection.
 */
import type { EventBus } from '../app/events';
import type { LangCode } from '../data/types';
import { LANGUAGE_BY_CODE, narrationClipUrl, uiText } from '../i18n';
import { button, h } from './dom';
import { icon } from './icons';

export interface SpeakOptions {
  prominent: boolean;
  clipId?: () => string;
  lang?: () => LangCode;
  events?: EventBus;
}

interface ActiveSession {
  btn: HTMLButtonElement;
  token: number;
  audio: HTMLAudioElement | null;
}

let active: ActiveSession | null = null;
let sessionSeq = 0;

const NOVELTY_RE = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox/i;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

function renderBtn(btn: HTMLButtonElement, speaking: boolean, lang: LangCode): void {
  const t = uiText(lang);
  btn.replaceChildren(icon(speaking ? 'stop' : 'speaker'), h('span', { class: 'btn__label' }, speaking ? t.stopReading : t.readAloud));
  btn.classList.toggle('is-speaking', speaking);
  btn.setAttribute('aria-pressed', String(speaking));
}

function recordTelemetry(info: Record<string, unknown>): void {
  if (typeof window !== 'undefined') (window as unknown as { __lastNarration?: Record<string, unknown> }).__lastNarration = info;
}

export function stopSpeaking(): void {
  sessionSeq += 1;
  if (active?.audio) {
    active.audio.pause();
    active.audio.removeAttribute('src');
    active.audio.load();
  }
  if (speechSupported() && (active || window.speechSynthesis.speaking)) window.speechSynthesis.cancel();
  if (active && active.btn.isConnected) renderBtn(active.btn, false, (active.btn.dataset.lang as LangCode | undefined) ?? 'en');
  active = null;
}

export function stopIfDetached(): void {
  if (active && !active.btn.isConnected) stopSpeaking();
}

function pickVoice(bcp47: string): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const target = bcp47.toLowerCase();
  const prefix = target.split('-')[0];
  const cands = window.speechSynthesis.getVoices().filter((v) => {
    const vl = (v.lang || '').toLowerCase().replace('_', '-');
    return prefix === 'yue' ? vl.startsWith('yue') || vl === 'zh-hk' : vl === target || vl.startsWith(`${prefix}-`) || vl === prefix;
  });
  cands.sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) =>
      NOVELTY_RE.test(v.name) ? -100 : ((v.lang || '').toLowerCase().replace('_', '-') === target ? 20 : 10) + (/chirp|studio|natural|neural|premium|enhanced|google|siri/i.test(v.name) ? 15 : 0);
    return score(b) - score(a);
  });
  return cands[0] ?? null;
}

function speakFallback(text: string, lang: LangCode, clipId: string, token: number, events?: EventBus): void {
  if (!speechSupported()) {
    if (active?.token === token) stopSpeaking();
    return;
  }
  const meta = LANGUAGE_BY_CODE[lang] ?? LANGUAGE_BY_CODE.en;
  const clauses = text.split(/(?<=[.!?؟。！？])\s*/u).map((s) => s.trim()).filter(Boolean);
  if (!clauses.length) {
    stopSpeaking();
    return;
  }
  const voice = pickVoice(meta.bcp47);
  recordTelemetry({ clipId, lang, mode: 'browser-tts', bcp47: meta.bcp47, voice: voice?.name ?? 'default' });
  events?.emit('ui:speak', { clipId, lang, mode: 'browser-tts' });
  let idx = 0;
  const next = () => {
    if (active?.token !== token) return;
    if (idx >= clauses.length) {
      stopSpeaking();
      return;
    }
    const u = new SpeechSynthesisUtterance(clauses[idx++].slice(0, 260));
    u.lang = meta.bcp47;
    u.rate = 0.96;
    if (voice) u.voice = voice;
    u.addEventListener('end', next);
    u.addEventListener('error', () => {
      if (active?.token === token) stopSpeaking();
    });
    window.speechSynthesis.speak(u);
  };
  next();
}

export function readAloudButton(getText: () => string, opts: SpeakOptions): HTMLButtonElement | null {
  if (!opts.clipId && !speechSupported() && typeof Audio === 'undefined') return null;
  const initLang = opts.lang?.() ?? 'en';
  const btn = button(null, { class: `btn btn--speak ${opts.prominent ? 'btn--primary' : 'btn--quiet'}`, 'data-lang': initLang });
  renderBtn(btn, false, initLang);

  btn.addEventListener('click', () => {
    if (active?.btn === btn) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    const lang = opts.lang?.() ?? 'en';
    btn.dataset.lang = lang;
    const text = getText().replace(/\s+/g, ' ').trim();
    const clipId = opts.clipId?.() ?? '';
    const token = ++sessionSeq;

    if (clipId && typeof Audio !== 'undefined') {
      const src = narrationClipUrl(lang, clipId);
      const audio = new Audio(src);
      audio.preload = 'auto';
      active = { btn, token, audio };
      renderBtn(btn, true, lang);
      let settled = false;
      const fallback = () => {
        if (settled || active?.token !== token) return;
        settled = true;
        active.audio = null;
        if (text) speakFallback(text, lang, clipId, token, opts.events);
        else stopSpeaking();
      };
      audio.addEventListener('playing', () => {
        if (active?.token !== token) return;
        settled = true;
        const meta = LANGUAGE_BY_CODE[lang] ?? LANGUAGE_BY_CODE.en;
        recordTelemetry({ clipId, lang, mode: 'chirp3-hd', chirpVoice: meta.chirpVoice, audioSrc: audio.currentSrc || src });
        opts.events?.emit('ui:speak', { clipId, lang, mode: 'chirp3-hd' });
      }, { once: true });
      audio.addEventListener('ended', () => {
        if (active?.token === token) stopSpeaking();
      }, { once: true });
      audio.addEventListener('error', fallback, { once: true });
      void audio.play().catch(fallback);
      return;
    }

    if (!text) return;
    active = { btn, token, audio: null };
    renderBtn(btn, true, lang);
    speakFallback(text, lang, clipId || 'inline', token, opts.events);
  });
  return btn;
}

let lifecycleBound = false;
export function bindSpeechLifecycle(): void {
  if (lifecycleBound || typeof document === 'undefined') return;
  lifecycleBound = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSpeaking();
  });
  window.addEventListener('pagehide', () => stopSpeaking());
}
