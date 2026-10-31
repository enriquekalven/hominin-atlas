import type { Species } from '../types';

export const species: Species = {
  id: 'pan-paniscus',
  binomial: 'Pan paniscus',
  common: { kids: 'Bonobo', clinician: 'Bonobo (pygmy chimpanzee)' },
  nickname: null,
  group: 'living-relative',
  status: 'living',
  rangeKa: { start: 500, end: 0 },
  regions: ['Central Africa (Congo Basin south of the Congo River, DR Congo)'],
  brainCc: { best: null, min: 310, max: 380 },
  statureCm: { best: null, min: 110, max: 120 },
  massKg: { best: null, min: 33.2, max: 45.0 },
  locomotion: {
    kids: 'Bonobos walk on their knuckles and swing through trees, and they stand and walk on two legs more often than common chimpanzees.',
    clinician:
      'Quadrupedal knuckle-walking, vertical climbing and arboreal suspension, with comparatively frequent bouts of terrestrial and arboreal bipedalism (especially during object carrying and display); retains an abducted grasping hallux.',
  },
  diet: {
    kids: 'Mostly ripe forest fruit, soft stems, leaves and herbs, plus occasional small animals and insects.',
    clinician:
      'Frugivorous–folivorous rainforest diet rich in terrestrial herbaceous vegetation (THV), figs and drupes, supplemented by invertebrates and occasional small vertebrates.',
  },
  technology: {
    kids: 'Wild bonobos use leafy twigs as rain umbrellas and sponges, though they use stone tools much less often than chimpanzees in the wild.',
    clinician:
      'Lighter wild tool repertoire than P. troglodytes (leaf umbrellas, moss sponges, branch dragging), though captive individuals demonstrate proficient Oldowan-like flake production.',
  },
  overview: {
    kids: 'Bonobos share just as much DNA with us as common chimpanzees do! They live only in rainforests south of the giant Congo River. Including both chimpanzees and bonobos helps scientists avoid assuming our shared ancestor acted like only one ape.',
    clinician:
      'Second extant species of genus Pan, endemic to the Cuvette Centrale south of the Congo–Lualaba river barrier. Diverged from P. troglodytes ~1.5–2.0 Ma with subsequent ancient gene flow (Prüfer et al. 2012; de Manuel et al. 2016). No undisputed Pan paniscus fossils are known; rangeKa.start (500 ka) is a conservative Late-Middle Pleistocene placeholder alongside P. troglodytes so both sister outgroups anchor comparative anatomy. Sex-mean body masses follow Smith & Jungers (1997).',
  },
  keyTraits: {
    kids: [
      'Slender build with long legs for an ape',
      'Dark face from birth with pink lips and parted head hair',
      'Smaller canine teeth difference between males and females than chimps',
      'Grasping big toe for climbing',
    ],
    clinician: [
      'More gracile cranial vault and weaker supraorbital torus than P. troglodytes',
      'Lower intermembral index and slightly higher crural index than P. troglodytes',
      'Reduced canine sexual dimorphism compared with common chimpanzees',
      'Paedomorphic craniofacial proportions (Shea 1983)',
      'Abducted hallux and curved phalanges adapted for arboreal prehension',
    ],
  },
  funFacts: [
    'Bonobos and common chimpanzees share equally close DNA kinship with humans—neither one is closer to us than the other.',
    'Because bonobos cannot swim across the wide Congo River, their populations stayed separated from chimpanzees and gorillas.',
    'Female bonobos form strong friendships and hold top social rank in their groups.',
    'Bonobos were the last great ape species recognized by science, described from museum skulls in Tervuren, Belgium, in 1929.',
  ],
  ancestry: {
    parent: null,
    uncertain: false,
    note: 'Living sister outgroup alongside Pan troglodytes; both Pan species share an equal genealogical distance to Homo sapiens (~6–8 Ma split).',
  },
  geneFlow: ['pan-troglodytes'],
  specimens: [
    {
      id: 'rmca-lomako-bonobo-reference',
      catalog: 'RMCA Tervuren / USNM 398227 comparative wild Pan paniscus collection',
      nickname: null,
      site: { name: 'Lomako–Yokokala rainforest (Cuvette Centrale)', country: 'Democratic Republic of the Congo', lat: 0.85, lon: 21.1 },
      ageKa: { best: null, min: null, max: null, method: 'Modern osteological reference skeletons from wild Congo Basin individuals' },
      sex: 'unknown',
      ageAtDeath: 'Adult',
      discovery: { year: 1929, by: 'Ernst Schwarz & Harold Coolidge (taxonomic recognition from RMCA Tervuren crania)' },
      completeness: { percent: null, found: ['all'], partial: [] },
      story: {
        kids: 'Museum skeletons of wild bonobos from the Congo rainforest helped scientists realize bonobos are their own species, with slimmer skulls and longer legs than chimpanzees.',
        clinician:
          'Comparative wild osteological series housed at the Royal Museum for Central Africa (Tervuren) and the Smithsonian Institution (including USNM 398227, digitized in open-access 3D). Used alongside Gombe P. troglodytes to bracket ancestral Pan–Homo cranio-postcranial allometry and trauma rates.',
      },
      taphonomy: { colors: ['#ede3cd', '#d6c6a5', '#9e8864'], note: 'Recent macerated museum osteological bone.' },
      lesions: [],
      citations: ['prufer2012', 'smith1997'],
      isFlagship: true,
    },
  ],
  citations: ['prufer2012', 'demanuel2016', 'smith1997'],
};
