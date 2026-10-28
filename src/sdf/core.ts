/**
 * Signed distance field (SDF) toolkit used to sculpt bones.
 *
 * Every shape is a closure `(x, y, z) => signed distance in metres` (negative inside).
 * Hot paths are allocation-free scalar math; all vector work happens once at build time.
 * Distances are exact or Lipschitz-bounded approximations (ellipsoids, smooth blends), which the
 * mesher tolerates with a safety factor.
 */

export type SDF = (x: number, y: number, z: number) => number;
export type V3 = readonly [number, number, number];
/** Row-major 3x3 rotation matrix (world-from-local). */
export type M3 = readonly [number, number, number, number, number, number, number, number, number];

// ---------------------------------------------------------------------------------------------
// Build-time vector helpers
// ---------------------------------------------------------------------------------------------

export const vadd = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const vsub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const vscale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const vdot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const vcross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const vlen = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const vnorm = (a: V3): V3 => {
  const l = vlen(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const vlerp = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const mirrorV = (a: V3): V3 => [-a[0], a[1], a[2]];
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const M3_IDENTITY: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function m3mul(a: M3, b: M3): M3 {
  const r = new Array<number>(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    }
  }
  return r as unknown as M3;
}

export function rotX(a: number): M3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}
export function rotY(a: number): M3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}
export function rotZ(a: number): M3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}
/** Rotation from Euler angles in degrees applied X, then Y, then Z (world-from-local). */
export function rotXYZ(xDeg: number, yDeg: number, zDeg: number): M3 {
  const d = Math.PI / 180;
  return m3mul(rotZ(zDeg * d), m3mul(rotY(yDeg * d), rotX(xDeg * d)));
}
/** Matrix whose columns are the given local axes expressed in world space. */
export function basis(xAxis: V3, yAxis: V3, zAxis: V3): M3 {
  return [xAxis[0], yAxis[0], zAxis[0], xAxis[1], yAxis[1], zAxis[1], xAxis[2], yAxis[2], zAxis[2]];
}
/** Orthonormal frame with local +Y along `dir` and local +Z as close as possible to `fwd`. */
export function frameY(dir: V3, fwd: V3 = [0, 0, 1]): M3 {
  const y = vnorm(dir);
  let x = vcross(y, fwd);
  if (vlen(x) < 1e-6) x = vcross(y, [1, 0, 0]);
  x = vnorm(x);
  const z = vcross(x, y);
  return basis(x, y, z);
}
export function m3apply(m: M3, v: V3): V3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

// ---------------------------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------------------------

