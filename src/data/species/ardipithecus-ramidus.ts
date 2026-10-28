import type { Species } from '../types';

export const species: Species = {
  id: 'ardipithecus-ramidus',
  binomial: 'Ardipithecus ramidus',
  common: { kids: 'Ardipithecus (Ardi’s kind)', clinician: 'Ardipithecus ramidus' },
  nickname: null,
  group: 'early-hominin',
  status: 'extinct',
  rangeKa: { start: 4500, end: 4300 },
  regions: ['East Africa (Ethiopia)'],
  brainCc: { best: null, min: 300, max: 350 },
  statureCm: { best: 120, min: null, max: null },
  massKg: { best: 50, min: null, max: null },
  locomotion: {
    kids: 'Ardi walked on two legs on the ground. In the trees she climbed carefully, gripping branches with her hands and her thumb-like big toe.',
    clinician:
      'Facultative terrestrial bipedalism with retained arboreal capability: abducent, grasping hallux combined with a rigid lateral foot (Lovejoy et al. 2009); short, broad upper ilium compatible with upright walking; palmigrade (not knuckle-walking) hands with flexible midcarpal joints (White et al. 2009).',
  },
  diet: {
    kids: 'Fruits, nuts, leaves and other foods from woodlands.',
    clinician:
      'Generalised omnivore/frugivore. Enamel carbon isotopes indicate predominantly C3 (woodland) resources (White et al. 2009).',
  },
  technology: {
    kids: 'No tools have been found.',
    clinician: 'No associated lithic technology.',
  },
  overview: {
    kids: 'Ardi lived 4.4 million years ago in Ethiopia, in a wooded land with trees and springs. She could walk on two legs, and she could still climb well. Her skeleton surprised scientists, because she did not walk on her knuckles like a chimp.',
    clinician:
      'Named in 1994 (as Australopithecus ramidus; White et al. 1994) and known mainly from Aramis (Middle Awash), dated by 40Ar/39Ar to ~4.4 Ma (WoldeGabriel et al. 2009), including the partial skeleton ARA-VP-6/500; further remains come from Gona (Semaw et al. 2005). The mosaic anatomy (grasping hallux, palmigrade hand, bipedally adapted upper ilium, small non-honing canines) led White et al. (2009) to argue that the last common ancestor of humans and chimpanzees was not chimpanzee-like. That interpretation, and pelvic reconstructions made from crushed elements, remain debated. Body-size values are estimates for ARA-VP-6/500.',
  },
  keyTraits: {
    kids: ['A big toe that grabs like a thumb', 'Small canine teeth', 'Long arms for climbing', 'Brain about the size of a chimp’s'],
    clinician: [
      'Abducted, opposable hallux with a rigid lateral midfoot',
      'Short, broad upper ilium',
      'Palmigrade hand without knuckle-walking features',
      'Small, non-honing canines with reduced sexual dimorphism',
      'Endocranial volume ~300–350 cm³',
    ],
  },
  funFacts: [
    'Ardi’s bones were so fragile and crushed that it took about 15 years to dig them up, clean them and study them.',
    'In the Afar language, “ardi” means “ground floor” and “ramid” means “root”.',
    'Ardi was a female who probably weighed about 50 kilograms and stood about 1.2 metres tall.',
    'More than 100 fossils of this species have been found at Aramis, Ethiopia.',
    'When Ardi’s skeleton was finally published in 2009, the journal Science named it the Breakthrough of the Year.',
  ],
  ancestry: {
    parent: 'sahelanthropus-tchadensis',
    uncertain: true,
    note: 'Ardipithecus kadabba (~5.8–5.2 Ma, not included here) is a likelier direct predecessor. Whether Ardipithecus is ancestral to Australopithecus is debated.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'ara-vp-6-500',
      catalog: 'ARA-VP-6/500',
      nickname: 'Ardi',
      site: { name: 'Aramis, Middle Awash', country: 'Ethiopia', lat: 10.5, lon: 40.4 },
      ageKa: {
        best: 4400,
        min: null,
        max: null,
        method: '40Ar/39Ar dating of the volcanic tuffs bracketing the fossil horizon (both ~4.4 Ma)',
      },
      sex: 'female',
      ageAtDeath: 'Adult',
      discovery: { year: 1994, by: 'Yohannes Haile-Selassie (Middle Awash research team)' },
      completeness: {
        percent: null,
        found: ['teeth'],
        partial: ['cranium', 'mandible', 'pelvis', 'arm_L', 'arm_R', 'hand_L', 'hand_R', 'leg_L', 'leg_R', 'foot_L', 'foot_R'],
      },
      story: {
        kids: 'In 1994, scientists in Ethiopia spotted two small hand bones on the ground. Digging very carefully, they found much of a skeleton: Ardi! Her bones were so soft and squashed that the team had to harden them with special glue before lifting them out.',
        clinician:
          'Partial skeleton including cranium, dentition, pelvis, hands and feet. Many elements were crushed and extremely friable, requiring consolidation in the field and micro-CT-based virtual reconstruction (Suwa et al. 2009; White et al. 2009).',
      },
      taphonomy: { colors: ['#cdbf9f', '#a8977a', '#5e5040'], note: 'Pale, chalky, extremely fragile bone crushed within silty clay.' },
      lesions: [
        {
          id: 'ara-vp-6-500-crushed-cranium',
          kind: 'deformation',
          bone: 'cranium',
          site: { anchor: 'vertex' },
          timing: 'postmortem',
          healing: null,
          title: { kids: 'Squashed in the ground', clinician: 'Postmortem crushing and fragmentation of the cranium' },
          summary: {
            kids: 'Long after Ardi died, the weight of the ground crushed her skull into many tiny pieces. Scientists scanned the pieces and put them back together on a computer.',
            clinician:
              'The cranium was crushed and fragmented after burial. Suwa et al. (2009) reconstructed it virtually from micro-CT scans of the individual fragments. Other elements, notably the pelvis, were also crushed, so their published shapes are reconstructions; the pelvic reconstruction in particular remains debated.',
          },
          clinical: {
            morphology: 'Cranium flattened and broken into numerous small fragments with displaced edges; no healing or vital reaction.',
            differential: ['Taphonomic (sediment-load) crushing; no antemortem trauma proposed'],
            modernAnalogue: null,
            functionalImpact: null,
            survivalInterval: null,
          },
          evidence: 'established',
          debateNote: null,
          citations: ['suwa2009', 'white2009'],
          render: { severity: 0.8, pattern: 'compression' },
        },
      ],
      citations: ['white2009', 'suwa2009', 'woldegabriel2009'],
      isFlagship: true,
    },
  ],
  citations: ['white2009', 'suwa2009', 'white1994', 'woldegabriel2009', 'semaw2005', 'lovejoy2009'],
};
