import type { Species } from '../types';

export const species: Species = {
  id: 'australopithecus-africanus',
  binomial: 'Australopithecus africanus',
  common: { kids: 'Taung Child’s species', clinician: 'Australopithecus africanus' },
  nickname: null,
  group: 'australopith',
  status: 'extinct',
  rangeKa: { start: 3300, end: 2100 },
  regions: ['Southern Africa (South Africa)'],
  brainCc: { best: null, min: 425, max: 515 },
  statureCm: { best: null, min: 115, max: 138 },
  massKg: { best: null, min: 30, max: 41 },
  locomotion: {
    kids: 'Walked on two legs, and was still a good climber.',
    clinician:
      'Habitual bipedalism (e.g., Sts 14 pelvis and lower limb) with retained climbing-related traits such as relatively large upper-limb joints and curved phalanges.',
  },
  diet: {
    kids: 'Fruits, leaves, seeds, roots, and maybe insects and small animals.',
    clinician:
      'Generalist; enamel carbon isotopes show a substantial C4/CAM component alongside C3 foods, and microwear suggests mostly softer foods with some harder items.',
  },
  technology: {
    kids: 'No tools have been found with it for sure.',
    clinician: 'No lithic technology securely associated.',
  },
  overview: {
    kids: 'This species lived in South Africa between about 3.3 and 2.1 million years ago. Its first fossil, the Taung Child, was the first early human relative ever found in Africa. Many of its fossils come from caves like Sterkfontein and Makapansgat.',
    clinician:
      'Type species of Australopithecus (Dart 1925), sampled from cave breccias at Taung, Sterkfontein (Member 4) and Makapansgat. Ages rely on biochronology, U–Pb and cosmogenic burial dating and remain imprecise. Craniofacially less prognathic than A. afarensis, with apelike upper-limb proportions in some specimens. Stature and mass ranges are female–male means (McHenry 1991, 1992).',
  },
  keyTraits: {
    kids: ['Rounder head than Lucy’s', 'Smaller face', 'Walked on two legs', 'Small brain, a bit bigger than a chimp’s'],
    clinician: [
      'Rounded vault without a sagittal crest',
      'Reduced subnasal prognathism relative to A. afarensis',
      'Small canines and bicuspid lower third premolars',
      'Relatively large postcanine teeth',
      'Endocranial volume ~425–515 cm³',
    ],
  },
  funFacts: [
    'The Taung Child was found in 1924 at a lime quarry and described by Raymond Dart in 1925.',
    'Dart is said to have used his wife’s knitting needles to free the skull from the rock.',
    'Many scientists did not believe Dart for more than 20 years, until more fossils were found.',
    '“Australopithecus” means “southern ape”.',
  ],
  ancestry: {
    parent: 'australopithecus-afarensis',
    uncertain: true,
    note: 'Its relationships to A. afarensis, A. sediba and Paranthropus robustus are debated.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'taung-1',
      catalog: 'Taung 1',
      nickname: 'Taung Child',
      site: { name: 'Taung (Buxton Limeworks)', country: 'South Africa', lat: -27.6, lon: 24.6 },
      ageKa: { best: null, min: null, max: null, method: 'Faunal correlation only; no direct radiometric date (age uncertain, commonly cited as ~2.5–2.8 Ma)' },
      sex: 'unknown',
      ageAtDeath: 'Child, about 3 years old (dental development)',
      discovery: { year: 1924, by: 'Quarry workers at Buxton Limeworks; described by Raymond Dart' },
      completeness: { percent: null, found: [], partial: ['cranium', 'mandible', 'teeth_upper', 'teeth_lower'] },
      story: {
        kids: 'In 1924, workers blasting rock at a lime quarry found a small stone skull. Raymond Dart spent weeks carefully chipping it free. Inside the rock was the face of a child about 3 years old. Dart named a new species from it. Scientists think a big eagle may have caught this child long ago.',
        clinician:
          'Juvenile face and partial mandible with deciduous dentition and erupting first permanent molars, plus a natural endocranial cast. The associated small-mammal fauna shows features of raptor accumulation (Berger & Clarke 1995).',
      },
      taphonomy: { colors: ['#d9cdb5', '#bba98b', '#7b6a52'], note: 'Pale grey-beige bone in breccia, with a limestone natural endocast.' },
      lesions: [
        {
          id: 'taung-1-left-orbit-floor',
          kind: 'puncture',
          bone: 'cranium',
          site: { anchor: 'orbit-floor-L' },
          timing: 'perimortem',
          healing: 'none',
          title: { kids: 'Hole in the left eye socket', clinician: 'Perforating defect of the left orbital floor' },
          summary: {
            kids: 'The bottom of the child’s left eye socket has a small, ragged hole. It looks like damage made by the claws of a big eagle.',
            clinician:
              'Berger (2006) described ragged perforation and depressed damage of the orbital floor and compared it with talon damage on monkey skulls from African crowned eagle nests.',
          },
          clinical: {
            morphology: 'Ragged perforation with inward-depressed margins in the floor of the orbit; no healing.',
            differential: [
              'Talon/beak damage by a large raptor such as the African crowned eagle (Berger 2006)',
              'Postmortem damage during fossilisation, blasting or preparation',
              'Mammalian carnivore damage',
            ],
            modernAnalogue: 'Comparable in position to a penetrating orbital-floor injury; no healing response.',
            functionalImpact: null,
            survivalInterval: 'None (perimortem).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['berger2006', 'berger1995'],
          render: { severity: 0.35, radiusMm: 3, count: 1 },
        },
        {
          id: 'taung-1-right-orbit-floor',
          kind: 'puncture',
          bone: 'cranium',
          site: { anchor: 'orbit-floor-R' },
          timing: 'perimortem',
          healing: 'none',
          title: { kids: 'Hole in the right eye socket', clinician: 'Perforating defect of the right orbital floor' },
          summary: {
            kids: 'The right eye socket has similar damage, as if talons gripped the child’s head from both sides.',
            clinician:
              'Paired damage in both orbital floors was interpreted as consistent with a raptor’s talons gripping the head (Berger 2006).',
          },
          clinical: {
            morphology: 'Ragged defect with depressed margins in the orbital floor; no healing.',
            differential: [
              'Talon/beak damage by a large raptor (Berger 2006)',
              'Postmortem damage during fossilisation, blasting or preparation',
            ],
            modernAnalogue: 'Comparable in position to a penetrating orbital-floor injury; no healing response.',
            functionalImpact: null,
            survivalInterval: 'None (perimortem).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['berger2006'],
          render: { severity: 0.35, radiusMm: 3, count: 1 },
        },
      ],
      citations: ['dart1925', 'berger2006', 'berger1995'],
      isFlagship: true,
    },
  ],
  citations: ['dart1925', 'berger1995', 'berger2006', 'mchenry1991', 'mchenry1992'],
};
