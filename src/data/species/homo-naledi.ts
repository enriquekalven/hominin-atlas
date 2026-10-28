import type { Species } from '../types';

export const species: Species = {
  id: 'homo-naledi',
  binomial: 'Homo naledi',
  common: { kids: 'Naledi (star human)', clinician: 'Homo naledi' },
  nickname: null,
  group: 'archaic-homo',
  status: 'extinct',
  rangeKa: { start: 335, end: 236 },
  regions: ['Southern Africa (South Africa)'],
  brainCc: { best: null, min: 465, max: 610 },
  statureCm: { best: null, min: null, max: null },
  massKg: { best: null, min: null, max: null },
  locomotion: {
    kids: 'Walked on two legs with feet a lot like ours, and climbed with curved fingers.',
    clinician:
      'Human-like foot and lower limb indicating striding bipedalism, combined with an australopith-like shoulder and pelvis and curved manual phalanges suggesting climbing.',
  },
  diet: {
    kids: 'We are not sure. Its teeth have many tiny chips, so it may have eaten gritty or hard food.',
    clinician: 'Not established; frequent antemortem enamel chipping suggests hard or grit-laden foods.',
  },
  technology: {
    kids: 'No tools have been found with it for sure. Some scientists think it buried its dead and scratched marks on cave walls, but many other scientists are not convinced.',
    clinician:
      'No artefacts securely associated with the fossils. Berger et al. (2023) proposed deliberate burials and wall engravings in the Rising Star system; critics argue that the sedimentological, taphonomic and dating evidence does not demonstrate intentional burial or engraving by H. naledi (e.g., Martinón-Torres et al. 2024), so these claims remain debated.',
  },
  overview: {
    kids: 'Homo naledi was found deep inside the Rising Star cave in South Africa. It lived about 335,000 to 236,000 years ago, at the same time as early Homo sapiens in Africa. It had a small brain, but hands and feet a lot like ours. More than 1,500 of its fossils have been found.',
    clinician:
      'Known from >1,500 elements representing at least 15 individuals in the Dinaledi Chamber (Berger et al. 2015) and further individuals in the Lesedi Chamber (Hawks et al. 2017). Combines a small endocranial volume (465–610 cm³) with Homo-like hands, feet and teeth and primitive shoulder, pelvis and curved phalanges. Dated to 335–236 ka (Dirks et al. 2017). How the remains entered remote chambers (deliberate disposal or burial versus other processes) is debated.',
  },
  keyTraits: {
    kids: ['Small brain', 'Feet almost like ours', 'Curved fingers for climbing', 'Small teeth'],
    clinician: [
      'Endocranial volume 465–610 cm³',
      'Human-like foot with adducted hallux',
      'Curved manual phalanges with a long, robust thumb',
      'Australopith-like flared ilium and shoulder configuration',
      'Small, simple dentition',
    ],
  },
  funFacts: [
    'To reach the fossils, scientists had to squeeze through a gap only about 18 centimetres wide.',
    'The first excavation team included six women scientists who could fit through the tight cave passages, nicknamed the “Underground Astronauts”.',
    '“Naledi” means “star” in the Sesotho language, after the Rising Star cave.',
    'It lived at the same time as early Homo sapiens in Africa, even though its brain was much smaller.',
    'Cavers Steven Tucker and Rick Hunter discovered the fossil chamber in September 2013.',
    'The second fossil chamber is called Lesedi, which means “light”.',
  ],
  ancestry: {
    parent: 'homo-erectus',
    uncertain: true,
    note: 'Phylogenetic position unresolved; possibly a late-surviving lineage that branched from early Homo.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'les1',
      catalog: 'LES1',
      nickname: 'Neo',
      site: { name: 'Rising Star cave system, Lesedi Chamber', country: 'South Africa', lat: -26.02, lon: 27.71 },
      ageKa: {
        best: null,
        min: 236,
        max: 335,
        method: 'Species age range from U-Th and ESR dating in the Dinaledi Chamber (Dirks et al. 2017); Lesedi remains assumed similar',
      },
      sex: 'male',
      ageAtDeath: 'Adult',
      discovery: { year: null, by: 'Rising Star expedition team (Lesedi Chamber first explored by cavers Rick Hunter and Steven Tucker)' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible'],
        partial: ['teeth', 'spine', 'ribs', 'arm_L', 'arm_R', 'pelvis', 'leg_L', 'leg_R'],
      },
      story: {
        kids: 'In a second, hard-to-reach chamber of the Rising Star cave, the team found the skeleton of an adult. They named him Neo, which means “gift” in Sesotho. His skull is one of the most complete of his species.',
        clinician:
          'Partial adult skeleton with a relatively complete cranium (endocranial volume ~610 cm³) and mandible plus postcranial elements, from the Lesedi Chamber (Hawks et al. 2017).',
      },
      taphonomy: { colors: ['#e6dcc6', '#cbbd9f', '#8b7a5e'], note: 'Pale cream, little-mineralised cave bone with dark manganese specks.' },
      lesions: [],
      citations: ['hawks2017', 'dirks2017'],
      isFlagship: true,
    },
    {
      id: 'dh1',
      catalog: 'DH1',
      nickname: null,
      site: { name: 'Rising Star cave system, Dinaledi Chamber', country: 'South Africa', lat: -26.02, lon: 27.71 },
      ageKa: {
        best: null,
        min: 236,
        max: 335,
        method: 'U-Th dating of flowstones, combined U-series/ESR dating of H. naledi teeth and palaeomagnetism (Dirks et al. 2017)',
      },
      sex: 'male',
      ageAtDeath: 'Adult',
      discovery: {
        year: 2013,
        by: 'Rising Star expedition team (the Dinaledi Chamber was found in September 2013 by cavers Steven Tucker and Rick Hunter)',
      },
      completeness: { percent: null, found: ['mandible'], partial: ['cranium', 'teeth'] },
      story: {
        kids: 'DH1 is the official “name-tag” fossil of Homo naledi. Scientists compare new finds with it to check whether they belong to the same species. It includes part of a skull and an almost complete lower jaw.',
        clinician:
          'Holotype of H. naledi (Berger et al. 2015): partial calvaria, partial maxilla and nearly complete mandible of a presumed adult male from the Dinaledi Chamber, with an estimated endocranial volume of about 560 cm³.',
      },
      taphonomy: { colors: ['#e3d7bf', '#c7b591', '#6b5a43'], note: 'Pale cream Dinaledi cave bone with dark manganese specks.' },
      lesions: [],
      citations: ['berger2015', 'dirks2017'],
      isFlagship: false,
    },
    {
      id: 'uw-101-1142',
      catalog: 'U.W. 101-1142',
      nickname: null,
      site: { name: 'Rising Star cave system, Dinaledi Chamber', country: 'South Africa', lat: -26.02, lon: 27.71 },
      ageKa: {
        best: null,
        min: 236,
        max: 335,
        method: 'Dinaledi Chamber age: U-Th on flowstones, U-series/ESR on H. naledi teeth, palaeomagnetism (Dirks et al. 2017)',
      },
      sex: 'unknown',
      ageAtDeath: null,
      discovery: { year: null, by: 'Rising Star expedition team (Dinaledi Chamber excavations)' },
      completeness: { percent: null, found: [], partial: ['mandible'] },
      story: {
        kids: 'This is a piece of a lower jaw from the Dinaledi Chamber. On the inside of the jaw there is a small, smooth bump of extra bone. Doctors call this kind of lump an osteoma.',
        clinician:
          'Fragmentary H. naledi mandible from the Dinaledi Chamber with a well-circumscribed bony mass on the lingual surface of the right corpus, diagnosed as a peripheral osteoma, a benign bone-forming tumour (Odes et al. 2018).',
      },
      taphonomy: { colors: ['#e0d3b8', '#c2ae88', '#5f4f3a'], note: 'Pale Dinaledi cave bone with dark manganese specks.' },
      lesions: [
        {
          id: 'uw-101-1142-right-mandible-osteoma',
          kind: 'tumor',
          bone: 'mandible',
          site: { anchor: 'mandible-body-R' },
          timing: 'antemortem',
          healing: null,
          title: {
            kids: 'A small, harmless bone lump in the jaw',
            clinician: 'Peripheral osteoma, lingual surface of the right mandibular corpus',
          },
          summary: {
            kids: 'A little bump of extra-hard bone grew on the inside of this jaw. Lumps like this are usually harmless. Scientists used special X-ray scans to look inside it.',
            clinician:
              'Well-circumscribed, sessile bony outgrowth on the lingual surface of the right mandibular body. After gross and micro-CT examination, Odes et al. (2018) diagnosed a benign bone-forming tumour (peripheral osteoma).',
          },
          clinical: {
            morphology:
              'Raised, smooth, well-circumscribed bony mass on the lingual aspect of the right mandibular corpus; studied macroscopically and with micro-CT.',
            differential: ['Mandibular torus', 'Exostosis / reactive periosteal new bone', 'Osteochondroma', 'Ossifying fibroma'],
            modernAnalogue:
              'Peripheral (periosteal) osteoma of the mandible: a benign, slow-growing, usually asymptomatic tumour of mature bone, most often seen on the lingual body, angle or inferior border of the mandible.',
            functionalImpact: null,
            survivalInterval: null,
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['odes2018'],
          render: { severity: 0.3 },
        },
      ],
      citations: ['odes2018', 'dirks2017'],
      isFlagship: false,
    },
  ],
  citations: ['berger2015', 'dirks2015', 'hawks2017', 'dirks2017', 'towle2017', 'berger2023', 'martinontorres2024'],
};
