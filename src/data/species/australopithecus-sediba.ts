import type { Species } from '../types';

export const species: Species = {
  id: 'australopithecus-sediba',
  binomial: 'Australopithecus sediba',
  common: { kids: 'Karabo’s species', clinician: 'Australopithecus sediba' },
  nickname: null,
  group: 'australopith',
  status: 'extinct',
  rangeKa: { start: 1980, end: 1975 },
  regions: ['Southern Africa (South Africa)'],
  brainCc: { best: 420, min: null, max: null },
  statureCm: { best: null, min: null, max: null },
  massKg: { best: null, min: null, max: null },
  locomotion: {
    kids: 'Walked on two legs and climbed trees. It walked in an unusual way, rolling its feet inward.',
    clinician:
      'Bipedal with an inferred hyperpronating gait (primitive calcaneus with medial weight transfer), combined with long upper limbs and climbing adaptations.',
  },
  diet: {
    kids: 'Leaves, fruit, bark and other forest foods, even though grass grew nearby.',
    clinician:
      'Enamel carbon isotopes indicate an almost exclusively C3 diet; phytoliths in dental calculus include bark and other woody tissues.',
  },
  technology: {
    kids: 'No tools have been found.',
    clinician: 'No associated lithic technology.',
  },
  overview: {
    kids: 'Australopithecus sediba lived about 2 million years ago in South Africa. It had a mix of old and new features: a small brain, but hands and hips a bit like ours. A young male and an adult female were found together in a cave.',
    clinician:
      'Known from Malapa (Cradle of Humankind), dated by U–Pb on flowstones and palaeomagnetism to 1.977 ± 0.002 Ma (Pickering et al. 2011). Mosaic morphology: small endocranial volume (~420 cm³; Carlson et al. 2011), australopith-like upper limb and foot, but Homo-like features of the pelvis, hand (long thumb) and dentition. Proposed, and contested, as close to the ancestry of Homo even though it postdates the earliest Homo fossils. The narrow rangeKa reflects a single, precisely dated site.',
  },
  keyTraits: {
    kids: ['Small brain', 'Long thumb for gripping', 'Long arms for climbing', 'Hips a bit like ours'],
    clinician: [
      'Endocranial volume ~420 cm³ (MH1)',
      'Long thumb relative to the fingers',
      'Homo-like iliac and dental features with australopith-like limb proportions',
      'Relatively small postcanine teeth for an australopith',
      'Primitive calcaneus',
    ],
  },
  funFacts: [
    'The first bone was found in 2008 by 9-year-old Matthew Berger.',
    '“Sediba” means “natural spring” or “wellspring” in the Sesotho language.',
    'The young male’s nickname, Karabo, means “answer” and was chosen in a naming competition for South African schoolchildren.',
    'Scientists found tiny bits of plants stuck in its tooth tartar, showing what it ate about 2 million years ago.',
  ],
  ancestry: {
    parent: 'australopithecus-africanus',
    uncertain: true,
    note: 'Probably derived from A. africanus-like populations; proposed but contested as close to the ancestry of Homo.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'mh1',
      catalog: 'MH1 (U.W. 88-50, holotype)',
      nickname: 'Karabo',
      site: { name: 'Malapa, Cradle of Humankind', country: 'South Africa', lat: -25.9, lon: 27.8 },
      ageKa: {
        best: 1977,
        min: 1975,
        max: 1979,
        method: 'U–Pb dating of flowstones bracketing the deposit, with palaeomagnetic constraints (Pickering et al. 2011)',
      },
      sex: 'male',
      ageAtDeath: 'Juvenile (second molars erupted)',
      discovery: { year: 2008, by: 'Matthew Berger, aged 9, during exploration led by Lee Berger' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible'],
        partial: ['teeth', 'clavicle_R', 'spine', 'ribs', 'arm_R', 'hand_R', 'pelvis', 'leg_R', 'foot_R'],
      },
      story: {
        kids: 'In 2008, 9-year-old Matthew Berger was exploring near a cave with his dad, a scientist. He spotted a bone sticking out of a rock. It was the collarbone of a young boy who lived about 2 million years ago! The boy is now called Karabo.',
        clinician:
          'Juvenile male partial skeleton with a nearly complete cranium (endocranial volume ~420 cm³) and mandible, found with the adult female MH2 in a collapsed cave deposit; both appear to have been deposited at about the same time.',
      },
      taphonomy: { colors: ['#c9b59a', '#a58c6c', '#5a4632'], note: 'Light brown bone partly encased in hard, calcified cave sediment.' },
      lesions: [],
      citations: ['berger2010', 'pickering2011', 'carlson2011'],
      isFlagship: true,
    },
  ],
  citations: ['berger2010', 'pickering2011', 'carlson2011'],
};
