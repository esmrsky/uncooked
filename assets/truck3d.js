/*
  A real-time Cybertruck, built from the truck's own flat panels.
  Proportions follow Tesla's published dimensions (223.7 in long, 143.1 in wheelbase).
  Units are meters. +x is forward, +y is up, +z is the passenger side.
*/
import * as THREE from './vendor/three.module.min.js';

/* ------------------------------------------------------------------
   Films. Shared with the page UI.
   ------------------------------------------------------------------ */
export const FINISHES = {
  gloss: { label: 'Gloss', code: 'GLS', note: 'Deep reflections, like fresh paint. The easiest finish to wash; dark colors show swirl marks.' },
  satin: { label: 'Satin', code: 'SAT', note: 'A low sheen that sharpens every edge. No wax, no polish.' },
  matte: { label: 'Matte', code: 'MAT', note: 'No reflection at all. Matte-safe soap only, and it can’t be buffed.' },
  chrome: { label: 'Chrome', code: 'CHR', note: 'A rolling mirror. The priciest film, and the hardest to lay flat on big panels.' },
  shift: { label: 'Color-shift', code: 'SHF', note: 'Changes color with the viewing angle, so every flat panel reads as its own shade. Drag to turn the truck.' },
  ppf: { label: 'Clear PPF', code: 'PPF', note: 'Keeps the stainless look. Thick urethane takes the scratches and road grime instead.' }
};
export const SOLIDS = [
  { id: 'obsidian', name: 'Obsidian', hex: '#1c1d20', code: 'OBS' },
  { id: 'glacier', name: 'Glacier White', hex: '#e6e8e8', code: 'GLC' },
  { id: 'concrete', name: 'Concrete', hex: '#7c8387', code: 'CON' },
  { id: 'olive', name: 'Olive Drab', hex: '#4a5331', code: 'OLV' },
  { id: 'tan', name: 'Desert Tan', hex: '#b69a70', code: 'TAN' },
  { id: 'ocean', name: 'Deep Ocean', hex: '#14406a', code: 'OCN' },
  { id: 'red', name: 'Signal Red', hex: '#a8121c', code: 'RED' },
  { id: 'blaze', name: 'Blaze Orange', hex: '#d9561a', code: 'BLZ' },
  { id: 'volt', name: 'Volt', hex: '#bcd334', code: 'VLT' },
  { id: 'violet', name: 'Ultraviolet', hex: '#48298a', code: 'UVT' }
];
export const SHIFTS = [
  { id: 'aurora', name: 'Aurora', stops: ['#16c2b0', '#2f56f0', '#8a2be0'], code: 'AUR' },
  { id: 'oilslick', name: 'Oil Slick', stops: ['#1d8a57', '#2a55a8', '#6a2b98'], code: 'OIL' },
  { id: 'solar', name: 'Solar Flare', stops: ['#f0b030', '#e0442a', '#8a1540'], code: 'SOL' },
  { id: 'nebula', name: 'Nebula', stops: ['#d08452', '#7a2fa8', '#22348e'], code: 'NEB' }
];
export const CLEARS = [
  { id: 'gloss-clear', name: 'Gloss clear', code: 'GCL' },
  { id: 'satin-clear', name: 'Satin clear', code: 'SCL' }
];
export const paletteFor = (f) => (f === 'shift' ? SHIFTS : f === 'ppf' ? CLEARS : SOLIDS);
export const findColor = (f, id) => paletteFor(f).find((c) => c.id === id);

/* ------------------------------------------------------------------
   Geometry. Profile points come from a to-scale side drawing
   (1 drawing unit = 0.25 in) and are converted to meters here.
   ------------------------------------------------------------------ */
const S = 0.006413;
const X = (x) => (x - 501) * S;
const Y = (y) => (380 - y) * S;

const W = 1.0;            // half body width
const WR = 0.70;          // half roof width at the peak
const YB = Y(188);        // beltline: where the greenhouse starts leaning in
const YPK = Y(100);       // roof peak
const BOT = Y(318);       // rocker bottom
const WY = Y(314);        // wheel center height
const TIRE_R = 66 * S;
const WHEELS = [X(226), X(793)];
const XMIN = X(58), XMAX = X(944);

const N = [X(944), Y(222)];
const F1 = [X(938), Y(258)];
const F2 = [X(926), Y(300)];
const F3 = [X(912), Y(318)];
const PK = [X(548), YPK];
const C = [X(58), YB];
const R1 = [X(60), Y(294)];
const RB = [X(72), Y(318)];
const A = [N[0] + (YB - N[1]) * (PK[0] - N[0]) / (PK[1] - N[1]), YB];
const topFront = (x) => N[1] + (PK[1] - N[1]) * (x - N[0]) / (PK[0] - N[0]);
const topRear = (x) => C[1] + (PK[1] - C[1]) * (x - C[0]) / (PK[0] - C[0]);
const zAt = (y) => (y <= YB ? W : W - (W - WR) * (y - YB) / (YPK - YB));
const TUMBLE = (W - WR) / (YPK - YB);

