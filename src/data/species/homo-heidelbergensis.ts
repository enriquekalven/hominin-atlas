import type { Species } from '../types';

export const species: Species = {
  id: 'homo-heidelbergensis',
  binomial: 'Homo heidelbergensis',
  common: { kids: 'Heidelberg human', clinician: 'Homo heidelbergensis (sensu lato)' },
  nickname: null,
  group: 'archaic-homo',
  status: 'extinct',
  rangeKa: { start: 700, end: 200 },
  regions: ['Africa', 'Europe'],
  brainCc: { best: null, min: 1100, max: 1400 },
  statureCm: { best: null, min: 157, max: 175 },
  massKg: { best: null, min: 51, max: 62 },
  locomotion: {
    kids: 'Walked on two legs, just like us. Strong and muscular.',
    clinician: 'Fully modern-style striding bipedalism with robust long bones and thick cortical walls.',
  },
  diet: {
    kids: 'Hunted large animals like horses and deer, and gathered plants.',
    clinician: 'Large-game hunting and butchery are documented at several Middle Pleistocene sites in Africa and Europe.',
  },
  technology: {
    kids: 'Made hand axes and wooden spears.',
    clinician: 'Late Acheulean bifaces; prepared-core (Levallois) techniques appear towards the end of its range.',
  },
  overview: {
    kids: 'Homo heidelbergensis lived about 700,000 to 200,000 years ago in Africa and Europe. It had a big brain, almost as big as ours, and a large brow ridge. Some of these people may be the ancestors of both Neanderthals and us.',
    clinician:
      'A broadly defined Middle Pleistocene taxon (type: Mauer 1 mandible, ~609 ka; Wagner et al. 2010). Many researchers now restrict or abandon it. The ~430 ka Sima de los Huesos sample shows derived Neanderthal features (Arsuaga et al. 2014) and Neanderthal-lineage nuclear DNA (Meyer et al. 2016), so in this atlas the SH fossils are placed with H. neanderthalensis. African fossils such as Kabwe and Bodo are sometimes assigned to H. rhodesiensis. Body-size values follow the Smithsonian Human Origins summary.',
  },
  keyTraits: {
    kids: ['Big brain', 'Huge brow ridge', 'Wide face', 'Strong, heavy body'],
    clinician: [
      'Endocranial volume ~1,100–1,400 cm³',
      'Massive supraorbital torus',
      'Large, broad face with a wide nasal aperture',
      'Higher, broader vault than H. erectus with parietal expansion',
      'Robust postcranium with thick cortical bone',
    ],
  },
  funFacts: [
    'The first fossil, a lower jaw, was found in 1907 in a sand pit at Mauer, near Heidelberg, Germany.',
    'The Kabwe skull from Zambia was found by miners in 1921.',
    'The Kabwe skull has some of the oldest known tooth cavities: many of its teeth were decayed.',
    'Scientists still argue about which fossils really belong to this species.',
  ],
  ancestry: {
    parent: 'homo-erectus',
    uncertain: true,
    note: 'Often treated as the last common ancestor of Neanderthals and modern humans, but this is debated. The Sima de los Huesos fossils (~430 ka), once assigned here, carry Neanderthal-lineage DNA and features and are placed with H. neanderthalensis in this atlas.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'kabwe-1',
      catalog: 'Kabwe 1',
      nickname: 'Broken Hill skull',
      site: { name: 'Kabwe (formerly Broken Hill) mine', country: 'Zambia', lat: -14.4, lon: 28.4 },
      ageKa: {
        best: 299,
        min: 274,
        max: 324,
        method: 'Direct U-series and combined U-series/ESR dating of the cranium and associated fossils (Grün et al. 2020: 299 ± 25 ka)',
      },
      sex: 'unknown',
      ageAtDeath: 'Adult',
      discovery: { year: 1921, by: 'Tom Zwiglaar, a miner' },
      completeness: { percent: null, found: ['cranium', 'teeth_upper'], partial: [] },
      story: {
        kids: 'In 1921, miners digging for metal ore in Zambia found a huge, heavy skull. It belonged to an adult who lived about 300,000 years ago. Many of its teeth had cavities, and some had infections at the roots. That must have hurt!',
        clinician:
          'Near-complete adult cranium without mandible, with a massive supraorbital torus and large face. Directly dated to 299 ± 25 ka (Grün et al. 2020). Shows extensive dental caries with periapical lesions.',
      },
      taphonomy: { colors: ['#b59b74', '#8f7656', '#4f3d2b'], note: 'Heavy, mineral-rich bone from a lead–zinc ore body.' },
      lesions: [
        {
          id: 'kabwe-1-dental-caries-abscesses',
          kind: 'dental-disease',
          bone: 'cranium',
          site: { anchor: 'palate' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'Cavities and sore tooth roots', clinician: 'Extensive dental caries with periapical abscess cavities (maxilla)' },
          summary: {
            kids: 'Many of this person’s top teeth had holes from tooth decay. Some infections reached the roots and made little holes in the jaw bone. This would have been painful.',
            clinician:
              'Multiple carious lesions affect the maxillary dentition, several with associated periapical bone loss (abscess cavities) in the alveolar process. One of the earliest documented cases of severe caries in the hominin record.',
          },
          clinical: {
            morphology: 'Cavitated carious lesions in multiple maxillary teeth with periapical rarefaction/cavities in the alveolar bone.',
            differential: [
              'Dental caries with secondary periapical abscesses',
              'Contribution of lead exposure to dental pathology (proposed by Bartsiokas & Day 1993; speculative)',
            ],
            modernAnalogue: 'Advanced caries with periapical abscesses; in a modern patient this causes chronic pain and risk of spreading infection.',
            functionalImpact: 'Likely chronic oral pain and impaired chewing (inferred).',
            survivalInterval: null,
          },
          evidence: 'established',
          debateNote: null,
          citations: ['bartsiokas1993', 'grun2020'],
          render: { severity: 0.6 },
        },
      ],
      citations: ['grun2020', 'bartsiokas1993'],
      isFlagship: true,
    },
  ],
  citations: ['grun2020', 'wagner2010', 'arsuaga2014', 'meyer2016', 'smithsonian-hop'],
};
