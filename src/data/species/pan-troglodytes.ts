import type { Species } from '../types';

export const species: Species = {
  id: 'pan-troglodytes',
  binomial: 'Pan troglodytes',
  common: { kids: 'Chimpanzee', clinician: 'Common chimpanzee' },
  nickname: null,
  group: 'living-relative',
  status: 'living',
  rangeKa: { start: 545, end: 0 },
  regions: ['West Africa', 'Central Africa', 'East Africa'],
  brainCc: { best: null, min: null, max: null },
  statureCm: { best: null, min: null, max: null },
  massKg: { best: null, min: 33.7, max: 59.7 },
  locomotion: {
    kids: 'Chimps walk on all fours, leaning on their knuckles. They are amazing climbers. They can walk on two legs, but only for a short time.',
    clinician:
      'Quadrupedal knuckle-walking combined with vertical climbing and suspension. Bipedal bouts are brief and performed with flexed hips and knees ("bent-hip, bent-knee"); the hallux is abducted and grasping.',
  },
  diet: {
    kids: 'Mostly ripe fruit. They also eat leaves, seeds, termites and ants, and sometimes meat.',
    clinician:
      'Ripe-fruit specialists and omnivores: fruit supplemented by leaves, pith, seeds, social insects and hunted vertebrates (e.g., red colobus monkeys at Gombe and Taï).',
  },
  technology: {
    kids: 'Chimps use sticks to fish for termites, leaves as sponges, and stones to crack nuts.',
    clinician:
      'Population-specific tool traditions (termite/ant probes, leaf sponges, stone and wooden hammer-and-anvil nut cracking). Useful as a behavioural model, not as a stage of human evolution.',
  },
  overview: {
    kids: 'Chimpanzees and bonobos are our closest living cousins. Our family lines split apart about 6 to 8 million years ago. Chimps are not our ancestors: they kept evolving too! We show a chimp so you can compare its bones with ours.',
    clinician:
      'Extant outgroup reference. Genomic estimates place the Pan–Homo divergence at roughly 6–8 Ma (estimates depend on mutation-rate and generation-time assumptions). The fossil record of Pan is limited to teeth from the Kapthurin Formation, Kenya, ~545 ka (McBrearty & Jablonski 2005); rangeKa.start therefore reflects the first fossil appearance of the genus, not the origin of the lineage. Body-mass range shows wild subspecies/sex means (Smith & Jungers 1997).',
  },
  keyTraits: {
    kids: ['Long arms and short legs', 'A big toe that grabs like a thumb', 'Brain about one-third the size of ours', 'Big canine teeth, especially in males'],
    clinician: [
      'Intermembral index > 100 (forelimbs longer than hindlimbs)',
      'Abducted, opposable hallux; no longitudinal arch',
      'Posteriorly positioned foramen magnum',
      'Tall, narrow, coronally oriented iliac blades',
      'Femoral bicondylar angle near 0° (no valgus knee)',
      'Marked subnasal prognathism and a honing canine–premolar complex',
    ],
  },
  funFacts: [
    'Chimpanzees and humans differ at only about 1.2% of the DNA letters that can be lined up between our genomes.',
    'Jane Goodall began studying the chimpanzees of Gombe, Tanzania, in 1960 and saw them make tools to fish for termites.',
    'Chimpanzee fossils are extremely rare: the first ones were only described in 2005, from Kenya.',
    'Like people, wild chimpanzees sometimes break bones in falls and fights, and many of the breaks heal.',
    'Archaeologists have dug up nut-cracking stones that chimpanzees used in Côte d’Ivoire about 4,300 years ago.',
    'Chimpanzee DNA still carries traces of interbreeding with bonobos, their closest relatives, long ago.',
  ],
  ancestry: {
    parent: null,
    uncertain: false,
    note: 'Living outgroup. Chimpanzees are not ancestral to hominins; both lineages descend from a shared ancestor that lived roughly 6–8 million years ago.',
  },
  geneFlow: ['pan-paniscus'],
  specimens: [
    {
      id: 'gombe-chimpanzee-collection',
      catalog: 'Gombe Stream chimpanzee skeletal collection (multiple individuals)',
      nickname: null,
      site: { name: 'Gombe Stream National Park', country: 'Tanzania', lat: -4.7, lon: 29.6 },
      ageKa: { best: null, min: null, max: null, method: 'Modern skeletons of known wild individuals (not fossils)' },
      sex: 'unknown',
      ageAtDeath: null,
      discovery: { year: null, by: null },
      completeness: { percent: null, found: ['all'], partial: [] },
      story: {
        kids: 'At Gombe in Tanzania, scientists have watched wild chimps for more than 60 years. When some of these chimps died, their skeletons were kept and studied. Many had broken bones that healed while they were alive.',
        clinician:
          'Skeletons of known-life-history wild chimpanzees from Gombe. Jurmain (1997) documented a high frequency of healed skeletal trauma attributed to falls and intraspecific aggression, a useful baseline for interpreting fractures in fossil hominins. Lethal intercommunity aggression has been recorded at Gombe and many other long-term study sites (Wilson et al. 2014).',
      },
      taphonomy: { colors: ['#e9dfc8', '#d4c4a3', '#a08a66'], note: 'Recent, unfossilised bone.' },
      lesions: [],
      citations: ['jurmain1997', 'wilson2014'],
      isFlagship: true,
    },
  ],
  citations: ['mcbrearty2005', 'chimpconsortium2005', 'jurmain1997', 'smith1997', 'goodall1964', 'mercader2007', 'demanuel2016'],
};
