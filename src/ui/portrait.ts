/**
 * Species portraits and full-attire life reconstructions (AI-generated museum paleoart impressions)
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
  'sahelanthropus-tchadensis': {
    kids: 'Covered in thick dark ape-like hair to stay warm and shaded by Lake Chad, shown with a simple woven reed waist wrap.',
    clinician: 'Speculative soft tissue: dense hominid pelage and dark skin; shown with a hypothetical lakeside sedge-reed waist wrap for modesty.',
  },
  'ardipithecus-ramidus': {
    kids: 'Thick woodland fur cover with dark skin, shown wearing a simple woven bark-and-vine waist band while holding a fig branch.',
    clinician: 'Woodland hominin pelage reconstruction; no archaeological clothing attested at 4.4 Ma (bark-strip waist band is artistic).',
  },
  'australopithecus-afarensis': {
    kids: 'Lucy had dark skin and short brown body hair, shown with a woven savanna-grass and hide waist wrap and a wooden digging stick.',
    clinician: 'Retained archaic body hair with dark tropical epidermis; woven grass/hide waist wrap is an artistic modesty convention (no 3.2 Ma textiles).',
  },
  'australopithecus-africanus': {
    kids: 'Short brown hair over the shoulders and chest, wearing a simple sun-dried antelope hide wrap tied with twisted grass cord.',
    clinician: 'Archaic pelage and medium-dark skin reconstruction; draped raw hide wrap is paleoartistic (no clothing evidence at 2.5 Ma).',
  },
  'australopithecus-sediba': {
    kids: 'Medium-brown skin with shorter body hair, wearing a braided grass and hide wrap around the waist.',
    clinician: 'Transitional pelage density; braided plant-fiber and hide waist wrap is an artistic convention (Malapa ~1.98 Ma).',
  },
  'paranthropus-boisei': {
    kids: 'Strong shoulders with dark hair and skin, wearing a woven sedge-grass and hide wrap while carrying wetland papyrus roots.',
    clinician: 'Megadont robust australopith with tall sagittal crest and archaic pelage; shown with C4 sedge tubers and speculative woven wrap.',
  },
  'paranthropus-robustus': {
    kids: 'Muscular build with short body hair, a simple hide wrap, and a polished bone digging tool used to dig up roots and termites.',
    clinician: 'Archaic pelage with speculative hide wrap; holds an attested Swartkrans-type polished bone digging implement (Backwell & d’Errico 2001).',
  },
  'homo-habilis': {
    kids: 'Lighter body hair than Lucy, wearing a simple gazelle hide draped over one shoulder and holding a sharp Oldowan stone chopper.',
    clinician: 'Reduced body hair relative to australopiths; shown with Oldowan core/flake lithics and a speculative draped raw-hide mantle.',
  },
  'homo-erectus': {
    kids: 'Tall, active runner with smooth dark brown skin for sweating in the hot sun, a leather shoulder sling, and a stone handaxe.',
    clinician: 'Thermoregulatory bare dark skin with eccrine sweat adaptation (Jablonski 2004), Acheulean biface in hip pouch, and cured hide sling.',
  },
  'homo-heidelbergensis': {
    kids: 'Wore a thick cured wild-horse hide cape tied with rawhide cord to stay warm and carried a wooden hunting spear.',
    clinician: 'Draped Middle Pleistocene hide mantle (consistent with Schöningen hide-scraping lithic wear) and a fire-hardened spruce spear.',
  },
  'homo-neanderthalensis': {
    kids: 'Dressed for Ice Age cold in a scraped reindeer-hide tunic, a thick wolf-fur cloak fastened with a bone pin, and forearm wraps.',
    clinician: ' scraped reindeer/deer hide tunic, wolf-fur mantle with bone pin, and Mousterian spear; supported by lissoir bone smoothers and lithic hide polish.',
  },
  'denisovans': {
    kids: 'Bundled in a warm steppe-bison fur coat sewn with bone awls, braided leather ties, and a polished green stone bracelet.',
    clinician: 'Heavy bison/wolf fur parka sewn with bone awls and an attested Denisova Cave polished green chlorite bracelet (Derevianko et al. 2008).',
  },
  'homo-floresiensis': {
    kids: 'Tiny island human wearing a beaten tree-bark cloth and woven pandanus-fiber shoulder wrap while holding a stone blade.',
    clinician: 'Diminutive 1.06 m stature; shown with speculative tropical beaten bark-cloth / pandanus wrap and attested Liang Bua chert blade.',
  },
  'homo-luzonensis': {
    kids: 'Small island human wearing a woven rattan and bark-cloth shoulder wrap and holding a flaked stone tool.',
    clinician: 'Speculative cranial and soft-tissue reconstruction (known from teeth/postcrania); shown with hypothetical tropical bark-cloth wrap.',
  },
  'homo-naledi': {
    kids: 'Slender build with dark skin and curly hair, wearing a simple springbok hide draped over one shoulder and tied at the waist.',
    clinician: 'Small-brained ~300 ka hominin (LES1 cranium); draped bovid-hide wrap is an artistic convention (no clothing artifacts in Rising Star).',
  },
  'homo-sapiens': {
    kids: 'Wearing a finely sewn buckskin tunic stitched with bone needles, a warm fox-fur collar, a woven belt, and seashell beads.',
    clinician: 'Upper Paleolithic tailored hide tunic (eyed bone needles), arctic fox mantle, twined fiber belt, and perforated marine shell / ochre beads.',
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
    title: `${sp.common.kids} (${sp.binomial}) — Skin & Attire Reconstruction`,
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
            reconstruction(sp, 'portrait--modal-recon', `Full life reconstruction of ${sp.common.kids} with skin and attire`),
            h('figcaption', { class: 'life-modal__cap' }, 'Three-quarter life reconstruction with skin, hair/pelage & attire'),
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
