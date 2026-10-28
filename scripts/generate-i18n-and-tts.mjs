/**
 * Generates:
 * 1) `src/i18n/catalog.ts` — 12-language localized catalog for all 17 hominin species
 *    and 24 paleopathology lesions (`en`, `ar`, `de`, `nl`, `es`, `fr`, `it`, `pt`, `zh`, `yue`, `ja`, `ko`).
 * 2) `public/audio/<lang>/<clipId>.mp3` — Pre-synthesized Google Cloud Chirp 3 HD (`Aoede`)
 *    studio MP3 narrations for Kids & Clinician modes across all 17 species and 24 lesions.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CATALOG_PATH = join(ROOT, 'src/i18n/catalog.ts');
const AUDIO_ROOT = join(ROOT, 'public/audio');
const GCP_PROJECT = process.env.GCP_PROJECT || 'project-maui';

const FORCE_TRANSLATE = process.argv.includes('--force-translate');
const FORCE_AUDIO = process.argv.includes('--force-audio');

const TARGET_LANGS = [
  { code: 'en', translateTarget: null, voice: { languageCode: 'en-US', name: 'en-US-Chirp3-HD-Aoede' } },
  { code: 'ar', translateTarget: 'ar', voice: { languageCode: 'ar-XA', name: 'ar-XA-Chirp3-HD-Aoede' } },
  { code: 'de', translateTarget: 'de', voice: { languageCode: 'de-DE', name: 'de-DE-Chirp3-HD-Aoede' } },
  { code: 'nl', translateTarget: 'nl', voice: { languageCode: 'nl-NL', name: 'nl-NL-Chirp3-HD-Aoede' } },
  { code: 'es', translateTarget: 'es', voice: { languageCode: 'es-ES', name: 'es-ES-Chirp3-HD-Aoede' } },
  { code: 'fr', translateTarget: 'fr', voice: { languageCode: 'fr-FR', name: 'fr-FR-Chirp3-HD-Aoede' } },
  { code: 'it', translateTarget: 'it', voice: { languageCode: 'it-IT', name: 'it-IT-Chirp3-HD-Aoede' } },
  { code: 'pt', translateTarget: 'pt', voice: { languageCode: 'pt-BR', name: 'pt-BR-Chirp3-HD-Aoede' } },
  { code: 'zh', translateTarget: 'zh-CN', voice: { languageCode: 'cmn-CN', name: 'cmn-CN-Chirp3-HD-Aoede' } },
  { code: 'yue', translateTarget: 'zh-TW', voice: { languageCode: 'yue-HK', name: 'yue-HK-Chirp3-HD-Aoede' } },
  { code: 'ja', translateTarget: 'ja', voice: { languageCode: 'ja-JP', name: 'ja-JP-Chirp3-HD-Aoede' } },
  { code: 'ko', translateTarget: 'ko', voice: { languageCode: 'ko-KR', name: 'ko-KR-Chirp3-HD-Aoede' } },
];

function getAccessToken() {
  return execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
}

let cachedToken = getAccessToken();
let tokenTime = Date.now();
function token() {
  if (Date.now() - tokenTime > 20 * 60 * 1000) {
    cachedToken = getAccessToken();
    tokenTime = Date.now();
  }
  return cachedToken;
}

async function translateSlice(slice, target) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    const res = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'x-goog-user-project': GCP_PROJECT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: slice,
        source: 'en',
        target,
        format: 'text',
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const items = json?.data?.translations ?? [];
      return items.map((item) => String(item.translatedText ?? '').trim());
    }
    const errBody = await res.text();
    if (res.status >= 500 && slice.length > 1) {
      const mid = Math.ceil(slice.length / 2);
      const a = await translateSlice(slice.slice(0, mid), target);
      const b = await translateSlice(slice.slice(mid), target);
      return [...a, ...b];
    }
    if (attempt >= 4) {
      throw new Error(`Translation failed (${target}, HTTP ${res.status}): ${errBody.slice(0, 300)}`);
    }
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
}

async function translateBatch(texts, target) {
  const out = [];
  const BATCH_SIZE = 20;
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    out.push(...(await translateSlice(slice, target)));
  }
  return out;
}

function isValidMp3(filePath) {
  if (!existsSync(filePath)) return false;
  const st = statSync(filePath);
  if (st.size < 1024) return false;
  const buf = readFileSync(filePath);
  const isId3 = buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33;
  const isMpegSync = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
  return isId3 || isMpegSync;
}

/**
 * Prepares text for Chirp 3 HD so long scientific sentences or CJK clauses never trigger
 * HTTP 400 ("sentences that are too long").
 */
