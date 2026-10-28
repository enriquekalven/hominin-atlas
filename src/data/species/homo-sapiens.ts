import type { Species } from '../types';

export const species: Species = {
  id: 'homo-sapiens',
  binomial: 'Homo sapiens',
  common: { kids: 'Modern human (us!)', clinician: 'Homo sapiens' },
  nickname: null,
  group: 'modern-human',
  status: 'living',
  rangeKa: { start: 315, end: 0 },
  regions: ['Africa', 'Europe', 'Asia', 'Australia and Oceania', 'Americas'],
  brainCc: { best: 1350, min: null, max: null },
  // Population means, not individual extremes: national mean adult heights, Guatemalan women 149.4 cm to
  // Dutch men 182.5 cm (NCD-RisC 2016); adult body mass, global mean 62 kg, regional means 57.7 (Asia)
  // to 80.7 kg (North America) (Walpole et al. 2012).
  statureCm: { best: null, min: 149.4, max: 182.5 },
  massKg: { best: 62, min: 57.7, max: 80.7 },
  locomotion: {
    kids: 'We walk and run on two legs. Humans are great long-distance runners!',
    clinician: 'Obligate striding bipedalism with endurance-running adaptations (Bramble & Lieberman 2004).',
  },
  diet: {
    kids: 'Almost anything! Plants, meat, fish and shellfish, and later farmed foods.',
    clinician: 'Highly flexible omnivory with cooking and food processing; agriculture from the early Holocene.',
  },
  technology: {
    kids: 'From stone tools to spaceships! Early people made needles, beads, paintings and flutes.',
    clinician: 'Middle Stone Age technology from ≥300 ka, later Upper Palaeolithic/Later Stone Age industries, symbolic material culture, and all later technology.',
  },
  overview: {
    kids: 'That’s us! Homo sapiens appeared in Africa at least 300,000 years ago. Our ancestors spread across the whole world. Long ago, we met Neanderthals and Denisovans, and some of their DNA is still in us today.',
    clinician:
      'Earliest fossils with derived facial morphology from Jebel Irhoud (~315 ka; Hublin et al. 2017; Richter et al. 2017) and Omo Kibish (≥233 ka; Vidal et al. 2022; earlier estimate ~195 ka, McDougall et al. 2005); the globular braincase evolved later within the lineage. Dispersed out of Africa repeatedly, with a major dispersal after ~60 ka, admixing with Neanderthals and Denisovans. Average adult brain size ~1,350 cm³. Body size varies widely: national mean adult heights range from about 149 cm (Guatemalan women) to 183 cm (Dutch men) (NCD-RisC 2016), and mean adult body mass is about 62 kg worldwide (Walpole et al. 2012).',
  },
  keyTraits: {
    kids: ['Big, round head', 'Small face tucked under the forehead', 'A chin!', 'Slender body'],
    clinician: [
      'Globular neurocranium with a high, vertical frontal and parietal bossing',
      'Retracted, orthognathic face with reduced supraorbital relief',
      'Mental eminence (chin)',
      'Gracile postcranium with relatively thin cortical bone',
      'Average endocranial volume ~1,350 cm³',
    ],
  },
  funFacts: [
    'The oldest known Homo sapiens fossils, from Jebel Irhoud in Morocco, are about 315,000 years old.',
    'Every person alive today belongs to this one species.',
    'Ötzi the Iceman lived about 5,300 years ago and was found in the Alps in 1991.',
    'Modern humans are the only hominins with a true bony chin.',
    'Ötzi had more than 60 tattoos made of small lines and crosses.',
    'Most people whose ancestors lived outside Africa carry a little Neanderthal DNA, about 1 to 2 percent.',
  ],
  ancestry: {
    parent: 'homo-heidelbergensis',
    uncertain: true,
    note: 'Derived from African Middle Pleistocene populations (sometimes grouped as H. heidelbergensis or H. rhodesiensis); the ancestry may involve several interconnected African populations rather than a single ancestor.',
  },
  geneFlow: ['homo-neanderthalensis', 'denisovans'],
  specimens: [
    {
      id: 'cro-magnon-1',
      catalog: 'Cro-Magnon 1',
      nickname: 'The Old Man of Cro-Magnon',
      site: { name: 'Abri de Cro-Magnon, Les Eyzies-de-Tayac', country: 'France', lat: 44.9, lon: 1.0 },
      ageKa: {
        best: null,
        min: null,
        max: null,
        method: 'Radiocarbon on a shell ornament from the burial: ~27.7 ka 14C BP (Henry-Gambier 2002), roughly 32 ka in calendar years',
      },
      sex: 'male',
      ageAtDeath: 'Adult',
      discovery: { year: 1868, by: 'Railway construction workers; excavated by Louis Lartet' },
      completeness: { percent: null, found: ['cranium', 'mandible'], partial: [] },
      story: {
        kids: 'In 1868, workers building a railway in France uncovered a rock shelter with very old bones. One skull belonged to a man who lived about 30,000 years ago, in the time of Ice Age cave art. He is called the Old Man of Cro-Magnon. He had an unusual patch on his forehead, and doctors today still wonder what caused it.',
        clinician:
          'Adult male cranium and mandible from the 1868 Cro-Magnon rock-shelter burials, dated by association to ~27.7 ka 14C BP and attributed to the Gravettian (Henry-Gambier 2002). A lesion of the frontal bone has received several diagnoses.',
      },
      taphonomy: { colors: ['#d8c9ab', '#bca883', '#86704f'], note: 'Light tan rock-shelter bone.' },
      lesions: [
        {
          id: 'cro-magnon-1-frontal-lesion',
          kind: 'tumor',
          bone: 'cranium',
          site: { anchor: 'frontal-mid' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'Mystery patch on the forehead', clinician: 'Erosive lesion of the frontal bone (diagnosis debated)' },
          summary: {
            kids: 'The front of his skull has a rough, eaten-away patch. Some doctors think it came from a lumpy skin and nerve disease. Others think it was an infection or an old injury.',
            clinician:
              'An erosive lesion of the external table of the frontal bone has been interpreted in several ways; Charlier et al. (2018) proposed neurofibromatosis type 1.',
          },
          clinical: {
            morphology: 'Irregular erosive defect of the outer table of the frontal bone.',
            differential: [
              'Neurofibromatosis type 1 (Charlier et al. 2018)',
              'Infectious lesion',
              'Healed or healing trauma',
            ],
            modernAnalogue: null,
            functionalImpact: null,
            survivalInterval: null,
          },
          evidence: 'debated',
          debateNote:
            'A single skeletal lesion cannot establish a genetic syndrome. Charlier et al. (2018) argued for neurofibromatosis type 1, but infection and trauma have also been proposed, and no consensus exists. The Cro-Magnon pathology had been described earlier by Dastugue (1967).',
          citations: ['charlier2018b', 'dastugue1967'],
          render: { severity: 0.4, radiusMm: 12 },
        },
      ],
      citations: ['henrygambier2002', 'charlier2018b', 'dastugue1967'],
      isFlagship: true,
    },
    {
      id: 'irhoud-1',
      catalog: 'Irhoud 1',
      nickname: null,
      site: { name: 'Jebel Irhoud', country: 'Morocco', lat: 31.86, lon: -8.87 },
      ageKa: {
        best: 315,
        min: 281,
        max: 349,
        method:
          'Thermoluminescence of heated flints from fossil-bearing layer 7: 315 ± 34 ka (Richter et al. 2017). Irhoud 1 was found by miners in 1961 without precise provenance; a tooth of Irhoud 3 from the early finds gave a U-series/ESR age of 286 ± 32 ka.',
      },
      sex: 'unknown',
      ageAtDeath: 'Adult',
      discovery: { year: 1961, by: 'Barite miners at Jebel Irhoud' },
      completeness: { percent: null, found: ['cranium'], partial: [] },
      story: {
        kids: 'In 1961, miners digging into a hill in Morocco found this skull. Much later, scientists worked out that people like this lived about 300,000 years ago. That makes them some of the oldest members of our own species ever found! The face looks a lot like ours, but the back of the head is longer.',
        clinician:
          'Adult cranium recovered during barite mining in 1961. With the newer Jebel Irhoud fossils (including the partial cranium Irhoud 10 and the adult mandible Irhoud 11) it combines a modern-looking face with an elongated, archaic braincase, supporting an early, mosaic emergence of H. sapiens features across Africa (Hublin et al. 2017).',
      },
      taphonomy: { colors: ['#bfa98a', '#927b5f', '#4f4032'], note: 'Light tan cave-sediment bone with darker brown patches.' },
      lesions: [],
      citations: ['hublin2017', 'richter2017'],
      isFlagship: false,
    },
    {
      id: 'qafzeh-11',
      catalog: 'Qafzeh 11',
      nickname: null,
      site: { name: 'Qafzeh Cave, near Nazareth', country: 'Israel', lat: 32.68, lon: 35.3 },
      ageKa: {
        best: 92,
        min: 87,
        max: 97,
        method: 'Thermoluminescence of burnt flints from the hominin-bearing Mousterian layers: 92 ± 5 ka (Valladas et al. 1988)',
      },
      sex: 'unknown',
      ageAtDeath: 'Adolescent, about 12–13 years',
      discovery: { year: null, by: 'Excavations directed by Bernard Vandermeersch' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible'],
        partial: ['teeth', 'spine', 'ribs', 'arm_L', 'arm_R', 'pelvis', 'leg_L', 'leg_R'],
      },
      story: {
        kids: 'This young person lived about 92,000 years ago in what is now Israel. Years before they died, they hurt their head, and the skull bone got a dent that later healed. When they died, their people buried them with deer antlers.',
        clinician:
          'Adolescent burial with deer antlers from Qafzeh Cave, an early H. sapiens site. The frontal bone carries a healed depressed fracture; a CT-based 3D study of the skull and endocast led Coqueugniot et al. (2014) to infer childhood brain injury with possible lasting neurological and behavioural effects, and to read the burial as evidence of social care.',
      },
      taphonomy: { colors: ['#c2a27c', '#99785a', '#5a4330'], note: 'Light brown cave bone with darker mineral staining.' },
      lesions: [
        {
          id: 'qafzeh-11-frontal-depressed-fracture',
          kind: 'depressed-fracture',
          bone: 'cranium',
          site: { anchor: 'frontal-mid' },
          timing: 'antemortem',
          healing: 'remodeled',
          title: { kids: 'A healed dent in the skull', clinician: 'Healed depressed fracture of the frontal bone' },
          summary: {
            kids: 'When this child was younger, a hard knock dented the front of the skull. The bone healed over the years. Scientists think the injury may have changed how the child thought and behaved.',
            clinician:
              'Healed depressed fracture of the frontal bone with remodelled margins, sustained years before death. CT-based 3D reconstruction of the cranium and endocast suggests involvement of the underlying frontal lobe (Coqueugniot et al. 2014). The exact position on the frontal bone is approximated in this model.',
          },
          clinical: {
            morphology: 'Healed, remodelled depression of the frontal bone; cranium and endocast studied by CT-based 3D reconstruction.',
            differential: ['Postmortem (taphonomic) deformation, excluded by bone healing', 'Healed infectious or other non-traumatic lesion'],
            modernAnalogue:
              'Healed depressed skull fracture after blunt head trauma in childhood; in modern children such injuries can be associated with focal brain injury and later cognitive or behavioural problems.',
            functionalImpact: 'Coqueugniot et al. (2014) infer possible lasting neurological and behavioural impairment.',
            survivalInterval: 'Years: the fracture had healed long before death in adolescence.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['coqueugniot2014'],
          render: { severity: 0.5, radiusMm: 10 },
        },
      ],
      citations: ['coqueugniot2014', 'valladas1988'],
      isFlagship: false,
    },
    {
      id: 'otzi',
      catalog: 'Iceman (South Tyrol Museum of Archaeology, Bolzano)',
      nickname: 'Ötzi',
      site: { name: 'Tisenjoch (Hauslabjoch), Ötztal Alps', country: 'Italy', lat: 46.78, lon: 10.84 },
      ageKa: {
        best: 5.2,
        min: 5.05,
        max: 5.3,
        method: 'AMS radiocarbon dating of the body and his equipment, calibrated to c. 3350–3100 BC (Copper Age); best = midpoint',
      },
      sex: 'male',
      ageAtDeath: 'About 45 years',
      discovery: { year: 1991, by: 'Helmut and Erika Simon (hikers from Nuremberg)' },
      completeness: { percent: null, found: ['all'], partial: [] },
      story: {
        kids: 'Two hikers found Ötzi in the ice high in the Alps in 1991. He lived about 5,300 years ago. The cold ice kept his body, clothes and tools safe, even his copper axe. Long before, he had broken some ribs, and they had healed. At the end of his life, an arrow hit his left shoulder. He was hurt badly and did not survive.',
        clinician:
          'Naturally mummified adult male, about 45 years old, found in a rock gully at about 3,210 m with clothing and Copper Age equipment (copper-bladed axe, unfinished yew bow, quiver with arrows). Imaging shows healed rib fractures from earlier in life (Murphy et al. 2003; rib levels not specified here). Radiographs in 2001 revealed a flint arrowhead in the left shoulder; CT later showed an associated lesion of the left subclavian artery, interpreted as the cause of death (Gostner & Egarter Vigl 2002; Pernter et al. 2007).',
      },
      taphonomy: {
        colors: ['#8b6b4a', '#6b5037', '#3a2a1c'],
        note: 'Freeze-dried glacier mummy; the skeleton is known from X-rays and CT, so colours approximate the mummified tissue.',
      },
      lesions: [
        {
          id: 'otzi-left-scapula-arrowhead',
          kind: 'projectile-wound',
          bone: 'scapula_L',
          site: { anchor: 'blade' },
          timing: 'perimortem',
          healing: 'none',
          title: {
            kids: 'Arrow tip in the shoulder',
            clinician: 'Perforating arrow wound of the left scapula with retained flint arrowhead',
          },
          summary: {
            kids: 'An arrow hit Ötzi in the back of his left shoulder. Its stone tip went through his shoulder blade and stayed inside. There was no time for the bone to heal. He was hurt badly and did not survive.',
            clinician:
              'Flint arrowhead retained in the left shoulder region, first identified on radiographs in 2001. The projectile entered from the back, perforated the left scapula and came to rest close to the left subclavian vessels; CT showed a lesion of the left subclavian artery with surrounding haematoma, consistent with rapidly fatal haemorrhage (Gostner & Egarter Vigl 2002; Pernter et al. 2007).',
          },
          clinical: {
            morphology:
              'Perforating defect of the left scapula without bony reaction; radiopaque flint arrowhead lodged in the soft tissues of the left shoulder/upper thorax near the subclavian artery; no arrow shaft was found in the wound.',
            differential: [
              'Before 2001, death was attributed to exposure; the arrowhead was only recognised on radiographs in 2001',
              'A head injury (blow or fall) has also been discussed as an additional cause of death',
            ],
            modernAnalogue:
              'Penetrating projectile injury of the shoulder girdle with subclavian artery injury: a vascular emergency that causes haemorrhagic shock if bleeding is not controlled.',
            functionalImpact: 'Fatal: severe bleeding from the injured left subclavian artery (Pernter et al. 2007).',
            survivalInterval: 'Short: no bone healing; Pernter et al. (2007) infer death soon after the injury.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['gostner2002', 'pernter2007'],
          render: { severity: 0.6, count: 1, radiusMm: 5 },
        },
      ],
      citations: ['gostner2002', 'pernter2007', 'murphy2003'],
      isFlagship: false,
    },
    {
      id: 'romito-2',
      catalog: 'Romito 2',
      nickname: null,
      site: { name: 'Riparo del Romito, Papasidero (Calabria)', country: 'Italy', lat: 39.9, lon: 15.9 },
      ageKa: {
        best: null,
        min: null,
        max: null,
        method: 'Radiocarbon-dated Late Epigravettian (Late Upper Palaeolithic) double burial',
      },
      sex: 'unknown',
      ageAtDeath: 'Adolescent',
      discovery: { year: null, by: 'Excavations directed by Paolo Graziosi (1960s)' },
      completeness: {
        percent: null,
        found: ['skull', 'spine', 'arm_L', 'arm_R', 'leg_L', 'leg_R', 'pelvis'],
        partial: ['ribs', 'hand_L', 'hand_R', 'foot_L', 'foot_R'],
      },
      story: {
        kids: 'This teenager lived in Italy near the end of the Ice Age. They were born with a condition that made their arms and legs grow very short. Scientists think their group helped care for them. They were buried together with an adult.',
        clinician:
          'Adolescent from a Late Epigravettian double burial with an adult (Romito 1). Disproportionate short stature with marked shortening of the forearms and lower legs was diagnosed as acromesomelic dysplasia (Frayer et al. 1987); survival to adolescence with a severe skeletal dysplasia has been discussed as evidence of group support.',
      },
      taphonomy: { colors: ['#cdb595', '#a68a68', '#5a4634'], note: 'Light brown rock-shelter burial bone with darker sediment staining.' },
      lesions: [
        {
          id: 'romito-2-right-radius-dysplasia',
          kind: 'developmental',
          bone: 'radius_R',
          site: { t: 0.5, azimuthDeg: 0 },
          timing: 'antemortem',
          healing: null,
          title: {
            kids: 'Arms and legs that grew very short',
            clinician: 'Acromesomelic dysplasia: mesomelic shortening of the forearm',
          },
          summary: {
            kids: 'Romito 2 was born with a condition that changes how bones grow. The forearms and lower legs stayed very short, so this teenager was much smaller than everyone else. It did not come from an injury.',
            clinician:
              'Disproportionate short stature with the greatest shortening in the forearms and lower legs (mesomelia) and a normally proportioned cranium, diagnosed as acromesomelic dysplasia (Frayer et al. 1987). A bilateral, systemic condition, shown here on the right radius.',
          },
          clinical: {
            morphology: 'Short limb bones, with the middle segments (forearm and lower leg) most shortened; cranium of normal proportions.',
            differential: [
              'Achondroplasia (rhizomelic pattern; Frayer et al. favoured acromesomelic dysplasia)',
              'Other short-limbed skeletal dysplasias',
            ],
            modernAnalogue:
              'Acromesomelic dysplasia, Maroteaux type: autosomal recessive skeletal dysplasia caused by biallelic NPR2 variants, with marked short stature and short forearms, lower legs, hands and feet.',
            functionalImpact: 'Severe short stature with short forearms; limited elbow extension is common in modern patients.',
            survivalInterval: 'Lifelong (congenital); survived to adolescence.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['frayer1987'],
          render: { severity: 0.6 },
        },
      ],
      citations: ['frayer1987'],
      isFlagship: false,
    },
  ],
  citations: ['hublin2017', 'richter2017', 'vidal2022', 'mcdougall2005', 'bramble2004', 'green2010', 'ncdrisc2016', 'walpole2012'],
};
