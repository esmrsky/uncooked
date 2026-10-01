/*
  The live Cybertruck studio.
  Loads a glTF model of the truck, then layers every film on top of it with one
  material: wraps land only where the model's metalness map marks bare stainless,
  so tires, glass, trim and lights keep their own look.
  Units are meters. +x is forward, +y is up.
*/
import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/addons/libs/meshopt_decoder.module.js';

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

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TRUCK_LENGTH = 5.683; // 223.7 in, Tesla's published length

/* ------------------------------------------------------------------
   Textures made on the fly
   ------------------------------------------------------------------ */
function canvasTex(w, h, draw, srgb = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
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
   Films
   One shader layer drives every finish through uniforms, so switching
   finishes never recompiles. wrapMask comes from the model's own
   metalness map: bare stainless = 1, everything else = 0.
   ------------------------------------------------------------------ */
const FILM_UNIFORMS = `
uniform vec3 uWrapColor; uniform float uColorMix; uniform float uTint;
uniform float uMetal; uniform float uMetalMix; uniform float uRough; uniform float uRoughMix; uniform float uCoat;
uniform float uShift; uniform vec3 uShiftA; uniform vec3 uShiftB; uniform vec3 uShiftC;
uniform float uTop; uniform vec3 uTopColor; uniform float uTopRough;
`;

function makeFilm(src) {
  const m = new THREE.MeshPhysicalMaterial({
    map: src.map, metalnessMap: src.metalnessMap, roughnessMap: src.roughnessMap,
    metalness: 1, roughness: 1, clearcoat: 1, clearcoatRoughness: 0.05,
    side: src.side, envMapIntensity: 1
  });
  const u = {
    uWrapColor: { value: new THREE.Color('#1c1d20') }, uColorMix: { value: 1 }, uTint: { value: 1 },
    uMetal: { value: 0 }, uMetalMix: { value: 1 }, uRough: { value: 0.5 }, uRoughMix: { value: 1 }, uCoat: { value: 0.35 },
    uShift: { value: 0 }, uShiftA: { value: new THREE.Color() }, uShiftB: { value: new THREE.Color() }, uShiftC: { value: new THREE.Color() },
    uTop: { value: 0 }, uTopColor: { value: new THREE.Color('#1c1d20') }, uTopRough: { value: 0.5 }
  };
  m.userData.u = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.fragmentShader = FILM_UNIFORMS + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        // Tail and marker lights are baked into the texture as saturated red: make them glow.
        float redLight = step( 0.35, diffuseColor.r ) * step( diffuseColor.g, 0.08 ) * step( diffuseColor.b, 0.08 );
        totalEmissiveRadiance += diffuseColor.rgb * redLight * 6.0;
        float metalS = texture2D( metalnessMap, vMetalnessMapUv ).b;
        float wrapMask = smoothstep( 0.6, 0.85, metalS ) * smoothstep( 0.35, 0.6, dot( diffuseColor.rgb, vec3( 0.3333 ) ) );
        vec3 filmCol = uWrapColor;
        if ( uShift > 0.5 ) {
          float ndv = abs( dot( normalize( vNormal ), normalize( vViewPosition ) ) );
          filmCol = ndv > 0.55 ? mix( uShiftB, uShiftA, smoothstep( 0.55, 0.98, ndv ) ) : mix( uShiftC, uShiftB, smoothstep( 0.08, 0.55, ndv ) );
        }
        float topMask = 0.0;
        if ( uTop > 0.5 ) {
          vec3 wN = normalize( ( vec4( vNormal, 0.0 ) * viewMatrix ).xyz );
          topMask = smoothstep( 0.5, 0.75, wN.y );
        }
        vec3 filmed = mix( diffuseColor.rgb * uTint, filmCol, uColorMix );
        filmed = mix( filmed, uTopColor, topMask );
        diffuseColor.rgb = mix( diffuseColor.rgb, filmed, wrapMask );`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix( roughnessFactor, mix( mix( roughnessFactor, uRough, uRoughMix ), uTopRough, topMask ), wrapMask );`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        metalnessFactor = mix( metalnessFactor, mix( mix( metalnessFactor, uMetal, uMetalMix ), 0.05, topMask ), wrapMask );`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat = uCoat * wrapMask * ( 1.0 - 0.7 * topMask );
        #endif`);
  };
  m.customProgramCacheKey = () => 'film-layer';
  return m;
}