const archPts = (cx) => [[cx - 0.564, BOT], [cx - 0.487, Y(244)], [cx - 0.282, Y(222)], [cx + 0.282, Y(222)], [cx + 0.487, Y(244)], [cx + 0.564, BOT]];
const flareOuter = (cx) => [[cx - 0.667, BOT], [cx - 0.577, Y(236)], [cx - 0.333, Y(206)], [cx + 0.333, Y(206)], [cx + 0.577, Y(236)], [cx + 0.667, BOT]];

const V = (x, y, z) => new THREE.Vector3(x, y, z);

class Builder {
  constructor() { this.p = []; this.n = []; this.uv = []; }
  tri(a, b, c, hint) {
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (n.lengthSq() < 1e-12) return;
    if (hint && n.dot(hint) < 0) { const t = b; b = c; c = t; n.negate(); }
    n.normalize();
    const t = new THREE.Vector3(1, 0, 0);
    t.addScaledVector(n, -n.dot(t));
    if (t.lengthSq() < 1e-3) { t.set(0, 0, 1); t.addScaledVector(n, -n.dot(t)); }
    t.normalize();
    const bt = new THREE.Vector3().crossVectors(n, t);
    for (const q of [a, b, c]) {
      this.p.push(q.x, q.y, q.z);
      this.n.push(n.x, n.y, n.z);
      this.uv.push(q.dot(t), q.dot(bt));
    }
  }
  poly(pts, hint) { for (let i = 1; i < pts.length - 1; i++) this.tri(pts[0], pts[i], pts[i + 1], hint); }
  shape(pts2, to3, hint) {
    const tris = THREE.ShapeUtils.triangulateShape(pts2.map((q) => new THREE.Vector2(q[0], q[1])), []);
    const v3 = pts2.map(to3);
    for (const [a, b, c] of tris) this.tri(v3[a], v3[b], v3[c], hint);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    return g;
  }
}

// Point on the leaning greenhouse plane, pushed slightly outward
const onTumble = (x, y, s, lift = 0) => {
  const n = V(0, TUMBLE, s).normalize();
  return V(x, y, s * zAt(y)).addScaledVector(n, lift);
};
const frontTopNormal = V(PK[1] - N[1], N[0] - PK[0], 0).normalize();
const rearTopNormal = V(-(PK[1] - C[1]), PK[0] - C[0], 0).normalize();
const onFrontTop = (x, z, lift = 0) => V(x, topFront(x), z).addScaledVector(frontTopNormal, lift);
const onRearTop = (x, z, lift = 0) => V(x, topRear(x), z).addScaledVector(rearTopNormal, lift);

function lowerContour() {
  const [rw, fw] = WHEELS;
  const pts = [C, A, N, F1, F2, [F3[0], BOT]];
  archPts(fw).slice().reverse().forEach((q) => pts.push(q));
  archPts(rw).slice().reverse().forEach((q) => pts.push(q));
  pts.push([RB[0], BOT], R1);
  return pts;
}

function bodyGeometries() {
  const sides = new Builder();
  const tops = new Builder();
  const contour = lowerContour();
  for (const s of [1, -1]) {
    sides.shape(contour, (q) => V(q[0], q[1], s * W), V(0, 0, s));
    sides.poly([V(A[0], YB, s * W), V(PK[0], YPK, s * WR), V(C[0], YB, s * W)], V(0, TUMBLE, s));
  }
  sides.poly([V(...N, W), V(...F1, W), V(...F1, -W), V(...N, -W)], V(1, 0.2, 0));
  sides.poly([V(...F1, W), V(...F2, W), V(...F2, -W), V(...F1, -W)], V(1, -0.2, 0));
  sides.poly([V(...C, W), V(...R1, W), V(...R1, -W), V(...C, -W)], V(-1, 0, 0));
  tops.poly([V(...N, W), V(...A, W), V(...PK, WR), V(...PK, -WR), V(...A, -W), V(...N, -W)], frontTopNormal);
  tops.poly([V(...PK, WR), V(...C, W), V(...C, -W), V(...PK, -WR)], rearTopNormal);
  return { sides: sides.geometry(), tops: tops.geometry() };
}