export function sphere(c: V3, r: number): SDF {
  const [cx, cy, cz] = c;
  return (x, y, z) => Math.sqrt((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2) - r;
}

/** Ellipsoid (iq bound). `rot` = world-from-local rotation. */
export function ellipsoid(c: V3, r: V3, rot: M3 = M3_IDENTITY): SDF {
  const [cx, cy, cz] = c;
  const [rx, ry, rz] = r;
  const ix = 1 / rx, iy = 1 / ry, iz = 1 / rz;
  const ix2 = ix * ix, iy2 = iy * iy, iz2 = iz * iz;
  const rmin = Math.min(rx, ry, rz);
  const [a, b, cc, d, e, f, g, h, i] = rot;
  const identity = rot === M3_IDENTITY;
  return (x, y, z) => {
    let px = x - cx, py = y - cy, pz = z - cz;
    if (!identity) {
      const lx = a * px + d * py + g * pz;
      const ly = b * px + e * py + h * pz;
      const lz = cc * px + f * py + i * pz;
      px = lx; py = ly; pz = lz;
    }
    const k0 = Math.sqrt(px * px * ix2 + py * py * iy2 + pz * pz * iz2);
    const k1 = Math.sqrt(px * px * ix2 * ix2 + py * py * iy2 * iy2 + pz * pz * iz2 * iz2);
    if (k1 < 1e-12) return -rmin;
    return (k0 * (k0 - 1)) / k1;
  };
}

export function capsule(a: V3, b: V3, r: number): SDF {
  const [ax, ay, az] = a;
  const bax = b[0] - ax, bay = b[1] - ay, baz = b[2] - az;
  const inv = 1 / Math.max(1e-12, bax * bax + bay * bay + baz * baz);
  return (x, y, z) => {
    const pax = x - ax, pay = y - ay, paz = z - az;
    let h = (pax * bax + pay * bay + paz * baz) * inv;
    h = h < 0 ? 0 : h > 1 ? 1 : h;
    const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
  };
}

/** Round cone between spheres (a, r1) and (b, r2) (iq). Falls back to a capsule-like blend if degenerate. */
export function roundCone(a: V3, b: V3, r1: number, r2: number): SDF {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  if (l2 <= rr * rr * 1.0001) {
    // One sphere contains the other.
    return r1 >= r2 ? sphere(a, r1) : sphere(b, r2);
  }
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  const [ax, ay, az] = a;
  const sgn = Math.sign(rr);
  return (x, y, z) => {
    const pax = x - ax, pay = y - ay, paz = z - az;
    const yy = pax * bax + pay * bay + paz * baz;
    const zz = yy - l2;
    const qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy;
    const x2 = qx * qx + qy * qy + qz * qz;
    const y2 = yy * yy * l2;
    const z2 = zz * zz * l2;
    const k = sgn * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  };
}

/** Rounded box with half extents `half`, rounding `round`, oriented by `rot`. */
export function box(c: V3, half: V3, round = 0, rot: M3 = M3_IDENTITY): SDF {
  const [cx, cy, cz] = c;
  const hx = half[0] - round, hy = half[1] - round, hz = half[2] - round;
  const [a, b, cc, d, e, f, g, h, i] = rot;
  return (x, y, z) => {
    const px = x - cx, py = y - cy, pz = z - cz;
    const lx = Math.abs(a * px + d * py + g * pz) - hx;
    const ly = Math.abs(b * px + e * py + h * pz) - hy;
    const lz = Math.abs(cc * px + f * py + i * pz) - hz;
    const ox = lx > 0 ? lx : 0, oy = ly > 0 ? ly : 0, oz = lz > 0 ? lz : 0;
    const inside = Math.min(Math.max(lx, ly, lz), 0);
    return Math.sqrt(ox * ox + oy * oy + oz * oz) + inside - round;
  };
}

/** Capped cylinder between a and b (iq). */
export function cylinder(a: V3, b: V3, r: number): SDF {
  const [ax, ay, az] = a;
  const bax = b[0] - ax, bay = b[1] - ay, baz = b[2] - az;
  const baba = bax * bax + bay * bay + baz * baz;
  return (x, y, z) => {
    const pax = x - ax, pay = y - ay, paz = z - az;
    const paba = pax * bax + pay * bay + paz * baz;
    const qx = pax * baba - bax * paba, qy = pay * baba - bay * paba, qz = paz * baba - baz * paba;
    const xx = Math.sqrt(qx * qx + qy * qy + qz * qz) - r * baba;
    const yy = Math.abs(paba - baba * 0.5) - baba * 0.5;
    const x2 = xx * xx;
    const y2 = yy * yy * baba;
    const d = Math.max(xx, yy) < 0 ? -Math.min(x2, y2) : (xx > 0 ? x2 : 0) + (yy > 0 ? y2 : 0);
    return (Math.sign(d) * Math.sqrt(Math.abs(d))) / baba;
  };
}

export function torus(c: V3, R: number, r: number, rot: M3 = M3_IDENTITY): SDF {
  const [cx, cy, cz] = c;
  const [a, b, cc, d, e, f, g, h, i] = rot;
  return (x, y, z) => {
    const px = x - cx, py = y - cy, pz = z - cz;
    const lx = a * px + d * py + g * pz;
    const ly = b * px + e * py + h * pz;
    const lz = cc * px + f * py + i * pz;
    const q = Math.sqrt(lx * lx + lz * lz) - R;
    return Math.sqrt(q * q + ly * ly) - r;
  };
}

/** Half-space: negative on the side opposite to the normal (dot(p - point, n) < 0 is inside). */
export function halfSpace(point: V3, normal: V3): SDF {
  const n = vnorm(normal);
  const off = vdot(point, n);
  return (x, y, z) => x * n[0] + y * n[1] + z * n[2] - off;
}

/** Union of round cones along a polyline: a tapering tube. */
export function tube(points: readonly V3[], radii: readonly number[]): SDF {
  const parts: SDF[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    parts.push(roundCone(points[i], points[i + 1], radii[i], radii[i + 1]));
  }
  return union(...parts);
}

/**
 * Tube with elliptical cross-section (e.g. ribs). `ra` is the radius along `up` projected onto the
 * plane normal to the segment, `rb` the radius across. Approximate (ellipsoid-style bound).
 */
export function flatTube(points: readonly V3[], ra: readonly number[], rb: readonly number[], up: V3): SDF {
  type Seg = { a: V3; d: V3; len2: number; u: V3; w: V3; ra0: number; ra1: number; rb0: number; rb1: number };
  const segs: Seg[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const d = vsub(points[i + 1], a);
    const t = vnorm(d);
    let w = vcross(t, up);
    if (vlen(w) < 1e-6) w = vcross(t, [1, 0, 0]);
    w = vnorm(w);
    const u = vcross(w, t);
    segs.push({ a, d, len2: Math.max(1e-12, vdot(d, d)), u, w, ra0: ra[i], ra1: ra[i + 1], rb0: rb[i], rb1: rb[i + 1] });
  }
  return (x, y, z) => {
    let best = Infinity;
    for (let s = 0; s < segs.length; s++) {
      const g = segs[s];
      const px = x - g.a[0], py = y - g.a[1], pz = z - g.a[2];
      let h = (px * g.d[0] + py * g.d[1] + pz * g.d[2]) / g.len2;
      h = h < 0 ? 0 : h > 1 ? 1 : h;
      const vx = px - g.d[0] * h, vy = py - g.d[1] * h, vz = pz - g.d[2] * h;
      const cu = vx * g.u[0] + vy * g.u[1] + vz * g.u[2];
      const cw = vx * g.w[0] + vy * g.w[1] + vz * g.w[2];
      const ct2 = Math.max(0, vx * vx + vy * vy + vz * vz - cu * cu - cw * cw);
      const ra_ = g.ra0 + (g.ra1 - g.ra0) * h;
      const rb_ = g.rb0 + (g.rb1 - g.rb0) * h;
      const rt = Math.min(ra_, rb_);
      const k0 = Math.sqrt((cu * cu) / (ra_ * ra_) + (cw * cw) / (rb_ * rb_) + ct2 / (rt * rt));
      const k1 = Math.sqrt((cu * cu) / ra_ ** 4 + (cw * cw) / rb_ ** 4 + ct2 / rt ** 4);
      const dist = k1 < 1e-12 ? -rt : (k0 * (k0 - 1)) / k1;
      if (dist < best) best = dist;
    }
    return best;
  };
}

/**
 * Planar polygon (2D, counter-clockwise or clockwise) extruded to `halfThickness` and rounded.
 * The polygon lives in the plane spanned by unit vectors `u` and `v` through `origin`; the
 * extrusion is along u x v.
 */
export function extrudedPolygon(
  poly: ReadonlyArray<readonly [number, number]>,
  halfThickness: number,
  round: number,
  origin: V3,
  u: V3,
  v: V3,
): SDF {
  const n = poly.length;
  const px = poly.map((p) => p[0]);
  const py = poly.map((p) => p[1]);
  const w = vnorm(vcross(u, v));
  const [ox, oy, oz] = origin;
  return (x, y, z) => {
    const qx = x - ox, qy = y - oy, qz = z - oz;
    const a = qx * u[0] + qy * u[1] + qz * u[2];
    const b = qx * v[0] + qy * v[1] + qz * v[2];
    const c = qx * w[0] + qy * w[1] + qz * w[2];
    // iq sdPolygon
    let d = (a - px[0]) ** 2 + (b - py[0]) ** 2;
    let s = 1;
    for (let i = 0, j = n - 1; i < n; j = i, i++) {
      const ex = px[j] - px[i], ey = py[j] - py[i];
      const wx = a - px[i], wy = b - py[i];
      let t = (wx * ex + wy * ey) / (ex * ex + ey * ey);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const bx = wx - ex * t, by = wy - ey * t;
      const dd = bx * bx + by * by;
      if (dd < d) d = dd;
      const c1 = b >= py[i], c2 = b < py[j], c3 = ex * wy > ey * wx;
      if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
    }
    const d2 = s * Math.sqrt(d);
    const ex = d2 + round;
    const ey = Math.abs(c) - (halfThickness - round);
    const mx = ex > 0 ? ex : 0, my = ey > 0 ? ey : 0;
    return Math.min(Math.max(ex, ey), 0) + Math.sqrt(mx * mx + my * my) - round;
  };
}

// ---------------------------------------------------------------------------------------------
// Swept profiles
// ---------------------------------------------------------------------------------------------

/** 2D rounded rectangle centred at (cu, cv) with half sizes (hu, hv) and corner radius r. */
export function roundRect2(u: number, v: number, cu: number, cv: number, hu: number, hv: number, r: number): number {
  const qx = Math.abs(u - cu) - hu + r;
  const qy = Math.abs(v - cv) - hv + r;
  const ox = qx > 0 ? qx : 0, oy = qy > 0 ? qy : 0;
  return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * Sweep a 2D cross-section along a polyline lying (approximately) in the XZ plane.
 * `profile(s, u, v)` returns the 2D signed distance of the section at arc fraction `s` (0..1),
 * where `u` is the horizontal offset to the left of the travel direction (t x up) and `v` is world Y.
 * Open ends are capped flat.
 */
export function sweepXZ(points: readonly V3[], profile: (s: number, u: number, v: number) => number): SDF {
  const n = points.length;
  const ax: number[] = [], az: number[] = [], dx: number[] = [], dz: number[] = [], len: number[] = [], cum: number[] = [0];
  for (let i = 0; i < n - 1; i++) {
    const ddx = points[i + 1][0] - points[i][0];
    const ddz = points[i + 1][2] - points[i][2];
    const l = Math.max(1e-9, Math.hypot(ddx, ddz));
    ax.push(points[i][0]); az.push(points[i][2]); dx.push(ddx); dz.push(ddz); len.push(l);
    cum.push(cum[i] + l);
  }
  const total = cum[n - 1];
  const segs = n - 1;
  return (x, y, z) => {
    let best = Infinity, bi = 0, bh = 0;
    for (let i = 0; i < segs; i++) {
      const px = x - ax[i], pz = z - az[i];
      let h = (px * dx[i] + pz * dz[i]) / (len[i] * len[i]);
      h = h < 0 ? 0 : h > 1 ? 1 : h;
      const qx = px - dx[i] * h, qz = pz - dz[i] * h;
      const d2 = qx * qx + qz * qz;
      if (d2 < best) { best = d2; bi = i; bh = h; }
    }
    const tx = dx[bi] / len[bi], tz = dz[bi] / len[bi];
    const px = x - ax[bi], pz = z - az[bi];
    const cx = dx[bi] * bh, cz = dz[bi] * bh;
    // left normal = t x up = (-tz, 0, tx)
    let u = (px - cx) * -tz + (pz - cz) * tx;
    const interiorJoint = (bh === 0 && bi > 0) || (bh === 1 && bi < segs - 1);
    if (interiorJoint) {
      const j = bh === 0 ? bi - 1 : bi + 1;
      const nx = -(tz + dz[j] / len[j]) * 0.5, nz = (tx + dx[j] / len[j]) * 0.5;
      const rx = px - cx, rz = pz - cz;
      u = Math.sign(rx * nx + rz * nz || 1) * Math.sqrt(rx * rx + rz * rz);
    }
    const s = (cum[bi] + bh * len[bi]) / total;
    const d2 = profile(s, u, y);
    let along = 0;
    if (bi === 0 && bh === 0) along = -(px * tx + pz * tz);
    else if (bi === segs - 1 && bh === 1) along = (px - dx[bi]) * tx + (pz - dz[bi]) * tz;
    if (along > 0) return d2 > 0 ? Math.sqrt(d2 * d2 + along * along) : Math.max(d2, along);
    return d2;
  };
}

/** Resample a polyline to `count` points evenly spaced by arc length. */
export function resample(points: readonly V3[], count: number): V3[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const d = vsub(points[i], points[i - 1]);
    cum.push(cum[i - 1] + Math.hypot(d[0], d[1], d[2]));
  }
  const total = cum[cum.length - 1];
  const out: V3[] = [];
  let j = 1;
  for (let k = 0; k < count; k++) {
    const target = (k / (count - 1)) * total;
    while (j < cum.length - 1 && cum[j] < target) j++;
    const seg = cum[j] - cum[j - 1] || 1e-9;
    out.push(vlerp(points[j - 1], points[j], Math.min(1, Math.max(0, (target - cum[j - 1]) / seg))));
  }
  return out;
}

/** Centripetal-ish Catmull-Rom through control points, `perSeg` samples per span. */
export function catmullRom(ctrl: readonly V3[], perSeg = 6): V3[] {
  const out: V3[] = [];
  const P = (i: number) => ctrl[Math.max(0, Math.min(ctrl.length - 1, i))];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])]);
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------------------------

