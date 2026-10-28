import type { Species } from '../types';

export const species: Species = {
  id: 'paranthropus-boisei',
  binomial: 'Paranthropus boisei',
  common: { kids: 'Nutcracker Man’s species', clinician: 'Paranthropus boisei' },
  nickname: 'Nutcracker Man',
  group: 'paranthropus',
  status: 'extinct',
  rangeKa: { start: 2300, end: 1200 },
  regions: ['East Africa (Ethiopia, Kenya, Tanzania, Malawi)'],
  brainCc: { best: null, min: 500, max: 550 },
  statureCm: { best: null, min: 124, max: 137 },
  massKg: { best: null, min: 34, max: 49 },
  locomotion: {
    kids: 'Walked on two legs. Its arms were strong.',
    clinician: 'Bipedal; the postcranial skeleton is poorly known and few elements are securely attributed.',
  },
  diet: {
    kids: 'It had huge teeth and jaws, but tooth chemistry shows it mostly ate grasses and sedges, not nuts!',
    clinician:
      'Enamel carbon isotopes indicate a diet dominated (~75–80%) by C4 resources such as grasses and sedges (Cerling et al. 2011); microwear lacks the heavy pitting expected from habitual hard-object feeding.',
  },
  technology: {
    kids: 'No tools are known to have been made by this species. Stone tools found near its fossils were probably made by early Homo.',
    clinician: 'No tools securely attributed; Oldowan artefacts at sites such as FLK Zinj are generally attributed to contemporaneous Homo.',
  },
  overview: {
    kids: 'This big-jawed relative lived in East Africa from about 2.3 to 1.2 million years ago. It had the biggest back teeth of any human relative. It lived at the same time as early members of our own group, Homo.',
    clinician:
      'Hyper-robust Paranthropus with megadont, thick-enamelled postcanine teeth, a sagittal crest in males, flaring zygomatics and a dished midface. Despite the "Nutcracker" morphology, isotopes and microwear indicate prolonged chewing of tough C4 plant foods rather than habitual hard-object feeding. Stature and mass ranges are female–male means (McHenry 1991, 1992).',
  },
  keyTraits: {
    kids: ['Huge, flat chewing teeth', 'A bony crest on top of the head for big jaw muscles', 'Wide, dish-shaped face', 'Small front teeth'],
    clinician: [
      'Sagittal crest anchoring a hypertrophied temporalis (males)',
      'Megadont, molarised premolars and molars with very thick enamel',
      'Anteriorly positioned, flaring zygomatic arches; dished midface',
      'Small incisors and canines',
      'Endocranial volume ~500–550 cm³',
    ],
  },
  funFacts: [
    'Mary Leakey found the famous skull OH 5 at Olduvai Gorge, Tanzania, in 1959.',
    'The skull was first named Zinjanthropus boisei, after Charles Boise, who helped pay for the Leakeys’ work.',
    'Its molars are much bigger than ours, but tooth chemistry shows it mostly ate grasses and sedges.',
    'Mary Leakey nicknamed the OH 5 skull “Dear Boy”.',
  ],
  ancestry: {
    parent: 'australopithecus-afarensis',
    uncertain: true,
    note: 'Most likely descended from Paranthropus aethiopicus (~2.7–2.3 Ma, not included here), which itself may derive from an A. afarensis-like ancestor.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'oh-5',
      catalog: 'OH 5',
      nickname: 'Nutcracker Man (also “Zinj” or “Dear Boy”)',
      site: { name: 'Olduvai Gorge, FLK (Bed I)', country: 'Tanzania', lat: -3.0, lon: 35.4 },
      ageKa: { best: null, min: null, max: null, method: 'Bed I volcanic tuffs: originally ~1.75 Ma by K–Ar (1961); later 40Ar/39Ar work places Bed I at ~1.8–1.9 Ma' },
      sex: 'male',
      ageAtDeath: 'Young adult (third molars only lightly worn)',
      discovery: { year: 1959, by: 'Mary Leakey' },
      completeness: { percent: null, found: ['cranium', 'teeth_upper'], partial: [] },
      story: {
        kids: 'On a July morning in 1959, Mary Leakey spotted part of a skull and some huge teeth at Olduvai Gorge. She hurried back to camp to tell her husband, Louis. The skull had giant back teeth, so people called it “Nutcracker Man”.',
        clinician:
          'Nearly complete adult cranium with a complete maxillary dentition, sagittal crest and dished face; no associated mandible. Endocranial volume ~530 cm³.',
      },
      taphonomy: { colors: ['#3f3a36', '#6b625a', '#1f1b18'], note: 'Very dark grey-brown, heavily mineralised bone typical of Olduvai Bed I.' },
      lesions: [],
      citations: ['leakey1959'],
      isFlagship: true,
    },
  ],
  citations: ['leakey1959', 'cerling2011', 'mchenry1991', 'mchenry1992'],
};