// Finish → shader settings
function filmSettings(finish, colorId) {
  const solid = (f, c) => ({ color: c.hex, colorMix: 1, tint: 1, metal: f.metal, metalMix: 1, rough: f.rough, roughMix: 1, coat: f.coat, coatRough: f.coatRough, shift: null });
  if (finish === 'bare') return { colorMix: 0, tint: 1, metalMix: 0, roughMix: 0, coat: 0, coatRough: 0.1, shift: null };
  if (finish === 'ppf') {
    return colorId === 'satin-clear'
      ? { colorMix: 0, tint: 0.78, metalMix: 0, rough: 0.55, roughMix: 1, coat: 0.6, coatRough: 0.55, shift: null }
      : { colorMix: 0, tint: 1, metalMix: 0, roughMix: 0, coat: 1, coatRough: 0.03, shift: null };
  }
  if (finish === 'shift') {
    const c = findColor('shift', colorId) || SHIFTS[0];
    return { color: c.stops[1], colorMix: 1, tint: 1, metal: 0.35, metalMix: 1, rough: 0.3, roughMix: 1, coat: 1, coatRough: 0.04, shift: c.stops };
  }
  const c = findColor(finish, colorId) || SOLIDS[0];
  switch (finish) {
    case 'gloss': return solid({ metal: 0, rough: 0.32, coat: 1, coatRough: 0.03 }, c);
    case 'satin': return solid({ metal: 0.08, rough: 0.5, coat: 0.35, coatRough: 0.5 }, c);
    case 'matte': return solid({ metal: 0, rough: 0.92, coat: 0, coatRough: 0.5 }, c);
    case 'chrome': {
      const col = new THREE.Color(c.hex); const hsl = {}; col.getHSL(hsl);
      if (hsl.l < 0.12) col.setHSL(hsl.h, hsl.s, 0.22);
      if (hsl.s < 0.12) col.setHSL(0, 0, Math.max(hsl.l, 0.8));
      return { color: col, colorMix: 1, tint: 1, metal: 1, metalMix: 1, rough: 0.05, roughMix: 1, coat: 0, coatRough: 0.1, shift: null };
    }
    default: return solid({ metal: 0, rough: 0.4, coat: 0, coatRough: 0.5 }, c);
  }
}

function applyFilm(m, finish, colorId, top) {
  const s = filmSettings(finish, colorId);
  const u = m.userData.u;
  if (s.color !== undefined) u.uWrapColor.value.set(s.color);
  u.uColorMix.value = s.colorMix;
  u.uTint.value = s.tint;
  u.uMetal.value = s.metal ?? 0; u.uMetalMix.value = s.metalMix;
  u.uRough.value = s.rough ?? 0.5; u.uRoughMix.value = s.roughMix;
  u.uCoat.value = s.coat;
  m.clearcoatRoughness = s.coatRough;
  u.uShift.value = s.shift ? 1 : 0;
  if (s.shift) { u.uShiftA.value.set(s.shift[0]); u.uShiftB.value.set(s.shift[1]); u.uShiftC.value.set(s.shift[2]); }
  if (top) {
    const t = filmSettings(top.finish, top.color);
    u.uTop.value = 1;
    u.uTopColor.value.set(t.color || '#1c1d20');
    u.uTopRough.value = t.rough ?? 0.5;
  } else {
    u.uTop.value = 0;
  }
}

