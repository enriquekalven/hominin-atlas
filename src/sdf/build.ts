/**
 * Bone build dispatcher: (species | morph, bone id, quality, lesions) -> SDF + bounds + markers.
 * Runs inside mesh workers (and the dev harness). Pure and deterministic.
 */
import type { AABB, SDF } from './core';
import { blendParams, PRESETS, type MorphParams } from '../morph/params';
import { computeLayout, type Layout } from './layout';
import { buildSkull, projectToSurface, type SkullGeometry } from './skull';
import * as pc from './postcrania';
import { applyLesions, type LesionMarker } from './lesions';
import type { Lesion, SpeciesId } from '../data/types';

export type Quality = 'high' | 'preview' | 'lineup';
export type MaterialKind = 'bone' | 'enamel' | 'cartilage';

export interface BuildRequest {
  speciesId: SpeciesId;
  boneId: string;
  quality: Quality;
  /** All lesions of the displayed specimen (skull parts need teeth info from other bones). */
  lesions: readonly Lesion[];
  healingT: number;
  morph?: { toSpeciesId: SpeciesId; t: number } | null;
}

export interface BuiltBone {
  sdf: SDF;
  bounds: AABB;
  voxel: number;
  markers: LesionMarker[];
  tag: ((x: number, y: number, z: number) => number) | null;
  material: MaterialKind;
}

const QUALITY_SCALE: Record<Quality, number> = { high: 1, preview: 2.3, lineup: 3.4 };

const layoutCache = new Map<string, { params: MorphParams; layout: Layout }>();
const skullCache = new Map<string, SkullGeometry>();

function paramsKey(req: Pick<BuildRequest, 'speciesId' | 'morph'>): string {
  return req.morph ? `${req.speciesId}>${req.morph.toSpeciesId}@${req.morph.t.toFixed(3)}` : req.speciesId;
}

export function getModel(req: Pick<BuildRequest, 'speciesId' | 'morph'>): { params: MorphParams; layout: Layout } {
  const key = paramsKey(req);
  let hit = layoutCache.get(key);
  if (!hit) {
    const params = req.morph ? blendParams(PRESETS[req.speciesId], PRESETS[req.morph.toSpeciesId], req.morph.t) : PRESETS[req.speciesId];
    hit = { params, layout: computeLayout(params) };
    if (layoutCache.size > 24) layoutCache.clear();
    layoutCache.set(key, hit);
  }
  return hit;
}

/** Teeth affected by dental lesions (FDI numbers). */
export function dentalSets(lesions: readonly Lesion[]): { missing: Set<number>; caries: Set<number> } {
  const missing = new Set<number>();
  const caries = new Set<number>();
  for (const l of lesions) {
    const teeth = l.site.teeth ?? [];
    if (l.kind === 'tooth-loss') {
      if (teeth.length) teeth.forEach((t) => missing.add(t));
      else {
        const sev = l.render?.severity ?? 0.5;
        const quadrants = l.bone === 'teeth_upper' || l.bone === 'cranium' ? [1, 2] : l.bone === 'teeth_lower' || l.bone === 'mandible' ? [3, 4] : [1, 2, 3, 4];
        const fromTooth = sev > 0.85 ? 1 : sev > 0.6 ? 4 : 6;
        for (const q of quadrants) for (let n = fromTooth; n <= 8; n++) missing.add(q * 10 + n);
      }
    } else if (l.kind === 'dental-disease' && teeth.length) {
      teeth.forEach((t) => caries.add(t));
    }
  }
  return { missing, caries };
}

function skullFor(req: BuildRequest, params: MorphParams): SkullGeometry {
  const { missing, caries } = dentalSets(req.lesions);
  const key = `${paramsKey(req)}|${[...missing].sort().join(',')}|${[...caries].sort().join(',')}`;
  let sk = skullCache.get(key);
  if (!sk) {
    sk = buildSkull(params.skull, { missingTeeth: missing, cariesTeeth: caries });
    if (skullCache.size > 12) skullCache.clear();
    skullCache.set(key, sk);
  }
  return sk;
}

function skullBuild(sk: SkullGeometry, part: 'cranium' | 'mandible' | 'teeth_upper' | 'teeth_lower'): pc.BoneBuild {
  const sdf = part === 'cranium' ? sk.cranium : part === 'mandible' ? sk.mandible : part === 'teeth_upper' ? sk.teethUpper : sk.teethLower;
  const bounds = part === 'cranium' ? sk.bounds.cranium : part === 'mandible' ? sk.bounds.mandible : part === 'teeth_upper' ? sk.bounds.teethUpper : sk.bounds.teethLower;
  const anchors: Record<string, [number, number, number]> = {};
  for (const [k, v] of Object.entries(sk.anchors)) {
    const isMand = k.startsWith('mandible');
    if ((part === 'mandible') === isMand) anchors[k] = [v[0], v[1], v[2]];
  }
  return { sdf, bounds, voxel: part.startsWith('teeth') ? 0.0007 * sk.scale : 0.00135 * sk.scale, anchors };
}

function leftId(id: string): string {
  return id.replace(/_R(\d*)$/, '_L$1');
}

