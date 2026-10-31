import type { Species } from '../types';

export const species: Species = {
  id: 'australopithecus-anamensis',
  binomial: 'Australopithecus anamensis',
  common: { kids: 'Lake Turkana australopith', clinician: 'Australopithecus anamensis' },
  nickname: null,
  group: 'australopith',
  status: 'extinct',
  rangeKa: { start: 4200, end: 3800 },
  regions: ['East Africa (Kenya: Kanapoi & Allia Bay; Ethiopia: Asa Issie & Woranso-Mille)'],
  brainCc: { best: 370, min: 365, max: 375 },
  statureCm: { best: null, min: null, max: null },
  massKg: { best: null, min: 42, max: 55 },
  locomotion: {
    kids: 'Its shin bone had a flat, strong ankle joint made for walking upright on two legs, while its long forearms still helped it climb trees.',
    clinician:
      'Obligate/habitual terrestrial biped evidenced by the orthogonal tibial plafond and expanded metaphyses of KNM-KP 29285 (Leakey et al. 1995), paired with a long radius and curved phalanges indicating continued arboreal climbing.',
  },
  diet: {
    kids: 'Fruits, nuts, seeds and tough roots—harder foods than earlier forest relatives ate.',
    clinician:
      'Predominantly C3 plant resources (enamel δ13C ≈ −12‰ to −10‰) with thick molar enamel and heavy occlusal wear adapted to tougher fallback foods than Ardipithecus.',
  },
  technology: {
    kids: 'No stone tools have been found with this species.',
    clinician: 'No associated stone tool assemblages (predates Lomekwi 3 by ~500 kyr).',
  },
  overview: {
    kids: 'Named after “anam”, the Turkana word for lake, Australopithecus anamensis is the oldest known member of Lucy’s genus. For decades we only had its jaws and shin bone—until a nearly complete 3.8-million-year-old skull was found in Ethiopia in 2016!',
    clinician:
      'Earliest recognized species of Australopithecus (~4.2–3.8 Ma; Leakey et al. 1995). Long proposed to have evolved anagenetically into A. afarensis (Kimbel et al. 2006), though the 3.80 Ma MRD-VP-1/1 cranium from Woranso-Mille overlaps temporally with early frontal elements assigned to A. afarensis (~3.9 Ma at Belohdelie), indicating cladogenesis and at least ~100 kyr of lineage overlap (Haile-Selassie et al. 2019).',
  },
  keyTraits: {
    kids: [
      'Upright-walking shin bone and ankle joint',
      'Small brain about the size of a chimp’s (~370 cm³)',
      'Long, narrow jaw with parallel rows of back teeth',
      'Wide cheekbones and a strongly projecting lower face',
    ],
    clinician: [
      'Orthogonal distal/proximal tibial articular surfaces (KNM-KP 29285) diagnostic of bipedal loading',
      'Small endocranial volume (~365–370 cm³ in MRD-VP-1/1) with pronounced postorbital constriction',
      'Narrow, U-shaped palate with parallel postcanine tooth rows and sloping mandibular symphysis',
      'Anteriorly projecting zygomatics and small, oval external acoustic meatus',
    ],
  },
  funFacts: [
    '“Anam” means “lake” in the Turkana language, honouring ancient Lake Lonyumun in northern Kenya.',
    'The first fossil piece of this species was actually picked up in 1965, thirty years before scientists had enough bones to name it!',
    'In 2016, goat herder Ali Bereino spotted the upper jaw of the famous MRD skull sticking out of sandy ground in Ethiopia.',
    'Its discovery proved that Lucy’s species lived side-by-side with its older cousin for at least 100,000 years.',
  ],
  ancestry: {
    parent: 'ardipithecus-ramidus',
    uncertain: true,
    note: 'Plausible descendant of an Ardipithecus-grade Pliocene hominin in eastern Africa (~4.4–4.2 Ma), though transitional fossils remain sparse.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'mrd-vp-1-1',
      catalog: 'MRD-VP-1/1',
      nickname: 'MRD cranium',
      site: { name: 'Miro Dora, Woranso-Mille', country: 'Ethiopia', lat: 11.45, lon: 40.52 },
      ageKa: { best: 3800, min: 3770, max: 3820, method: '40Ar/39Ar dating of tuffs bracketing deltaic sands in the Woranso-Mille sequence' },
      sex: 'male',
      ageAtDeath: 'Older adult (heavily worn postcanine dentition)',
      discovery: { year: 2016, by: 'Ali Bereino and Yohannes Haile-Selassie (Woranso-Mille Paleoanthropological Project)' },
      completeness: {
        percent: null,
        found: ['cranium', 'teeth_upper'],
        partial: [],
      },
      story: {
        kids: 'In February 2016, local resident Ali Bereino found an upper jaw in the Afar desert of Ethiopia, and Yohannes Haile-Selassie spotted the rest of the skull just three metres away! It gave scientists their very first look at the face of Australopithecus anamensis.',
        clinician:
          'Virtually complete adult male cranium (~365–370 cm³ endocranial volume) combining primitive traits (small braincase, extreme postorbital constriction, small earhole) with derived facial robusticity and anteriorly positioned zygomatics (Haile-Selassie et al. 2019).',
      },
      taphonomy: { colors: ['#7d6a54', '#a18a6d', '#44372b'], note: 'Warm brown mineralised cranium from deltaic sandstone.' },
      lesions: [],
      citations: ['haileselassie2019'],
      isFlagship: true,
    },
    {
      id: 'knm-kp-29285',
      catalog: 'KNM-KP 29285',
      nickname: 'Kanapoi bipedal tibia',
      site: { name: 'Kanapoi, West Turkana', country: 'Kenya', lat: 2.31, lon: 36.08 },
      ageKa: { best: 4100, min: 4070, max: 4170, method: '40Ar/39Ar dating of the Kanapoi pumice tuff horizons' },
      sex: 'unknown',
      ageAtDeath: 'Adult',
      discovery: { year: 1994, by: 'Peter Nzube (team led by Meave Leakey and Alan Walker)' },
      completeness: {
        percent: null,
        found: ['tibia_R'],
        partial: [],
      },
      story: {
        kids: 'Found near Lake Turkana in 1994, this 4.1-million-year-old right shin bone has both its knee end and its ankle end—proving early australopiths walked upright with weight straight over their ankles.',
        clinician:
          'Right proximal and distal tibia (missing mid-diaphyseal segment) from Kanapoi (~4.1 Ma). Symmetrical condylar concavities, expanded subchondral trabecular bone and a perpendicular tibiotalar joint surface provide classic biomechanical proof of habitual bipedalism at >4 Ma (Leakey et al. 1995).',
      },
      taphonomy: { colors: ['#8a765c', '#ae977a', '#4b3e2f'], note: 'Buff-brown fluvial bone from Kanapoi paleosol.' },
      lesions: [],
      citations: ['leakey1995'],
      isFlagship: false,
    },
  ],
  citations: ['leakey1995', 'haileselassie2019', 'kimbel2009', 'smithsonian-hop'],
};