function chunkForChirp(rawText, langCode) {
  const isCjk = langCode === 'zh' || langCode === 'yue' || langCode === 'ja';
  let t = String(rawText || '')
    .replace(/\s+/g, ' ')
    .replace(/[~≈]/g, ' ')
    .replace(/\s*[—–]\s*/g, isCjk ? '，' : ', ')
    .replace(/[;；؛]/g, isCjk ? '。' : '. ')
    .trim();

  if (!t) return [];

  if (isCjk) {
    // Split on CJK sentence/clause punctuation and enforce <= 24 chars per sentence with '。'
    const rawClauses = t
      .split(/(?<=[。！？；，、,.!?])\s*/u)
      .map((s) => s.trim())
      .filter(Boolean);
    const shortClauses = [];
    for (const c of rawClauses) {
      let rem = c;
      while (rem.length > 24) {
        shortClauses.push(rem.slice(0, 22) + '。');
        rem = rem.slice(22);
      }
      if (rem) {
        const endsWithStop = /[。！？.!?]$/.test(rem);
        shortClauses.push(endsWithStop ? rem : rem.replace(/[，、,]$/, '') + '。');
      }
    }
    const chunks = [];
    let cur = '';
    for (const sc of shortClauses) {
      if (cur && cur.length + sc.length > 320) {
        chunks.push(cur);
        cur = sc;
      } else {
        cur += sc;
      }
    }
    if (cur) chunks.push(cur);
    return chunks;
  }

  // Non-CJK (en, ar, de, nl, es, fr, it, pt, ko): ensure each sentence <= 175 chars, join up to 900 chars per request
  const sentences = t
    .split(/(?<=[.!?؟。])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);

  const bounded = [];
  for (const s of sentences) {
    if (s.length <= 175) {
      bounded.push(/[.!?؟]$/.test(s) ? s : `${s}.`);
      continue;
    }
    const parts = s.split(/(?<=[,:،])\s+/u);
    let cur = '';
    for (const p of parts) {
      if (cur && cur.length + 1 + p.length > 160) {
        bounded.push(/[.!?؟]$/.test(cur) ? cur : `${cur.replace(/[,:،]$/, '')}.`);
        cur = p;
      } else {
        cur = cur ? `${cur} ${p}` : p;
      }
    }
    if (cur) {
      while (cur.length > 175) {
        const idx = cur.lastIndexOf(' ', 160);
        const cut = idx > 40 ? idx : 160;
        bounded.push(`${cur.slice(0, cut).trim()}.`);
        cur = cur.slice(cut).trim();
      }
      if (cur) bounded.push(/[.!?؟]$/.test(cur) ? cur : `${cur.replace(/[,:،]$/, '')}.`);
    }
  }

  const chunks = [];
  let acc = '';
  for (const b of bounded) {
    if (acc && acc.length + 1 + b.length > 900) {
      chunks.push(acc);
      acc = b;
    } else {
      acc = acc ? `${acc} ${b}` : b;
    }
  }
  if (acc) chunks.push(acc);
  return chunks;
}

