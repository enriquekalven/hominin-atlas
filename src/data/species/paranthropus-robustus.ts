import type { Species } from '../types';

export const species: Species = {
  id: 'paranthropus-robustus',
  binomial: 'Paranthropus robustus',
  common: { kids: 'Robust southern ape-man', clinician: 'Paranthropus robustus' },
  nickname: null,
  group: 'paranthropus',
  status: 'extinct',
  rangeKa: { start: 2000, end: 1000 },
  regions: ['Southern Africa (South Africa)'],
  brainCc: { best: null, min: 410, max: 530 },
  statureCm: { best: null, min: 110, max: 132 },
  massKg: { best: null, min: 32, max: 40 },
  locomotion: {
    kids: 'Walked on two legs.',
    clinician: 'Bipedal. Hand bones from Swartkrans have been argued to show tool-making capability, but their attribution (Paranthropus vs early Homo) is uncertain.',
  },
  diet: {
    kids: 'Tough and hard plant foods like seeds, nuts, roots and grasses.',
    clinician:
      'Mixed C3/C4 diet with marked seasonal and individual variability from enamel isotopes; microwear pitting suggests hard foods were at least important fallback foods.',
  },
  technology: {
    kids: 'Some scientists think it used bone tools to dig into termite mounds.',
    clinician: 'Worn bone tools from Swartkrans (possibly for termite foraging) may have been used by P. robustus or by early Homo.',
  },
  overview: {
    kids: 'This robust relative lived in South Africa about 2 to 1 million years ago. It had big chewing teeth and, in males, a bony crest on the head. Many of its fossils were found in caves where leopards and other big cats sometimes left their meals.',
    clinician:
      'Known from Kromdraai (type), Swartkrans, Drimolen, Cooper’s and Gondolin. Robust masticatory apparatus, less extreme than P. boisei, with high intraspecific variation and marked sexual dimorphism. Stature and mass ranges are female–male means (McHenry 1991, 1992).',
  },
  keyTraits: {
    kids: ['Big flat chewing teeth', 'A bony crest on top of the head (in males)', 'Wide cheekbones', 'Small brain'],
    clinician: [
      'Sagittal crest in males',
      'Megadont postcanine teeth with thick enamel',
      'Flared, anteriorly positioned zygomatics; dished face',
      'Small anterior dentition',
      'Endocranial volume ~410–530 cm³',
    ],
  },
  funFacts: [
    'Robert Broom named this species in 1938 after a schoolboy, Gert Terblanche, brought him fossil teeth from Kromdraai.',
    'A young P. robustus skull, SK 54, has two holes that match the lower canine teeth of a leopard.',
    'Discoveries like SK 54 showed that early hominins were often the hunted, not the hunters.',
    'Some scientists think P. robustus used bone tools to dig into termite mounds.',
  ],
  ancestry: {
    parent: 'australopithecus-africanus',
    uncertain: true,
    note: 'May derive from A. africanus-like populations in southern Africa, or share an ancestor with P. boisei; whether Paranthropus is a natural (monophyletic) group is debated.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'sk-54',
      catalog: 'SK 54',
      nickname: null,
      site: { name: 'Swartkrans', country: 'South Africa', lat: -26.0, lon: 27.7 },
      ageKa: { best: null, min: null, max: null, method: 'Swartkrans Member 1 (uranium–lead and biochronology; roughly 2.2–1.8 Ma)' },
      sex: 'unknown',
      ageAtDeath: 'Juvenile',
      discovery: { year: null, by: 'Swartkrans excavations of Robert Broom and John T. Robinson' },
      completeness: { percent: null, found: [], partial: ['cranium'] },
      story: {
        kids: 'This is part of the skull of a young robust ape-man from Swartkrans cave. It has two round holes in the back. Scientist Bob Brain found that a leopard’s bottom fangs fit right into them. Long ago, a leopard probably caught this youngster and carried it up a tree near the cave.',
        clinician:
          'Juvenile calvaria with two circular perforations in the posterior vault. C. K. Brain (1970, 1981) showed that the lower canines of a fossil leopard mandible from the same deposit fit the holes, supporting a scenario of leopard predation with carcasses dragged into trees overhanging the cave shaft.',
      },
      taphonomy: { colors: ['#cfc1a6', '#b19d7d', '#6d5b45'], note: 'Light grey-brown cave bone with darker manganese spots.' },
      lesions: [
        {
          id: 'sk-54-leopard-punctures',
          kind: 'puncture',
          bone: 'cranium',
          site: { anchor: 'occipital' },
          timing: 'perimortem',
          healing: 'none',
          title: { kids: 'Two holes from a leopard’s teeth', clinician: 'Paired perforations of the posterior cranial vault' },
          summary: {
            kids: 'Two round holes sit side by side at the back of the skull. They match the bottom fangs of a leopard. The young one did not survive.',
            clinician:
              'Two circular perforations in the posterior vault whose spacing matches the mandibular canines of a fossil leopard from Swartkrans, interpreted as a perimortem carnivore bite (Brain 1970, 1981).',
          },
          clinical: {
            morphology: 'Two rounded, full-thickness perforations of the posterior cranial vault with no healing or remodelling.',
            differential: [
              'Leopard bite (canine spacing match; Brain 1970, 1981)',
              'Bite by another large carnivore',
              'Postmortem damage',
            ],
            modernAnalogue: 'Comparable to penetrating carnivore bite injuries of the skull in big-cat attacks.',
            functionalImpact: null,
            survivalInterval: 'None (perimortem).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['brain1970', 'brain1981'],
          render: { severity: 0.4, radiusMm: 3, count: 2, spacingMm: 33 },
        },
      ],
      citations: ['brain1970', 'brain1981'],
      isFlagship: true,
    },
  ],
  citations: ['brain1970', 'brain1981', 'mchenry1991', 'mchenry1992'],
};
