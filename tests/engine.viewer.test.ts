/**
 * 3D viewer and SDF engine tests: static security/module-size guards, skeleton layout across all
 * 17 taxa, lesion sculpting + anchor projection, vertex color baking, and local scan parsing.
 */
import { describe, expect, it } from 'vitest';
import { validateScan } from '../src/app/scanFile';
import { SPECIES, flagshipSpecimen } from '../src/data';
import { SPECIES_IDS } from '../src/data/types';
import { buildBone, getModel, lesionAnchor } from '../src/sdf/build';
import { groupWorld } from '../src/sdf/layout';
import { TAG_FRESH, TAG_POLISH, TAG_POROUS } from '../src/sdf/lesions';
import { computeVertexColors, parseHexRgb } from '../src/viewer/materials';
import { cacheKeyFor } from '../src/viewer/pool';
import { prioritizeBones } from '../src/viewer/rig';
import { buildScanObject } from '../src/viewer/scanLoader';
import { executeBuildJob } from '../src/viewer/worker';

const VIEWER_SOURCES = import.meta.glob('../src/viewer/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const VIEWER_FILES = Object.entries(VIEWER_SOURCES).map(([path, text]) => ({
  rel: path.replace(/^\.\.\//, ''),
  text,
}));

describe('3D viewer source: security & module size contract', () => {
  const rules: [string, RegExp][] = [
    ['innerHTML / outerHTML', /\.(inner|outer)HTML\b/],
    ['insertAdjacentHTML', /insertAdjacentHTML/],
    ['document.write', /document\.write/],
    ['eval / new Function', /\beval\s*\(|new\s+Function\s*\(/],
    ['alert / confirm / prompt', /(^|[^.\w])(alert|confirm|prompt)\s*\(/m],
    ['runtime network calls', /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource/],
    ['CSS imported from TS', /import\s+['"][^'"]+\.css['"]/],
    ['console.log in production viewer', /console\.log\s*\(/],
    ['inline style attribute', /setAttribute\(\s*['"]style['"]/],
    ['inline event-handler attribute', /setAttribute\(\s*['"]on\w+['"]/],
  ];
  for (const [name, re] of rules) {
    it(`never uses ${name}`, () => {
      const offenders = VIEWER_FILES.filter((f) => re.test(f.text)).map((f) => f.rel);
      expect(offenders).toEqual([]);
    });
  }

  it('keeps every viewer module < 200 lines', () => {
    const big = VIEWER_FILES.map((f) => ({ rel: f.rel, lines: f.text.split('\n').length })).filter((f) => f.lines >= 200);
    expect(big).toEqual([]);
  });

  it('provides full-body front and back 3D photorealistic reconstruction assets for all 17 species', () => {
    const figureAssets = Object.keys(import.meta.glob('../public/figures/*.jpg'));
    for (const id of SPECIES_IDS) {
      expect(figureAssets).toContain(`../public/figures/${id}-front.jpg`);
      expect(figureAssets).toContain(`../public/figures/${id}-back.jpg`);
    }
  });
});

describe('SDF skeleton layout & bone builder across all 17 species', () => {
  it('computes a valid anatomical rig for all 17 species and morph blends', () => {
    for (const id of SPECIES_IDS) {
      const { params, layout } = getModel({ speciesId: id });
      expect(layout.stature).toBeCloseTo(params.body.stature, 2);
      expect(layout.boneIds.length).toBeGreaterThan(80);
      const head = groupWorld(layout, 'head');
      expect(head.pos[1]).toBeGreaterThan(layout.stature * 0.55);
      expect(head.pos[1]).toBeLessThan(layout.stature * 1.05);
    }
    const morphed = getModel({
      speciesId: 'australopithecus-afarensis',
      morph: { toSpeciesId: 'homo-sapiens', t: 0.5 },
    });
    expect(morphed.layout.stature).toBeGreaterThan(1.2);
    expect(morphed.layout.stature).toBeLessThan(1.7);
  });

  it('prioritizes skull and injured bones ahead of distal phalanges', () => {
    const sp = SPECIES.find((s) => s.id === 'homo-neanderthalensis')!;
    const spec = flagshipSpecimen(sp)!;
    const { layout } = getModel({ speciesId: sp.id });
    const ordered = prioritizeBones(layout, spec.lesions);
    expect(ordered.slice(0, 4)).toEqual(['cranium', 'mandible', 'teeth_upper', 'teeth_lower']);
    const injuredBone = spec.lesions[0].bone;
    expect(ordered.indexOf(injuredBone)).toBeLessThan(ordered.indexOf('foot_phalanx_dist_R5'));
  });

  it('meshes bones with lesions and resolves surface anchors and vertex colors', () => {
    const sp = SPECIES.find((s) => s.id === 'homo-neanderthalensis')!;
    const spec = flagshipSpecimen(sp)!;
    const lesion = spec.lesions[0];
    const req = {
      speciesId: sp.id,
      boneId: lesion.bone,
      quality: 'preview' as const,
      lesions: spec.lesions,
      healingT: 1,
    };
    expect(cacheKeyFor(req)).toContain(lesion.id);
    const built = buildBone(req);
    expect(built.markers.length).toBeGreaterThan(0);

    const anchor = lesionAnchor(req, lesion.id);
    expect(anchor).not.toBeNull();
    expect(Math.hypot(...anchor!.normal)).toBeCloseTo(1, 2);

    const job = executeBuildJob(1, req);
    expect(job.ok).toBe(true);
    expect(job.positions.length).toBeGreaterThan(300);

    // Test vertex color baking across fossil, bone, and xray modes + pathology tags.
    job.tags[0] = (1 << 8) | 200 | TAG_POROUS;
    job.tags[1] = TAG_FRESH;
    job.tags[2] = TAG_POLISH;
    for (const renderMode of ['fossil', 'bone', 'xray'] as const) {
      const cols = computeVertexColors(job, {
        renderMode,
        taphonomy: spec.taphonomy.colors,
        selectedSlot: 1,
      });
      expect(cols.length).toBe(job.positions.length);
      for (let i = 0; i < Math.min(30, cols.length); i++) {
        expect(cols[i]).toBeGreaterThanOrEqual(0);
        expect(cols[i]).toBeLessThanOrEqual(1);
      }
    }
    expect(parseHexRgb('#f2a93b')[0]).toBeCloseTo(0.949, 2);
  });
});

describe('Local 3D scan validation and parsing', () => {
  it('validates and parses ASCII STL, OBJ, and PLY scan buffers locally', () => {
    const enc = new TextEncoder();
    const stlBytes = enc.encode(
      'solid test\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid test\n',
    ).buffer;
    expect(validateScan('fossil.stl', stlBytes).ok).toBe(true);
    const stlMesh = buildScanObject('stl', stlBytes);
    expect(stlMesh.geometry.getAttribute('position').count).toBe(3);

    const objBytes = enc.encode('# mesh\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n').buffer;
    expect(validateScan('cranium.obj', objBytes).ok).toBe(true);
    const objMesh = buildScanObject('obj', objBytes);
    expect(objMesh.geometry.getAttribute('position').count).toBe(3);

    const plyBytes = enc.encode(
      'ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nelement face 1\nproperty list uchar int vertex_indices\nend_header\n0 0 0\n1 0 0\n0 1 0\n3 0 1 2\n',
    ).buffer;
    expect(validateScan('tooth.ply', plyBytes).ok).toBe(true);
    const plyMesh = buildScanObject('ply', plyBytes);
    expect(plyMesh.geometry.getAttribute('position').count).toBe(3);
  });
});