async function synthesizeSingleChunk(text, voice) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'x-goog-user-project': GCP_PROJECT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          sampleRateHertz: 24000,
        },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (!json?.audioContent) throw new Error('Empty audioContent in TTS response');
      return Buffer.from(json.audioContent, 'base64');
    }
    const errText = await res.text();
    if (res.status === 400 && text.length > 24) {
      const mid = Math.floor(text.length / 2);
      const dotIdx = text.indexOf('. ', Math.max(0, mid - 60));
      const cjkIdx = text.indexOf('。', Math.max(0, mid - 30));
      const spaceIdx = text.indexOf(' ', mid);
      const splitAt =
        dotIdx > 0 && dotIdx < text.length - 5
          ? dotIdx + 1
          : cjkIdx > 0 && cjkIdx < text.length - 2
            ? cjkIdx + 1
            : spaceIdx > 0 && spaceIdx < text.length - 5
              ? spaceIdx
              : mid;
      const leftRaw = text.slice(0, splitAt).trim();
      const left = /[.!?؟。]$/.test(leftRaw) ? leftRaw : leftRaw + (text.includes('。') ? '。' : '.');
      const right = text.slice(splitAt).trim();
      const b1 = await synthesizeSingleChunk(left, voice);
      const b2 = right ? await synthesizeSingleChunk(right, voice) : Buffer.alloc(0);
      return Buffer.concat([b1, b2]);
    }
    if (res.status === 429 && attempt <= 12) {
      const waitMs = Math.min(25000, 3500 * attempt + Math.floor(Math.random() * 1500));
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (attempt >= 6) {
      throw new Error(`TTS failed (${voice.name}, HTTP ${res.status}): ${errText.slice(0, 280)} | text="${text}"`);
    }
    await new Promise((r) => setTimeout(r, 800 * attempt));
  }
}

async function synthesizeClip(rawText, langCode, voice, outPath) {
  if (!FORCE_AUDIO && isValidMp3(outPath)) return 'cached';
  const chunks = chunkForChirp(rawText, langCode);
  if (chunks.length === 0) throw new Error(`Empty narration text for ${outPath}`);
  const buffers = [];
  for (const ch of chunks) {
    buffers.push(await synthesizeSingleChunk(ch, voice));
  }
  const combined = Buffer.concat(buffers);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, combined);
  if (!isValidMp3(outPath)) {
    throw new Error(`Invalid MP3 header written to ${outPath}`);
  }
  return 'generated';
}