export function union(...s: SDF[]): SDF {
  if (s.length === 1) return s[0];
  if (s.length === 2) {
    const [a, b] = s;
    return (x, y, z) => Math.min(a(x, y, z), b(x, y, z));
  }
  return (x, y, z) => {
    let d = Infinity;
    for (let i = 0; i < s.length; i++) {
      const v = s[i](x, y, z);
      if (v < d) d = v;
    }
    return d;
  };
}

/** Polynomial smooth minimum (iq), blend radius k. */
export function smin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
export function smax(a: number, b: number, k: number): number {
  return -smin(-a, -b, k);
}

export function smoothUnion(k: number, ...s: SDF[]): SDF {
  if (s.length === 1) return s[0];
  if (k <= 0) return union(...s);
  return (x, y, z) => {
    let d = s[0](x, y, z);
    for (let i = 1; i < s.length; i++) d = smin(d, s[i](x, y, z), k);
    return d;
  };
}

export function subtract(a: SDF, ...b: SDF[]): SDF {
  return (x, y, z) => {
    let d = a(x, y, z);
    for (let i = 0; i < b.length; i++) {
      const v = -b[i](x, y, z);
      if (v > d) d = v;
    }
    return d;
  };
}

export function smoothSubtract(k: number, a: SDF, ...b: SDF[]): SDF {
  if (k <= 0) return subtract(a, ...b);
  return (x, y, z) => {
    let d = a(x, y, z);
    for (let i = 0; i < b.length; i++) d = smax(d, -b[i](x, y, z), k);
    return d;
  };
}

