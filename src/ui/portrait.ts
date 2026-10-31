/**
 * Species portraits and full-body life reconstructions (AI-generated museum paleoart impressions)
 * with graceful monogram fallback when an image is missing or fails to decode.
 */
import type { Audience, DualText, Species, SpeciesId } from '../data/types';
import { openDialog } from './dialogs';
import { button, h } from './dom';
import { monogram } from './format';
import { PORTRAIT_CAPTION, pick } from './labels';

export function portraitUrl(id: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}portraits/${encodeURIComponent(id)}.jpg`;
}

export function reconstructionUrl(id: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}reconstructions/${encodeURIComponent(id)}.jpg`;
}

export const ATTIRE_SUMMARY: Record<SpeciesId, DualText> = {
  'pan-troglodytes': {
    kids: 'Living chimpanzee with coarse black fur, bare mottled face skin, and a peeled twig tool for fishing termites.',
    clinician: 'Living outgroup reference: dense dark pelage, mottled facial pigmentation, and unmodified organic foraging tools (no clothing).',
  },
  'pan-paniscus': {
    kids: 'Living bonobo with slender limbs, black fur, dark face skin from birth, pink lips, and parted head hair.',
    clinician: 'Living sister outgroup: gracile build, black pelage with parted crown hair, dark facial epidermis, and no material clothing.',
  },
  'sahelanthropus-tchadensis': {
    kids: 'Covered in thick dark ape-like body hair with dark facial skin beside ancient Lake Chad—million of years before clothes existed.',
    clinician: 'Naturalistic Late Miocene hominid pelage and dark epidermis; zero clothing or textiles (none existed at ~7 Ma).',
  },
  'orrorin-tugenensis': {
    kids: 'Covered in dark woodland fur for shade and warmth in ancient Kenyan forests, walking upright with bare feet and no clothing.',
    clinician: 'Naturalistic ~6 Ma hominid pelage over bipedal hindlimbs and climbing forelimbs; zero clothing or woven materials.',
  },
  'ardipithecus-ramidus': {
    kids: 'Thick woodland fur coat with dark skin and grasping feet while holding a wild fig branch—no clothing.',
    clinician: 'Naturalistic Pliocene woodland hominin pelage (~4.4 Ma) with opposable hallux and zero clothing artifacts.',
  },
  'australopithecus-anamensis': {
    kids: 'Dark skin with thick brown-black body fur suited to riverside woods near ancient Lake Turkana, with no clothing.',
    clinician: 'Naturalistic ~4.2–3.8 Ma australopith pelage and dark tropical epidermis without anachronistic clothing.',
  },
  'australopithecus-afarensis': {
    kids: 'Lucy had dark skin and natural brown-black body hair across her shoulders, torso and limbs, carrying a simple wooden foraging stick.',
    clinician: 'Naturalistic Plio-Pleistocene australopith pelage over dark tropical skin (zero woven textiles or leather wraps at ~3.2 Ma).',
  },
  'australopithecus-africanus': {
    kids: 'Natural brown body hair over dark skin for warm days and cool South African nights, with no clothing.',
    clinician: 'Naturalistic australopith pelage and medium-dark epidermis (~3.0–2.0 Ma); depicted without anachronistic clothing.',
  },
  'australopithecus-sediba': {
    kids: 'Shorter natural brown-black body hair over dark skin with long climbing arms and Homo-like hands, without clothing.',
    clinician: 'Transitional mosaic pelage over dark epidermis (Malapa ~1.98 Ma); shown naturally unclothed per archaeological record.',
  },
  'paranthropus-boisei': {
    kids: 'Broad, powerful shoulders covered in natural dark hominid hair, carrying freshly pulled wetland papyrus and sedge roots.',
    clinician: 'Megadont robust australopith with tall sagittal crest and natural dark pelage holding C4 sedge rhizomes (no clothing).',
  },
  'paranthropus-robustus': {
    kids: 'Muscular build with natural dark body hair and no clothing, holding a polished bone tool used to dig into termite mounds.',
    clinician: 'Naturalistic archaic pelage (no clothing), holding an attested Swartkrans-type polished bone digging implement (Backwell & d’Errico 2001).',
  },
  'homo-habilis': {
    kids: 'Thinner body hair than earlier relatives, shown with a simple scavenged hide over one shoulder and a sharp Oldowan stone flake.',
    clinician: 'Reduced pelage relative to australopiths; holds attested Mode 1 Oldowan core/flake lithics (draped raw hide is speculative).',
  },
  'homo-erectus': {
    kids: 'Tall, active runner with bare dark brown skin for cooling sweat in the hot sun, a simple hide carry strap, and a stone handaxe.',
    clinician: 'Thermoregulatory bare dark skin with eccrine sweat adaptation, holding a Mode 2 Acheulean biface (hide carry strap is speculative).',
  },
  'homo-antecessor': {
    kids: 'Draped in a heavy unsewn deer-hide cloak against cool Spanish winters while holding a sharp flint flake and wooden spear.',
    clinician: 'Speculative unsewn cervid/equid raw-hide wrap for cool Early Pleistocene Iberia (~850 ka) with attested TD6 Mode 1 flint flake.',
  },
  'homo-heidelbergensis': {
    kids: 'Wore a thick scraped wild-horse hide cape to stay warm in Ice Age Europe and carried a fire-hardened wooden hunting spear.',
    clinician: 'Draped Middle Pleistocene hide mantle (consistent with Boxgrove/Schöningen hide-scraping microwear) and attested spruce spear.',
  },
  'homo-neanderthalensis': {
    kids: 'Dressed for Ice Age cold in a scraped reindeer-hide tunic, a thick wolf-fur cloak, and a hafted Mousterian stone-tipped spear.',
    clinician: 'Scraped cervid-hide tunic and fur mantle supported by lissoir bone smoothers, lithic hide polish, and birch-tar hafted Mode 3 spears.',
  },
  denisovans: {
    kids: 'Bundled in a warm steppe-bison fur coat sewn with bone awls, braided leather ties, and a polished green stone bracelet.',
    clinician: 'Heavy bison/wolf fur parka sewn with bone awls and an attested Denisova Cave polished green chlorite bracelet.',
  },
  'homo-floresiensis': {
    kids: 'Tiny 1-metre-tall island human with dark tropical skin and light body hair, holding a flaked volcanic stone tool.',
    clinician: 'Diminutive ~1.06 m insular hominin with tropical epidermis and attested Liang Bua radial chert/tuff flake.',
  },
  'homo-luzonensis': {
    kids: 'Small tropical island human with dark skin and climbing-capable hands and feet, holding a simple flaked stone tool.',
    clinician: 'Speculative cranial and soft-tissue reconstruction (known from Callao Cave dentition and phalanges/metatarsals).',
  },
  'homo-naledi': {
    kids: 'Slender, athletic build with dark skin and short curly hair, shown exploring the dark Rising Star cave system.',
    clinician: 'Small-brained ~300 ka hominin (LES1 cranium) with bare dark epidermis; no clothing or lithics attested in Rising Star.',
  },
  'homo-sapiens': {
    kids: 'Wearing a finely sewn buckskin tunic stitched with eyed bone needles, a warm fox-fur collar, a twined belt, and seashell beads.',
    clinician: 'Upper Paleolithic tailored hide tunic (eyed bone needles), fox-fur mantle, twined fiber belt, and perforated marine shell beads.',
  },
};

