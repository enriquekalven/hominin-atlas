import type { Species } from '../types';

export const species: Species = {
  id: 'sahelanthropus-tchadensis',
  binomial: 'Sahelanthropus tchadensis',
  common: { kids: 'Sahelanthropus (Toumaï’s kind)', clinician: 'Sahelanthropus tchadensis' },
  nickname: null,
  group: 'early-hominin',
  status: 'extinct',
  rangeKa: { start: 7200, end: 6800 },
  regions: ['Central Africa (Chad)'],
  brainCc: { best: null, min: 360, max: 370 },
  statureCm: { best: null, min: null, max: null },
  massKg: { best: null, min: null, max: null },
  locomotion: {
    kids: 'It may have walked on two legs some of the time and climbed trees too. Scientists are still arguing about it!',
    clinician:
      'Habitual bipedality has been inferred from a relatively anterior foramen magnum and basicranial configuration in the virtual reconstruction (Zollikofer et al. 2005). Postcranial evidence from Toros-Menalla (a partial femoral shaft and two ulnae) is read as habitual terrestrial bipedalism combined with arboreal climbing by Daver et al. (2022), but as not supporting habitual bipedalism by Macchiarelli et al. (2020); attribution of these bones to Sahelanthropus rests on their association with the type locality. Locomotion remains unresolved.',
  },
  diet: {
    kids: 'Probably fruit, leaves and other foods from forests near a lake.',
    clinician:
      'Not directly established (no isotopic or microwear data published for the type material). Postcanine enamel thickness was described as intermediate between chimpanzees and australopiths (Brunet et al. 2002).',
  },
  technology: {
    kids: 'No tools have been found.',
    clinician: 'No associated lithic technology.',
  },
  overview: {
    kids: 'Sahelanthropus lived about 7 million years ago in Chad, in the middle of Africa. Back then the land had a big lake, forests and grassy areas. Its skull is one of the oldest that might belong to our side of the family tree.',
    clinician:
      'Known from a cranium (TM 266-01-060-1), mandibular fragments and isolated teeth from Toros-Menalla, Djurab Desert, Chad (Brunet et al. 2002), dated to ~7 Ma by biochronology (Vignaud et al. 2002) and authigenic 10Be/9Be cosmogenic dating (Lebatard et al. 2008). Hominin status rests on small, apically worn canines without a functional C/P3 honing complex and a relatively anterior foramen magnum; some researchers consider it a Miocene ape (Wolpoff et al. 2002). The species range (7.2–6.8 Ma) is the cosmogenic age bracket of this single dated locality.',
  },
  keyTraits: {
    kids: ['Small brain, about the size of a chimp’s', 'Thick bony brow over the eyes', 'Small canine teeth', 'Flatter face than a chimp'],
    clinician: [
      'Massive, continuous supraorbital torus',
      'Small, apically worn canines; no functional C/P3 honing',
      'Relatively anterior foramen magnum and short basioccipital (reconstruction-dependent)',
      'Endocranial volume ~360–370 cm³ (virtual reconstruction)',
      'Moderate subnasal prognathism',
    ],
  },
  funFacts: [
    'Its nickname Toumaï means “hope of life” in the Daza (Goran) language of Chad.',
    'The skull was found in the Djurab Desert of Chad in 2001.',
    'The skull was crushed and bent in the ground, so scientists rebuilt it piece by piece on a computer.',
    'It lived about 7 million years ago, close to the time our lineage split from the chimpanzee lineage.',
    'Toumaï was found far to the west of East Africa’s Rift Valley, where most other early hominin fossils come from.',
    'A thigh bone found at the same site has sparked a lively debate about whether Toumaï’s species walked on two legs.',
  ],
  ancestry: {
    parent: null,
    uncertain: true,
    note: 'Possibly near the base of the hominin lineage; its relationship to Ardipithecus and to later hominins is unknown, and some researchers place it outside hominins.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'tm-266-01-060-1',
      catalog: 'TM 266-01-060-1',
      nickname: 'Toumaï',
      site: { name: 'Toros-Menalla (locality TM 266), Djurab Desert', country: 'Chad', lat: 16.2, lon: 17.5 },
      ageKa: {
        best: 7000,
        min: 6800,
        max: 7200,
        method: 'Biochronology of the associated fauna plus authigenic 10Be/9Be cosmogenic nuclide dating of the fossiliferous unit (Lebatard et al. 2008)',
      },
      sex: 'unknown',
      ageAtDeath: 'Adult (fully erupted, worn dentition)',
      discovery: { year: 2001, by: 'Ahounta Djimdoumalbaye (Mission Paléoanthropologique Franco-Tchadienne, led by Michel Brunet)' },
      completeness: { percent: null, found: ['cranium'], partial: ['teeth_upper'] },
      story: {
        kids: 'In 2001, a fossil hunter named Ahounta found this skull in the hot, sandy Djurab Desert of Chad. It is about 7 million years old! Over time it was squashed out of shape in the ground. Scientists scanned it and rebuilt it on a computer to see its real shape.',
        clinician:
          'Nearly complete cranium with a heavily distorted vault and face. CT-based virtual reconstruction (Zollikofer et al. 2005) corrected fracture displacement and plastic deformation, yielding an endocranial volume of ~360–370 cm³ and a basicranial configuration the authors considered compatible with habitual bipedality.',
      },
      taphonomy: { colors: ['#5b4636', '#7a5f45', '#2e2219'], note: 'Dark brown, iron-stained fossil bone with a mineral crust.' },
      lesions: [
        {
          id: 'tm-266-01-060-1-cranial-distortion',
          kind: 'deformation',
          bone: 'cranium',
          site: { anchor: 'vertex' },
          timing: 'postmortem',
          healing: null,
          title: { kids: 'Squashed in the ground', clinician: 'Postmortem fracturing and plastic deformation of the cranium' },
          summary: {
            kids: 'After Toumaï died, heavy layers of sand pressed on the skull for millions of years. It cracked and bent out of shape. This did not hurt Toumaï: it happened long after death.',
            clinician:
              'Taphonomic distortion with multiple fractures, plastic deformation and displacement of cranial elements; corrected by segmentation, realignment and mirror-imaging in the virtual reconstruction (Zollikofer et al. 2005).',
          },
          clinical: {
            morphology:
              'Vault and face crushed and asymmetrically displaced, with numerous sediment-filled cracks; no vital reaction or remodelling at fracture margins.',
            differential: [
              'Taphonomic (sediment-load) deformation; no antemortem or perimortem trauma has been proposed',
              'Distortion complicates the reading of hominin-diagnostic traits such as foramen magnum position; critics have argued the cranium could belong to an ape (Wolpoff et al. 2002)',
            ],
            modernAnalogue: null,
            functionalImpact: null,
            survivalInterval: null,
          },
          evidence: 'established',
          debateNote: null,
          citations: ['zollikofer2005', 'brunet2002', 'wolpoff2002'],
          render: { severity: 0.6, pattern: 'compression' },
        },
      ],
      citations: ['brunet2002', 'zollikofer2005', 'lebatard2008', 'vignaud2002'],
      isFlagship: true,
    },
  ],
  citations: ['brunet2002', 'zollikofer2005', 'lebatard2008', 'vignaud2002', 'wolpoff2002', 'daver2022', 'macchiarelli2020'],
};
