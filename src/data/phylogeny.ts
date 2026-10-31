/**
 * Competing phylogenetic hypotheses for hominin evolution.
 *
 * Paleoanthropologists actively debate key branching points—especially the origin of genus Homo
 * and the Divergence of Middle Pleistocene lineages. Rather than presenting a single dogmatic tree,
 * the atlas lets learners and clinicians toggle among three published topologies.
 */
import type { DualText, Species, SpeciesId } from './types';

export type PhylogenyHypothesisId = 'consensus' | 'sediba-homo' | 'antecessor-lca';

export interface PhylogenyHypothesis {
  id: PhylogenyHypothesisId;
  shortLabel: DualText;
  summary: DualText;
  overrides: Partial<Record<SpeciesId, { parent: SpeciesId | null; uncertain: boolean; note: string }>>;
}

export const PHYLOGENY_HYPOTHESES: readonly PhylogenyHypothesis[] = [
  {
    id: 'consensus',
    shortLabel: { kids: 'Model A · East African Homo', clinician: 'East African Early Homo + H. heidelbergensis LCA' },
    summary: {
      kids: 'Most textbooks draw early Homo branching near Lucy’s East African relatives, and show Homo heidelbergensis splitting into us, Neanderthals, and Denisovans.',
      clinician:
        'Conventional textbook synthesis: genus Homo arises in eastern Africa (~2.8 Ma, LD 350-1) from an A. afarensis-grade ancestor, while Middle Pleistocene H. heidelbergensis s.l. bridges H. erectus to H. sapiens, Neanderthals, and Denisovans.',
    },
    overrides: {},
  },
  {
    id: 'sediba-homo',
    shortLabel: { kids: 'Model B · Sediba Bridge', clinician: 'Berger et al. (2010): A. sediba Sister to Homo' },
    summary: {
      kids: 'What if southern Africa helped spark our genus? This model highlights Karabo’s species (Australopithecus sediba) as the closest cousin to early Homo.',
      clinician:
        'Tests Berger et al. (2010): cranial, pelvic, manual and dental synapomorphies group Australopithecus sediba (via an A. africanus-like ancestor predating 1.98 Ma Malapa) as sister/stem to Homo—contested on chronological grounds (LD 350-1 at ~2.8 Ma; Spoor et al. 2015).',
    },
    overrides: {
      'homo-habilis': {
        parent: 'australopithecus-sediba',
        uncertain: true,
        note: 'Under Berger et al. (2010), an older population of the A. africanus → A. sediba clade shares more derived pelvic, hand and dental traits with early Homo than A. afarensis does.',
      },
      'homo-naledi': {
        parent: 'australopithecus-sediba',
        uncertain: true,
        note: 'Alternative southern African mosaic hypothesis rooting H. naledi near the basal sediba–Homo radiation.',
      },
    },
  },
  {
    id: 'antecessor-lca',
    shortLabel: { kids: 'Model C · Pioneer LCA', clinician: 'Welker et al. (2020) Proteomics + Early Erectus Split' },
    summary: {
      kids: 'Ancient tooth proteins suggest Pioneer Man (Homo antecessor) sat right beside the shared ancestor of modern humans, Neanderthals, and Denisovans!',
      clinician:
        'Incorporates enamel palaeoproteomics (Welker et al. 2020) and Sima de los Huesos nuclear aDNA (Meyer et al. 2016): an H. antecessor-like basal clade (~950–800 ka) sits near the H. sapiens / Neanderthal–Denisovan divergence, while H. heidelbergensis represents Afro-European sister/Neanderthal-stem populations and H. floresiensis branches directly from early H. erectus or pre-erectus.',
    },
    overrides: {
      'homo-sapiens': {
        parent: 'homo-antecessor',
        uncertain: true,
        note: 'Proteomic topology (Welker et al. 2020): modern-like facial morphology in H. antecessor reflects proximity to the ~800 ka last common ancestor of H. sapiens, Neanderthals and Denisovans.',
      },
      'homo-heidelbergensis': {
        parent: 'homo-antecessor',
        uncertain: true,
        note: 'Places Middle Pleistocene Afro-European H. heidelbergensis / H. bodoensis downstream of an Early Pleistocene antecessor-grade stem.',
      },
      'homo-floresiensis': {
        parent: 'homo-habilis',
        uncertain: true,
        note: 'Argue et al. (2017) Bayesian cladistic hypothesis: LB1’s primitive wrist, foot and mandible branch from a pre-erectus (H. habilis-grade) dispersal rather than dwarfed Java H. erectus.',
      },
    },
  },
];

export function getPhylogenyHypothesis(id: PhylogenyHypothesisId): PhylogenyHypothesis {
  return PHYLOGENY_HYPOTHESES.find((h) => h.id === id) ?? PHYLOGENY_HYPOTHESES[0];
}

export function applyPhylogenyHypothesis(
  speciesList: readonly Species[],
  id: PhylogenyHypothesisId,
): Species[] {
  const hyp = getPhylogenyHypothesis(id);
  return speciesList.map((sp) => {
    const ov = hyp.overrides[sp.id];
    if (!ov) return sp;
    return { ...sp, ancestry: ov };
  });
}