export function baseBuild(req: BuildRequest, params: MorphParams, layout: Layout, shaftScale = 1): { build: pc.BoneBuild; material: MaterialKind } {
  const id = req.boneId;
  const ctx: pc.BuildCtx = { body: params.body, layout, detail: req.quality === 'high', shaftScale };
  if (id === 'cranium' || id === 'mandible' || id === 'teeth_upper' || id === 'teeth_lower') {
    return { build: skullBuild(skullFor(req, params), id), material: id.startsWith('teeth') ? 'enamel' : 'bone' };
  }
  if (id === 'costal_cartilage' || id === 'costal_cartilage_R') return { build: pc.cartilageBone(ctx), material: 'cartilage' };
  if (id === 'hyoid') return { build: pc.hyoid(ctx), material: 'bone' };
  if (id === 'sacrum') return { build: pc.sacrum(ctx), material: 'bone' };
  if (id === 'coccyx') return { build: pc.coccyx(ctx), material: 'bone' };
  if (id === 'sternum') return { build: pc.sternumBone(ctx), material: 'bone' };
  if (id.startsWith('vert_')) {
    const spec = layout.vertebrae.get(id);
    if (!spec) throw new Error(`no vertebra ${id}`);
    return { build: pc.vertebra(ctx, spec), material: 'bone' };
  }
  const L = leftId(id);
  const rib = /^rib_L(\d+)$/.exec(L);
  if (rib) {
    const spec = layout.ribs.get(Number(rib[1]));
    if (!spec) throw new Error(`no rib ${id}`);
    return { build: pc.rib(ctx, spec), material: 'bone' };
  }
  const base = L.replace(/_L\d*$/, '');
  switch (base) {
    case 'clavicle': return { build: pc.clavicle(ctx), material: 'bone' };
    case 'scapula': return { build: pc.scapula(ctx), material: 'bone' };
    case 'humerus': return { build: pc.humerus(ctx), material: 'bone' };
    case 'radius': return { build: pc.radius(ctx), material: 'bone' };
    case 'ulna': return { build: pc.ulna(ctx), material: 'bone' };
    case 'carpals': return { build: pc.carpals(ctx), material: 'bone' };
    case 'pelvis': return { build: pc.osCoxae(ctx), material: 'bone' };
    case 'femur': return { build: pc.femur(ctx), material: 'bone' };
    case 'patella': return { build: pc.patella(ctx), material: 'bone' };
    case 'tibia': return { build: pc.tibia(ctx), material: 'bone' };
    case 'fibula': return { build: pc.fibula(ctx), material: 'bone' };
    case 'talus': return { build: pc.talus(ctx), material: 'bone' };
    case 'calcaneus': return { build: pc.calcaneus(ctx), material: 'bone' };
    case 'tarsals': return { build: pc.tarsals(ctx), material: 'bone' };
    default: break;
  }
  const small = layout.small.get(id) ?? layout.small.get(L);
  if (small) {
    const kind = base.startsWith('metacarpal') ? 'metacarpal' : base.startsWith('metatarsal') ? 'metatarsal'
      : base.endsWith('prox') ? 'prox' : base.endsWith('mid') ? 'mid' : 'dist';
    return { build: pc.smallLongBone(ctx, small, kind), material: 'bone' };
  }
  throw new Error(`unknown bone ${id}`);
}

export function buildBone(req: BuildRequest): BuiltBone {
  const { params, layout } = getModel(req);
  const own = req.lesions.filter((l) => l.bone === req.boneId);
  const atrophy = own.find((l) => l.kind === 'atrophy');
  const shaftScale = atrophy ? 1 - 0.35 * (atrophy.render?.severity ?? 0.5) : 1;
  const { build, material } = baseBuild(req, params, layout, shaftScale);
  const sculpt = own.filter((l) => l.kind !== 'atrophy' && !(l.bone.startsWith('teeth') && (l.kind === 'tooth-loss' || l.kind === 'dental-disease')));
  const res = applyLesions(build.sdf, build, sculpt, req.healingT);
  const scale = QUALITY_SCALE[req.quality];
  return { sdf: res.sdf, bounds: build.bounds, voxel: build.voxel * scale, markers: res.markers, tag: res.tag, material };
}

/** Hotspot anchor for a lesion without meshing (main thread), in bone-local coordinates. */
export function lesionAnchor(req: BuildRequest, lesionId: string): { center: [number, number, number]; normal: [number, number, number] } | null {
  const built = buildBone({ ...req, quality: 'preview' });
  const m = built.markers.find((x) => x.id === lesionId);
  if (!m) return null;
  const pr = projectToSurface(built.sdf, m.center, 3);
  return { center: [pr.p[0], pr.p[1], pr.p[2]], normal: [m.normal[0], m.normal[1], m.normal[2]] };
}

/** Dev harness entry. */
export function buildBoneForHarness(species: string, part: string): { sdf: SDF; bounds: AABB; voxel: number } {
  const b = buildBone({ speciesId: species as SpeciesId, boneId: part, quality: 'high', lesions: [], healingT: 1 });
  return { sdf: b.sdf, bounds: b.bounds, voxel: b.voxel };
}