async function runPool(items, concurrency, worker) {
  let idx = 0;
  const results = new Array(items.length);
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) break;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  console.log('[i18n+tts] Loading Hominin Atlas species, attire, and lesion records via Vite SSR...');
  const vite = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true } });
  let SPECIES;
  let ATTIRE_SUMMARY;
  try {
    ({ SPECIES } = await vite.ssrLoadModule('/src/data/index.ts'));
    ({ ATTIRE_SUMMARY } = await vite.ssrLoadModule('/src/ui/portrait.ts'));
  } finally {
    await vite.close();
  }

  const allLesions = [];
  const seenLesions = new Set();
  for (const sp of SPECIES) {
    for (const spec of sp.specimens) {
      for (const l of spec.lesions) {
        if (!seenLesions.has(l.id)) {
          seenLesions.add(l.id);
          allLesions.push(l);
        }
      }
    }
  }
  console.log(`[i18n+tts] Loaded ${SPECIES.length} species and ${allLesions.length} unique lesions.`);

  // Build English source catalog and flat string table for deterministic batch translation
  const enSpecies = {};
  const enLesions = {};
  const stringSlots = []; // Array<{ set(targetSpecies, targetLesions, val): void, en: string }>

  for (const sp of SPECIES) {
    const attire = ATTIRE_SUMMARY[sp.id];
    enSpecies[sp.id] = {
      common: { kids: sp.common.kids, clinician: sp.common.clinician },
      overview: { kids: sp.overview.kids, clinician: sp.overview.clinician },
      attire: { kids: attire.kids.trim(), clinician: attire.clinician.trim() },
      locomotion: { kids: sp.locomotion.kids, clinician: sp.locomotion.clinician },
      diet: { kids: sp.diet.kids, clinician: sp.diet.clinician },
      technology: { kids: sp.technology.kids, clinician: sp.technology.clinician },
      keyTraits: { kids: [...sp.keyTraits.kids], clinician: [...sp.keyTraits.clinician] },
      funFacts: [...sp.funFacts],
    };

    const sid = sp.id;
    for (const field of ['common', 'overview', 'attire', 'locomotion', 'diet', 'technology']) {
      for (const aud of ['kids', 'clinician']) {
        stringSlots.push({
          en: enSpecies[sid][field][aud],
          assign: (spMap) => {
            spMap[sid][field][aud] = '';
          },
          write: (spMap, _lMap, val) => {
            spMap[sid][field][aud] = val;
          },
        });
      }
    }
    sp.keyTraits.kids.forEach((txt, i) => {
      stringSlots.push({
        en: txt,
        write: (spMap, _lMap, val) => {
          spMap[sid].keyTraits.kids[i] = val;
        },
      });
    });
    sp.keyTraits.clinician.forEach((txt, i) => {
      stringSlots.push({
        en: txt,
        write: (spMap, _lMap, val) => {
          spMap[sid].keyTraits.clinician[i] = val;
        },
      });
    });
    sp.funFacts.forEach((txt, i) => {
      stringSlots.push({
        en: txt,
        write: (spMap, _lMap, val) => {
          spMap[sid].funFacts[i] = val;
        },
      });
    });
  }

  for (const l of allLesions) {
    enLesions[l.id] = {
      title: { kids: l.title.kids, clinician: l.title.clinician },
      summary: { kids: l.summary.kids, clinician: l.summary.clinician },
    };
    const lid = l.id;
    for (const field of ['title', 'summary']) {
      for (const aud of ['kids', 'clinician']) {
        stringSlots.push({
          en: enLesions[lid][field][aud],
          write: (_spMap, lMap, val) => {
            lMap[lid][field][aud] = val;
          },
        });
      }
    }
  }

  let catalogByLang = null;
  if (!FORCE_TRANSLATE && existsSync(CATALOG_PATH)) {
    console.log('[i18n+tts] Reusing existing src/i18n/catalog.ts (pass --force-translate to regenerate).');
    const vite2 = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true } });
    try {
      const mod = await vite2.ssrLoadModule('/src/i18n/catalog.ts');
      catalogByLang = mod.CATALOG_BY_LANG;
    } finally {
      await vite2.close();
    }
  }

  if (!catalogByLang) {
    catalogByLang = {
      en: { species: enSpecies, lesions: enLesions },
    };
    const sourceStrings = stringSlots.map((s) => s.en);
    console.log(`[i18n+tts] Translating ${sourceStrings.length} strings across 11 target languages via Cloud Translation v2...`);

    for (const lang of TARGET_LANGS) {
      if (!lang.translateTarget) continue;
      const spClone = structuredClone(enSpecies);
      const lClone = structuredClone(enLesions);
      const translated = await translateBatch(sourceStrings, lang.translateTarget);
      translated.forEach((val, idx) => {
        stringSlots[idx].write(spClone, lClone, val);
      });
      catalogByLang[lang.code] = { species: spClone, lesions: lClone };
      console.log(`  ✓ translated [${lang.code}] (${lang.translateTarget})`);
    }

    const tsContent = `/**
 * Auto-generated 12-language paleoanthropology & paleopathology catalog for Hominin Atlas.
 * Generated by scripts/generate-i18n-and-tts.mjs — do not edit manually.
 */
import type { DualText, LangCode, SpeciesId } from '../data/types';

export interface LocalizedSpeciesEntry {
  common: DualText;
  overview: DualText;
  attire: DualText;
  locomotion: DualText;
  diet: DualText;
  technology: DualText;
  keyTraits: { kids: string[]; clinician: string[] };
  funFacts: string[];
}

export interface LocalizedLesionEntry {
  title: DualText;
  summary: DualText;
}

export interface LocalizedCatalog {
  species: Record<SpeciesId, LocalizedSpeciesEntry>;
  lesions: Record<string, LocalizedLesionEntry>;
}

export const CATALOG_BY_LANG: Record<LangCode, LocalizedCatalog> = ${JSON.stringify(catalogByLang, null, 2)};
`;
    mkdirSync(dirname(CATALOG_PATH), { recursive: true });
    writeFileSync(CATALOG_PATH, tsContent, 'utf8');
    console.log(`[i18n+tts] Wrote ${CATALOG_PATH}`);
  }

  // Build Chirp 3 HD synthesis queue across all 12 languages
  const jobs = [];
  for (const lang of TARGET_LANGS) {
    const cat = catalogByLang[lang.code];
    for (const sp of SPECIES) {
      const entry = cat.species[sp.id];
      const kidsSep = lang.code === 'zh' || lang.code === 'yue' || lang.code === 'ja' ? '。' : '. ';
      const kidsText = [
        entry.common.kids,
        entry.overview.kids,
        entry.attire.kids,
        ...(entry.funFacts || []),
      ].join(kidsSep);
      const clinicianText = [
        sp.binomial,
        entry.overview.clinician,
        entry.attire.clinician,
      ].join(kidsSep);

      jobs.push({
        langCode: lang.code,
        voice: lang.voice,
        clipId: `${sp.id}-kids`,
        text: kidsText,
        outPath: join(AUDIO_ROOT, lang.code, `${sp.id}-kids.mp3`),
      });
      jobs.push({
        langCode: lang.code,
        voice: lang.voice,
        clipId: `${sp.id}-clinician`,
        text: clinicianText,
        outPath: join(AUDIO_ROOT, lang.code, `${sp.id}-clinician.mp3`),
      });
    }

    for (const l of allLesions) {
      const entry = cat.lesions[l.id];
      const sep = lang.code === 'zh' || lang.code === 'yue' || lang.code === 'ja' ? '。' : '. ';
      jobs.push({
        langCode: lang.code,
        voice: lang.voice,
        clipId: `lesion-${l.id}-kids`,
        text: `${entry.title.kids}${sep}${entry.summary.kids}`,
        outPath: join(AUDIO_ROOT, lang.code, `lesion-${l.id}-kids.mp3`),
      });
      jobs.push({
        langCode: lang.code,
        voice: lang.voice,
        clipId: `lesion-${l.id}-clinician`,
        text: `${entry.title.clinician}${sep}${entry.summary.clinician}`,
        outPath: join(AUDIO_ROOT, lang.code, `lesion-${l.id}-clinician.mp3`),
      });
    }
  }

  console.log(`[i18n+tts] Synthesizing ${jobs.length} Chirp 3 HD (Aoede) studio clips across ${TARGET_LANGS.length} languages...`);
  let doneCount = 0;
  let generatedCount = 0;
  let cachedCount = 0;

  await runPool(jobs, 4, async (job) => {
    const status = await synthesizeClip(job.text, job.langCode, job.voice, job.outPath);
    doneCount += 1;
    if (status === 'generated') {
      generatedCount += 1;
      await new Promise((r) => setTimeout(r, 250));
    } else {
      cachedCount += 1;
    }
    if (doneCount % 80 === 0 || doneCount === jobs.length) {
      console.log(`  [tts] ${doneCount}/${jobs.length} (generated: ${generatedCount}, cached: ${cachedCount})`);
    }
  });

  console.log(`[i18n+tts] DONE! ${jobs.length} Chirp 3 HD MP3 clips verified in public/audio/.`);
}

main().catch((err) => {
  console.error('[i18n+tts] FATAL:', err);
  process.exit(1);
});
