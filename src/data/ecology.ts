/**
 * Structured paleoecological enamel carbon-isotope (δ13C) dietary signatures
 * and Grahame Clark lithic technological modes (Modes 0–4) for all 21 taxa.
 */
import type { DualText, SpeciesId } from './types';

export interface PaleoecologyEntry {
  dietIsotope: DualText;
  lithicMode: DualText;
}

export const PALEOECOLOGY: Record<SpeciesId, PaleoecologyEntry> = {
  'pan-troglodytes': {
    dietIsotope: {
      kids: 'Forest C3 plants & fruit (>95% tree foods)',
      clinician: 'Pure C3 canopy/woodland signal (enamel δ13C ≈ −13.5‰ to −11.5‰), even in savanna-woodland populations',
    },
    lithicMode: {
      kids: 'Percussive nut-cracking stones & organic probes',
      clinician: 'Percussive Mode 0 (unflaked hammer–anvil nut-cracking & organic probes; Côte d’Ivoire ≥4.3 ka)',
    },
  },
  'pan-paniscus': {
    dietIsotope: {
      kids: 'Rainforest C3 fruit & soft ground herbs',
      clinician: 'Closed-canopy C3 rainforest signal (δ13C ≈ −14.5‰ to −13.0‰; fruit + terrestrial herbaceous vegetation)',
    },
    lithicMode: {
      kids: 'Leaf umbrellas & moss sponges (no wild stone tools)',
      clinician: 'Organic tool use in the wild (no habitual wild stone percussive tradition documented)',
    },
  },
  'sahelanthropus-tchadensis': {
    dietIsotope: {
      kids: 'Lakeside forest & gallery-woodland C3 plants',
      clinician: 'Inferred C3 gallery-forest/woodland browser–frugivore within a mosaic perilacustrine basin (Chad)',
    },
    lithicMode: {
      kids: 'None found (pre-stone-tool era)',
      clinician: 'None attested (pre-lithic Late Miocene)',
    },
  },
  'orrorin-tugenensis': {
    dietIsotope: {
      kids: 'Woodland C3 fruits, seeds & insects',
      clinician: 'Inferred C3 closed/open woodland frugivore–omnivore (thick-enamelled microdont molars; Lukeino Fm.)',
    },
    lithicMode: {
      kids: 'None found (pre-stone-tool era)',
      clinician: 'None attested (pre-lithic Late Miocene)',
    },
  },
  'ardipithecus-ramidus': {
    dietIsotope: {
      kids: 'Woodland C3 figs, leaves & palm fruits (~85–90% C3)',
      clinician: 'Predominantly C3 woodland signal (enamel δ13C ≈ −11.5‰ to −10.0‰; <10–15% C4 grass/sedge input)',
    },
    lithicMode: {
      kids: 'None found',
      clinician: 'None attested (pre-Lomekwan Pliocene)',
    },
  },
  'australopithecus-anamensis': {
    dietIsotope: {
      kids: 'Mostly C3 trees/shrubs, tough seeds & roots (~90% C3)',
      clinician: 'C3-dominated diet (enamel δ13C ≈ −12.0‰ to −10.2‰) despite expanding C4 grassy floodplains at Turkana',
    },
    lithicMode: {
      kids: 'None found',
      clinician: 'None attested (~4.2–3.8 Ma; predates 3.3 Ma Lomekwan)',
    },
  },
  'australopithecus-afarensis': {
    dietIsotope: {
      kids: 'Mixed C3 tree foods + C4 savanna grasses & sedges',
      clinician: 'First major C3/C4 dietary expansion (enamel δ13C spanning −13‰ to −3‰; ~22–50% C4/CAM in Hadar/Dikika)',
    },
    lithicMode: {
      kids: 'Debated (3.3 Ma Lomekwian tools lived nearby)',
      clinician: 'Unconfirmed; spatiotemporal overlap with 3.3 Ma Lomekwian (“Mode 0”) & debated 3.4 Ma Dikika striae',
    },
  },
  'australopithecus-africanus': {
    dietIsotope: {
      kids: 'Mixed woodland fruits + ~30–40% savanna C4 foods',
      clinician: 'Broad mixed C3/C4 diet (enamel δ13C ≈ −11‰ to −5‰; ~30–40% C4 tropical grasses/sedges or C4-fed insects)',
    },
    lithicMode: {
      kids: 'No confirmed stone tools at its cave sites',
      clinician: 'No direct lithic association in Sterkfontein Member 4 / Makapansgat',
    },
  },
  'australopithecus-sediba': {
    dietIsotope: {
      kids: 'Almost 100% C3 forest leaves, fruit & bark',
      clinician: 'Unexpectedly pure C3 signal (enamel δ13C ≈ −11.6‰; woody/bark phytoliths) amid C4 savanna',
    },
    lithicMode: {
      kids: 'No stone tools found at Malapa cave',
      clinician: 'None recovered in the Malapa deposit (despite precision-grip hand morphology)',
    },
  },
  'paranthropus-boisei': {
    dietIsotope: {
      kids: 'Extreme C4 sedge & tropical grass specialist (~75–80% C4)',
      clinician: 'Extreme C4 specialist (enamel δ13C ≈ −2.0‰ to +0.2‰; ~75–80% C4 sedges/grasses, Cerling et al. 2011)',
    },
    lithicMode: {
      kids: 'Co-existed with Oldowan/Acheulean stone tools',
      clinician: 'Co-occurs stratigraphically with Mode 1 (Oldowan) & early Mode 2; maker attribution debated',
    },
  },
  'paranthropus-robustus': {
    dietIsotope: {
      kids: 'Mixed C3 nuts/tubers + ~35% C4 savanna sedges',
      clinician: 'Mixed C3/C4 hard-object/fallback generalist (enamel δ13C ≈ −9.5‰ to −6.0‰; pitted microwear)',
    },
    lithicMode: {
      kids: 'Polished bone digging sticks for termite mounds',
      clinician: 'Osseous digging tools (Swartkrans termite-foraging bone points) + co-occurring Mode 1/2 lithics',
    },
  },
  'homo-habilis': {
    dietIsotope: {
      kids: 'Mixed C3/C4 plants plus scavenged meat & marrow',
      clinician: 'Mixed C3/C4 omnivore (~30–50% C4 signal in East Turkana/Olduvai) with stone-tool marrow/meat access',
    },
    lithicMode: {
      kids: 'Mode 1 · Oldowan sharp flakes & cobble choppers',
      clinician: 'Mode 1 · Oldowan core-and-flake industry (hard-hammer cobble cores & sharp unretouched flakes)',
    },
  },
  'homo-erectus': {
    dietIsotope: {
      kids: 'Open-savanna C4 grazers, marrow & underground tubers',
      clinician: 'Elevated C4/animal-tissue isotopic signature (~45–65% C4 in Turkana Homo) + ungulate butchery',
    },
    lithicMode: {
      kids: 'Mode 1 Oldowan → Mode 2 Acheulean teardrops (hand axes)',
      clinician: 'Mode 1 (Dmanisi/early Oldowan) & Mode 2 · Acheulean symmetrical bifacial handaxes and cleavers (≥1.76 Ma)',
    },
  },
  'homo-antecessor': {
    dietIsotope: {
      kids: 'Temperate C3 woodland deer, horses & wild plants',
      clinician: 'Temperate European C3 ecosystem carnivore–forager (cervids, equids, plant foods & TD6 cannibalism)',
    },
    lithicMode: {
      kids: 'Mode 1 · Sharp flint & quartzite flakes and cores',
      clinician: 'Mode 1 · Early European core-and-flake industry (Gran Dolina TD6; predates European Mode 2 spread)',
    },
  },
  'homo-heidelbergensis': {
    dietIsotope: {
      kids: 'Large Ice Age game (horses, rhinos) & seasonal plants',
      clinician: 'High-trophic C3/mixed big-game hunter (cooperative equine/cervid hunting at Schöningen & Boxgrove)',
    },
    lithicMode: {
      kids: 'Mode 2 → 3 · Finely shaped hand axes & wooden spears',
      clinician: 'Late Mode 2 refined Acheulean bifaces transitioning to early Mode 3 Levallois prepared cores + wooden spears',
    },
  },
  'homo-neanderthalensis': {
    dietIsotope: {
      kids: 'Top-predator meat diet plus cooked seeds, roots & seafood',
      clinician: 'High collagen δ15N top-level carnivore signal paired with dental-calculus starch/plant & coastal marine intake',
    },
    lithicMode: {
      kids: 'Mode 3 · Mousterian Levallois stone points & birch-tar glue',
      clinician: 'Mode 3 · Mousterian / Levallois prepared-core flakes, hafted points (birch-bark pitch) & lissoir bone tools',
    },
  },
  denisovans: {
    dietIsotope: {
      kids: 'High-plateau blue sheep, yaks, marmots & steppe plants',
      clinician: 'Diverse Eurasian C3 boreal-to-alpine fauna (Baishiya Karst zooarchaeology: caprines, bovids, equids, marmots)',
    },
    lithicMode: {
      kids: 'Mode 3 → 4 · Stone flakes, bone tools & polished stone bracelets',
      clinician: 'Mode 3 prepared-core/flake assemblages (Baishiya & Denisova) extending into Initial Upper Paleolithic ornaments',
    },
  },
  'homo-floresiensis': {
    dietIsotope: {
      kids: 'Island pygmy Stegodon elephants, Komodo dragons & giant rats',
      clinician: 'Insular C3/C4 monsoon-forest forager hunting juvenile Stegodon florensis, giant murids and Varanus',
    },
    lithicMode: {
      kids: 'Mode 1 · Small volcanic-rock & chert radial flakes',
      clinician: 'Mode 1-like radial/bipolar core-and-flake reduction on silicified tuff and chert (~190–50 ka at Liang Bua)',
    },
  },
  'homo-luzonensis': {
    dietIsotope: {
      kids: 'Tropical island deer, wild pigs & rainforest plants',
      clinician: 'Tropical C3 island rainforest–woodland diet (associated with butchered Philippine brown deer in Callao Cave)',
    },
    lithicMode: {
      kids: 'Cut-marked deer bones (709 ka stone tools nearby in Luzon)',
      clinician: 'Butchery cut marks in Callao Cave; Mode 1 core-and-flake tools documented earlier on Luzon at Kalinga (~709 ka)',
    },
  },
  'homo-naledi': {
    dietIsotope: {
      kids: 'Gritty, dusty savanna–woodland foods that chipped its teeth',
      clinician: 'Heavy antemortem dental chipping & cupped wear indicating gritty/mechanically resistant Highveld resources',
    },
    lithicMode: {
      kids: 'No stone tools found inside the Rising Star chambers',
      clinician: 'Unassociated in Rising Star chambers (contemporaneous with southern African Middle Stone Age Mode 3)',
    },
  },
  'homo-sapiens': {
    dietIsotope: {
      kids: 'Global omnivore: land game, fish, shellfish & cooked grains',
      clinician: 'Broad-spectrum C3/C4/marine isotopic niche expansion (high aquatic/coastal δ13C & δ15N diversity from MSA/UP onward)',
    },
    lithicMode: {
      kids: 'Mode 3 → Mode 4/5 · Blades, bone needles, bows & microliths',
      clinician: 'Mode 3 Middle Stone Age (Jebel Irhoud Levallois) → Mode 4/5 prismatic blades, microliths & osseous projectiles',
    },
  },
};
