import type { Species } from '../types';

export const species: Species = {
  id: 'orrorin-tugenensis',
  binomial: 'Orrorin tugenensis',
  common: { kids: 'Millennium Man', clinician: 'Orrorin tugenensis' },
  nickname: 'Millennium Man',
  group: 'early-hominin',
  status: 'extinct',
  rangeKa: { start: 6100, end: 5700 },
  regions: ['East Africa (Tugen Hills, Kenya)'],
  brainCc: { best: null, min: null, max: null },
  statureCm: { best: null, min: 115, max: 125 },
  massKg: { best: null, min: 35, max: 50 },
  locomotion: {
    kids: 'Its thigh bone shows it already walked upright on two legs on the ground, while its curved finger bone shows it still climbed trees well.',
    clinician:
      'Proximal femoral morphology (elongated femoral neck, obturator externus groove, asymmetric cortical distribution in BAR 1002’00) supports habitual terrestrial bipedalism, paired with a curved proximal manual phalanx and robust humeral shaft ridge indicating retained arboreal climbing (Senut et al. 2001; Richmond & Jungers 2008).',
  },
  diet: {
    kids: 'Mostly ripe fruits, seeds, leaves and insects in wooded lakeside forests.',
    clinician:
      'Small, thick-enamelled molars and premolars consistent with an omnivorous/frugivorous woodland diet including harder seeds and fruits.',
  },
  technology: {
    kids: 'No stone tools are known from this time; it probably used simple sticks or stones like living apes.',
    clinician: 'No associated lithic industry.',
  },
  overview: {
    kids: 'Found in Kenya in the year 2000—earning the nickname Millennium Man—Orrorin lived about 6 million years ago. Its thigh bones are among the oldest direct leg-bone clues that our early relatives walked on two legs.',
    clinician:
      'Late Miocene hominin from four localities in the Lukeino Formation, Tugen Hills, Kenya, constrained by 40Ar/39Ar and magnetostratigraphy to ~6.1–5.7 Ma (Senut et al. 2001). Represented by 20+ dental, mandibular and postcranial fossils from at least five individuals; cranial vault capacity remains unknown (brainCc = null). Morphometric analyses of BAR 1002’00 link its proximal femur closely to Plio-Pleistocene australopiths (Richmond & Jungers 2008).',
  },
  keyTraits: {
    kids: [
      'Thigh bone shaped for walking upright on two legs',
      'Curved finger bones for grasping tree branches',
      'Small back teeth with thick enamel',
      'Pointed ape-like upper canine tooth with a shallow groove',
    ],
    clinician: [
      'Elongated, anteroposteriorly compressed femoral neck with an obturator externus groove',
      'Thickened inferior vs. superior femoral neck cortex (debated in high-res CT studies)',
      'Relatively small, microdont molars with thick enamel',
      'Curved proximal manual phalanx and prominent brachioradialis crest on distal humerus',
    ],
  },
  funFacts: [
    '“Orrorin” means “Original Man” in the local Tugen language of western Kenya.',
    'Because the fossils were announced right after the year 2000, reporters nicknamed it “Millennium Man”.',
    'Marks from large carnivore teeth on the thigh bones show big predators hunted or scavenged early hominins 6 million years ago.',
    'Unlike Toumaï in Chad (known mostly from a skull), Orrorin is famous for preserving three thigh bones.',
  ],
  ancestry: {
    parent: 'sahelanthropus-tchadensis',
    uncertain: true,
    note: 'Late Miocene East African hominin (~6.1–5.7 Ma); exact cladistic order relative to Sahelanthropus and Ardipithecus remains unresolved.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'bar-1002-00',
      catalog: "BAR 1002'00 (paratype femur; with holotype mandible BAR 1000'00)",
      nickname: 'Millennium Man femur',
      site: { name: 'Kapsomin, Lukeino Formation, Tugen Hills', country: 'Kenya', lat: 0.78, lon: 35.88 },
      ageKa: { best: 5900, min: 5700, max: 6100, method: '40Ar/39Ar dating of volcanic tuffs and palaeomagnetism of the Lukeino Formation' },
      sex: 'unknown',
      ageAtDeath: 'Young adult / late subadult',
      discovery: { year: 2000, by: 'Kiptalam Cheboi, Brigitte Senut, Martin Pickford and Kenya Palaeontology Expedition' },
      completeness: {
        percent: null,
        found: ['femur_L'],
        partial: ['mandible', 'teeth_upper', 'teeth_lower', 'humerus_R', 'hand_L'],
      },
      story: {
        kids: 'In late 2000, Kiptalam Cheboi and a French–Kenyan team uncovered a left thigh bone in the Tugen Hills of Kenya. Its ball-joint and neck showed a 6-million-year-old walker—and bite marks near the knee showed a big cat chewed on the bone!',
        clinician:
          "Proximal two-thirds of a left femur (~201 mm preserved) preserving the spherical head, elongated neck and proximal shaft from Kapsomin, associated in the same horizon with the BAR 1000'00 mandibular fragments, distal right humerus and curved manual phalanx (Senut et al. 2001; Richmond & Jungers 2008).",
      },
      taphonomy: { colors: ['#58483b', '#7b6653', '#2e241d'], note: 'Dark mineralised Late Miocene bone from calcareous Lukeino silts.' },
      lesions: [
        {
          id: 'bar-1002-00-carnivore-gnawing',
          kind: 'bite-marks',
          bone: 'femur_L',
          site: { t: 0.85, azimuthDeg: 180 },
          timing: 'perimortem',
          healing: 'none',
          title: {
            kids: 'Big-cat tooth marks near the knee end',
            clinician: 'Carnivore tooth punctures and gnawing damage on distal preserved femoral shaft',
          },
          summary: {
            kids: 'Large carnivore teeth crushed and chewed off the lower end of the thigh bone around the time of death, with zero healing.',
            clinician:
              "Carnivore tooth punctures, scoring and crenellated gnawing removed the distal condyles of BAR 1002'00 without osteogenic reaction (Senut et al. 2001), indicating predation or early scavenging by a large Miocene felid/carnivoran.",
          },
          clinical: {
            morphology: 'Unremodelled carnivore tooth punctures and ragged gnawed margin truncating the distal femoral diaphysis.',
            differential: ['Perimortem large-felid predation', 'Early postmortem carnivore scavenging'],
            modernAnalogue: 'Leopard or machairodont felid feeding damage on primate long-bone epiphyses.',
            functionalImpact: 'Perimortem/postmortem taphonomic modification (associated with mortality or scavenging event).',
            survivalInterval: 'None (no reactive bone).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['senut2001'],
          render: { severity: 0.55, count: 3, spacingMm: 14 },
        },
      ],
      citations: ['senut2001', 'richmond2008'],
      isFlagship: true,
    },
  ],
  citations: ['senut2001', 'richmond2008', 'smithsonian-hop'],
};
