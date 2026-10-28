import type { Species } from '../types';

export const species: Species = {
  id: 'homo-luzonensis',
  binomial: 'Homo luzonensis',
  common: { kids: 'Luzon human', clinician: 'Homo luzonensis' },
  nickname: null,
  group: 'island-homo',
  status: 'extinct',
  rangeKa: { start: 67, end: 50 },
  regions: ['Luzon, Philippines'],
  brainCc: { best: null, min: null, max: null },
  statureCm: { best: null, min: null, max: null },
  massKg: { best: null, min: null, max: null },
  locomotion: {
    kids: 'Walked on two legs, but its curved finger and toe bones suggest it might also have climbed.',
    clinician:
      'Bipedal (inferred). Curved manual and pedal phalanges with strong flexor attachments recall australopiths and may reflect climbing or developmental plasticity (Détroit et al. 2019).',
  },
  diet: {
    kids: 'We do not know yet.',
    clinician: 'Not directly known.',
  },
  technology: {
    kids: 'No stone tools have been found with its fossils so far.',
    clinician:
      'No artefacts directly associated with the Callao Cave hominin fossils. A ~709 ka butchered rhinoceros at Kalinga, Luzon (Ingicco et al. 2018), shows that some hominins reached Luzon much earlier, but their identity is unknown.',
  },
  overview: {
    kids: 'Homo luzonensis is a small human relative found in a cave on Luzon island in the Philippines. Only a few teeth and finger and toe bones have been found. They are at least 50,000 to 67,000 years old. Its teeth are tiny, and its toe bone is curved like those of much older relatives.',
    clinician:
      'Named by Détroit et al. (2019) from teeth, manual and pedal phalanges, a third metatarsal and a juvenile femoral shaft representing at least three individuals from Callao Cave. U-series minimum ages are ~67 ka (CCH1 metatarsal; Mijares et al. 2010) and ~50 ka (CCH6 tooth); true ages could be older, so rangeKa is a minimum bracket. Combines very small, simple postcanine teeth with australopith-like curved phalanges; affinities unresolved. Brain size, stature and body mass are unknown.',
  },
  keyTraits: {
    kids: ['Very small back teeth', 'Curved finger and toe bones', 'Probably a small body', 'Lived on an island'],
    clinician: [
      'Very small, morphologically simple maxillary molars',
      'Premolars relatively large with two or three roots',
      'Curved proximal manual and pedal phalanges with strong flexor ridges',
      'Proximal pedal phalanx morphology resembling australopiths',
    ],
  },
  funFacts: [
    'It was named in 2019 after Luzon, the island where it was found.',
    'Its back teeth are smaller than those of almost any other known human relative.',
    'Its toe bone is curved like the toes of Lucy’s species, which lived millions of years earlier.',
    'The first fossil, a foot bone, was found in Callao Cave in 2007.',
    'Luzon was never joined to mainland Asia by land, so its ancestors must have crossed the sea.',
    'Stone tools and a butchered rhinoceros on Luzon are about 709,000 years old, but nobody knows who made them.',
  ],
  ancestry: {
    parent: 'homo-erectus',
    uncertain: true,
    note: 'Ancestry unknown: possibly an island descendant of an early Homo or H. erectus dispersal, paralleling H. floresiensis.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'cch6',
      catalog: 'CCH6 (holotype)',
      nickname: null,
      site: { name: 'Callao Cave', country: 'Philippines', lat: 17.7, lon: 121.8 },
      ageKa: { best: null, min: 50, max: null, method: 'U-series minimum age on dental tissue (Détroit et al. 2019)' },
      sex: 'unknown',
      ageAtDeath: 'Adult (permanent teeth in wear)',
      discovery: { year: null, by: 'Callao Cave excavation team led by Armand Salvador Mijares' },
      completeness: { percent: null, found: [], partial: ['teeth_upper'] },
      story: {
        kids: 'These small upper teeth all came from one person who lived on Luzon island at least 50,000 years ago. They are so small and simple that scientists decided they belonged to a new species.',
        clinician:
          'Holotype: associated maxillary postcanine teeth (premolars and molars) of one adult individual, with very small molar crowns and relatively large, multi-rooted premolars (Détroit et al. 2019).',
      },
      taphonomy: { colors: ['#b9a585', '#9b8665', '#5c4b36'], note: 'Small, brown-stained teeth from cave sediments.' },
      lesions: [],
      citations: ['detroit2019'],
      isFlagship: true,
    },
    {
      id: 'cch1',
      catalog: 'CCH1',
      nickname: null,
      site: { name: 'Callao Cave', country: 'Philippines', lat: 17.7, lon: 121.8 },
      ageKa: { best: null, min: 67, max: null, method: 'Direct U-series (laser-ablation) dating of the bone; minimum age (Mijares et al. 2010)' },
      sex: 'unknown',
      ageAtDeath: null,
      discovery: { year: 2007, by: 'Armand Salvador Mijares and team (University of the Philippines)' },
      // Third metatarsal. Left vs right is not confirmed in the sources used here, so no bone is encoded.
      completeness: { percent: null, found: [], partial: [] },
      story: {
        kids: 'This foot bone was found in 2007. It showed that people lived on Luzon at least 67,000 years ago, long before anyone knew about Homo luzonensis.',
        clinician:
          'Nearly complete third metatarsal, small and gracile. Direct U-series dating gives a minimum age of ~67 ka, at the time the earliest direct evidence of hominins in the Philippines (Mijares et al. 2010). First referred to Homo sp.; included in the H. luzonensis hypodigm by Détroit et al. (2019). Laterality is not confirmed here, so the bone is not mapped onto the 3D skeleton.',
      },
      taphonomy: { colors: ['#bea788', '#9f876a', '#5e4c3b'], note: 'Small, tan foot bone from cave sediments.' },
      lesions: [],
      citations: ['mijares2010', 'detroit2019'],
      isFlagship: false,
    },
  ],
  citations: ['detroit2019', 'mijares2010', 'ingicco2018'],
};
