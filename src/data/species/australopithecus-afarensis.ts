import type { Species } from '../types';

export const species: Species = {
  id: 'australopithecus-afarensis',
  binomial: 'Australopithecus afarensis',
  common: { kids: 'Lucy’s species', clinician: 'Australopithecus afarensis' },
  nickname: null,
  group: 'australopith',
  status: 'extinct',
  rangeKa: { start: 3850, end: 2950 },
  regions: ['East Africa (Ethiopia, Kenya, Tanzania)'],
  brainCc: { best: null, min: 385, max: 550 },
  statureCm: { best: null, min: 105, max: 151 },
  massKg: { best: null, min: 29, max: 45 },
  locomotion: {
    kids: 'They walked on two legs like us, with shorter steps. They still had strong arms and curved fingers for climbing trees.',
    clinician:
      'Habitual biped: valgus knee, adducted hallux and longitudinal arch (Laetoli footprints), short and laterally flaring iliac blades. Long forearms, curved phalanges and a cranially oriented glenoid suggest some continued arboreal activity.',
  },
  diet: {
    kids: 'Fruits, leaves, seeds, roots and some grassy plants.',
    clinician:
      'Generalist; enamel carbon isotopes indicate variable use of C4/CAM resources in addition to C3 plants, unlike earlier hominins.',
  },
  technology: {
    kids: 'No stone tools have been found with Lucy’s species for sure, but some scientists think they may have used tools.',
    clinician:
      'No associated lithics. Proposed 3.4 Ma cut-marked bones from Dikika are debated; Lomekwi 3 artefacts (~3.3 Ma) have no hominin attribution.',
  },
  overview: {
    kids: 'Lucy’s species lived in East Africa for almost a million years, from about 3.85 to 2.95 million years ago. They walked upright on two legs, but their brains were still small, about the size of a chimp’s. They lived in places with trees, grass and rivers.',
    clinician:
      'One of the best-sampled early hominins (Hadar, Laetoli, Dikika, Woranso-Mille and others; reviewed by Kimbel & Delezene 2009). Combines an ape-sized braincase (~385–550 cm³) with a bipedal postcranium and marked body-size dimorphism. Stature and mass ranges are female–male means from femoral and joint-size regressions (McHenry 1991, 1992) and carry wide error.',
  },
  keyTraits: {
    kids: ['Walked upright on two legs', 'Small brain', 'Long arms and curved fingers', 'A big face that sticks out at the bottom'],
    clinician: [
      'Valgus knee (high bicondylar angle)',
      'Short, laterally flared iliac blades',
      'Compound temporonuchal crest in large (male) crania',
      'Marked subnasal prognathism; reduced, largely non-honing canines',
      'Curved manual and pedal phalanges',
    ],
  },
  funFacts: [
    'Lucy was named after the Beatles song “Lucy in the Sky with Diamonds”, which was playing in camp the night she was found.',
    'In Ethiopia, Lucy is also called Dinkinesh, which means “you are marvelous” in Amharic.',
    'Footprints left about 3.66 million years ago at Laetoli, Tanzania, are thought to have been made by this species.',
    'Lucy’s skeleton is about 40 percent complete.',
    'Selam, a little girl of Lucy’s species about three years old, was found in 2000 not far from where Lucy was found.',
    'A tall male skeleton of this species is nicknamed Kadanuumuu, which means “big man” in the Afar language.',
  ],
  ancestry: {
    parent: 'australopithecus-anamensis',
    uncertain: false,
    note: 'Widely regarded as descending from Australopithecus anamensis (~4.2–3.8 Ma; Kimbel et al. 2009), though the 3.80 Ma MRD-VP-1/1 cranium demonstrates ~100 kyr of temporal overlap via branching cladogenesis rather than pure anagenesis (Haile-Selassie et al. 2019).',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'al-288-1',
      catalog: 'A.L. 288-1',
      nickname: 'Lucy (Dinkinesh)',
      site: { name: 'Hadar, Afar Locality 288', country: 'Ethiopia', lat: 11.1, lon: 40.6 },
      ageKa: { best: 3180, min: null, max: null, method: '40Ar/39Ar dating of tuffs bracketing the fossil horizon' },
      sex: 'female',
      ageAtDeath: 'Young adult (third molars erupted, little worn)',
      discovery: { year: 1974, by: 'Donald Johanson and Tom Gray' },
      completeness: {
        percent: 40,
        found: ['mandible', 'pelvis_L', 'sacrum', 'femur_L', 'tibia_R', 'humerus_L', 'humerus_R'],
        partial: ['cranium', 'thoracic', 'lumbar', 'ribs', 'radius_R', 'ulna_R', 'hand_R', 'fibula_L', 'foot_R'],
      },
      story: {
        kids: 'In 1974, Don Johanson and Tom Gray saw a piece of arm bone in a gully in Ethiopia. Soon they found many more bones from the same small female. That night, the team played a Beatles song and named her Lucy. She stood only about 1.1 metres tall.',
        clinician:
          'Partial skeleton (~40% of elements) of a small adult female, including the mandible, left os coxae, sacrum and major limb bones. The pelvis, femur and tibia document habitual bipedalism. Cook et al. (1983) described pathological changes in her vertebrae.',
      },
      taphonomy: { colors: ['#6e5c4b', '#8c7864', '#3b2f26'], note: 'Dark grey-brown, well-mineralised bone from the Hadar silts.' },
      lesions: [
        {
          id: 'al-288-1-right-proximal-humerus',
          kind: 'unhealed-fracture',
          bone: 'humerus_R',
          site: { t: 0.05, azimuthDeg: 0 },
          timing: 'perimortem',
          healing: 'none',
          title: { kids: 'Broken shoulder (did not heal)', clinician: 'Compressive fracture of the proximal right humerus' },
          summary: {
            kids: 'The top of Lucy’s right arm bone has sharp breaks that never healed. Some scientists think Lucy fell from a tall tree and stretched out her arms to catch herself. Other scientists think the bone broke long after she died. We may never know for sure.',
            clinician:
              'Kappelman et al. (2016) used high-resolution CT to describe sharp-edged, compressed and slightly displaced fragments of the humeral head and tuberosities without callus, interpreting a perimortem compressive (axial-loading) fracture consistent with a fall onto outstretched arms from height. The same study reports a similar but less severe fracture at the left shoulder, a pilon fracture of the right ankle (see the right tibia) and further fractures at the left knee, pelvis and first rib. Critics argue that comparable breaks are common in fossil bone after death.',
          },
          clinical: {
            morphology:
              'Fragmented proximal humeral head and tuberosities with sharp, steep fracture margins, impaction of fragments and slight displacement; no callus or remodelling.',
            differential: [
              'Perimortem fall from height onto outstretched arms (Kappelman et al. 2016)',
              'Postmortem fracturing during fossilisation, sediment compaction or erosion',
              'Other perimortem scenarios such as mudslide or animal attack (Charlier et al. 2018)',
            ],
            modernAnalogue:
              'If the fracture is perimortem, it resembles a multi-part proximal humerus fracture from a fall onto an outstretched hand (FOOSH).',
            functionalImpact: null,
            survivalInterval: 'None (no healing; perimortem if not taphonomic).',
          },
          evidence: 'debated',
          debateNote:
            'Kappelman et al. (2016) argue that the absence of healing and the compressive pattern, repeated in several other bones, indicate injuries from a fall from a tree. Critics, including Lucy’s discoverer Donald Johanson, note that fossil bones often break in similar ways after death, and Charlier et al. (2018) proposed other causes of death. Fracture timing cannot be proven from morphology alone.',
          citations: ['kappelman2016', 'charlier2018a'],
          render: { severity: 0.6, displacementMm: 3, pattern: 'comminuted' },
        },
        {
          id: 'al-288-1-right-distal-tibia',
          kind: 'unhealed-fracture',
          bone: 'tibia_R',
          site: { t: 0.97, azimuthDeg: 0 },
          timing: 'perimortem',
          healing: 'none',
          title: { kids: 'Cracked ankle (did not heal)', clinician: 'Pilon fracture of the distal right tibia' },
          summary: {
            kids: 'The bottom of Lucy’s right shin bone, at the ankle, is cracked too. Scientists are still arguing about whether this happened when she died or long afterwards.',
            clinician:
              'Kappelman et al. (2016) report an unhealed pilon fracture of the right ankle (distal tibia) as part of the multi-element compressive fracture pattern they attribute to a fall from height. It is contested on the same grounds as the humeral fracture.',
          },
          clinical: {
            morphology:
              'Unhealed fracture of the distal right tibia involving the tibial plafond (pilon fracture); no callus or remodelling (Kappelman et al. 2016).',
            differential: [
              'Perimortem axial-loading injury from a fall from height (Kappelman et al. 2016)',
              'Postmortem fracturing during fossilisation, sediment compaction or erosion',
              'Other perimortem scenarios such as mudslide or animal attack (Charlier et al. 2018)',
            ],
            modernAnalogue:
              'If perimortem, it resembles a tibial pilon (plafond) fracture, typically produced by axial loading through the ankle in falls from height.',
            functionalImpact: null,
            survivalInterval: 'None (no healing; perimortem if not taphonomic).',
          },
          evidence: 'debated',
          debateNote:
            'Kappelman et al. (2016) interpret this ankle fracture, together with the shoulder fractures and others, as injuries from a fall out of a tall tree. Critics, including Lucy’s discoverer Donald Johanson, note that fossil bones often break in similar ways after death, and Charlier et al. (2018) proposed a mudslide and/or animal attack instead. Fracture timing cannot be proven from morphology alone.',
          citations: ['kappelman2016', 'charlier2018a'],
          render: { severity: 0.5, pattern: 'compression' },
        },
      ],
      citations: ['johanson1976', 'kappelman2016', 'cook1983'],
      isFlagship: true,
    },
    {
      id: 'dik-1-1',
      catalog: 'DIK-1-1',
      nickname: 'Selam',
      site: { name: 'Dikika (locality DIK-1), Afar Region', country: 'Ethiopia', lat: 11.1, lon: 40.6 },
      ageKa: { best: 3300, min: null, max: null, method: '40Ar/39Ar-dated volcanic tuffs bracketing the fossil horizon (Hadar Formation)' },
      sex: 'female',
      ageAtDeath: 'About 3 years (dental development)',
      discovery: { year: 2000, by: 'Dikika Research Project team led by Zeresenay Alemseged' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible', 'teeth', 'hyoid'],
        partial: ['cervical', 'thoracic', 'ribs', 'shoulder_L', 'shoulder_R'],
      },
      story: {
        kids: 'Selam was a little girl about three years old. Her name means “peace”. Her bones were found inside a block of sandstone in Ethiopia, and scientists spent years gently freeing them. She even still has her tiny tongue bone!',
        clinician:
          'Juvenile partial skeleton (about 3 years old, probable female) with articulated cranium and mandible, the first hyoid known for an early hominin, both scapulae, vertebrae, ribs, and parts of the limbs and a foot (Alemseged et al. 2006). It pairs an African-ape-like hyoid and gorilla-like scapulae with a lower limb adapted to bipedal walking.',
      },
      taphonomy: { colors: ['#8a6f55', '#b39a78', '#4a3a2c'], note: 'Approximate colours: brown bone partly held in fine sandstone matrix.' },
      lesions: [],
      citations: ['alemseged2006'],
      isFlagship: false,
    },
    {
      id: 'ksd-vp-1-1',
      catalog: 'KSD-VP-1/1',
      nickname: 'Kadanuumuu',
      site: { name: 'Korsi Dora, Woranso-Mille, Afar Region', country: 'Ethiopia', lat: 11.5, lon: 40.5 },
      ageKa: { best: 3580, min: null, max: null, method: '40Ar/39Ar dating of volcanic tuffs associated with the fossil horizon' },
      sex: 'male',
      ageAtDeath: 'Adult',
      discovery: { year: 2005, by: 'Woranso-Mille project team led by Yohannes Haile-Selassie' },
      completeness: {
        percent: null,
        found: [],
        partial: ['ribs', 'pelvis'],
      },
      story: {
        kids: 'Kadanuumuu means “big man” in the Afar language. He was much taller than Lucy. His bones show he walked upright on two legs.',
        clinician:
          'Adult male partial skeleton about 400,000 years older than Lucy, preserving a nearly complete scapula, a clavicle, ribs, part of the pelvis and limb bones (Haile-Selassie et al. 2010). The authors argue it shows that efficient upright walking was already established in early A. afarensis. Only side-independent elements are mapped in the 3D completeness view.',
      },
      taphonomy: { colors: ['#6f5a46', '#927b62', '#33281e'], note: 'Approximate colours.' },
      lesions: [],
      citations: ['haileselassie2010'],
      isFlagship: false,
    },
  ],
  citations: ['johanson1976', 'kappelman2016', 'mchenry1991', 'mchenry1992', 'kimbel2009', 'leakey1979', 'alemseged2006', 'haileselassie2010'],
};