export function intersect(a: SDF, b: SDF): SDF {
  return (x, y, z) => Math.max(a(x, y, z), b(x, y, z));
}

export function smoothIntersect(k: number, a: SDF, b: SDF): SDF {
  return (x, y, z) => smax(a(x, y, z), b(x, y, z), k);
}

/** Inflate (r > 0) or shrink a shape. */
export function offset(s: SDF, r: number): SDF {
  return (x, y, z) => s(x, y, z) - r;
}

/** Hollow shell: keeps material between the surface and an inner surface `thickness` deep. */
export function hollow(s: SDF, thickness: number): SDF {
  return (x, y, z) => {
    const d = s(x, y, z);
    return Math.max(d, -(d + thickness));
  };
}

/** Bilateral symmetry about the x = 0 plane: build one side at +x, get both. */
export function mirrorX(s: SDF): SDF {
  return (x, y, z) => s(x < 0 ? -x : x, y, z);
}

/** Rigid transform: the shape `s` is defined in a local frame placed at `origin` with rotation `rot`. */
export function place(s: SDF, origin: V3, rot: M3 = M3_IDENTITY): SDF {
  const [ox, oy, oz] = origin;
  const [a, b, c, d, e, f, g, h, i] = rot;
  return (x, y, z) => {
    const px = x - ox, py = y - oy, pz = z - oz;
    return s(a * px + d * py + g * pz, b * px + e * py + h * pz, c * px + f * py + i * pz);
  };
}

