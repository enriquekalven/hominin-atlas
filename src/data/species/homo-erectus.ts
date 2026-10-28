import type { Species } from '../types';

export const species: Species = {
  id: 'homo-erectus',
  binomial: 'Homo erectus',
  common: { kids: 'Upright Man', clinician: 'Homo erectus' },
  nickname: 'Upright Man',
  group: 'early-homo',
  status: 'extinct',
  rangeKa: { start: 1890, end: 110 },
  regions: ['Africa', 'Western Asia (Georgia)', 'East Asia (China)', 'Southeast Asia (Java)'],
  brainCc: { best: null, min: 546, max: 1251 },
  statureCm: { best: null, min: 145, max: 185 },
  massKg: { best: null, min: 40, max: 68 },
  locomotion: {
    kids: 'Walked and ran on two long legs, just like us.',
    clinician:
      'Obligate, modern-like striding bipedalism with long lower limbs and an arched foot; adaptations for endurance running have been proposed (Bramble & Lieberman 2004).',
  },
  diet: {
    kids: 'Meat, bone marrow, fruits, roots and tubers. It may have cooked food with fire.',
    clinician: 'Increased reliance on animal tissues (cut-marked bones) and food processing; evidence for controlled fire before ~1 Ma is limited and debated.',
  },
  technology: {
    kids: 'Made big, teardrop-shaped stone hand axes.',
    clinician: 'Associated with Oldowan and Acheulean (Mode 2) technologies; Acheulean bifaces appear in East Africa by ~1.75 Ma.',
  },
  overview: {
    kids: 'Homo erectus was the first human relative with a body shaped much like ours. It lived for almost two million years and spread from Africa all the way to China and Indonesia. It made hand axes and may have used fire.',
    clinician:
      'Widely distributed, long-lived species (≈1.9 Ma to ≈110 ka; Ngandong, Java, dated to 117–108 ka by Rizal et al. 2020). Some authors separate early African specimens as H. ergaster. A juvenile cranium from Drimolen (DNH 134, ~2.04–1.95 Ma) has been attributed to H. erectus (Herries et al. 2020), which would extend the range. Endocranial volume spans ~546 cm³ (Dmanisi Skull 5) to >1,200 cm³ (Ngandong). Body-size range follows the Smithsonian Human Origins summary.',
  },
  keyTraits: {
    kids: ['Tall body with long legs', 'Thick brow ridge', 'Long, low skull', 'Bigger brain than Homo habilis'],
    clinician: [
      'Long, low cranial vault with sagittal keeling and an angular torus',
      'Thick cranial vault bones; continuous supraorbital torus',
      'Endocranial volume ~546–1,251 cm³',
      'Modern-like body proportions and tall stature',
      'Reduced postcanine dentition',
    ],
  },
  funFacts: [
    'The Turkana Boy skeleton, found in Kenya in 1984, is one of the most complete early human skeletons ever found.',
    'The first Homo erectus fossils were found on Java, Indonesia, by Eugène Dubois in 1891.',
    'Homo erectus survived on Java until about 110,000 years ago.',
    'At Dmanisi, Georgia, five skulls about 1.8 million years old were found, including one from an older person who had lost almost all their teeth.',
  ],
  ancestry: {
    parent: 'homo-habilis',
    uncertain: true,
    note: 'Origin uncertain: possibly from H. habilis-like populations in Africa, but the two species overlapped in time in East Africa.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'knm-wt-15000',
      catalog: 'KNM-WT 15000',
      nickname: 'Turkana Boy (Nariokotome Boy)',
      site: { name: 'Nariokotome, West Turkana', country: 'Kenya', lat: 4.1, lon: 35.8 },
      ageKa: { best: 1500, min: null, max: null, method: '40Ar/39Ar and correlation of volcanic tuffs bracketing the skeleton (about 1.5 Ma)' },
      sex: 'male',
      ageAtDeath: 'Juvenile; about 8–9 years from dental growth lines (older estimates suggested 11–12 years)',
      discovery: { year: 1984, by: 'Kamoya Kimeu (team led by Richard Leakey and Alan Walker)' },
      completeness: {
        percent: null,
        found: ['skull', 'spine', 'ribs', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'pelvis', 'leg_L', 'leg_R'],
        partial: [],
      },
      story: {
        kids: 'In 1984, fossil hunter Kamoya Kimeu spotted a small piece of skull near a dry riverbed in Kenya. The team dug for years and found almost a whole skeleton of a boy. He lived about 1.5 million years ago and was already tall for his age.',
        clinician:
          'Exceptionally complete juvenile male skeleton lacking most of the hands and feet (Brown et al. 1985). Long-limbed, narrow-bodied proportions. Vertebral asymmetries have been interpreted as pathology (axial dysplasia or juvenile disc herniation) or as minor variation.',
      },
      taphonomy: { colors: ['#4d4036', '#76634f', '#2a221c'], note: 'Dark brown to black fossil bone from lake-margin silts.' },
      lesions: [],
      citations: ['brown1985'],
      isFlagship: true,
    },
  ],
  citations: ['brown1985', 'rizal2020', 'herries2020', 'lordkipanidze2013', 'bramble2004', 'smithsonian-hop'],
};