function glassGeometry() {
  const b = new Builder();
  const side = [[X(412), Y(188)], [X(398), Y(138.3)], [X(548), Y(112)], [X(772), Y(181)], [X(781), Y(188)]];
  for (const s of [1, -1]) b.poly(side.map((q) => onTumble(q[0], q[1], s, 0.004)), V(0, TUMBLE, s));
  const ws = [1.70, 0.43].map((x) => [x, zAt(topFront(x)) - 0.075]);
  b.poly([onFrontTop(ws[0][0], ws[0][1], 0.004), onFrontTop(ws[1][0], ws[1][1], 0.004), onFrontTop(ws[1][0], -ws[1][1], 0.004), onFrontTop(ws[0][0], -ws[0][1], 0.004)], frontTopNormal);
  const rf = [0.17, -0.66].map((x) => [x, zAt(topRear(x)) - 0.075]);
  b.poly([onRearTop(rf[0][0], rf[0][1], 0.004), onRearTop(rf[1][0], rf[1][1], 0.004), onRearTop(rf[1][0], -rf[1][1], 0.004), onRearTop(rf[0][0], -rf[0][1], 0.004)], rearTopNormal);
  return b.geometry();
}

function trimGeometry() {
  const b = new Builder();
  const lift = 0.006;
  for (const s of [1, -1]) {
    // B-pillar
    const x0 = X(578), x1 = X(590);
    const yTop = Y(119);
    b.poly([onTumble(x0, YB, s, lift), onTumble(x0, yTop, s, lift), onTumble(x1, yTop - 0.004, s, lift), onTumble(x1, YB, s, lift)], V(0, TUMBLE, s));
    // Mirrors
    const mx = X(734), my = Y(197);
    const m = [V(mx - 0.13, my + 0.03, s * W), V(mx + 0.10, my + 0.05, s * W), V(mx + 0.12, my - 0.07, s * (W + 0.02)), V(mx - 0.11, my - 0.08, s * (W + 0.02))];
    const out = m.map((q) => q.clone().add(V(0, 0, s * 0.14)));
    b.poly(out, V(0, 0, s));
    for (let i = 0; i < 4; i++) b.poly([m[i], m[(i + 1) % 4], out[(i + 1) % 4], out[i]], V(0, 0.2, s));
  }
  return b.geometry();
}

function claddingGeometry() {
  const b = new Builder();
  const d = 0.035;
  for (const s of [1, -1]) {
    const z0 = s * W, z1 = s * (W + d);
    for (const cx of WHEELS) {
      const o = flareOuter(cx), i = archPts(cx);
      const band = [...o, ...i.slice().reverse()];
      b.shape(band, (q) => V(q[0], q[1], z1), V(0, 0, s));
      const away = (p, q) => V((p[0] + q[0]) / 2 - cx, (p[1] + q[1]) / 2 - BOT, 0);
      for (let k = 0; k < o.length - 1; k++) {
        b.poly([V(...o[k], z0), V(...o[k + 1], z0), V(...o[k + 1], z1), V(...o[k], z1)], away(o[k], o[k + 1]));
        b.poly([V(...i[k], z0), V(...i[k + 1], z0), V(...i[k + 1], z1), V(...i[k], z1)], away(i[k], i[k + 1]).negate());
      }
    }
    // Rocker strips between and outside the arches
    const h = 0.085, zz = s * (W + 0.012);
    const [rw, fw] = WHEELS;
    for (const [xa, xb] of [[RB[0] + 0.02, rw - 0.667], [rw + 0.667, fw - 0.667], [fw + 0.667, F3[0] - 0.01]]) {
      b.poly([V(xa, BOT, zz), V(xb, BOT, zz), V(xb, BOT + h, zz), V(xa, BOT + h, zz)], V(0, 0, s));
      b.poly([V(xa, BOT + h, s * W), V(xb, BOT + h, s * W), V(xb, BOT + h, zz), V(xa, BOT + h, zz)], V(0, 1, 0));
    }
  }
  // Lower front apron and rear bumper
  b.poly([V(...F2, W), V(F3[0], BOT, W), V(F3[0], BOT, -W), V(...F2, -W)], V(1, -0.3, 0));
  b.poly([V(...R1, W), V(RB[0], BOT, W), V(RB[0], BOT, -W), V(...R1, -W)], V(-1, -0.3, 0));
  return b.geometry();
}

function wellGeometry() {
  const b = new Builder();
  for (const cx of WHEELS) {
    const a = archPts(cx);
    for (let k = 0; k < a.length - 1; k++) {
      b.poly([V(...a[k], W - 0.002), V(...a[k + 1], W - 0.002), V(...a[k + 1], -W + 0.002), V(...a[k], -W + 0.002)], V(0, -1, 0));
    }
    for (const s of [1, -1]) b.poly(a.map((q) => V(q[0], q[1], s * 0.6)), V(0, 0, s));
  }
  // Underbody
  const y0 = 0.30, y1 = BOT + 0.01, zz = 0.92;
  b.poly([V(RB[0] + 0.05, y0, zz), V(F3[0] - 0.05, y0, zz), V(F3[0] - 0.05, y0, -zz), V(RB[0] + 0.05, y0, -zz)], V(0, -1, 0));
  for (const s of [1, -1]) b.poly([V(RB[0] + 0.05, y0, s * zz), V(F3[0] - 0.05, y0, s * zz), V(F3[0] - 0.05, y1, s * zz), V(RB[0] + 0.05, y1, s * zz)], V(0, 0, s));
  return b.geometry();
}