// A thin glowing line where the film ends, drawn only on the stainless.
function makeEdge(metalTex, planes) {
  const m = new THREE.MeshBasicMaterial({ map: metalTex, color: new THREE.Color(1.6, 1.55, 1.5), toneMapped: false, clippingPlanes: planes, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', 'if ( texture2D( map, vMapUv ).b < 0.6 ) discard;');
  };
  m.customProgramCacheKey = () => 'film-edge';
  return m;
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
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer, glow);
  scene.background = backgroundTexture(glow);

  const camera = new THREE.PerspectiveCamera(24, 2, 0.1, 200);
  const baseTarget = V(0, 0.85, 0);
  const target = baseTarget.clone();
  const framing = { offset: V(...(opts.offset || [0, 0, 0])), shift: opts.shift || [0, 0], fitWidth: opts.fitWidth || 3.9, fitHeight: opts.fitHeight || 1.55 };
  target.copy(baseTarget).add(framing.offset);

  // Clipping planes for the wrap/stainless split, measured along the truck's length.
  let xMin = -TRUCK_LENGTH / 2, xMax = TRUCK_LENGTH / 2;
  const keepRear = new THREE.Plane(V(-1, 0, 0), xMin);
  const keepFront = new THREE.Plane(V(1, 0, 0), -xMin);
  const edgeA = new THREE.Plane(V(1, 0, 0), -xMin);
  const edgeB = new THREE.Plane(V(-1, 0, 0), xMin + 0.014);

  const truck = new THREE.Group();
  truck.visible = false;
  scene.add(truck);
  let mirror = null;
  const films = [];       // wrap layers (front of the cut)
  const edges = [];
  let pendingLook = { finish: 'satin', color: 'obsidian', top: null };
  let ready = false;
  const anchors = {};

  const floorAlpha = radialTexture([[0, '#fff'], [0.22, '#fff'], [0.5, '#000'], [1, '#000']], false);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.5, metalness: 0.0, transparent: true, opacity: 0.9, alphaMap: floorAlpha, depthWrite: false, envMapIntensity: 0.45 }));
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = 1;
  scene.add(floor);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2.9), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.92 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.004, 0);
  shadow.renderOrder = 2;
  scene.add(shadow);

  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(6, 9, 8);
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#b9c1c9', '#121212', 0.45));

  /* ---------- load the truck ---------- */
  function buildFromModel(gltf) {
    const root = gltf.scene;
    // The file points the nose along +z; turn it to +x and scale to the real length.
    root.rotation.y = Math.PI / 2;
    root.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(root);
    const s = TRUCK_LENGTH / (box.max.x - box.min.x);
    root.scale.setScalar(s);
    root.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(root);
    root.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    root.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(root);
    xMin = box.min.x; xMax = box.max.x;

    const glass = new THREE.MeshPhysicalMaterial({ color: '#0a0d11', metalness: 0, roughness: 0.04, transparent: true, opacity: 0.86, envMapIntensity: 0.6 });
    const lightBar = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.3, 2.4, 2.5), toneMapped: false });
    const painted = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      const name = (o.name || '').toLowerCase();
      if (name.includes('glass')) { o.material = glass; return; }
      if (name.includes('dashboard_light')) { o.material = lightBar; return; }
      if (name.includes('dashboard_line')) { o.material = new THREE.MeshStandardMaterial({ color: '#0b0c0d', roughness: 0.4 }); return; }
      if (o.material && o.material.metalnessMap) painted.push(o);
    });
    for (const o of painted) {
      const src = o.material;
      const film = makeFilm(src); film.clippingPlanes = [keepRear];
      const steel = makeFilm(src); steel.clippingPlanes = [keepFront];
      applyFilm(steel, 'bare');
      const edge = makeEdge(src.metalnessMap, [edgeA, edgeB]);
      o.material = film;
      films.push(film);
      const steelMesh = o.clone(false); steelMesh.material = steel;
      const edgeMesh = o.clone(false); edgeMesh.material = edge;
      o.parent.add(steelMesh, edgeMesh);
      edges.push(edgeMesh);
    }
    truck.add(root);

    const front = root.getObjectByName('dashboard_light');
    const fb = front ? new THREE.Box3().setFromObject(front) : null;
    const H = box.max.y;

    // Points the detail callouts point at
    const L = xMax - xMin;
    const at = (fx, fy, z) => [xMin + fx * L, fy * H, z];
    const halfBody = (box.max.z - box.min.z) / 2;
    Object.assign(anchors, {
      nose: fb ? [fb.max.x, (fb.min.y + fb.max.y) / 2, halfBody * 0.5] : at(1, 0.56, 0.5),
      rake: at(0.76, 0.86, 0.3), panel: at(0.66, 0.42, halfBody), door: at(0.372, 0.46, halfBody),
      arch: at(0.825, 0.585, halfBody), vault: at(0.18, 0.72, 0.4)
    });
  }

  function finishLoad() {
    // Floor reflection doubles the drawing work, so callers can turn it off (phones do).
    if (opts.reflection !== false) {
      mirror = truck.clone();
      mirror.scale.y = -1;
      scene.add(mirror);
    }
    truck.visible = true;
    ready = true;
    setLook(pendingLook.finish, pendingLook.color, pendingLook.top);
    setReveal(reveal);
    t0 = performance.now();
    dirty = true;
  }

  const readyPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(opts.modelUrl || 'assets/models/cybertruck.glb', (gltf) => {
      try { buildFromModel(gltf); finishLoad(); resolve(); } catch (e) { reject(e); }
    }, undefined, reject);
  });
  readyPromise.then(() => opts.onReady && opts.onReady(), (e) => opts.onError && opts.onError(e));

  /* ---------- camera rig ---------- */
  const view = { az: 0.42, el: 0.1, azT: 0.42, elT: 0.1, vel: 0, zoom: 1 };
  let userActive = 0;
  let t0 = performance.now();

  function fitDistance() {
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const needW = framing.fitWidth / (Math.tan(vfov / 2) * camera.aspect);
    const needH = framing.fitHeight / Math.tan(vfov / 2);
    return Math.max(needW, needH);
  }
  const size = { w: 1, h: 1 };
  function placeCamera() {
    const d = fitDistance() * view.zoom;
    camera.position.set(
      target.x + d * Math.sin(view.az) * Math.cos(view.el),
      target.y + d * Math.sin(view.el),
      target.z + d * Math.cos(view.az) * Math.cos(view.el)
    );
    camera.lookAt(target);
    // Slide the view window so the truck sits off-center while still turning about its own middle.
    if (framing.shift[0] || framing.shift[1]) camera.setViewOffset(size.w, size.h, -framing.shift[0] * size.w, -framing.shift[1] * size.h, size.w, size.h);
    else camera.clearViewOffset();
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    size.w = Math.max(1, Math.round(r.width)); size.h = Math.max(1, Math.round(r.height));
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  /* ---------- reveal ---------- */
  let reveal = 0;
  function setReveal(pct) {
    reveal = Math.max(0, Math.min(100, pct));
    const x = xMin - 0.02 + (reveal / 100) * (xMax - xMin + 0.04);
    keepRear.constant = x;
    keepFront.constant = -x;
    edgeA.constant = -x;
    edgeB.constant = x + 0.014;
    // Only draw what the cut actually shows: film behind it, stainless ahead of it, the edge between.
    const showEdge = reveal > 0.3 && reveal < 99.7;
    const showFilm = reveal > 0.3, showSteel = reveal < 99.7;
    for (const group of [truck, mirror]) {
      if (!group) continue;
      group.traverse((o) => {
        if (!o.isMesh || !o.material || !o.material.customProgramCacheKey) return;
        const k = o.material.customProgramCacheKey();
        if (k === 'film-edge') o.visible = showEdge && group === truck;
        else if (k === 'film-layer') o.visible = o.material.clippingPlanes[0] === keepRear ? showFilm : showSteel;
      });
    }
    dirty = true;
  }

  /* ---------- looks ---------- */
  function setLook(finish, colorId, top) {
    pendingLook = { finish, color: colorId, top: top || null };
    films.forEach((m) => applyFilm(m, finish, colorId, top));
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
    let moving = false;
    if (ready && intro < 1) {
      intro = Math.min(1, (now - t0) / 2600);
      const k = 1 - Math.pow(1 - intro, 3);
      view.azT = baseAz - 0.55 * (1 - k);
      view.zoom = 1 + 0.12 * (1 - k);
      moving = true;
    } else if (ready && !dragging) {
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
    ready: readyPromise,
    isReady: () => ready,
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
    // Render one frame now and return it as an image (used for the booking card and stills).
    capture(type = 'image/jpeg', q = 0.9, frameOverride) {
      if (!ready) return null;
      const saved = { offset: framing.offset.clone(), shift: framing.shift, fitWidth: framing.fitWidth, fitHeight: framing.fitHeight, reveal };
      if (frameOverride) {
        if (frameOverride.reveal !== undefined) setReveal(frameOverride.reveal);
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
    anchors,
    renderer, scene, camera,
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); }
  };
}
