import type { FossilSite, Range, Species } from '../types';

// Sima de los Huesos (SH, Atapuerca) hominins are included here as early members of the Neanderthal
// lineage (Arsuaga et al. 2014; Meyer et al. 2016). Shared values for the four SH specimens:
const SH_SITE: FossilSite = { name: 'Sima de los Huesos, Sierra de Atapuerca', country: 'Spain', lat: 42.35, lon: -3.52 };
const SH_AGE: Range & { method: string | null } = {
  best: 430,
  min: null,
  max: null,
  method: 'Combined U-series (speleothem), luminescence and palaeomagnetic dating (Arsuaga et al. 2014)',
};
const SH_PLACEMENT =
  'SH is placed in the Neanderthal file because its crania and teeth show Neanderthal-derived features and its nuclear DNA groups with Neanderthals (Arsuaga et al. 2014; Meyer et al. 2016).';
const SH_COLORS: [string, string, string] = ['#d8c6a3', '#b49771', '#5e4b3a'];
const SHANIDAR_SITE: FossilSite = { name: 'Shanidar Cave', country: 'Iraq (Kurdistan Region)', lat: 36.8, lon: 44.2 };

export const species: Species = {
  id: 'homo-neanderthalensis',
  binomial: 'Homo neanderthalensis',
  common: { kids: 'Neanderthal', clinician: 'Neanderthal' },
  nickname: null,
  group: 'archaic-homo',
  status: 'extinct',
  rangeKa: { start: 430, end: 40 },
  regions: ['Europe', 'Western Asia', 'Central Asia and Siberia (Altai)'],
  brainCc: { best: null, min: 1200, max: 1750 },
  statureCm: { best: null, min: 155, max: 164 },
  massKg: { best: null, min: 54, max: 65 },
  locomotion: {
    kids: 'Walked on two legs like us. They had short, very strong bodies, good for cold places.',
    clinician:
      'Fully bipedal. Stocky body with a wide thorax and relatively short distal limb segments, consistent with cold-climate (Bergmann/Allen) adaptation and high habitual activity levels. La Chapelle-aux-Saints 1, once reconstructed as stooped, had a lumbar lordosis and pelvic incidence within the modern human range (Haeusler et al. 2019).',
  },
  diet: {
    kids: 'Lots of meat from big animals like deer, horses and mammoths, plus plants, nuts and, in some places, seafood.',
    clinician:
      'High trophic level from bone-collagen nitrogen isotopes, with substantial large-herbivore meat (Richards & Trinkaus 2009); dental calculus (e.g. Shanidar 3, Spy I and II) preserves plant microfossils, some cooked (Henry et al. 2011); site evidence documents marine resources in Iberia.',
  },
  technology: {
    kids: 'Made sharp stone tools and spears, used fire, and glued tools together with sticky tar from birch bark.',
    clinician: 'Mousterian (Middle Palaeolithic) industries with Levallois prepared-core technology, hafting with birch-tar adhesive, controlled fire and pigment use.',
  },
  overview: {
    kids: 'Neanderthals lived in Europe and Asia from about 430,000 to 40,000 years ago. They were clever, strong people who survived ice ages. They cared for injured friends, and some of their DNA lives on in many people today.',
    clinician:
      'Extinct human lineage with derived cranial (mid-facial prognathism, occipital bun, suprainiac fossa, retromolar space) and postcranial traits. In this atlas the ~430 ka Sima de los Huesos hominins are included as early members of the lineage (Arsuaga et al. 2014; Meyer et al. 2016). Disappearance ~41–39 ka cal BP (Higham et al. 2014). Healed injuries are common: Berger & Trinkaus (1995) likened the head-and-neck-biased trauma pattern to that of modern rodeo riders, whereas Beier et al. (2018), controlling for skeletal preservation, found cranial trauma prevalence similar to that of Upper Palaeolithic modern humans. A Krapina rib preserves the oldest known case of fibrous dysplasia (Monge et al. 2013). Interbred with H. sapiens (Green et al. 2010; Prüfer et al. 2014) and with Denisovans: Denisova 11 had a Neanderthal mother and a Denisovan father (Slon et al. 2018). Body-size values follow the Smithsonian Human Origins summary.',
  },
  keyTraits: {
    kids: ['Big nose and a face that pushes forward', 'Rounded brow ridges over the eyes', 'Long, low skull with a bump at the back', 'Short, very strong body'],
    clinician: [
      'Mid-facial prognathism with a large nasal aperture',
      'Double-arched supraorbital torus',
      'Occipital bun and suprainiac fossa',
      'Retromolar space; frequent taurodont molars',
      'Wide, barrel-shaped thorax; long, thin superior pubic ramus',
      'Endocranial volume ~1,200–1,750 cm³',
    ],
  },
  funFacts: [
    'The first fossil recognised as a Neanderthal was found in 1856 in the Neander Valley in Germany.',
    'Most people whose families come from outside Africa carry a small amount (around 1–2%) of Neanderthal DNA.',
    'Neanderthal brains were as big as ours, or even a little bigger on average.',
    'Shanidar 1 survived several serious injuries for many years, which suggests others helped him.',
    'A girl nicknamed “Denny” had a Neanderthal mother and a Denisovan father.',
    'The oldest members of the Neanderthal family, about 430,000 years old, come from a cave pit in Spain called the “Pit of the Bones” (Sima de los Huesos).',
  ],
  ancestry: {
    parent: 'homo-heidelbergensis',
    uncertain: true,
    note: 'Neanderthal-lineage traits appear by ~430 ka at Sima de los Huesos, whose nuclear DNA groups with Neanderthals (Meyer et al. 2016). Whether "H. heidelbergensis" is the ancestor depends on how broadly that taxon is defined.',
  },
  geneFlow: ['homo-sapiens', 'denisovans'],
  specimens: [
    // ── Shanidar 1 (flagship) ──────────────────────────────────────────────────────────────────
    {
      id: 'shanidar-1',
      catalog: 'Shanidar 1',
      nickname: 'Nandy',
      site: SHANIDAR_SITE,
      ageKa: { best: null, min: null, max: null, method: 'Middle Palaeolithic Layer D; early radiocarbon estimates (~45–50 ka) are now considered uncertain' },
      sex: 'male',
      ageAtDeath: 'Older adult',
      discovery: { year: 1957, by: 'Ralph Solecki and team' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible', 'teeth'],
        partial: ['spine', 'ribs', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'hand_L', 'pelvis', 'leg_L', 'leg_R', 'foot_L', 'foot_R'],
      },
      story: {
        kids: 'Shanidar 1 was a Neanderthal man who lived in a cave in the mountains of Iraq. He had many old injuries: a hurt left eye, a weak right arm, sore legs, and he could hardly hear. Yet he lived for many years with these problems. His group probably helped him find food and stay safe.',
        clinician:
          'Adult male with multiple healed traumatic lesions and degenerative changes (Trinkaus & Zimmerman 1982; Trinkaus 1983): healed crushing fracture of the left lateral orbit, hypotrophy of the right shoulder girdle and humerus with loss of the distal humerus, right lower-limb degenerative joint disease, and external auditory exostoses with probable hearing loss (Trinkaus & Villotte 2017). Crubézy & Trinkaus (1992) argued that some of his skeletal changes reflect diffuse idiopathic skeletal hyperostosis (DISH). Prolonged survival with these impairments is widely cited as evidence of social support.',
      },
      taphonomy: { colors: ['#d8c7a5', '#b8a17c', '#7d6748'], note: 'Light tan cave bone, broken and compacted under rock and sediment.' },
      lesions: [
        {
          id: 'shanidar-1-left-orbit',
          kind: 'healed-fracture',
          bone: 'cranium',
          site: { anchor: 'orbit-L' },
          timing: 'antemortem',
          healing: 'remodeled',
          title: { kids: 'Old injury around the left eye', clinician: 'Healed crushing fracture of the left lateral orbit' },
          summary: {
            kids: 'Long before he died, Shanidar 1 was hit hard on the left side of his face. The bones around his left eye healed, but he may not have been able to see well with that eye.',
            clinician:
              'Healed, remodelled crushing injury of the left lateral orbital margin and adjacent zygomatic/frontal region with deformation of the orbit, probably affecting vision in the left eye (Trinkaus & Zimmerman 1982; Trinkaus 1983).',
          },
          clinical: {
            morphology: 'Remodelled deformation of the left lateral orbital wall and margin with healed fracture lines; no active bone reaction.',
            differential: ['Healed blunt-force (crushing) trauma'],
            modernAnalogue: 'Malunited lateral orbital wall / zygomatico-orbital fracture.',
            functionalImpact: 'Probable reduced or lost vision in the left eye (inferred).',
            survivalInterval: 'Years (fully remodelled).',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['trinkaus1982', 'trinkaus1983'],
          render: { severity: 0.5, radiusMm: 15, pattern: 'compression' },
        },
        {
          id: 'shanidar-1-right-humerus',
          kind: 'amputation',
          bone: 'humerus_R',
          site: { t: 0.8, azimuthDeg: 0 },
          timing: 'antemortem',
          healing: 'remodeled',
          title: { kids: 'Weak right arm that ended above the elbow', clinician: 'Hypotrophic right humerus with healed loss of the distal segment' },
          summary: {
            kids: 'His right arm bone was thin and weak, and it ended in a healed stump above the elbow. He may have lost his lower arm after a bad injury. He lived for a long time afterwards.',
            clinician:
              'The right humerus is markedly hypotrophic, with healed fracture(s) and a healed distal end proximal to the elbow, indicating loss of the distal humerus and forearm long before death (Trinkaus & Zimmerman 1982; Trinkaus 1983). The right clavicle and scapula are hypotrophic as well (see those lesions).',
          },
          clinical: {
            morphology: 'Gracile, hypotrophic diaphysis with remodelled fracture changes and a rounded, healed distal stump; no forearm elements present.',
            differential: [
              'Traumatic amputation, or deliberate amputation after injury (Trinkaus 1983)',
              'Non-united fracture with loss of the distal segment',
              'Disuse atrophy secondary to nerve injury (possibly related to the cranial trauma)',
            ],
            modernAnalogue: 'Healed transhumeral amputation stump with disuse atrophy of the limb.',
            functionalImpact: 'Loss of use of the right forearm and hand (inferred).',
            survivalInterval: 'Years (remodelled).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['trinkaus1982', 'trinkaus1983'],
          render: { severity: 0.8, pattern: 'transverse' },
        },
        {
          id: 'shanidar-1-right-clavicle',
          kind: 'atrophy',
          bone: 'clavicle_R',
          site: { t: 0.5, azimuthDeg: 0 },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'Thin right collarbone', clinician: 'Hypotrophy of the right clavicle' },
          summary: {
            kids: 'His right collarbone stayed thin and weak because he could not use his right arm much.',
            clinician:
              'The right clavicle is markedly smaller and more gracile than the left, part of the hypotrophy of the whole right shoulder girdle and arm that accompanies the injured right humerus (Trinkaus & Zimmerman 1982; Trinkaus 1983).',
          },
          clinical: {
            morphology: 'Reduced size and robusticity of the right clavicle relative to the left.',
            differential: ['Disuse after severe right-arm injury', 'Peripheral nerve (brachial plexus) injury', 'Childhood-onset hypoplasia of the limb'],
            modernAnalogue: 'Disuse hypotrophy of a non-functional upper limb.',
            functionalImpact: 'Little or no functional use of the right arm (inferred).',
            survivalInterval: 'Years.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['trinkaus1982', 'trinkaus1983'],
          render: { severity: 0.5 },
        },
        {
          id: 'shanidar-1-right-scapula',
          kind: 'atrophy',
          bone: 'scapula_R',
          site: { anchor: 'blade' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'Small right shoulder blade', clinician: 'Hypotrophy of the right scapula' },
          summary: {
            kids: 'His right shoulder blade was smaller than the left one, because his right arm did not work well.',
            clinician:
              'The right scapula is hypotrophic relative to the left, matching the atrophy of the right clavicle and humerus (Trinkaus & Zimmerman 1982; Trinkaus 1983).',
          },
          clinical: {
            morphology: 'Reduced size and robusticity of the right scapula relative to the left.',
            differential: ['Disuse after severe right-arm injury', 'Peripheral nerve (brachial plexus) injury', 'Childhood-onset hypoplasia of the limb'],
            modernAnalogue: 'Disuse hypotrophy of the shoulder girdle.',
            functionalImpact: 'Weak or non-functional right shoulder (inferred).',
            survivalInterval: 'Years.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['trinkaus1982', 'trinkaus1983'],
          render: { severity: 0.5 },
        },
        {
          id: 'shanidar-1-right-ear-exostoses',
          kind: 'exostosis',
          bone: 'cranium',
          site: { anchor: 'ear-R' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'Bony bumps blocking the ear', clinician: 'External auditory exostoses, right external acoustic meatus' },
          summary: {
            kids: 'Little bony bumps grew inside his ear canal and almost closed it. He probably could not hear well.',
            clinician:
              'Advanced external auditory exostoses narrowing/occluding the right external acoustic meatus, with less advanced exostoses on the left, implying significant conductive hearing loss (Trinkaus & Villotte 2017).',
          },
          clinical: {
            morphology: 'Broad-based, lamellar bony outgrowths within the external acoustic meatus, severely narrowing the canal.',
            differential: ['External auditory exostoses (EAE)', 'Osteoma of the external auditory canal'],
            modernAnalogue: 'Surfer’s ear (EAE), associated with repeated exposure to cold water or wind; causes conductive hearing loss when occlusive.',
            functionalImpact: 'Probable substantial conductive hearing loss (inferred).',
            survivalInterval: null,
          },
          evidence: 'established',
          debateNote: null,
          citations: ['trinkaus2017'],
          render: { severity: 0.7, radiusMm: 4 },
        },
      ],
      citations: ['trinkaus1982', 'trinkaus1983', 'trinkaus2017', 'crubezy1992'],
      isFlagship: true,
    },

    // ── Shanidar 3 ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'shanidar-3',
      catalog: 'Shanidar 3',
      nickname: null,
      site: SHANIDAR_SITE,
      ageKa: { best: null, min: null, max: null, method: 'Mousterian Layer D of Shanidar Cave; not directly dated (chronology under revision)' },
      sex: 'male',
      ageAtDeath: 'Adult',
      discovery: { year: 1957, by: 'Ralph Solecki and team' },
      completeness: { percent: null, found: ['rib_L9'], partial: ['ribs', 'spine'] },
      story: {
        kids: 'This Neanderthal man lived in Shanidar Cave in the mountains of northern Iraq. One of his left ribs has a narrow wound made by something sharp. New bone had started to grow around it, so he lived for some weeks after he was hurt. Scientists are still not sure who or what made the wound.',
        clinician:
          'Adult male from Layer D of Shanidar Cave (Solecki excavations). The left 9th rib carries a penetrating sharp-force lesion with early bony repair, indicating survival for at least several weeks. Experimental comparisons led Churchill et al. (2009) to favour a low-kinetic-energy thrown weapon over a thrusting spear or an accident; the identity of the attacker cannot be determined. Starch grains and phytoliths in his dental calculus, some with cooking damage, show that he ate plant foods (Henry et al. 2011).',
      },
      taphonomy: { colors: ['#c4a47c', '#9b7b56', '#4f3b29'], note: 'Light brown, fragmentary cave bone.' },
      lesions: [
        {
          id: 'shanidar-3-left-rib-9',
          kind: 'projectile-wound',
          bone: 'rib_L9',
          site: { t: 0.5, azimuthDeg: 90 },
          timing: 'antemortem',
          healing: 'early',
          title: { kids: 'A healing wound on a rib', clinician: 'Penetrating sharp-force lesion, left 9th rib (partially healed)' },
          summary: {
            kids: 'Something sharp went in between his ribs on the left side and cut one rib. New bone started to grow around the cut, so he lived for weeks afterwards.',
            clinician:
              'Penetrating sharp-force injury of the left 9th rib with early reparative bone at the wound margins, indicating survival for at least several weeks. Churchill et al. (2009) found the damage most consistent with a low-kinetic-energy projectile (thrown spear or dart); weapon type and attacker remain inferences. Hotspot position along the rib is approximate.',
          },
          clinical: {
            morphology: 'Narrow penetrating defect in the left 9th rib made by a sharp object, with partial healing (new bone at the margins) but no complete repair.',
            differential: [
              'Thrown spear or dart (favoured by Churchill et al. 2009)',
              'Hand-delivered thrusting or stabbing weapon',
              'Accidental impalement on a sharp object',
            ],
            modernAnalogue: 'Penetrating chest-wall injury (stab or projectile wound) of the lower thorax.',
            functionalImpact: 'Not measurable from bone; chest pain and possible lung injury are inferred, not observed.',
            survivalInterval: 'At least several weeks (partial healing).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['churchill2009', 'trinkaus1983'],
          render: { severity: 0.5, count: 1 },
        },
      ],
      citations: ['churchill2009', 'trinkaus1983', 'henry2011'],
      isFlagship: false,
    },

    // ── La Chapelle-aux-Saints 1 ───────────────────────────────────────────────────────────────
    {
      id: 'la-chapelle-aux-saints-1',
      catalog: 'La Chapelle-aux-Saints 1',
      nickname: 'The Old Man',
      site: { name: 'Bouffia Bonneval, La Chapelle-aux-Saints', country: 'France', lat: 45.0, lon: 1.7 },
      ageKa: { best: null, min: null, max: null, method: null },
      sex: 'male',
      ageAtDeath: 'Older adult',
      discovery: { year: 1908, by: 'Abbés Amédée and Jean Bouyssonie and Louis Bardon' },
      completeness: {
        percent: null,
        found: ['cranium', 'mandible'],
        partial: ['spine', 'ribs', 'pelvis', 'arm_L', 'arm_R', 'leg_L', 'leg_R', 'hand_L', 'hand_R', 'foot_L', 'foot_R'],
      },
      story: {
        kids: 'In 1908, this Neanderthal man was found lying in a small pit in a cave in France. He had lost most of his teeth, and his back and hip joints were worn and sore. An early scientist wrongly drew him as a bent-over brute. Newer studies show he stood upright, just like us.',
        clinician:
          "Older adult male discovered in 1908 and monographed by Marcellin Boule (1911–1913), whose stooped, flexed-knee reconstruction shaped the 'brutish Neanderthal' stereotype. Re-analyses attribute some of his features to pathology, including extensive antemortem tooth loss and degenerative joint disease of the spine and hip, and show a lumbar lordosis and pelvic incidence within the modern human range (Trinkaus 1985; Haeusler et al. 2019). Rendu et al. (2014) argued for an intentional burial; Dibble et al. (2015) disputed it.",
      },
      taphonomy: { colors: ['#8a6a48', '#5f4732', '#2e2219'], note: 'Dark brown cave fossil with darker mottling.' },
      lesions: [
        {
          id: 'la-chapelle-aux-saints-1-tooth-loss',
          kind: 'tooth-loss',
          bone: 'mandible',
          site: { anchor: 'mandible-body-R' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'Lost teeth', clinician: 'Extensive antemortem tooth loss with alveolar resorption' },
          summary: {
            kids: 'He lost most of his teeth long before he died. Bone filled in the holes where the teeth had been, so he lived without them for a long time.',
            clinician:
              'Most teeth were lost antemortem in both jaws; the sockets are healed and the alveolar processes resorbed, implying prolonged survival after the losses (Trinkaus 1985). The loss is bilateral; the hotspot sits on the right mandibular body for display.',
          },
          clinical: {
            morphology: 'Healed, resorbed alveolar margins in the maxilla and mandible, with only a few teeth retained.',
            differential: ['Periodontal disease', 'Heavy occlusal wear with pulp exposure and periapical infection'],
            modernAnalogue: 'Partial edentulism with alveolar ridge resorption.',
            functionalImpact: 'Reduced chewing ability (inferred).',
            survivalInterval: 'Long-term (sockets fully remodelled).',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['trinkaus1985'],
          render: { severity: 0.8 },
        },
      ],
      citations: ['trinkaus1985', 'haeusler2019', 'rendu2014', 'dibble2015'],
      isFlagship: false,
    },

    // ── Kebara 2 ───────────────────────────────────────────────────────────────────────────────
    {
      id: 'kebara-2',
      catalog: 'Kebara 2',
      nickname: 'Moshe',
      site: { name: 'Kebara Cave, Mount Carmel', country: 'Israel', lat: 32.56, lon: 34.94 },
      ageKa: { best: 60, min: null, max: null, method: 'Thermoluminescence on burnt flints from the burial layer (Valladas et al. 1987)' },
      sex: 'male',
      ageAtDeath: 'Adult',
      discovery: { year: 1983, by: 'Excavation team led by Ofer Bar-Yosef and Bernard Vandermeersch' },
      completeness: {
        percent: null,
        found: ['mandible', 'teeth_lower', 'hyoid', 'spine', 'ribs', 'pelvis', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R'],
        partial: ['hand_L', 'hand_R'],
      },
      story: {
        kids: 'This Neanderthal man was buried in Kebara Cave in Israel about 60,000 years ago. His skull is missing, but his backbone, ribs and hips are beautifully preserved. He even kept his small tongue bone, which looks a lot like ours.',
        clinician:
          "Adult male; the most complete Neanderthal axial skeleton (vertebral column, thorax and pelvis) with the mandible, but lacking the cranium and most of the lower limbs. Its hyoid, the first known for a Neanderthal, closely resembles modern human hyoids (Arensburg et al. 1989), and micro-CT with finite-element analysis suggests modern-like internal micro-biomechanics (D'Anastasio et al. 2013). A modern-like hyoid is compatible with speech but does not prove it.",
      },
      taphonomy: { colors: ['#d3c09e', '#a98f6b', '#5b4a37'], note: 'Pale tan bone from a cave burial; cranium absent.' },
      lesions: [],
      citations: ['arensburg1989', 'danastasio2013', 'valladas1987'],
      isFlagship: false,
    },

    // ── Feldhofer 1 (holotype) ─────────────────────────────────────────────────────────────────
    {
      id: 'feldhofer-1',
      catalog: 'Feldhofer 1 (Neanderthal 1)',
      nickname: 'Feldhofer Neanderthal',
      site: { name: 'Kleine Feldhofer Grotte, Neander Valley', country: 'Germany', lat: 51.23, lon: 6.95 },
      ageKa: {
        best: 40,
        min: 39,
        max: 41,
        method: 'Direct AMS radiocarbon dating of the bone (Schmitz et al. 2002): about 40,000 radiocarbon years BP, uncalibrated',
      },
      sex: 'male',
      ageAtDeath: 'Adult (~40–45 years)',
      discovery: { year: 1856, by: 'Quarry workers; recognised by Johann Carl Fuhlrott' },
      completeness: {
        percent: null,
        found: ['clavicle_R', 'scapula_R', 'humerus_L', 'humerus_R', 'ulna_L', 'ulna_R', 'radius_R', 'femur_L', 'femur_R'],
        partial: ['cranium', 'pelvis_L', 'ribs'],
      },
      story: {
        kids: "In 1856, quarry workers in Germany's Neander Valley found old bones in a small cave. They became the first fossils to be named Neanderthal! Because his left forearm had healed crookedly from an old break, one famous 19th-century doctor mistakenly thought the whole skeleton was just a sick modern person. Much later, scientists found the discarded cave dirt and refitted more pieces of the very same skeleton.",
        clinician:
          'Holotype of Homo neanderthalensis King, 1864: a calotte and postcranial bones recovered by quarrymen in 1856, recognised by J. C. Fuhlrott and described by H. Schaaffhausen. Historically famous in paleopathology: Rudolf Virchow (1872) misattributed its archaic morphology to rickets and trauma after observing the genuinely healed left elbow injury. The first Neanderthal mtDNA sequence came from this skeleton (Krings et al. 1997), and re-excavation of discarded quarry sediments in 1997–2000 yielded refitting cranial/limb fragments and direct AMS 14C dates around 40 ka BP (Schmitz et al. 2002).',
      },
      taphonomy: { colors: ['#9a7650', '#6c5036', '#33261a'], note: 'Brown cave loam bone with dendritic manganese staining.' },
      lesions: [
        {
          id: 'feldhofer-1-left-ulna',
          kind: 'healed-fracture',
          bone: 'ulna_L',
          site: { t: 0.18, azimuthDeg: 90 },
          timing: 'antemortem',
          healing: 'remodeled',
          title: {
            kids: 'Healed broken left elbow bone',
            clinician: 'Healed fracture of the left proximal ulna / olecranon with secondary elbow osteoarthritis',
          },
          summary: {
            kids: 'He broke his left forearm near the elbow years before he died. It healed with a bump and stiffened his elbow, making his left arm thinner than his muscular right arm.',
            clinician:
              'Well-remodelled antemortem fracture of the left coronoid/olecranon region of the proximal ulna with widening of the trochlear notch, osteophytic lipping of the elbow joint, and diaphyseal hypotrophy of the left humerus relative to the hypertrophied right humerus (Berger & Trinkaus 1995; Schmitz et al. 2002).',
          },
          clinical: {
            morphology:
              'Deformed, widened trochlear notch of the left ulna with healed callus remodelling, marginal osteophytes and eburnation/degenerative joint changes across the left humeroulnar articulation, accompanied by left humeral gracility.',
            differential: [
              'Healed traumatic intra-articular fracture/dislocation of the left proximal ulna (olecranon/coronoid)',
              'Childhood/adolescent fall onto an outstretched or flexed left elbow',
            ],
            modernAnalogue: 'Malunited intra-articular olecranon fracture complicated by post-traumatic elbow osteoarthritis and restricted extension.',
            functionalImpact: 'Limited full extension/supination of the left elbow and reduced left-arm loading, compensated by marked right-arm hypertrophy.',
            survivalInterval: 'Many years (complete cortical remodelling and chronic unilateral disuse asymmetry).',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['schmitz2002', 'berger1995b'],
          render: { severity: 0.6, angulationDeg: 12 },
        },
      ],
      citations: ['schmitz2002', 'krings1997', 'berger1995b'],
      isFlagship: false,
    },

    // ── Sima de los Huesos Cranium 17 ──────────────────────────────────────────────────────────
    {
      id: 'sh-cranium-17',
      catalog: 'SH Cranium 17',
      nickname: null,
      site: SH_SITE,
      ageKa: SH_AGE,
      sex: 'unknown',
      ageAtDeath: 'Adult',
      discovery: { year: null, by: 'Atapuerca research team' },
      completeness: { percent: null, found: [], partial: ['cranium'] },
      story: {
        kids: 'This skull comes from a deep cave pit in Spain called the Pit of the Bones. The people found there lived about 430,000 years ago and were early members of the Neanderthal family. This person has two breaks in the forehead that never healed. Scientists think another person caused them. Sadly, this person did not survive.',
        clinician: `Adult cranium of undetermined sex, reassembled from fragments recovered over many excavation seasons. Two perimortem penetrating fractures on the left frontal bone, similar in shape and size but with different trajectories, are interpreted as two blows with the same object in face-to-face conflict, the earliest proposed case of lethal interpersonal violence in the hominin record (Sala et al. 2015). The authors also argue that the body was deliberately placed in the shaft. ${SH_PLACEMENT}`,
      },
      taphonomy: { colors: SH_COLORS, note: 'Pale cream bone from the clay at the bottom of a cave shaft; reassembled from many fragments.' },
      lesions: [
        {
          id: 'sh-cranium-17-left-frontal-fractures',
          kind: 'depressed-fracture',
          bone: 'cranium',
          site: { anchor: 'frontal-L' },
          timing: 'perimortem',
          healing: 'none',
          title: { kids: 'Two breaks in the forehead', clinician: 'Two perimortem penetrating fractures, left frontal bone' },
          summary: {
            kids: 'There are two holes above the left eye. The bone never healed, so they happened around the time this person died.',
            clinician:
              'Two perimortem fractures of the left frontal bone without healing; similar outline and size but different orientations, consistent with two separate impacts by the same object. Either blow was probably lethal (Sala et al. 2015).',
          },
          clinical: {
            morphology:
              'Two penetrating fracture defects of similar outline and size on the left side of the frontal squama above the orbit, with different implied trajectories and no healing response.',
            differential: [
              'Accidental injury from a fall into the shaft (considered unlikely by Sala et al. 2015)',
              'Postmortem breakage by rockfall or sediment pressure (rejected: perimortem fracture characteristics)',
            ],
            modernAnalogue: 'Repeated blunt-force penetrating skull fractures (forensic pattern of intentional blows).',
            functionalImpact: null,
            survivalInterval: 'None (perimortem; either blow probably fatal).',
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['sala2015'],
          render: { severity: 0.8, count: 2 },
        },
      ],
      citations: ['sala2015', 'arsuaga2014', 'meyer2016'],
      isFlagship: false,
    },

    // ── Sima de los Huesos Cranium 14 ("Benjamina") ────────────────────────────────────────────
    {
      id: 'sh-cranium-14',
      catalog: 'SH Cranium 14',
      nickname: 'Benjamina',
      site: SH_SITE,
      ageKa: SH_AGE,
      sex: 'unknown',
      ageAtDeath: 'Child',
      discovery: { year: null, by: 'Atapuerca research team' },
      completeness: { percent: null, found: [], partial: ['cranium'] },
      story: {
        kids: "This skull belonged to a child that scientists nicknamed Benjamina. A baby's skull bones are joined by soft seams so the head can grow. In this child, one seam at the back closed too early, so the head grew lopsided. Benjamina still lived for several years. This child lived about 430,000 years ago and was an early member of the Neanderthal family.",
        clinician: `Child cranium with lambdoid single-suture craniosynostosis, the earliest known human case (Gracia et al. 2009). Premature closure of one lambdoid suture produced cranial asymmetry; raised intracranial pressure and cognitive effects are possible but cannot be measured. The authors used survival into childhood to argue that the child was cared for by the group. ${SH_PLACEMENT}`,
      },
      taphonomy: { colors: SH_COLORS, note: 'Pale cream bone from the clay at the bottom of a cave shaft.' },
      lesions: [
        {
          id: 'sh-cranium-14-lambdoid-craniosynostosis',
          kind: 'developmental',
          bone: 'cranium',
          site: { anchor: 'occipital' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'A skull seam that closed too early', clinician: 'Lambdoid single-suture craniosynostosis' },
          summary: {
            kids: 'One seam at the back of the skull closed too soon. The head grew lopsided as the child got bigger.',
            clinician: 'Premature fusion of one lambdoid suture (single-suture craniosynostosis) with compensatory asymmetry of the cranial vault (Gracia et al. 2009).',
          },
          clinical: {
            morphology: 'Obliteration of one lambdoid suture with associated asymmetry of the cranial vault.',
            differential: ['Deformational (positional) plagiocephaly without synostosis', 'Postmortem (taphonomic) deformation'],
            modernAnalogue: 'Unilateral lambdoid craniosynostosis (rare; posterior plagiocephaly).',
            functionalImpact: 'Possible raised intracranial pressure and developmental delay (not measurable from the fossil).',
            survivalInterval: 'Survived into childhood.',
          },
          evidence: 'established',
          debateNote: null,
          citations: ['gracia2009'],
          render: { severity: 0.5 },
        },
      ],
      citations: ['gracia2009', 'arsuaga2014', 'meyer2016'],
      isFlagship: false,
    },

    // ── Sima de los Huesos Cranium 5 ("Miguelón") ──────────────────────────────────────────────
    {
      id: 'sh-cranium-5',
      catalog: 'SH Cranium 5',
      nickname: 'Miguelón',
      site: SH_SITE,
      ageKa: SH_AGE,
      sex: 'unknown',
      ageAtDeath: 'Adult',
      discovery: { year: 1992, by: 'Atapuerca research team (J. L. Arsuaga and colleagues)' },
      completeness: { percent: null, found: ['cranium'], partial: ['teeth_upper'] },
      story: {
        kids: 'Scientists nicknamed this skull Miguelón. It is one of the most complete fossil skulls ever found, and it is about 430,000 years old. One of the upper teeth broke, and an infection spread into the bone around it. It probably made this person very sick. Miguelón was an early member of the Neanderthal family.',
        clinician: `Adult cranium, among the most complete in the hominin fossil record (Arsuaga et al. 1993). The maxilla shows a severe antemortem dento-alveolar infection spreading from a damaged tooth into the surrounding bone (Pérez et al. 1997); a contribution to death has been suggested but cannot be demonstrated. ${SH_PLACEMENT}`,
      },
      taphonomy: { colors: ['#d1b48a', '#a9875f', '#5a4532'], note: 'Light orange-brown, nearly complete skull from the Pit of the Bones.' },
      lesions: [
        {
          id: 'sh-cranium-5-maxillary-infection',
          kind: 'infection',
          bone: 'cranium',
          site: { anchor: 'palate' },
          timing: 'antemortem',
          healing: null,
          title: { kids: 'An infected tooth', clinician: 'Dento-alveolar infection with osteitis of the maxilla' },
          summary: {
            kids: 'One of the upper teeth broke. Germs got in and made a sore spot that spread into the jawbone.',
            clinician:
              'Antemortem infection originating from a damaged maxillary tooth, with an alveolar abscess and inflammatory bone changes extending into the maxilla (Pérez et al. 1997). The hotspot marks the upper jaw generally; the side is not encoded here.',
          },
          clinical: {
            morphology: 'Destructive and inflammatory changes of the maxillary alveolar process around a damaged tooth, consistent with a periapical abscess spreading into adjacent bone.',
            differential: ['Periapical abscess after dental trauma or heavy wear', 'Postmortem damage to the alveolar bone'],
            modernAnalogue: 'Odontogenic infection with maxillary osteitis (untreated dental abscess).',
            functionalImpact: 'Pain and possible systemic illness (inferred); a role in death has been suggested but cannot be demonstrated.',
            survivalInterval: null,
          },
          evidence: 'probable',
          debateNote: null,
          citations: ['perez1997'],
          render: { severity: 0.6 },
        },
      ],
      citations: ['arsuaga1993', 'perez1997', 'arsuaga2014', 'meyer2016'],
      isFlagship: false,
    },

    // ── Sima de los Huesos Pelvis 1 ("Elvis") ──────────────────────────────────────────────────
    {
      id: 'sh-pelvis-1',
      catalog: 'SH Pelvis 1',
      nickname: 'Elvis',
      site: SH_SITE,
      ageKa: SH_AGE,
      sex: 'male',
      ageAtDeath: 'Older adult (estimated over 45 years)',
      discovery: { year: null, by: 'Atapuerca research team' },
      completeness: { percent: null, found: ['pelvis', 'lumbar'], partial: [] },
      story: {
        kids: 'Scientists nicknamed this hip bone Elvis, after a singer who was famous for moving his hips! It belonged to an older man who lived about 430,000 years ago, an early member of the Neanderthal family. The bones of his lower back were worn and had slipped, so his back probably hurt and he may have stood bent forward.',
        clinician: `The most complete Middle Pleistocene human pelvis, associated with a lumbar spine, from an aged individual (Bonmatí et al. 2010). The authors describe lumbar kyphosis, spondylolisthesis and Baastrup disease ("kissing spines") and infer chronic low-back pain and a forward-flexed posture. No lesion hotspot is placed because the affected segment levels are not encoded here. ${SH_PLACEMENT}`,
      },
      taphonomy: { colors: SH_COLORS, note: 'Pale cream bone from the clay at the bottom of a cave shaft.' },
      lesions: [],
      citations: ['bonmati2010', 'arsuaga2014', 'meyer2016'],
      isFlagship: false,
    },
  ],
  citations: [
    'arsuaga2014',
    'meyer2016',
    'higham2014',
    'green2010',
    'prufer2014',
    'slon2018',
    'trinkaus1983',
    'schmitz2002',
    'krings1997',
    'smithsonian-hop',
    'berger1995b',
    'beier2018',
    'haeusler2019',
    'richards2009',
    'henry2011',
    'monge2013',
  ],
};