function seamGeometry() {
  const pts = [];
  const seg = (a, b) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (const s of [1, -1]) {
    const z = s * (W + 0.002);
    seg(V(X(584), YB, z), V(X(584), BOT + 0.085, z));
    seg(V(X(412), YB, z), V(X(412), BOT + 0.085, z));
    seg(V(X(782), Y(189), z), V(X(746), Y(205), z));
  }
  // Vault lid and frunk lid outlines
  const xv = -0.74;
  seg(onRearTop(xv, zAt(topRear(xv)) - 0.02, 0.002), onRearTop(xv, -(zAt(topRear(xv)) - 0.02), 0.002));
  for (const s of [1, -1]) {
    seg(onRearTop(xv, s * (zAt(topRear(xv)) - 0.12), 0.002), onRearTop(C[0] + 0.03, s * (W - 0.12), 0.002));
    seg(onFrontTop(1.72, s * (W - 0.10), 0.002), onFrontTop(N[0] - 0.05, s * (W - 0.10), 0.002));
  }
  seg(onFrontTop(1.72, W - 0.10, 0.002), onFrontTop(1.72, -(W - 0.10), 0.002));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

// The Cybertruck's hard edges catch light like a knife; draw them as fine highlights.
function edgeGeometry() {
  const pts = [];
  const seg = (a, b) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (const s of [1, -1]) {
    seg(V(...N, s * W), V(...A, s * W));
    seg(V(...A, s * W), V(...PK, s * WR));
    seg(V(...PK, s * WR), V(...C, s * W));
    seg(V(...A, s * W), V(...C, s * W));
  }
  seg(V(...N, W), V(...N, -W));
  seg(V(...PK, WR), V(...PK, -WR));
  seg(V(...C, W), V(...C, -W));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/* ------------------------------------------------------------------
   Textures made on the fly (no image downloads)
   ------------------------------------------------------------------ */
function canvasTex(w, h, draw, srgb = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function brushedTexture() {
  const t = canvasTex(1024, 256, (ctx, w, h) => {
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const row = 150 + (Math.random() + Math.random() - 1) * 16;
      let drift = 0;
      for (let x = 0; x < w; x++) {
        drift = drift * 0.99 + (Math.random() - 0.5) * 3;
        const v = Math.max(0, Math.min(255, row + drift));
        const i = (y * w + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(0.45, 6);
  return t;
}
function radialTexture(stops, srgb = true) {
  return canvasTex(128, 128, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  }, srgb);
}
function shadowTexture() {
  return canvasTex(512, 256, (ctx, w, h) => {
    ctx.filter = 'blur(18px)';
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * 0.40, h * 0.30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.filter = 'blur(6px)';
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    for (const fx of [0.2, 0.8]) { ctx.beginPath(); ctx.ellipse(w * fx, h / 2, w * 0.07, h * 0.33, 0, 0, Math.PI * 2); ctx.fill(); }
  });
}

function hexToRgb(hex) { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; }

/* ------------------------------------------------------------------
   Materials
   ------------------------------------------------------------------ */
function makeSteel(brushed, satin = false) {
  return new THREE.MeshPhysicalMaterial({
    color: satin ? '#9da4a9' : '#c2c8cd',
    metalness: 1,
    roughness: satin ? 0.5 : 0.3,
    roughnessMap: brushed,
    anisotropy: 0.55,
    envMapIntensity: 1
  });
}

// Color-shift: blend three colors by how squarely each facet faces the viewer.
function shiftify(mat, stops) {
  mat.userData.shift = stops.map((h) => new THREE.Color(h));
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uShiftA = { value: mat.userData.shift[0] };
    sh.uniforms.uShiftB = { value: mat.userData.shift[1] };
    sh.uniforms.uShiftC = { value: mat.userData.shift[2] };
    sh.fragmentShader = 'uniform vec3 uShiftA; uniform vec3 uShiftB; uniform vec3 uShiftC;\n' + sh.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `float ndv = abs( dot( normalize( vNormal ), normalize( vViewPosition ) ) );
       vec3 shiftCol = ndv > 0.55 ? mix( uShiftB, uShiftA, smoothstep( 0.55, 0.98, ndv ) ) : mix( uShiftC, uShiftB, smoothstep( 0.08, 0.55, ndv ) );
       vec4 diffuseColor = vec4( shiftCol, opacity );`
    );
  };
  mat.customProgramCacheKey = () => 'shift';
  return mat;
}

function wrapParams(finish, colorId) {
  if (finish === 'ppf') {
    const satin = colorId === 'satin-clear';
    return { steel: true, satin, clearcoat: 1, clearcoatRoughness: satin ? 0.55 : 0.03 };
  }
  if (finish === 'shift') {
    const c = findColor('shift', colorId) || SHIFTS[0];
    return { color: c.stops[1], metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.04, shift: c.stops };
  }
  const c = findColor(finish, colorId) || SOLIDS[0];
  switch (finish) {
    case 'gloss': return { color: c.hex, metalness: 0.0, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.03 };
    case 'satin': return { color: c.hex, metalness: 0.08, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.5 };
    case 'matte': return { color: c.hex, metalness: 0.0, roughness: 0.92 };
    case 'chrome': {
      const col = new THREE.Color(c.hex);
      const hsl = {}; col.getHSL(hsl);
      if (hsl.l < 0.12) col.setHSL(hsl.h, hsl.s, 0.22);
      if (hsl.s < 0.12) col.setHSL(0, 0, Math.max(hsl.l, 0.78));
      return { color: col, metalness: 1, roughness: 0.05 };
    }
    default: return { color: c.hex, roughness: 0.4 };
  }
}

function makeWrap(params, brushed) {
  let m;
  if (params.steel) {
    m = makeSteel(brushed, params.satin);
    m.clearcoat = params.clearcoat;
    m.clearcoatRoughness = params.clearcoatRoughness;
  } else {
    m = new THREE.MeshPhysicalMaterial({
      color: params.color, metalness: params.metalness || 0, roughness: params.roughness,
      clearcoat: params.clearcoat || 0, clearcoatRoughness: params.clearcoatRoughness || 0
    });
    if (params.shift) shiftify(m, params.shift);
  }
  return m;
}

/* ------------------------------------------------------------------
   Lighting environment: a dark studio with an ember horizon and
   long softboxes, baked into a reflection map once.
   ------------------------------------------------------------------ */
function makeEnvironment(renderer, glow) {
  const env = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { glow: { value: new THREE.Color(glow) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 glow; varying vec3 vP;
      void main(){
        float y = vP.y;
        // dark sky, a lit backdrop sweep just under the horizon, dark floor below it
        vec3 sky = mix(vec3(0.05, 0.05, 0.055), vec3(0.13, 0.13, 0.14), smoothstep(0.1, 0.95, y));
        vec3 sweep = mix(vec3(0.58, 0.59, 0.6), vec3(0.2, 0.2, 0.205), smoothstep(-0.02, -0.085, y));
        vec3 floorC = mix(vec3(0.05, 0.048, 0.047), vec3(0.015), smoothstep(-0.12, -0.5, y));
        vec3 c = y > 0.0 ? sky : (y > -0.095 ? sweep : floorC);
        float band = exp(-pow((y - 0.11) / 0.05, 2.0));
        c += mix(glow, vec3(dot(glow, vec3(0.3333))), 0.25) * band * 0.32;
        gl_FragColor = vec4(c, 1.0);
      }`
  }));
  env.add(dome);
  const box = (w, h, pos, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.copy(pos); m.lookAt(0, 0, 0); env.add(m);
  };
  box(20, 1.2, V(0, 13, 1.5), 3.2);    // long overhead strip: the highlight along every top edge
  box(16, 3.5, V(4, 4.5, 15), 1.1);    // big softbox on the viewer's side: lights the flat flanks
  box(6, 3, V(12, 7, 6), 2.2);         // key, front passenger corner
  box(10, 2.2, V(-12, 3.5, -8), 1.4);  // rim from behind
  box(12, 3, V(-2, 4, -15), 0.3);      // far-side fill
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.035).texture;
  pm.dispose();
  return tex;
}

function drawBackground(ctx, w, h, glow) {
  const g = new THREE.Color(glow);
  const rgb = `${Math.round(g.r * 255)}, ${Math.round(g.g * 255)}, ${Math.round(g.b * 255)}`;
  {
    const lin = ctx.createLinearGradient(0, 0, 0, h);
    lin.addColorStop(0, '#080809');
    lin.addColorStop(0.5, '#0c0b0b');
    lin.addColorStop(1, '#060606');
    ctx.fillStyle = lin; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.scale(1, 0.2);
    const rad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.62);
    rad.addColorStop(0, `rgba(${rgb}, 0.6)`);
    rad.addColorStop(0.4, `rgba(${rgb}, 0.2)`);
    rad.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = rad; ctx.fillRect(-w, -h * 4, w * 2, h * 8);
    ctx.restore();
  }
}
function backgroundTexture(glow) {
  return canvasTex(1024, 512, (ctx, w, h) => drawBackground(ctx, w, h, glow), true);
}

/* ------------------------------------------------------------------
   The studio
   ------------------------------------------------------------------ */
export function createStudio(canvas, opts = {}) {
  const reduce = !!opts.reducedMotion;
  const glow = opts.glow || '#ff5a1a';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: !!opts.preserve, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer, glow);
  scene.background = backgroundTexture(glow);

  const camera = new THREE.PerspectiveCamera(24, 2, 0.1, 200);
  const baseTarget = V(0.1, 0.82, 0);
  const target = baseTarget.clone();
  const framing = { offset: V(...(opts.offset || [0, 0, 0])), shift: opts.shift || [0, 0], fitWidth: opts.fitWidth || 3.9, fitHeight: opts.fitHeight || 1.55 };
  target.copy(baseTarget).add(framing.offset);

  const brushed = brushedTexture();
  const geo = bodyGeometries();

  const keepRear = new THREE.Plane(V(-1, 0, 0), XMIN);
  const keepFront = new THREE.Plane(V(1, 0, 0), -XMIN);
  const edgeA = new THREE.Plane(V(1, 0, 0), -XMIN);
  const edgeB = new THREE.Plane(V(-1, 0, 0), XMIN + 0.014);

  const steel = makeSteel(brushed);
  steel.clippingPlanes = [keepFront];
  let wrapMat = makeWrap(wrapParams('satin', 'obsidian'), brushed);
  wrapMat.clippingPlanes = [keepRear];
  let topMat = null;
  const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.55, 1.5), toneMapped: false, clippingPlanes: [edgeA, edgeB], polygonOffset: true, polygonOffsetFactor: -2 });

  const truck = new THREE.Group();
  const meshes = {
    steelSides: new THREE.Mesh(geo.sides, steel),
    steelTops: new THREE.Mesh(geo.tops, steel),
    wrapSides: new THREE.Mesh(geo.sides, wrapMat),
    wrapTops: new THREE.Mesh(geo.tops, wrapMat),
    edgeSides: new THREE.Mesh(geo.sides, edgeMat),
    edgeTops: new THREE.Mesh(geo.tops, edgeMat)
  };
  Object.values(meshes).forEach((m) => truck.add(m));

  const glass = new THREE.MeshPhysicalMaterial({ color: '#07090c', metalness: 0, roughness: 0.06, envMapIntensity: 0.28, polygonOffset: true, polygonOffsetFactor: -1 });
  truck.add(new THREE.Mesh(glassGeometry(), glass));
  const trimMat = new THREE.MeshStandardMaterial({ color: '#0b0c0d', roughness: 0.45, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -2 });
  truck.add(new THREE.Mesh(trimGeometry(), trimMat));
  const clad = new THREE.MeshStandardMaterial({ color: '#1a1c1e', roughness: 0.62, metalness: 0.05 });
  truck.add(new THREE.Mesh(claddingGeometry(), clad));
  const well = new THREE.MeshBasicMaterial({ color: '#030303', side: THREE.DoubleSide });
  truck.add(new THREE.Mesh(wellGeometry(), well));
  truck.add(new THREE.LineSegments(seamGeometry(), new THREE.LineBasicMaterial({ color: '#000000', transparent: true, opacity: 0.55 })));
  truck.add(new THREE.LineSegments(edgeGeometry(), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.28 })));

  // Wheels: tire + six-facet aero cover
  const tireMat = new THREE.MeshStandardMaterial({ color: '#0e0e0f', roughness: 0.88 });
  const coverMat = new THREE.MeshStandardMaterial({ color: '#4a5056', roughness: 0.35, metalness: 0.7, flatShading: true });
  const rimMat = new THREE.MeshStandardMaterial({ color: '#15171a', roughness: 0.5, metalness: 0.4 });
  const tireGeo = new THREE.CylinderGeometry(TIRE_R, TIRE_R, 0.31, 48, 1);
  tireGeo.rotateX(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.315, 0.315, 0.02, 48, 1);
  rimGeo.rotateX(Math.PI / 2);
  const wheels = [];
  for (const x of WHEELS) {
    for (const s of [1, -1]) {
      const w = new THREE.Group();
      w.position.set(x, WY, s * 0.855);
      w.add(new THREE.Mesh(tireGeo, tireMat));
      const rim = new THREE.Mesh(rimGeo, rimMat); rim.position.z = s * 0.156; w.add(rim);
      const coverGeo = new THREE.ConeGeometry(0.3, 0.05, 6, 1);
      coverGeo.rotateX(s * Math.PI / 2);
      const cover = new THREE.Mesh(coverGeo, coverMat); cover.position.z = s * 0.18; w.add(cover);
      truck.add(w);
      wheels.push(w);
    }
  }

  // Light bars
  const barFront = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.016, 2 * W - 0.12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.3, 2.4), toneMapped: false }));
  barFront.position.set(N[0] - 0.004, N[1] - 0.02, 0);
  truck.add(barFront);
  const barRear = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 2 * W - 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.18, 0.1), toneMapped: false }));
  barRear.position.set(C[0] - 0.004, C[1] - 0.03, 0);
  truck.add(barRear);
  const glowTex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
  const addGlow = (x, y, color, size, n) => {
    for (let i = 0; i < n; i++) {
      const z = -W + 0.1 + (i / (n - 1)) * (2 * W - 0.2);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
      sp.position.set(x, y, z); sp.scale.set(size, size, 1);
      truck.add(sp);
    }
  };
  addGlow(N[0] + 0.03, N[1] - 0.02, '#cfe6ff', 0.34, 9);
  addGlow(C[0] - 0.03, C[1] - 0.03, '#ff2a14', 0.3, 9);

  scene.add(truck);

  // Reflection in the floor: a mirrored copy under a translucent floor
  const mirror = truck.clone();
  mirror.scale.y = -1;
  scene.add(mirror);

  const floorAlpha = radialTexture([[0, '#fff'], [0.22, '#fff'], [0.5, '#000'], [1, '#000']], false);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.5, metalness: 0.0, transparent: true, opacity: 0.9, alphaMap: floorAlpha, depthWrite: false, envMapIntensity: 0.45 }));
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = 1;
  scene.add(floor);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2.9), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.92 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.05, 0.004, 0);
  shadow.renderOrder = 2;
  scene.add(shadow);

  const key = new THREE.DirectionalLight('#ffffff', 1.8);
  key.position.set(6, 9, 8);
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#b9c1c9', '#121212', 0.55));

  /* ---------- camera rig ---------- */
  const view = { az: 0.42, el: 0.1, dist: 1, azT: 0.42, elT: 0.1, vel: 0, zoom: 1 };
  let userActive = 0;
  let t0 = performance.now();

  function fitDistance() {
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const needW = framing.fitWidth / (Math.tan(vfov / 2) * camera.aspect);
    const needH = framing.fitHeight / Math.tan(vfov / 2);
    return Math.max(needW, needH);
  }
  function placeCamera() {
    const d = fitDistance() * view.zoom;
    camera.position.set(
      target.x + d * Math.sin(view.az) * Math.cos(view.el),
      target.y + d * Math.sin(view.el),
      target.z + d * Math.cos(view.az) * Math.cos(view.el)
    );
    camera.lookAt(target);
    // Slide the view window so the truck sits off-center while still turning about its own middle.
    const w = size.w, h = size.h;
    if (framing.shift[0] || framing.shift[1]) camera.setViewOffset(w, h, -framing.shift[0] * w, -framing.shift[1] * h, w, h);
    else camera.clearViewOffset();
  }

  const size = { w: 1, h: 1 };
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    size.w = w; size.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  /* ---------- reveal ---------- */
  let reveal = 0;
  function setReveal(pct) {
    reveal = Math.max(0, Math.min(100, pct));
    const x = XMIN - 0.02 + (reveal / 100) * (XMAX - XMIN + 0.04);
    keepRear.constant = x;
    keepFront.constant = -x;
    edgeA.constant = -x;
    edgeB.constant = x + 0.014;
    const showEdge = reveal > 0.3 && reveal < 99.7;
    meshes.edgeSides.visible = meshes.edgeTops.visible = showEdge;
    dirty = true;
  }

  /* ---------- looks ---------- */
  function setLook(finish, colorId, top) {
    const next = makeWrap(wrapParams(finish, colorId), brushed);
    next.clippingPlanes = [keepRear];
    meshes.wrapSides.material = next;
    let nextTop = next;
    if (top) {
      nextTop = makeWrap(wrapParams(top.finish, top.color), brushed);
      nextTop.clippingPlanes = [keepRear];
    }
    meshes.wrapTops.material = nextTop;
    // keep the mirrored copy in sync
    mirror.children.forEach((m, i) => {
      if (truck.children[i] === meshes.wrapSides) m.material = next;
      if (truck.children[i] === meshes.wrapTops) m.material = nextTop;
    });
    if (wrapMat !== steel) wrapMat.dispose();
    if (topMat && topMat !== next) topMat.dispose();
    wrapMat = next;
    topMat = nextTop !== next ? nextTop : null;
    dirty = true;
  }

  /* ---------- interaction ---------- */
  let dragging = false, lastX = 0, lastY = 0;
  if (opts.interactive !== false) {
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY; userActive = performance.now();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (opts.onInteract) opts.onInteract();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      view.azT -= dx * 0.005;
      view.elT = Math.max(0.02, Math.min(0.42, view.elT + dy * 0.003));
      view.vel = -dx * 0.005;
      userActive = performance.now();
    });
    const end = () => { dragging = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  /* ---------- loop ---------- */
  let dirty = true, visible = true, raf = 0, intro = reduce ? 1 : 0;
  const baseAz = opts.az ?? 0.42;
  view.az = view.azT = reduce ? baseAz : baseAz - 0.55;
  view.el = view.elT = opts.el ?? 0.1;
  view.zoom = reduce ? 1 : 1.12;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000;
    let moving = false;
    if (intro < 1) {
      intro = Math.min(1, t / 2.6);
      const k = 1 - Math.pow(1 - intro, 3);
      view.azT = baseAz - 0.55 * (1 - k);
      view.zoom = 1 + 0.12 * (1 - k);
      moving = true;
    } else if (!dragging) {
      if (Math.abs(view.vel) > 0.0004) { view.azT += view.vel; view.vel *= 0.93; moving = true; }
      if (!reduce && now - userActive > 5000) { view.azT += 0.0009; moving = true; }
    }
    const da = view.azT - view.az, de = view.elT - view.el;
    if (Math.abs(da) > 1e-4 || Math.abs(de) > 1e-4) { view.az += da * 0.12; view.el += de * 0.12; moving = true; }
    if (moving || dirty) {
      placeCamera();
      renderer.render(scene, camera);
      dirty = false;
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  setReveal(0);
  placeCamera();
  raf = requestAnimationFrame(frame);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) dirty = true; }).observe(canvas);
  }

  return {
    setLook,
    setReveal,
    getReveal: () => reveal,
    setFraming({ offset, shift, fitWidth, fitHeight } = {}) {
      if (offset) framing.offset.set(...offset);
      if (shift) framing.shift = shift;
      if (fitWidth) framing.fitWidth = fitWidth;
      if (fitHeight) framing.fitHeight = fitHeight;
      target.copy(baseTarget).add(framing.offset);
      dirty = true;
    },
    setGlow(hex) {
      const img = scene.background.image;
      drawBackground(img.getContext('2d'), img.width, img.height, hex);
      scene.background.needsUpdate = true;
      dirty = true;
    },
    setView(az, el) { if (az !== undefined) view.azT = az; if (el !== undefined) view.elT = el; userActive = performance.now(); },
    // Render one frame now and return it as an image (used for the build sheet and stills).
    capture(type = 'image/jpeg', q = 0.9, frameOverride) {
      const saved = { offset: framing.offset.clone(), shift: framing.shift, fitWidth: framing.fitWidth, fitHeight: framing.fitHeight, reveal };
      if (frameOverride && frameOverride.reveal !== undefined) setReveal(frameOverride.reveal);
      if (frameOverride) {
        framing.offset.set(...(frameOverride.offset || [0, 0, 0]));
        framing.shift = frameOverride.shift || [0, 0];
        framing.fitWidth = frameOverride.fitWidth || 3.9;
        framing.fitHeight = frameOverride.fitHeight || 1.55;
        target.copy(baseTarget).add(framing.offset);
      }
      placeCamera(); renderer.render(scene, camera);
      const url = canvas.toDataURL(type, q);
      if (frameOverride) {
        framing.offset.copy(saved.offset); framing.shift = saved.shift; framing.fitWidth = saved.fitWidth; framing.fitHeight = saved.fitHeight;
        target.copy(baseTarget).add(framing.offset);
        if (frameOverride.reveal !== undefined) setReveal(saved.reveal);
        placeCamera(); renderer.render(scene, camera);
      }
      return url;
    },
    still({ az, el, zoom = 1, targetShift = [0, 0, 0], fov } = {}) {
      intro = 1; view.az = view.azT = az; view.el = view.elT = el; view.zoom = zoom;
      target.copy(baseTarget).add(V(...targetShift));
      if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      placeCamera(); renderer.render(scene, camera);
    },
    project(p) { const v = V(...p).project(camera); return [(v.x + 1) / 2, (1 - v.y) / 2]; },
    anchors: {
      nose: [N[0], N[1], W * 0.4], rake: [1.25, topFront(1.25), 0.35], panel: [X(640), Y(262), W],
      door: [X(412), Y(250), W], arch: [WHEELS[1], Y(206), W + 0.03], vault: [-1.9, topRear(-1.9), 0.4]
    },
    renderer, scene, camera,
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); }
  };
}
