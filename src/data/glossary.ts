import type { GlossaryTerm } from './types';

/**
 * Glossary for the Hominin Atlas (owned by the data curator).
 * `kids`: one or two short sentences at about a 9-year-old reading level.
 * `clinician`: precise definition with standard terminology.
 * Sorted alphabetically by term (case-insensitive).
 */
const TERMS: GlossaryTerm[] = [
  {
    term: 'Abscess (periapical)',
    kids: 'A pocket of infection at the tip of a tooth root. It can leave a little hole in the jaw bone.',
    clinician:
      'Localised suppurative infection at the root apex, usually secondary to caries or pulp exposure; in skeletal remains it appears as a smooth-walled periapical cavity or sinus through the alveolar bone.',
  },
  {
    term: 'Acheulean',
    kids: 'A way of making stone tools, famous for big teardrop-shaped hand axes.',
    clinician:
      'Mode 2 lithic industry characterised by bifacially worked handaxes and cleavers, appearing in East Africa by ~1.75 Ma and associated with H. erectus and later Middle Pleistocene Homo.',
  },
  {
    term: 'Acromesomelic dysplasia',
    kids: 'A rare condition people are born with that makes the forearms, lower legs, hands and feet shorter.',
    clinician:
      'Genetic skeletal dysplasia with disproportionate shortening of the middle (forearm, leg) and distal (hand, foot) limb segments; the Maroteaux type is caused by biallelic NPR2 variants.',
  },
  {
    term: 'Alveolar resorption',
    kids: 'When a tooth is lost, the jaw bone around the empty hole slowly fills in and shrinks.',
    clinician:
      'Remodelling and loss of alveolar bone after tooth loss or periodontal disease. Healed, resorbed sockets indicate that the individual survived for months to years after the teeth were lost.',
  },
  {
    term: 'Amputation',
    kids: 'When part of an arm or leg is lost, by an accident or on purpose.',
    clinician:
      'Loss or removal of a distal limb segment, traumatic or surgical. In skeletal remains, a remodelled, rounded bone end indicates survival after the loss.',
  },
  {
    term: 'Ancient DNA',
    kids: 'Tiny bits of genetic code that can still be found in very old bones and teeth.',
    clinician:
      'DNA recovered from archaeological or palaeontological material; highly fragmented and chemically damaged (e.g., cytosine deamination), requiring clean-room extraction and authentication. Survives best in cold environments, up to several hundred thousand years.',
  },
  {
    term: 'Antemortem',
    kids: 'Something that happened before death, while the person was still alive.',
    clinician:
      'Occurring before death; for skeletal lesions, recognised by osteoblastic/osteoclastic response such as callus, remodelling or rounded margins.',
  },
  {
    term: 'Argon–argon dating (40Ar/39Ar)',
    kids: 'A way to find the age of volcanic ash layers. Fossils found between ash layers get their ages from them.',
    clinician:
      'Radiometric technique measuring the ratio of radiogenic 40Ar to 39Ar (produced from 39K by neutron irradiation) in volcanic minerals; dates eruptions and therefore fossils bracketed by tuffs, as in the East African Rift.',
  },
  {
    term: 'Bicondylar angle',
    kids: 'The angle of the thigh bone that brings our knees close together under our body. It helps us balance on two legs.',
    clinician:
      'Angle between the femoral shaft axis and a perpendicular to the infracondylar plane. Typically about 8–11° in humans and near 0° in chimpanzees; a high angle (valgus knee) is a developmental signal of habitual bipedal loading.',
  },
  {
    term: 'Bipedalism',
    kids: 'Walking upright on two legs, like we do.',
    clinician:
      'Habitual terrestrial locomotion on the hindlimbs; skeletal correlates include an anteriorly positioned foramen magnum, lumbar lordosis, short broad iliac blades, a valgus knee and an adducted hallux with a longitudinal arch.',
  },
  {
    term: 'Breccia',
    kids: 'Rock made of broken pieces stuck together like natural cement. Many South African fossils are trapped in it.',
    clinician:
      'Clastic rock of angular fragments cemented by calcite; cave breccias in South Africa (Sterkfontein, Swartkrans, Taung) encase much of the regional hominin record and complicate dating.',
  },
  {
    term: 'Callus',
    kids: 'The new bone that grows around a break to glue it back together while it heals.',
    clinician:
      'Reparative tissue bridging a fracture: soft (fibrocartilaginous) callus followed by woven-bone hard callus, then remodelling to lamellar bone over months to years.',
  },
  {
    term: 'Caries (dental)',
    kids: 'Tooth decay: holes in teeth made by germs that feed on food, especially sugary and starchy food.',
    clinician:
      'Progressive demineralisation of dental hard tissues by acids from bacterial fermentation of carbohydrates, producing cavitated lesions that may expose the pulp and lead to periapical infection.',
  },
  {
    term: 'Comminuted fracture',
    kids: 'A break where the bone shatters into more than two pieces.',
    clinician: 'Fracture with more than two fragments, usually from high-energy loading.',
  },
  {
    term: 'Cosmogenic nuclide dating',
    kids: 'A dating method that uses tiny changes made in rocks by rays from space.',
    clinician:
      'Dating based on isotopes produced by cosmic rays (e.g., 26Al/10Be burial dating in quartz, or authigenic 10Be/9Be in sediments). After burial, production stops and the ratio changes predictably with time.',
  },
  {
    term: 'Craniosynostosis',
    kids: 'When the seams between skull bones close too early in a baby, so the head grows into an unusual shape.',
    clinician:
      'Premature fusion of one or more cranial sutures, producing compensatory skull deformity (e.g., lambdoid synostosis causing posterior asymmetry); may be isolated or syndromic and can raise intracranial pressure.',
  },
  {
    term: 'Depressed fracture',
    kids: 'A dent in the skull where a hard hit pushed the bone inward.',
    clinician: 'Inward displacement of a segment of the cranial vault produced by focal blunt-force impact.',
  },
  {
    term: 'Disuse atrophy',
    kids: 'When a body part is not used for a long time, its bones get thin and weak.',
    clinician:
      'Loss of bone mass and cortical thickness from reduced mechanical loading (e.g., paralysis or immobilisation), producing a gracile, hypotrophic element.',
  },
  {
    term: 'Eburnation',
    kids: 'Shiny, polished bone in a joint where the soft cushion wore away and bone rubbed on bone.',
    clinician:
      'Polished, ivory-like subchondral bone surface produced by bone-on-bone contact after cartilage loss; regarded as pathognomonic of osteoarthritis in skeletal remains.',
  },
  {
    term: 'Enamel hypoplasia',
    kids: 'Thin lines or pits on teeth that show a child was sick or hungry while the teeth were growing.',
    clinician:
      'Deficiency of enamel thickness (linear grooves, pits or planes) caused by disruption of ameloblast secretion during crown formation; a non-specific indicator of systemic physiological stress in childhood.',
  },
  {
    term: 'Endocast (endocranial volume)',
    kids: 'A copy of the inside of the skull. It shows how big the brain was.',
    clinician:
      'Natural, physical or virtual cast of the endocranial cavity, used to estimate endocranial volume (in cm³, approximately brain size) and to study surface features of the brain.',
  },
  {
    term: 'ESR dating (electron spin resonance)',
    kids: 'A way to date fossil teeth by measuring tiny energy traps that slowly fill up over time.',
    clinician:
      'Trapped-charge method quantifying radiation-induced paramagnetic centres in tooth enamel; combined with U-series (US-ESR) to model uranium uptake. Useful beyond the radiocarbon range.',
  },
  {
    term: 'Exostosis',
    kids: 'An extra bump of bone growing out of a bone.',
    clinician:
      'Benign bony outgrowth from a bone surface (e.g., external auditory exostoses, post-traumatic or enthesophytic outgrowths).',
  },
  {
    term: 'External auditory exostoses',
    kids: 'Bony bumps inside the ear canal. They can block the ear and make it hard to hear.',
    clinician:
      'Broad-based lamellar bony growths of the external acoustic meatus associated with repeated cold-water or cold-wind exposure ("surfer’s ear"); occlusive lesions cause conductive hearing loss.',
  },
  {
    term: 'Fibrous dysplasia',
    kids: 'A condition where part of a bone grows with soft, stringy tissue instead of normal hard bone.',
    clinician:
      'Developmental disorder (post-zygotic GNAS activating mutations) in which normal bone and marrow are replaced by fibro-osseous tissue, causing expansile, ground-glass lesions; monostotic or polyostotic.',
  },
  {
    term: 'Foramen magnum',
    kids: 'The big hole at the bottom of the skull where the spinal cord goes through. In two-legged walkers it sits more underneath the skull.',
    clinician:
      'Opening in the occipital bone transmitting the medulla oblongata; its anterior position and horizontal orientation correlate with orthograde posture and bipedalism.',
  },
  {
    term: 'Fossil',
    kids: 'The remains or traces of a living thing from long ago, kept in rock or sediment.',
    clinician:
      'Preserved remains or traces of an organism from the geological past; bone may be mineralised (permineralised/replaced) or, in young or cold contexts, largely unaltered.',
  },
  {
    term: 'Hallux',
    kids: 'The big toe.',
    clinician: 'First digit of the foot. An adducted, non-opposable hallux is a hallmark of human-like bipedal feet; apes have an abducted, grasping hallux.',
  },
  {
    term: 'Hominin',
    kids: 'Humans and all our close relatives on our side of the family tree, after we split from chimpanzees.',
    clinician: 'Member of the tribe Hominini: modern humans and all extinct taxa more closely related to humans than to Pan.',
  },
  {
    term: 'Holotype',
    kids: 'The one special fossil that a species name is officially attached to.',
    clinician: 'The single name-bearing specimen designated when a species is described (e.g., OH 7 for Homo habilis).',
  },
  {
    term: 'Hypervitaminosis A',
    kids: 'Getting sick from eating far too much vitamin A, for example from the liver of meat-eating animals.',
    clinician:
      'Toxicity from chronic or acute excess retinol intake (e.g., carnivore liver), producing bone pain and, in chronic cases, periosteal new bone formation; proposed for KNM-ER 1808.',
  },
  {
    term: 'Insular dwarfism',
    kids: 'When big animals living on an island slowly evolve to be much smaller over many generations.',
    clinician:
      'Evolutionary reduction in body size of large-bodied lineages isolated on islands ("island rule"), attributed to limited resources and reduced predation; proposed for H. floresiensis.',
  },
  {
    term: 'Introgression',
    kids: 'When two groups have children together, so some DNA from one group ends up in the other.',
    clinician:
      'Incorporation of alleles from one population or species into another through hybridisation and backcrossing (e.g., Neanderthal and Denisovan ancestry in present-day humans).',
  },
  {
    term: 'ka and Ma',
    kids: '“ka” means thousand years ago. “Ma” means million years ago.',
    clinician: 'ka = kilo-annum (10³ years before present); Ma = mega-annum (10⁶ years). 1 Ma = 1,000 ka.',
  },
  {
    term: 'Knuckle-walking',
    kids: 'Walking on all fours while leaning on the knuckles, like chimps and gorillas do.',
    clinician: 'Quadrupedal locomotion bearing weight on the dorsal surfaces of the intermediate phalanges, characteristic of Pan and Gorilla.',
  },
  {
    term: 'Malunion',
    kids: 'A broken bone that healed crooked.',
    clinician: 'Fracture healed in a non-anatomical position (angulation, rotation or shortening), potentially altering function.',
  },
  {
    term: 'Megadontia',
    kids: 'Having really big teeth, especially the back chewing teeth.',
    clinician: 'Large postcanine tooth size relative to body size, characteristic of Paranthropus.',
  },
  {
    term: 'Mental eminence',
    kids: 'The bony chin. Only modern humans have a real one.',
    clinician: 'Triangular anterior projection of the mandibular symphysis (chin), a derived trait of Homo sapiens.',
  },
  {
    term: 'Microcephaly',
    kids: 'A condition where a person’s head and brain are much smaller than usual.',
    clinician:
      'Occipitofrontal head circumference markedly below age/sex norms, usually with reduced brain volume; primary forms are genetic. Proposed (and widely rejected) as an explanation for LB1.',
  },
  {
    term: 'Miocene',
    kids: 'A long stretch of time from about 23 to 5.3 million years ago, when apes lived in many places.',
    clinician: 'Geological epoch ~23.0–5.33 Ma; its late part includes the earliest proposed hominins (e.g., Sahelanthropus).',
  },
  {
    term: 'Mousterian',
    kids: 'A style of stone tools made by Neanderthals and some early modern humans.',
    clinician: 'Middle Palaeolithic industry of Europe and the Near East with flake tools (scrapers, points), often made with Levallois prepared-core techniques.',
  },
  {
    term: 'Myositis ossificans',
    kids: 'When a badly bruised muscle starts growing a lump of bone inside it.',
    clinician:
      'Heterotopic ossification within skeletal muscle or soft tissue, most often after trauma; matures peripherally ("zonal" pattern) and may be mistaken for a tumour.',
  },
  {
    term: 'Neoplasm',
    kids: 'A tumour: a lump of cells that keeps growing when it should not. Some are harmless, some are dangerous.',
    clinician: 'Abnormal, autonomous tissue growth; benign (e.g., osteoid osteoma, osteoma) or malignant (e.g., osteosarcoma).',
  },
  {
    term: 'Occipital bun',
    kids: 'A rounded bump at the back of the skull, common in Neanderthals.',
    clinician: 'Posterior projection of the occipital squama ("chignon"), typical of Neanderthals and present in some early modern Europeans.',
  },
  {
    term: 'Oldowan',
    kids: 'The oldest common style of stone tools: simple sharp flakes knocked off rocks.',
    clinician: 'Mode 1 lithic industry of cores and flakes, known from at least ~2.6 Ma (Gona, Ethiopia); named after Olduvai Gorge.',
  },
  {
    term: 'OSL dating (optically stimulated luminescence)',
    kids: 'A way to tell when sand grains were last in sunlight before they got buried.',
    clinician:
      'Trapped-charge method measuring luminescence released by light stimulation of quartz or feldspar grains; dates the last exposure of sediment to daylight.',
  },
  {
    term: 'Osteoarthritis',
    kids: 'When a joint wears out, so it can hurt and get stiff.',
    clinician:
      'Degenerative joint disease with cartilage loss, marginal osteophytes, subchondral sclerosis and cysts, and eburnation; reflects age, mechanical loading and other factors.',
  },
  {
    term: 'Osteoid osteoma',
    kids: 'A small, harmless bone lump that can still be quite painful.',
    clinician:
      'Benign osteoblastic tumour with a small (usually < 1.5–2 cm) radiolucent nidus and surrounding reactive sclerosis; typically in young individuals, with nocturnal pain relieved by NSAIDs.',
  },
  {
    term: 'Osteoma (peripheral)',
    kids: 'A small, slow-growing, harmless bump of extra bone, often on the jaw or skull.',
    clinician: 'Benign, slow-growing lesion of mature lamellar bone arising from the periosteal surface, most frequent in the craniofacial skeleton and jaws.',
  },
  {
    term: 'Osteophyte',
    kids: 'A little spur of extra bone that grows at the edge of a worn joint or backbone.',
    clinician: 'Marginal bony outgrowth at joint margins or vertebral body rims, associated with degenerative change.',
  },
  {
    term: 'Osteosarcoma',
    kids: 'A rare and serious kind of bone cancer.',
    clinician: 'Malignant mesenchymal tumour producing osteoid; aggressive, most common in adolescents, typically metaphyseal in long bones.',
  },
  {
    term: 'Paleopathology',
    kids: 'The study of injuries and illnesses in very old bones and bodies.',
    clinician: 'The study of disease and trauma in ancient human and animal remains, integrating skeletal, radiological, histological and molecular evidence.',
  },
  {
    term: 'Paleoproteomics',
    kids: 'Reading ancient proteins from old bones and teeth to learn who they belonged to.',
    clinician:
      'Mass-spectrometric analysis of ancient proteins (e.g., enamel, collagen); proteins survive longer than DNA and can resolve phylogenetic affinity and sex of fossils (e.g., Xiahe, Harbin, Penghu 1).',
  },
  {
    term: 'Perimortem',
    kids: 'Something that happened around the time of death.',
    clinician:
      'At or near the time of death: fracture surfaces show fresh-bone ("green bone") characteristics (sharp, oblique margins, same colour as the surrounding cortex) with no healing.',
  },
  {
    term: 'Periostitis',
    kids: 'When the thin skin around a bone gets irritated and grows a rough layer of new bone.',
    clinician: 'Periosteal inflammation producing subperiosteal new bone (periosteal reaction); a non-specific response to infection, trauma, metabolic or neoplastic processes.',
  },
  {
    term: 'Pleistocene',
    kids: 'The time of the ice ages, from about 2.6 million to 11,700 years ago.',
    clinician: 'Geological epoch ~2.58 Ma–11.7 ka, characterised by repeated glacial–interglacial cycles; spans most of the evolution of Homo.',
  },
  {
    term: 'Pliocene',
    kids: 'The time from about 5.3 to 2.6 million years ago, when Lucy’s species lived.',
    clinician: 'Geological epoch ~5.33–2.58 Ma; includes Ardipithecus ramidus and most Australopithecus species.',
  },
  {
    term: 'Postmortem',
    kids: 'Something that happened after death, like a bone breaking while buried in the ground.',
    clinician:
      'After death: taphonomic breaks typically show transverse, jagged or stepped surfaces and colour differences between the fracture surface and the surrounding cortex, with no healing.',
  },
  {
    term: 'Prognathism',
    kids: 'When the face and jaws stick out forward.',
    clinician: 'Anterior projection of the face or jaws relative to the neurocranium (e.g., subnasal or mid-facial prognathism).',
  },
  {
    term: 'Radiocarbon dating',
    kids: 'A way to date things that were once alive, up to about 50,000 years old.',
    clinician:
      'Dating by the decay of 14C (half-life ~5,730 years) in organic material; usable to ~50 ka and calibrated against independent records to calendar years.',
  },
  {
    term: 'Sagittal crest',
    kids: 'A bony ridge on top of the skull where big chewing muscles were attached.',
    clinician: 'Midline crest formed where the temporal lines of both sides meet, anchoring a hypertrophied temporalis muscle (e.g., male Paranthropus).',
  },
  {
    term: 'Schmorl’s node',
    kids: 'A small dent in a backbone where the soft cushion between backbones pushed into it.',
    clinician: 'Intravertebral herniation of the nucleus pulposus through the endplate, leaving a depression in the vertebral body surface.',
  },
  {
    term: 'Sexual dimorphism',
    kids: 'When males and females of a species look different, for example in size.',
    clinician: 'Systematic differences between the sexes in size or shape (e.g., body mass, canine size, cranial cresting).',
  },
  {
    term: 'Spondylolisthesis',
    kids: 'When one backbone slips forward over the one below it.',
    clinician:
      'Anterior displacement of a vertebral body relative to the one below, commonly L5 on S1 secondary to spondylolysis (pars interarticularis defect) or degeneration.',
  },
  {
    term: 'Stable carbon isotopes (C3/C4)',
    kids: 'Special clues in tooth enamel that show whether an animal ate mostly tree foods or mostly grasses.',
    clinician:
      'The 13C/12C ratio (δ13C) of enamel reflects the proportion of C3 (trees, shrubs, most herbs) versus C4/CAM (tropical grasses, sedges) resources consumed.',
  },
  {
    term: 'Supraorbital torus',
    kids: 'A thick bony brow ridge above the eyes.',
    clinician: 'Continuous bar of bone above the orbits, well developed in many archaic hominins (e.g., H. erectus, Neanderthals).',
  },
  {
    term: 'Taphonomy',
    kids: 'Everything that happens to a body after death until it is found as a fossil.',
    clinician:
      'Study of the processes (decay, scavenging, transport, burial, diagenesis, deformation) that affect remains after death and determine what is preserved.',
  },
  {
    term: 'Taurodontism',
    kids: 'Back teeth with a very big space inside them for the nerve, common in Neanderthals.',
    clinician: 'Enlargement of the pulp chamber with apical displacement of the root furcation in multirooted teeth.',
  },
  {
    term: 'U-series dating',
    kids: 'A way to date cave crusts, bones and teeth using uranium that slowly turns into other elements.',
    clinician:
      'Uranium-series disequilibrium dating (230Th/234U; U–Pb for older flowstones) of carbonates, bone and teeth; bone and teeth often yield minimum ages because of open-system uranium uptake.',
  },
];

export const GLOSSARY: GlossaryTerm[] = [...TERMS].sort((a, b) =>
  a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }),
);
