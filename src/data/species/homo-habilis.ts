import type { Species } from '../types';

export const species: Species = {
  id: 'homo-habilis',
  binomial: 'Homo habilis',
  common: { kids: 'Handy Man', clinician: 'Homo habilis' },
  nickname: 'Handy Man',
  group: 'early-homo',
  status: 'extinct',
  rangeKa: { start: 2400, end: 1400 },
  regions: ['East Africa (Tanzania, Kenya, Ethiopia)'],
  brainCc: { best: null, min: 510, max: 824 },
  statureCm: { best: null, min: 100, max: 131 },
  massKg: { best: null, min: 32, max: 37 },
  locomotion: {
    kids: 'Walked on two legs. Its arms were long and strong, good for climbing.',
    clinician:
      'Bipedal (OH 8 foot with an adducted hallux and arched midfoot elements). Some partial skeletons attributed to the species suggest relatively long upper limbs, but attributions are debated.',
  },
  diet: {
    kids: 'Plants, plus meat and bone marrow from animals, using stone tools.',
    clinician: 'Omnivorous; association with Oldowan tools and cut-marked bones indicates carcass processing.',
  },
  technology: {
    kids: 'Made simple stone tools by knocking sharp flakes off rocks.',
    clinician: 'Associated with Oldowan (Mode 1) technology at Olduvai, although the earliest Oldowan predates securely dated H. habilis fossils.',
  },
  overview: {
    kids: 'Homo habilis lived in East Africa about 2.4 to 1.4 million years ago. Its name means “handy man”, because scientists thought it made the first stone tools. Its brain was bigger than Lucy’s, but its body was still small.',
    clinician:
      'Defined on OH 7 (Leakey, Tobias & Napier 1964). The hypodigm is heterogeneous: some researchers separate H. rudolfensis (KNM-ER 1470) and some question whether habilis belongs in Homo. Endocranial volumes range from ~510 cm³ (KNM-ER 1813) to 729–824 cm³ for the reconstructed OH 7 (Spoor et al. 2015). Stature and mass ranges are female–male means (McHenry 1991, 1992).',
  },
  keyTraits: {
    kids: ['Bigger brain than earlier relatives', 'Smaller face and teeth than Paranthropus', 'Long arms', 'Made stone tools'],
    clinician: [
      'Endocranial volume ~510–820 cm³',
      'Reduced postcanine megadontia relative to australopiths',
      'Primitive, long and narrow mandibular dental arcade in OH 7',
      'Broad distal phalangeal tufts in the OH 7 hand',
      'Small body size',
    ],
  },
  funFacts: [
    'The type fossil, OH 7, was found in 1960 by Jonathan Leakey, so it is nicknamed “Jonny’s Child”.',
    'The name “habilis” (handy) was suggested by Raymond Dart.',
    'Some fossils from Olduvai Gorge thought to belong to Homo habilis have crocodile bite marks!',
    'It lived at the same time and in the same places as Paranthropus boisei and early Homo erectus.',
  ],
  ancestry: {
    parent: 'australopithecus-afarensis',
    uncertain: true,
    note: 'The earliest Homo (the ~2.8 Ma Ledi-Geraru mandible, not included here) may link Homo to A. afarensis-like populations. H. habilis overlapped in time with H. erectus, so it may not be its direct ancestor.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'oh-7',
      catalog: 'OH 7',
      nickname: 'Jonny’s Child',
      site: { name: 'Olduvai Gorge, FLK NN (Bed I)', country: 'Tanzania', lat: -3.0, lon: 35.4 },
      ageKa: { best: null, min: 1750, max: 1850, method: 'Bed I volcanic tuffs (K–Ar and 40Ar/39Ar), roughly 1.8 Ma' },
      sex: 'unknown',
      ageAtDeath: 'Juvenile',
      discovery: { year: 1960, by: 'Jonathan Leakey' },
      completeness: { percent: null, found: ['mandible'], partial: ['cranium', 'teeth_lower', 'hand_L', 'hand_R'] },
      story: {
        kids: 'In 1960, young Jonathan Leakey found pieces of a skull and jaw at Olduvai Gorge. They belonged to a child who lived about 1.8 million years ago. Scientists used these fossils to name a new species: Homo habilis.',
        clinician:
          'Holotype: juvenile mandible with dentition, both parietals and a set of hand bones. Spoor et al. (2015) virtually reconstructed the distorted mandible and parietals, estimating an endocranial volume of 729–824 cm³ and a primitive, long, narrow dental arcade.',
      },
      taphonomy: { colors: ['#4a423b', '#6e645a', '#25201c'], note: 'Dark, mineralised Olduvai Bed I bone.' },
      lesions: [],
      citations: ['leakey1964', 'spoor2015'],
      isFlagship: true,
    },
  ],
  citations: ['leakey1964', 'spoor2015', 'mchenry1991', 'mchenry1992'],
};