function imageFrame(url: string, sp: Pick<Species, 'id' | 'binomial' | 'common'>, className: string, alt: string): HTMLElement {
  const frame = h('span', { class: `portrait ${className} is-loading` });
  const fallback = () => {
    frame.classList.remove('is-loading');
    frame.classList.add('is-fallback');
    frame.replaceChildren(h('span', { class: 'portrait__mono', 'aria-hidden': 'true' }, monogram(sp.binomial, sp.common.kids)));
    if (alt) frame.appendChild(h('span', { class: 'sr-only' }, alt));
  };
  const img = h('img', { src: url, alt, loading: 'lazy', decoding: 'async', draggable: 'false' });
  img.addEventListener('load', () => frame.classList.remove('is-loading'), { once: true });
  img.addEventListener('error', fallback, { once: true });
  frame.appendChild(img);
  return frame;
}

export function portrait(sp: Pick<Species, 'id' | 'binomial' | 'common'>, className: string, alt = ''): HTMLElement {
  return imageFrame(portraitUrl(sp.id), sp, className, alt);
}

export function reconstruction(sp: Pick<Species, 'id' | 'binomial' | 'common'>, className: string, alt = ''): HTMLElement {
  return imageFrame(reconstructionUrl(sp.id), sp, className, alt);
}

export function openLifeDialog(sp: Species, audience: Audience): void {
  const note = pick(ATTIRE_SUMMARY[sp.id], audience);
  openDialog({
    title: `${sp.common.kids} (${sp.binomial}) — Skin & Pelage Reconstruction`,
    className: 'dialog--wide',
    description: PORTRAIT_CAPTION,
    build(body, handle) {
      body.append(
        h(
          'div',
          { class: 'life-modal' },
          h(
            'figure',
            { class: 'life-modal__fig' },
            reconstruction(sp, 'portrait--modal-recon', `Full life reconstruction of ${sp.common.kids}`),
            h('figcaption', { class: 'life-modal__cap' }, 'Three-quarter museum life reconstruction (skin, pelage & material culture)'),
          ),
          h(
            'figure',
            { class: 'life-modal__fig life-modal__fig--bust' },
            portrait(sp, 'portrait--modal-bust', `Close-up facial reconstruction of ${sp.common.kids}`),
            h('figcaption', { class: 'life-modal__cap' }, 'Close-up cranial & facial life portrait'),
          ),
        ),
        h('p', { class: 'life-modal__note' }, note),
        h('div', { class: 'dialog__foot' }, button('Close', { class: 'btn btn--primary' }, () => handle.close())),
      );
    },
  });
}