/**
 * Bounding-sphere acceleration: if the query point is farther than `margin` outside the sphere that
 * encloses the shape, return the (lower-bound) sphere distance without evaluating the shape.
 * `margin` must be >= the largest blend radius used by any parent smooth operator.
 */
export function bounded(s: SDF, center: V3, radius: number, margin = 0.02): SDF {
  const [cx, cy, cz] = center;
  return (x, y, z) => {
    const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2) - radius;
    return d > margin ? d : s(x, y, z);
  };
}

/** Add a displacement field (keep amplitude small relative to features to preserve the bound). */
export function displace(s: SDF, field: (x: number, y: number, z: number) => number): SDF {
  return (x, y, z) => s(x, y, z) + field(x, y, z);
}

export interface AABB {
  min: V3;
  max: V3;
}

export function aabbUnion(a: AABB, b: AABB): AABB {
  return {
    min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1]), Math.min(a.min[2], b.min[2])],
    max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1]), Math.max(a.max[2], b.max[2])],
  };
}

export function aabbFromPoints(points: readonly V3[], pad: number): AABB {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const p of points) {
    for (let k = 0; k < 3; k++) {
      if (p[k] < min[k]) min[k] = p[k];
      if (p[k] > max[k]) max[k] = p[k];
    }
  }
  return { min: [min[0] - pad, min[1] - pad, min[2] - pad], max: [max[0] + pad, max[1] + pad, max[2] + pad] };
}
