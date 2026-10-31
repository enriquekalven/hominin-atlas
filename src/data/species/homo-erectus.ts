import type { Species } from '../types';

export const species: Species = {
  id: 'homo-erectus',
  binomial: 'Homo erectus',
  common: { kids: 'Upright Man', clinician: 'Homo erectus' },
  nickname: 'Upright Man',
  group: 'early-homo',
  status: 'extinct',
  rangeKa: { start: 1890, end: 110 },
  regions: ['Africa', 'Western Asia (Georgia)', 'East Asia (China)', 'Southeast Asia (Java)'],
  brainCc: { best: null, min: 546, max: 1251 },
  statureCm: { best: null, min: 145, max: 185 },
  massKg: { best: null, min: 40, max: 68 },
  locomotion: {
    kids: 'Walked and ran on two long legs, just like us.',
    clinician:
      'Obligate, modern-like striding bipedalism with long lower limbs and an arched foot; adaptations for endurance running have been proposed (Bramble & Lieberman 2004).',
  },
  diet: {
    kids: 'Meat, bone marrow, fruits, roots and tubers. It may have cooked food with fire.',
    clinician: 'Increased reliance on animal tissues (cut-marked bones) and food processing; evidence for controlled fire before ~1 Ma is limited and debated.',
  },
  technology: {
    kids: 'Made big, teardrop-shaped stone hand axes.',
    clinician: 'Associated with Oldowan and Acheulean (Mode 2) technologies; Acheulean bifaces appear in East Africa by ~1.75 Ma.',
  },
  overview: {
    kids: 'Homo erectus was the first human relative with a body shaped much like ours. It lived for almost two million years and spread from Africa all the way to China and Indonesia. It made hand axes and may have used fire.',
    clinician:
      'Widely distributed, long-lived species (≈1.9 Ma to ≈110 ka; Ngandong, Java, dated to 117–108 ka by Rizal et al. 2020). Some authors separate early African specimens as H. ergaster. A juvenile cranium from Drimolen (DNH 134, ~2.04–1.95 Ma) has been attributed to H. erectus (Herries et al. 2020), which would extend the range. Endocranial volume spans ~546 cm³ (Dmanisi Skull 5) to >1,200 cm³ (Ngandong). Body-size range follows the Smithsonian Human Origins summary.',
  },
  keyTraits: {
    kids: ['Tall body with long legs', 'Thick brow ridge', 'Long, low skull', 'Bigger brain than Homo habilis'],
    clinician: [
      'Long, low cranial vault with sagittal keeling and an angular torus',
      'Thick cranial vault bones; continuous supraorbital torus',
      'Endocranial volume ~546–1,251 cm³',
      'Modern-like body proportions and tall stature',
      'Reduced postcanine dentition',
    ],
  },
  funFacts: [
    'The Turkana Boy skeleton, found in Kenya in 1984, is one of the most complete early human skeletons ever found.',
    'The first Homo erectus fossils were found on Java, Indonesia, by Eugène Dubois in 1891.',
    'Homo erectus survived on Java until about 110,000 years ago.',
    'At Dmanisi, Georgia, five skulls about 1.8 million years old were found, including one from an older person who had lost almost all their teeth.',
  ],
  ancestry: {
    parent: 'homo-habilis',
    uncertain: true,
    note: 'Origin uncertain: possibly from H. habilis-like populations in Africa, but the two species overlapped in time in East Africa.',
  },
  geneFlow: [],
  specimens: [
    {
      id: 'knm-wt-15000',
      catalog: 'KNM-WT 15000',
      nickname: 'Turkana Boy (Nariokotome Boy)',
      site: { name: 'Nariokotome, West Turkana', country: 'Kenya', lat: 4.1, lon: 35.8 },
      ageKa: { best: 1500, min: null, max: null, method: '40Ar/39Ar and correlation of volcanic tuffs bracketing the skeleton (about 1.5 Ma)' },
      sex: 'male',
      ageAtDeath: 'Juvenile; about 8–9 years from dental growth lines (older estimates suggested 11–12 years)',
      discovery: { year: 1984, by: 'Kamoya Kimeu (team led by Richard Leakey and Alan Walker)' },
      completeness: {
        percent: null,
        found: ['skull', 'spine', 'ribs', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'pelvis', 'leg_L', 'leg_R'],
        partial: [],
      },
      story: {
        kids: 'In 1984, fossil hunter Kamoya Kimeu spotted a small piece of skull near a dry riverbed in Kenya. The team dug for years and found almost a whole skeleton of a boy. He lived about 1.5 million years ago and was already tall for his age.',
        clinician:
          'Exceptionally complete juvenile male skeleton lacking most of the hands and feet (Brown et al. 1985). Long-limbed, narrow-bodied proportions. Vertebral asymmetries have been interpreted as pathology (axial dysplasia or juvenile disc herniation) or as minor variation.',
      },
      taphonomy: { colors: ['#4d4036', '#76634f', '#2a221c'], note: 'Dark brown to black fossil bone from lake-margin silts.' },
      lesions: [
        {
          id: 'knm-wt-15000-axial-dysplasia',
          kind: 'spinal-pathology',
          bone: 'vert_T11',
          site: { anchor: 'body' },
          timing: 'antemortem',
          healing: 'remodeled',
          title: {
            kids: 'Curved, bruised lower-back spine bones',
            clinician: 'Thoracolumbar vertebral asymmetry, Schmorl-like endplate lesions and debated canal stenosis',
          },
          summary: {
            kids: 'Several bones in Turkana Boy’s lower back are slightly tilted and indented, probably from a painful back disc injury while growing up.',
            clinician:
              'Vertebral wedging, facet asymmetry and endplate depressions across the lower thoracic and lumbar column of KNM-WT 15000; originally attributed to congenital axial dysplasia with thoracic spinal stenosis (Latimer & Ohman), later re-diagnosed as traumatic juvenile disc herniation without true neural-canal stenosis (Haeusler et al. 2013; Meyer & Haeusler 2015).',
          },
          clinical: {
            morphology: 'Asymmetric vertebral body wedging, imbricated articular facets, Schmorl-like endplate defects and lumbar kyphoscoliotic tilt.',
            differential: [
              'Traumatic juvenile intervertebral disc herniation with secondary degenerative remodelling (Haeusler et al. 2013)',
              'Congenital axial skeletal dysplasia with thoracic vertebral canal stenosis (Latimer & Ward 1993)',
              'Taphonomic post-depositional distortion of subadult vertebral elements',
            ],
            modernAnalogue: 'Adolescent Scheuermann-like / traumatic thoracolumbar disc herniation causing chronic mechanical back pain.',
            functionalImpact: 'Probable intermittent sciatica or mechanical low-back pain while retaining bipedal mobility.',
            survivalInterval: 'Months to years prior to death.',
          },
          evidence: 'debated',
          debateNote:
            'Latimer & Ohman interpreted KNM-WT 15000’s narrow thoracic neural canals as congenital axial dysplasia invalidating speech-breathing inferences, whereas Haeusler et al. (2013) and Meyer & Haeusler (2015) showed canal cross-sections fall within normal human range once juvenile disc herniation and taphonomic breakage are accounted for.',
          citations: ['latimer1993', 'haeusler2013', 'meyer2015'],
          render: { severity: 0.5 },
        },
      ],
      citations: ['brown1985', 'latimer1993', 'haeusler2013', 'meyer2015'],
      isFlagship: true,
    },
    {
      id: 'knm-er-1808',
      catalog: 'KNM-ER 1808',
      nickname: null,
      site: { name: 'Koobi Fora (Area 103), East Turkana', country: 'Kenya', lat: 4.02, lon: 36.25 },
      ageKa: { best: 1700, min: 1650, max: 1750, method: '40Ar/39Ar stratigraphy of the KBS Member, Koobi Fora Formation' },
      sex: 'female',
      ageAtDeath: 'Adult',
      discovery: { year: 1973, by: 'Kamoya Kimeu (Koobi Fora Research Project)' },
      completeness: {
        percent: null,
        found: ['femur_R', 'femur_L', 'tibia_R', 'tibia_L'],
        partial: ['cranium', 'mandible', 'humerus_R', 'radius_R', 'ulna_L', 'pelvis', 'fibula_R'],
      },
      story: {
        kids: 'This adult female Homo erectus from Kenya had thick, rough layers of extra bone coating her leg and arm shafts. Moving would have hurt deeply, so friends may have brought her water and food for weeks.',
        clinician:
          'Adult female partial skeleton (~1.7 Ma) exhibiting widespread, coarse woven subperiosteal new bone across the diaphyses of the femora, tibiae, fibulae, humeri, radius and ulna—one of the most dramatic systemic osteopathies in Early Pleistocene Homo (Walker et al. 1982; Rothschild et al. 1995).',
      },
      taphonomy: { colors: ['#5c4b3c', '#846e59', '#32281f'], note: 'Dark mineralised Koobi Fora sandstone bone showing thick porous periosteal apposition.' },
      lesions: [
        {
          id: 'knm-er-1808-periostitis',
          kind: 'infection',
          bone: 'femur_R',
          site: { t: 0.5, azimuthDeg: 0 },
          timing: 'antemortem',
          healing: 'early',
          title: {
            kids: 'Thick, painful layer of new bone on the thigh',
            clinician: 'Diffuse systemic diaphyseal hyperostosis / woven periostitis',
          },
          summary: {
            kids: 'Up to 7 millimetres of spongy new bone grew over her leg bones during a severe illness in the weeks or months before she died.',
            clinician:
              'Coarse, vascularised woven bone cuffs up to 7 mm thick encasing the diaphyses while sparing articular surfaces; attributed by Walker et al. (1982) to acute hypervitaminosis A from carnivore liver ingestion, and challenged by Rothschild et al. (1995) in favour of treponematosis (yaws) or other systemic periostitis.',
          },
          clinical: {
            morphology: 'Thick, disorganized, coarsely porous subperiosteal woven bone apposition along long-bone diaphyses with clear demarcation from underlying lamellar cortex.',
            differential: [
              'Hypervitaminosis A from carnivoran liver consumption (Walker et al. 1982)',
              'Treponematosis / Pleistocene yaws (Rothschild et al. 1995)',
              'Sickle-cell / hypertrophic osteoarthropathy or systemic infectious periostitis',
            ],
            modernAnalogue: 'Systemic subperiosteal hyperostosis with severe periosteal pain.',
            functionalImpact: 'Acute deep-bone pain and impaired mobility during the final weeks to months of life.',
            survivalInterval: 'Several weeks to a few months of active osteogenesis.',
          },
          evidence: 'debated',
          debateNote:
            'Walker et al. (1982) proposed hypervitaminosis A linked to increased carnivory (predator livers), whereas Rothschild et al. (1995) argued the distribution and spicule morphology better match yaws (treponematosis), and subsequent reviews also keep metabolic/hematologic etiologies open.',
          citations: ['walker1982', 'rothschild1995'],
          render: { severity: 0.75, radiusMm: 22 },
        },
      ],
      citations: ['walker1982', 'rothschild1995'],
      isFlagship: false,
    },
    {
      id: 'dmanisi-d3444',
      catalog: 'D3444 / D3900',
      nickname: 'Edentulous elder of Dmanisi (Skull 4)',
      site: { name: 'Dmanisi', country: 'Georgia', lat: 41.33, lon: 44.2 },
      ageKa: { best: 1770, min: 1760, max: 1850, method: '40Ar/39Ar on underlying basalt and overlying volcanic ash with palaeomagnetism' },
      sex: 'male',
      ageAtDeath: 'Senescent / older adult',
      discovery: { year: 2002, by: 'David Lordkipanidze and the Georgian National Museum team' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible'],
        partial: [],
      },
      story: {
        kids: 'Nearly 1.8 million years ago in Georgia, this older person lost almost every single tooth years before dying! Because chewing tough raw meat without teeth is nearly impossible, groupmates likely pounded soft food and shared it.',
        clinician:
          'Cranium D3444 and associated mandible D3900 (~1.77 Ma) displaying near-complete antemortem tooth loss with extensive alveolar bone resorption across both jaws—the earliest compelling osteological case for multi-year survival of a masticatorily impaired elder in Homo (Lordkipanidze et al. 2005; Margvelashvili et al. 2013).',
      },
      taphonomy: { colors: ['#c8b396', '#a48b69', '#5a4935'], note: 'Cream-buff fossil cranium and resorbed mandible from volcaniclastic silts.' },
      lesions: [
        {
          id: 'd3444-edentulism',
          kind: 'tooth-loss',
          bone: 'mandible',
          site: { anchor: 'mandible-symphysis' },
          timing: 'antemortem',
          healing: 'remodeled',
          title: {
            kids: 'Jaw healed smooth after losing almost all teeth',
            clinician: 'Complete antemortem edentulism (save one socket) with advanced alveolar resorption',
          },
          summary: {
            kids: 'All but one lower tooth fell out years before death, and the empty tooth sockets completely filled in and smoothed over with healed bone.',
            clinician:
              'Complete antemortem loss of all maxillary teeth and all mandibular teeth except the left canine, with profound vertical and labiolingual resorption of the alveolar processes and smooth cortical remodelling indicating survival for several years without functional dentition (Lordkipanidze et al. 2005; Margvelashvili et al. 2013).',
          },
          clinical: {
            morphology: 'Obliterated dental alveoli replaced by a knife-edged, smoothly corticated residual alveolar ridge across maxilla and mandible, plus severe periodontitis around the lone remaining lower left canine socket.',
            differential: [
              'Progressive severe attrition, super-eruption and chronic periodontitis culminating in antemortem exfoliation',
              'Traumatic avulsion (insufficient alone to account for bilateral postcanine symmetry)',
            ],
            modernAnalogue: 'Senescent total edentulism with Atwood Class V–VI residual ridge resorption.',
            functionalImpact: 'Inability to shear tough fibrous plant tissues or raw meat; implies lithic food tenderising (pounding/marrow extraction) and probable conspecific provisioning.',
            survivalInterval: 'Several years after loss of the cheek teeth.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['lordkipanidze2005', 'margvelashvili2013'],
          render: { severity: 0.7, radiusMm: 14 },
        },
      ],
      citations: ['lordkipanidze2005', 'margvelashvili2013', 'lordkipanidze2013'],
      isFlagship: false,
    },
  ],
  citations: [
    'brown1985',
    'latimer1993',
    'haeusler2013',
    'meyer2015',
    'walker1982',
    'rothschild1995',
    'lordkipanidze2005',
    'margvelashvili2013',
    'rizal2020',
    'herries2020',
    'lordkipanidze2013',
    'bramble2004',
    'smithsonian-hop',
  ],
};
