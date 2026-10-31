import type { Species } from '../types';

export const species: Species = {
  id: 'homo-antecessor',
  binomial: 'Homo antecessor',
  common: { kids: 'Pioneer Man', clinician: 'Homo antecessor' },
  nickname: 'Pioneer Man',
  group: 'archaic-homo',
  status: 'extinct',
  rangeKa: { start: 950, end: 770 },
  regions: ['Western Europe (Sierra de Atapuerca, Spain; possible footprints at Happisburgh, UK)'],
  brainCc: { best: 1000, min: null, max: null },
  statureCm: { best: null, min: 160, max: 180 },
  massKg: { best: null, min: 60, max: 90 },
  locomotion: {
    kids: 'Walked and ran upright on two strong, modern-shaped legs across European river valleys.',
    clinician:
      'Fully modern, obligate striding bipedalism with robust lower-limb diaphyses and foot proportions comparable to Early–Middle Pleistocene Homo.',
  },
  diet: {
    kids: 'Hunted deer, horses and rhinos, gathered plants and berries, and—at Gran Dolina cave—also butchered other humans.',
    clinician:
      'Broad-spectrum Paleolithic hunter-forager consuming ungulates (cervids, equids, bovids) and plant foods without archaeological proof of habitual cooking; Gran Dolina TD6 documents systematic nutritional cannibalism (Fernández-Jalvo et al. 1999).',
  },
  technology: {
    kids: 'Used sharp stone flakes and choppers made from flint, quartz and quartzite to slice meat and crack marrow bones.',
    clinician:
      'Core-and-flake (Mode 1 / early European Lower Paleolithic) lithic industry knapped on local flint, quartzite, sandstone and quartz in Gran Dolina TD6.',
  },
  overview: {
    kids: '“Antecessor” means “pioneer” or “explorer” in Latin, because this species is one of the earliest known humans in Western Europe, living in Spain about 850,000 years ago. Remarkably, a child’s fossil face already had hollow cheekbones shaped much like ours!',
    clinician:
      'Early Pleistocene European hominin from unit TD6 of Gran Dolina, Sierra de Atapuerca, Spain, dated by ESR, U-series and palaeomagnetism below the Matuyama–Brunhes boundary to ~850–772 ka (Bermúdez de Castro et al. 1997). Combines an archaic, double-arched supraorbital torus and ~1,000 cm³ braincase with a strikingly derived, modern-like midface (coronally oriented infraorbital plate and canine fossa). Ancient dental enamel palaeoproteomics places H. antecessor as a close sister lineage to the last common ancestor of H. sapiens, Neanderthals and Denisovans (Welker et al. 2020).',
  },
  keyTraits: {
    kids: [
      'Modern-looking hollow cheekbones under the eyes',
      'Arched brow ridge above the eyes',
      'Brain around 1,000 cm³ (three-quarters the size of ours)',
      'Tall, sturdy body suited to cooler European seasons',
    ],
    clinician: [
      'Derived modern-like midfacial topography with a distinct canine fossa and coronal infraorbital plate (ATD6-69)',
      'Double-arched supraorbital torus and low frontal squama (ATD6-15)',
      'Endocranial volume ~1,000 cm³',
      'Primitive premolar root morphology paired with derived anterior dental proportions',
    ],
  },
  funFacts: [
    '“Antecessor” was the Latin word Roman legions used for scouts and trailblazers.',
    'Scientists extracted 800,000-year-old proteins from a tooth of Homo antecessor—some of the oldest human proteins ever sequenced!',
    'Footprints pressed into mud on an English beach at Happisburgh (~850,000 years ago) may have been left by relatives of Pioneer Man.',
    'Over 160 fossil bones from at least 11 individuals were found in layer TD6 of Gran Dolina cave in northern Spain.',
  ],
  ancestry: {
    parent: 'homo-erectus',
    uncertain: true,
    note: 'Enamel palaeoproteomics places H. antecessor as a close sister taxon to—or near—the last common ancestor of H. sapiens, Neanderthals and Denisovans (Welker et al. 2020).',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'atd6-69',
      catalog: 'ATD6-69 (holotype maxilla/midface; associated with frontal ATD6-15, "Boy of Gran Dolina")',
      nickname: 'Boy of Gran Dolina',
      site: { name: 'Gran Dolina (Level TD6), Sierra de Atapuerca', country: 'Spain', lat: 42.35, lon: -3.52 },
      ageKa: {
        best: 850,
        min: 772,
        max: 949,
        method: 'Palaeomagnetism (Matuyama reversed chron >772 ka), ESR and U-series dating of Gran Dolina TD6',
      },
      sex: 'unknown',
      ageAtDeath: 'Juvenile (~10–11.5 years from dental eruption)',
      discovery: { year: 1994, by: 'Aurora Martín Nájera and the Atapuerca Research Team (Eudald Carbonell, J.M. Bermúdez de Castro, J.L. Arsuaga)' },
      completeness: {
        percent: null,
        found: ['cranium', 'teeth_upper'],
        partial: ['mandible', 'clavicle_L', 'ribs', 'radius_R', 'femur_L'],
      },
      story: {
        kids: 'In 1994 at Gran Dolina cave in Spain, scientists uncovered the midface of a 10-year-old who lived 850,000 years ago. To their surprise, the cheekbones looked shockingly modern—and tiny stone-tool scratches on the bones showed how tough life was in Ice Age Europe.',
        clinician:
          'Juvenile partial facial skeleton (ATD6-69) and refitting/associated frontal (ATD6-15) from the Aurora Stratum (TD6.2). Hominin bones in TD6 were processed identically to butchered deer and horse carcasses—bearing stone-tool defleshing striae, peeling and percussion notches—establishing the earliest secure case of hominin cannibalism in Europe (Bermúdez de Castro et al. 1997; Fernández-Jalvo et al. 1999).',
      },
      taphonomy: { colors: ['#d6bfa0', '#b79973', '#6b533b'], note: 'Ochre-cream cave breccia bone with iron-manganese flecks.' },
      lesions: [
        {
          id: 'atd6-69-cut-marks',
          kind: 'cut-marks',
          bone: 'cranium',
          site: { anchor: 'zygomatic-L' },
          timing: 'perimortem',
          healing: 'none',
          title: {
            kids: 'Stone-tool cut marks on the cheekbone',
            clinician: 'Perimortem lithic defleshing striae on the zygomaticomaxillary midface',
          },
          summary: {
            kids: 'Microscopic V-shaped scratches made by sharp stone flakes cross the cheekbone with no healing, showing meat was cut from the bone right after death.',
            clinician:
              'Sub-parallel V-sectioned incisions with internal microstriations and Hertzian shoulder flaking on the zygomatic and maxillary surfaces of ATD6-69 (and associated TD6 hominin elements), matching the butchery pattern of contemporaneous ungulate prey and documenting nutritional cannibalism (Fernández-Jalvo et al. 1999).',
          },
          clinical: {
            morphology: 'Linear V-shaped cortical striae with internal parallel microstriations, lacking osteoblastic remodelling; accompanied across the TD6 assemblage by percussion pits, conchoidal scars and classic peeling.',
            differential: [
              'Perimortem anthropic defleshing / nutritional cannibalism',
              'Ritual secondary defleshing (unsupported by identical discard with faunal refuse)',
              'Sedimentary trampling abrasion (excluded by SEM microstriation geometry and anatomical muscle-attachment placement)',
            ],
            modernAnalogue: 'Sharp-force stone-flake incisions on fresh periosteum-covered facial bone.',
            functionalImpact: 'Post-lethal / perimortem carcass processing.',
            survivalInterval: 'None (perimortem processing).',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['fernandezjalvo1999', 'bermudezdecastro1997'],
          render: { severity: 0.6, count: 5, radiusMm: 10 },
        },
      ],
      citations: ['bermudezdecastro1997', 'fernandezjalvo1999', 'welker2020'],
      isFlagship: true,
    },
  ],
  citations: ['bermudezdecastro1997', 'fernandezjalvo1999', 'welker2020', 'smithsonian-hop'],
};
