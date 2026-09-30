(() => {
  'use strict';

  const SHOP = window.SHOP || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Truck geometry. One coordinate system for every drawing on the page:
     1 unit ≈ 0.25 in, ground at y=380, nose facing right.
     ------------------------------------------------------------------ */
  const G = {
    body: 'M58,186 L548,100 L944,222 L938,258 L926,300 L912,318 L881,318 L869,244 L837,222 L749,222 L717,244 L705,318 L314,318 L302,244 L270,222 L182,222 L150,244 L138,318 L72,318 L60,294 Z',
    glass: 'M412,188 L398,138.3 L548,112 L772,181 L781,188 Z',
    wheels: [226, 793],
    wy: 314,
    x0: 58,
    span: 886
  };
  const arch = (cx) => `M${cx - 88},318 L${cx - 76},244 L${cx - 44},222 L${cx + 44},222 L${cx + 76},244 L${cx + 88},318 Z`;
  const flare = (cx) => `M${cx - 104},318 L${cx - 90},236 L${cx - 52},206 L${cx + 52},206 L${cx + 90},236 L${cx + 104},318 L${cx + 88},318 L${cx + 76},244 L${cx + 44},222 L${cx - 44},222 L${cx - 76},244 L${cx - 88},318 Z`;
  const hexPts = (r) => Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * Math.PI / 180;
    return [+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)];
  });

  /* ------------------------------------------------------------------
     Films
     ------------------------------------------------------------------ */
  const FINISHES = {
    gloss: { label: 'Gloss', code: 'GLS', note: 'Deep reflections, like fresh paint. The easiest finish to wash; dark colors show swirl marks.' },
    satin: { label: 'Satin', code: 'SAT', note: 'A low sheen that sharpens every edge. No wax, no polish.' },
    matte: { label: 'Matte', code: 'MAT', note: 'No reflection at all. Matte-safe soap only, and it can’t be buffed.' },
    chrome: { label: 'Chrome', code: 'CHR', note: 'A rolling mirror. The priciest film, and the hardest to lay flat on big panels.' },
    shift: { label: 'Color-shift', code: 'SHF', note: 'Changes color with the viewing angle. Move across the truck to see it turn.' },
    ppf: { label: 'Clear PPF', code: 'PPF', note: 'Keeps the stainless look. Thick urethane takes the scratches and grime instead.' }
  };
  const SOLIDS = [
    { id: 'obsidian', name: 'Obsidian', hex: '#141518', code: 'OBS' },
    { id: 'glacier', name: 'Glacier White', hex: '#e8ebeb', code: 'GLC' },
    { id: 'concrete', name: 'Concrete', hex: '#7f878b', code: 'CON' },
    { id: 'olive', name: 'Olive Drab', hex: '#4b5431', code: 'OLV' },
    { id: 'tan', name: 'Desert Tan', hex: '#b99d73', code: 'TAN' },
    { id: 'ocean', name: 'Deep Ocean', hex: '#12395c', code: 'OCN' },
    { id: 'red', name: 'Signal Red', hex: '#b3141f', code: 'RED' },
    { id: 'blaze', name: 'Blaze Orange', hex: '#de5a1c', code: 'BLZ' },
    { id: 'volt', name: 'Volt', hex: '#c6dd3a', code: 'VLT' },
    { id: 'violet', name: 'Ultraviolet', hex: '#4a2c8a', code: 'UVT' }
  ];
  const SHIFTS = [
    { id: 'aurora', name: 'Aurora', stops: ['#19c6b4', '#3657f5', '#8b2fe0'], code: 'AUR' },
    { id: 'oilslick', name: 'Oil Slick', stops: ['#1f8a55', '#5b2d94', '#1a55a3'], code: 'OIL' },
    { id: 'solar', name: 'Solar Flare', stops: ['#f0b431', '#e0442b', '#8e1742'], code: 'SOL' },
    { id: 'nebula', name: 'Nebula', stops: ['#cf8150', '#6c2fa5', '#1f318c'], code: 'NEB' }
  ];
  const CLEARS = [
    { id: 'gloss-clear', name: 'Gloss clear', code: 'GCL' },
    { id: 'satin-clear', name: 'Satin clear', code: 'SCL' }
  ];
  const paletteFor = (f) => (f === 'shift' ? SHIFTS : f === 'ppf' ? CLEARS : SOLIDS);
  const findColor = (f, id) => paletteFor(f).find((c) => c.id === id);

  // Environment reflection per finish: [offset, color, opacity], top of truck → bottom.
  const LIGHT = {
    gloss: [[0, '#fff', .34], [.40, '#fff', .10], [.455, '#fff', .03], [.462, '#000', .30], [.70, '#000', .16], [1, '#000', .05]],
    satin: [[0, '#fff', .22], [.45, '#fff', .04], [.6, '#000', .08], [1, '#000', .26]],
    matte: [[0, '#fff', .07], [.5, '#fff', 0], [1, '#000', .14]],
    chrome: [[0, '#fff', .92], [.22, '#fff', .35], [.43, '#fff', .72], [.458, '#000', .66], [.6, '#000', .45], [.85, '#000', .06], [1, '#fff', .42]],
    steel: [[0, '#fff', .30], [.42, '#fff', .06], [.6, '#000', .10], [1, '#000', .22]],
    ppfGloss: [[0, '#fff', .45], [.40, '#fff', .12], [.455, '#fff', .05], [.462, '#000', .22], [.7, '#000', .12], [1, '#000', .08]],
    ppfSatin: [[0, '#fff', .14], [.5, '#fff', 0], [1, '#000', .24]]
  };
  // Studio light streak: [half-width, opacity]
  const SHEEN = { gloss: [.06, .34], satin: [.2, .13], matte: [.3, .03], chrome: [.05, .6], steel: [.2, .12], ppfGloss: [.06, .32], ppfSatin: [.25, .06] };
  const STEEL = [[0, '#e1e5e7'], [.45, '#b6bdc1'], [1, '#8e969b']];
  const STEEL_DULL = [[0, '#a9afb2'], [.5, '#90979b'], [1, '#767d82']];
  const SHEEN_X = 430;

  function resolveLook(finish, colorId) {
    if (finish === 'bare') return { kind: 'steel', steel: STEEL, light: LIGHT.steel, sheen: SHEEN.steel, tex: ['tex-brushed', .6] };
    if (finish === 'ppf') {
      return colorId === 'satin-clear'
        ? { kind: 'steel', steel: STEEL_DULL, light: LIGHT.ppfSatin, sheen: SHEEN.ppfSatin, tex: ['tex-brushed', .2] }
        : { kind: 'steel', steel: STEEL, light: LIGHT.ppfGloss, sheen: SHEEN.ppfGloss, tex: ['tex-brushed', .45] };
    }
    if (finish === 'shift') {
      const c = findColor('shift', colorId) || SHIFTS[0];
      return { kind: 'shift', stops: c.stops, light: LIGHT.gloss, sheen: SHEEN.gloss };
    }
    const c = findColor(finish, colorId) || SOLIDS[0];
    const tex = finish === 'matte' ? ['tex-grain', .2] : finish === 'satin' ? ['tex-grain', .08] : null;
    return { kind: 'solid', hex: c.hex, light: LIGHT[finish], sheen: SHEEN[finish], tex };
  }

  function paintDefs(p, look) {
    const stops = (arr) => arr.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('');
    let base;
    if (look.kind === 'shift') {
      const s = look.stops;
      base = `<linearGradient id="${p}-base" gradientUnits="userSpaceOnUse" x1="0" y1="110" x2="640" y2="340" spreadMethod="repeat" data-shift="1">${stops([[0, s[0]], [.34, s[1]], [.67, s[2]], [1, s[0]]])}</linearGradient>`;
    } else if (look.kind === 'steel') {
      base = `<linearGradient id="${p}-base" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="330">${stops(look.steel)}</linearGradient>`;
    } else {
      base = `<linearGradient id="${p}-base"><stop offset="0" stop-color="${look.hex}"/><stop offset="1" stop-color="${look.hex}"/></linearGradient>`;
    }
    const light = `<linearGradient id="${p}-light" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="330">${stops(look.light)}</linearGradient>`;
    const [w, a] = look.sheen;
    const sheen = `<linearGradient id="${p}-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="300" y2="330" gradientTransform="translate(${SHEEN_X} 0)">${stops([[0, '#fff', 0], [.5 - w, '#fff', 0], [.5, '#fff', a], [.5 + w, '#fff', 0], [1, '#fff', 0]])}</linearGradient>`;
    return base + light + sheen;
  }

  function paintLayers(p, look) {
    const tex = look.tex ? `<path d="${G.body}" fill="url(#${look.tex[0]})" opacity="${look.tex[1]}" style="mix-blend-mode:overlay"/>` : '';
    return `<path d="${G.body}" fill="url(#${p}-base)"/>${tex}<path d="${G.body}" fill="url(#${p}-light)"/><path d="${G.body}" fill="url(#${p}-sheen)"/>`;
  }

  function wheel(cx) {
    const pts = hexPts(41);
    let facets = '';
    for (let i = 0; i < 6; i++) {
      const [a, b] = [pts[i], pts[(i + 1) % 6]];
      facets += `<path d="M0,0 L${a[0]},${a[1]} L${b[0]},${b[1]} Z" fill="${i % 2 ? '#2c3136' : '#3b4147'}"/>`;
    }
    return `<g transform="translate(${cx} ${G.wy})"><circle r="66" fill="url(#g-tire)"/><circle r="57" fill="none" stroke="#202327" stroke-width="2"/><g class="hub"><circle r="46" fill="#1d2125"/>${facets}<circle r="41" fill="none" stroke="#15181b" stroke-width="1.5"/><circle r="7" fill="#0d0f11"/><circle r="2.5" fill="#434a51"/></g></g>`;
  }

  // Everything that isn't body paint: wheels, cladding, glass, lights.
  function truckArt(bodyMarkup, { hero = false } = {}) {
    const W = G.wheels;
    return `
      <ellipse cx="500" cy="382" rx="462" ry="10" fill="#000" opacity=".65" filter="url(#f-blur)"/>
      ${W.map((cx) => `<path d="${arch(cx)}" fill="#050606"/>`).join('')}
      <g class="t-wheels">${W.map(wheel).join('')}</g>
      ${bodyMarkup}
      <g clip-path="url(#cp-body)"><rect x="0" y="305" width="1000" height="20" fill="url(#g-clad)"/></g>
      <path d="M782,189 L746,205 M584,189 L584,305 M412,189 L412,305" fill="none" stroke="#000" stroke-opacity=".42" stroke-width="1.5"/>
      <path d="M783,190.6 L747,206.6 M585.6,189 L585.6,305 M413.6,189 L413.6,305" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>
      ${W.map((cx) => `<path d="${flare(cx)}" fill="url(#g-clad)"/><path d="M${cx - 90},236 L${cx - 52},206 L${cx + 52},206 L${cx + 90},236" fill="none" stroke="#fff" stroke-opacity=".1"/>`).join('')}
      <path d="${G.glass}" fill="url(#g-glass)"/>
      <g clip-path="url(#cp-glass)"><path d="M468,192 L524,106 L566,106 L510,192Z M606,192 L656,106 L668,106 L618,192Z" fill="#fff" opacity=".07"/></g>
      <path d="${G.glass}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.2"/>
      <path d="M578,121 L584,188" stroke="#0a0c0e" stroke-width="7"/>
      <path d="M716,191 L752,186 L756,202 L720,207 Z" fill="#16191c"/><path d="M716,191 L752,186" stroke="#fff" stroke-opacity=".18"/>
      ${hero ? '<path class="beam" d="M944,219 L1000,195 L1000,262 L944,226 Z" fill="url(#g-beam)"/>' : ''}
      <path class="lightbar" d="M925,216.8 L943.5,222.3" stroke="#f3fbff" stroke-width="3.2" stroke-linecap="round" filter="url(#f-glow)"/>
      <path d="M58.6,188 L59.4,203" stroke="#ff3b30" stroke-width="3" stroke-linecap="round" filter="url(#f-glow)"/>`;
  }

  /* ------------------------------------------------------------------
     Shared SVG defs: brushed-steel and grain textures are drawn once on
     a canvas, then reused by every truck on the page.
     ------------------------------------------------------------------ */
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function texture(w, h, kind) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const d = img.data;
    if (kind === 'brushed') {
      for (let y = 0; y < h; y++) {
        const row = 128 + gauss() * 34;
        let drift = 0;
        for (let x = 0; x < w; x++) {
          drift = drift * 0.985 + (Math.random() - 0.5) * 5;
          const v = clamp(row + drift + (Math.random() - 0.5) * 14, 0, 255);
          const i = (y * w + x) * 4;
          d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
        }
      }
    } else {
      for (let i = 0; i < d.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 96;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  function installDefs() {
    let brushed = '', grain = '';
    try { brushed = texture(1000, 128, 'brushed'); grain = texture(256, 256, 'grain'); } catch (e) { /* canvas unavailable: trucks render without texture */ }
    const html = `<svg class="svg-defs" aria-hidden="true" focusable="false"><defs>
      <pattern id="tex-brushed" patternUnits="userSpaceOnUse" width="1000" height="64">${brushed ? `<image href="${brushed}" width="1000" height="64" preserveAspectRatio="none"/>` : ''}</pattern>
      <pattern id="tex-grain" patternUnits="userSpaceOnUse" width="128" height="128">${grain ? `<image href="${grain}" width="128" height="128"/>` : ''}</pattern>
      <linearGradient id="g-glass" gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="190"><stop offset="0" stop-color="#2d3742"/><stop offset=".55" stop-color="#121820"/><stop offset="1" stop-color="#07090c"/></linearGradient>
      <linearGradient id="g-clad" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="322"><stop offset="0" stop-color="#2b2f33"/><stop offset="1" stop-color="#131517"/></linearGradient>
      <radialGradient id="g-tire" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="66"><stop offset=".6" stop-color="#1b1d20"/><stop offset=".9" stop-color="#0d0e10"/><stop offset="1" stop-color="#050506"/></radialGradient>
      <linearGradient id="g-beam" gradientUnits="userSpaceOnUse" x1="944" y1="0" x2="1000" y2="0"><stop offset="0" stop-color="#eaf6ff" stop-opacity=".32"/><stop offset="1" stop-color="#eaf6ff" stop-opacity="0"/></linearGradient>
      <filter id="f-blur" x="-10%" y="-300%" width="120%" height="700%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="f-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="500"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <clipPath id="cp-body"><path d="${G.body}"/></clipPath>
      <clipPath id="cp-glass"><path d="${G.glass}"/></clipPath>
    </defs></svg>`;
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  /* A small truck in any finish, for cards and the build sheet. */
  function miniTruck(host, p, finish, colorId) {
    const look = resolveLook(finish, colorId);
    host.innerHTML = `<svg viewBox="40 90 924 304" aria-hidden="true" focusable="false"><defs id="${p}-defs">${paintDefs(p, look)}</defs><g id="${p}-art">${truckArt(`<g id="${p}-paint">${paintLayers(p, look)}</g>`)}</g></svg>`;
    if (look.kind === 'shift') shifters.add(p);
    else shifters.delete(p);
  }
  function repaintMini(p, finish, colorId) {
    const look = resolveLook(finish, colorId);
    const defs = document.getElementById(`${p}-defs`);
    const paint = document.getElementById(`${p}-paint`);
    if (!defs || !paint) return;
    defs.innerHTML = paintDefs(p, look);
    paint.innerHTML = paintLayers(p, look);
    if (look.kind === 'shift') shifters.add(p); else shifters.delete(p);
  }

  /* ------------------------------------------------------------------
     Color-shift motion: every shift gradient on screen drifts slowly;
     the hero one also follows the pointer like a change in viewing angle.
     ------------------------------------------------------------------ */
  const shifters = new Set();
  let pointerFrac = 0.5, pointerTarget = 0.5;
  function shiftLoop(t) {
    pointerFrac += (pointerTarget - pointerFrac) * 0.07;
    shifters.forEach((p) => {
      const g = document.getElementById(`${p}-base`);
      if (!g) return;
      const hero = p === 'hw';
      const off = (hero ? (pointerFrac - 0.5) * -760 : 0) + Math.sin(t / 2300 + (hero ? 0 : p.length)) * 140;
      g.setAttribute('gradientTransform', `translate(${off.toFixed(1)} 0)`);
    });
    requestAnimationFrame(shiftLoop);
  }

  /* Tween helper */
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function tween(from, to, ms, fn, done) {
    const start = performance.now();
    let raf = 0, stopped = false;
    const step = (now) => {
      if (stopped) return;
      const k = clamp((now - start) / ms, 0, 1);
      fn(from + (to - from) * ease(k));
      if (k < 1) raf = requestAnimationFrame(step); else if (done) done();
    };
    raf = requestAnimationFrame(step);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }

  /* ------------------------------------------------------------------
     Hero stage: drag-to-wrap
     ------------------------------------------------------------------ */
  const state = { finish: 'satin', color: 'olive' };
  const lastColor = { gloss: 'red', satin: 'olive', matte: 'tan', chrome: 'concrete', shift: 'aurora', ppf: 'gloss-clear' };
  let revealPct = 0;
  let stopIntro = null;
  let stopSheen = null;

  function buildHero() {
    const svg = $('#stage-svg');
    if (!svg) return;
    const look = resolveLook(state.finish, state.color);
    const steel = resolveLook('bare');
    svg.insertAdjacentHTML('beforeend', `
      <defs>
        ${paintDefs('hs', steel)}
        <clipPath id="reveal"><rect id="reveal-rect" x="0" y="0" width="0" height="500"/></clipPath>
        <linearGradient id="g-reflfade" gradientUnits="userSpaceOnUse" x1="0" y1="380" x2="0" y2="470"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="refl-mask" maskUnits="userSpaceOnUse" x="0" y="380" width="1000" height="100"><rect x="0" y="380" width="1000" height="100" fill="url(#g-reflfade)"/></mask>
      </defs>
      <defs id="hw-defs">${paintDefs('hw', look)}</defs>
      <g id="hero-truck" class="hero-truck">
        ${truckArt(`${paintLayers('hs', steel)}
          <g clip-path="url(#reveal)"><g id="hw-paint">${paintLayers('hw', look)}</g></g>
          <g clip-path="url(#cp-body)"><g id="film-edge" opacity="0"><rect x="0" y="90" width="4" height="240" fill="#000" opacity=".28"/><rect x="-1.6" y="90" width="1.6" height="240" fill="#fff" opacity=".9"/></g></g>`, { hero: true })}
      </g>
      <g class="reflection" mask="url(#refl-mask)" opacity=".26" pointer-events="none"><g transform="translate(0 760) scale(1 -1)"><use href="#hero-truck"/></g></g>`);
    if (look.kind === 'shift') shifters.add('hw');
  }

  function setReveal(pct) {
    revealPct = clamp(pct, 0, 100);
    const x = G.x0 + (revealPct / 100) * G.span;
    const rect = $('#reveal-rect');
    if (rect) rect.setAttribute('width', x.toFixed(1));
    const edge = $('#film-edge');
    if (edge) {
      edge.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
      edge.setAttribute('opacity', revealPct > 0.5 && revealPct < 99.5 ? '1' : '0');
    }
    const handle = $('#handle');
    if (handle) handle.style.left = `${x / 10}%`;
    const range = $('#wrap-range');
    if (range) {
      range.value = String(Math.round(revealPct));
      range.setAttribute('aria-valuetext', `${Math.round(revealPct)} percent wrapped`);
    }
  }

  function sheenSweep() {
    if (reduceMotion) return;
    if (stopSheen) stopSheen();
    const g = document.getElementById('hw-sheen');
    if (!g) return;
    stopSheen = tween(-620, SHEEN_X, 900, (v) => g.setAttribute('gradientTransform', `translate(${v.toFixed(1)} 0)`));
  }

  function initStage() {
    const stage = $('#stage');
    const svg = $('#stage-svg');
    const range = $('#wrap-range');
    const hint = $('#stage-hint');
    if (!stage || !svg) return;
    let dragging = false;

    const dismiss = () => {
      if (stopIntro) { stopIntro(); stopIntro = null; }
      if (hint) hint.classList.add('gone');
    };
    const moveTo = (clientX) => {
      const r = svg.getBoundingClientRect();
      const units = ((clientX - r.left) / r.width) * 1000;
      setReveal(((units - G.x0) / G.span) * 100);
    };
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      dismiss();
      stage.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      moveTo(e.clientX);
    });
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      pointerTarget = clamp((e.clientX - r.left) / r.width, 0, 1);
      if (dragging) moveTo(e.clientX);
    });
    const end = () => { dragging = false; stage.classList.remove('dragging'); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('lostpointercapture', end);

    if (range) {
      range.addEventListener('input', () => { dismiss(); setReveal(+range.value); });
      range.addEventListener('focus', () => stage.classList.add('focused'));
      range.addEventListener('blur', () => stage.classList.remove('focused'));
    }

    // Opening moment: the truck rolls in, the light bar comes on, film goes on.
    if (reduceMotion) {
      setReveal(62);
      stage.classList.add('lit');
    } else {
      setReveal(0);
      stage.classList.add('rolling');
      setTimeout(() => stage.classList.add('lit'), 650);
      const t = setTimeout(() => { stopIntro = tween(0, 62, 1500, setReveal, () => { stopIntro = null; }); }, 900);
      stopIntro = () => clearTimeout(t);
    }
  }

  /* ------------------------------------------------------------------
     Builder controls
     ------------------------------------------------------------------ */
  function swatchBg(finish, c) {
    if (finish === 'shift') return `linear-gradient(135deg, ${c.stops.join(', ')})`;
    if (finish === 'ppf') return c.id === 'satin-clear'
      ? 'linear-gradient(160deg, #c9cfd1, #9aa1a5)'
      : 'linear-gradient(160deg, #f4f6f7 0%, #b9c0c4 45%, #8d959a 55%, #c8ced1 100%)';
    if (finish === 'chrome') return `linear-gradient(170deg, #fff 0%, ${c.hex} 40%, #0b0c0d 52%, ${c.hex} 80%, #fff 100%)`;
    return c.hex;
  }

  function renderFinishChips() {
    const host = $('#finish-group');
    if (!host) return;
    host.innerHTML = Object.entries(FINISHES).map(([k, f]) =>
      `<label class="chip"><input type="radio" name="finish" value="${k}" id="finish-${k}"${k === state.finish ? ' checked' : ''}><span>${f.label}</span></label>`).join('');
    host.addEventListener('change', (e) => {
      if (e.target.name !== 'finish') return;
      state.finish = e.target.value;
      state.color = lastColor[state.finish];
      renderSwatches();
      applyState({ sweep: true });
    });
  }

  function renderSwatches() {
    const host = $('#color-group');
    if (!host) return;
    host.innerHTML = paletteFor(state.finish).map((c) =>
      `<label class="sw" title="${esc(c.name)}"><input type="radio" name="color" value="${c.id}" id="color-${c.id}"${c.id === state.color ? ' checked' : ''}><span class="sw-frame"><span class="sw-chip" style="background:${swatchBg(state.finish, c)}"></span></span><span class="sw-name">${esc(c.name)}</span></label>`).join('');
  }

  function lookName(f = state.finish, id = state.color) {
    const c = findColor(f, id);
    if (!c) return FINISHES[f].label;
    if (f === 'ppf') return `${c.name} PPF`;
    if (f === 'shift') return `${c.name} color-shift`;
    return `${FINISHES[f].label} ${c.name}`;
  }
  function buildCode(f = state.finish, id = state.color) {
    const c = findColor(f, id);
    return `CT-${FINISHES[f].code}-${c ? c.code : 'XXX'}`;
  }

  let lookEdited = false;
  function applyState({ sweep = false } = {}) {
    const look = resolveLook(state.finish, state.color);
    const defs = $('#hw-defs');
    const paint = $('#hw-paint');
    if (defs && paint) {
      defs.innerHTML = paintDefs('hw', look);
      paint.innerHTML = paintLayers('hw', look);
      if (look.kind === 'shift') shifters.add('hw'); else shifters.delete('hw');
    }
    if (sweep) {
      sheenSweep();
      if (revealPct < 45 && !stopIntro) tween(revealPct, 78, 900, setReveal);
    }
    const name = lookName();
    const code = buildCode();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('readout-name', name);
    set('readout-note', FINISHES[state.finish].note);
    set('build-code', code);
    set('stage-ghost', name);
    set('sheet-look', name);
    set('sheet-code', code);
    const q = $('#q-look');
    if (q && !lookEdited) q.value = `${name} (${code})`;
    repaintMini('sheet', state.finish, state.color);
  }

  function initBuilder() {
    renderFinishChips();
    renderSwatches();
    const colors = $('#color-group');
    if (colors) colors.addEventListener('change', (e) => {
      if (e.target.name !== 'color') return;
      state.color = e.target.value;
      lastColor[state.finish] = state.color;
      applyState({ sweep: true });
    });

    const copy = $('#copy-link');
    if (copy) copy.addEventListener('click', () => {
      const url = `${location.href.split('#')[0]}#build-${state.finish}-${state.color}`;
      const done = (msg) => { copy.textContent = msg; setTimeout(() => { copy.textContent = 'Copy build link'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => done('Link copied'), () => done('Couldn’t copy'));
      } else done('Couldn’t copy');
    });

    const q = $('#q-look');
    if (q) q.addEventListener('input', () => { lookEdited = true; });

    $$('.try').forEach((btn) => btn.addEventListener('click', () => {
      state.finish = btn.dataset.finish;
      state.color = btn.dataset.color;
      lastColor[state.finish] = state.color;
      const radio = document.getElementById(`finish-${state.finish}`);
      if (radio) radio.checked = true;
      renderSwatches();
      const target = $('#build');
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => {
        const before = revealPct;
        applyState({ sweep: true });
        if (before >= 45 && before < 70) tween(before, 78, 900, setReveal);
      }, reduceMotion ? 0 : 450);
    }));

    // Shared build links: #build-satin-olive
    const m = location.hash.match(/^#build-([a-z]+)-([a-z-]+)$/);
    if (m && FINISHES[m[1]] && findColor(m[1], m[2])) {
      state.finish = m[1];
      state.color = m[2];
      lastColor[m[1]] = m[2];
      const radio = document.getElementById(`finish-${state.finish}`);
      if (radio) radio.checked = true;
      renderSwatches();
      requestAnimationFrame(() => { const b = $('#build'); if (b) b.scrollIntoView({ block: 'center' }); });
    }
  }

  function initMinis() {
    $$('.mini').forEach((el, i) => miniTruck(el, `m${i}`, el.dataset.finish, el.dataset.color));
    const sheet = $('#sheet-truck');
    if (sheet) miniTruck(sheet, 'sheet', state.finish, state.color);
  }

  /* ------------------------------------------------------------------
     Etched drawing with numbered problem areas
     ------------------------------------------------------------------ */
  // Marker positions; compact variants keep bigger markers clear of the outline on phones.
  const SPOTS = [
    { n: 1, x: 944, y: 222, mx: 972, my: 168, cx: 955, cy: 158 },
    { n: 2, x: 716, y: 152, mx: 736, my: 110, cx: 730, cy: 98 },
    { n: 3, x: 640, y: 262, mx: 640, my: 262, cx: 640, cy: 262 },
    { n: 4, x: 412, y: 250, mx: 412, my: 250, cx: 412, cy: 250 },
    { n: 5, x: 793, y: 206, mx: 826, my: 160, cx: 850, cy: 140 },
    { n: 6, x: 220, y: 158, mx: 190, my: 116, cx: 190, cy: 105 }
  ];

  function buildEtch() {
    const svg = $('#etch-svg');
    if (!svg) return;
    const W = G.wheels;
    const compact = window.matchMedia('(max-width: 600px)').matches;
    const k = compact ? 2.2 : 1;
    const tick = (x, y) => `M${x - 5},${y + 5} L${x + 5},${y - 5}`;
    const label = (x, y, text, rot) => {
      const fs = 12 * k, w = text.length * fs * 0.7 + 16 * k;
      return `<g transform="translate(${x} ${y})${rot ? ' rotate(-90)' : ''}"><rect x="${-w / 2}" y="${-fs * .85}" width="${w}" height="${fs * 1.7}" class="e-lab-bg"/><text class="e-lab" text-anchor="middle" dy="${fs * .36}" font-size="${fs}" letter-spacing="${fs * .08}">${text}</text></g>`;
    };
    const dims = compact
      ? `<path class="e-ext" d="M58,190 V432 M944,226 V432 M548,96 H10 M58,380 H10"/>
         <path d="M58,424 H944 ${tick(58, 424)} ${tick(944, 424)}"/>
         <path d="M22,100 V380 ${tick(22, 100)} ${tick(22, 380)}"/>
         ${label(501, 424, '223.7 IN LONG')}
         ${label(22, 240, '70.5 IN', true)}`
      : `<path class="e-ext" d="M58,190 V432 M944,226 V432 M${W[0]},384 V410 M${W[1]},384 V410 M548,96 H10 M58,380 H10"/>
         <path d="M58,424 H944 ${tick(58, 424)} ${tick(944, 424)}"/>
         <path d="M${W[0]},402 H${W[1]} ${tick(W[0], 402)} ${tick(W[1], 402)}"/>
         <path d="M22,100 V380 ${tick(22, 100)} ${tick(22, 380)}"/>
         ${label(501, 424, '223.7 IN · LENGTH')}
         ${label((W[0] + W[1]) / 2, 402, '143.1 IN · WHEELBASE')}
         ${label(22, 240, '70.5 IN', true)}`;
    const spot = (s) => {
      const mx = compact ? s.cx : s.mx, my = compact ? s.cy : s.my;
      const lead = mx !== s.x || my !== s.y ? `<path class="e-lead" d="M${s.x},${s.y} L${mx},${my}"/><circle class="e-dot" cx="${s.x}" cy="${s.y}" r="${3.5 * k}"/>` : '';
      return `<g class="e-spot" data-n="${s.n}">${lead}<circle class="e-halo" cx="${mx}" cy="${my}" r="${22 * k}"/><circle class="e-mark" cx="${mx}" cy="${my}" r="${14 * k}"/><text class="e-num" x="${mx}" y="${my}" dy="${5 * k}" text-anchor="middle" font-size="${14 * k}">${s.n}</text></g>`;
    };
    svg.insertAdjacentHTML('beforeend', `
      <g class="e-grid">${Array.from({ length: 21 }, (_, i) => `<path d="M${i * 50},64 V448"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<path d="M0,${64 + i * 50} H1000"/>`).join('')}</g>
      <path class="e-ground" d="M16,380 H984"/>
      <g class="e-art">
        <path d="${G.body}"/>
        <path d="${G.glass}"/>
        ${W.map((cx) => `<path d="${flare(cx)}"/><circle cx="${cx}" cy="${G.wy}" r="66"/><circle cx="${cx}" cy="${G.wy}" r="46"/><path d="M${hexPts(41).map((p) => `${cx + p[0]},${G.wy + p[1]}`).join(' L')} Z"/><circle cx="${cx}" cy="${G.wy}" r="3"/>`).join('')}
        <path d="M782,189 L746,205 M584,189 L584,305 M412,189 L412,305 M578,121 L584,188 M65.5,305 H140 M312,305 H707 M879,305 H922"/>
        <path d="M716,191 L752,186 L756,202 L720,207 Z"/>
      </g>
      <g class="e-dim">${dims}</g>
      <g class="e-spots">${SPOTS.map(spot).join('')}</g>`);

    const setOn = (n, on) => {
      $$(`.e-spot[data-n="${n}"], .callouts li[data-n="${n}"]`).forEach((el) => el.classList.toggle('on', on));
    };
    $$('.callouts li').forEach((li) => {
      li.addEventListener('mouseenter', () => setOn(li.dataset.n, true));
      li.addEventListener('mouseleave', () => setOn(li.dataset.n, false));
    });
    $$('.e-spot').forEach((g) => {
      g.addEventListener('mouseenter', () => setOn(g.dataset.n, true));
      g.addEventListener('mouseleave', () => setOn(g.dataset.n, false));
    });
  }

  /* ------------------------------------------------------------------
     The drive: towns by compass bearing, distance = drive time
     ------------------------------------------------------------------ */
  const HOME = { lat: 42.0987, lon: -75.9180 };
  // Approximate drive minutes in normal traffic.
  const CITIES = [
    { id: 'cortland', name: 'Cortland', st: 'NY', lat: 42.6012, lon: -76.1805, min: 45, side: 'r' },
    { id: 'elmira', name: 'Elmira', st: 'NY', lat: 42.0898, lon: -76.8077, min: 55 },
    { id: 'oneonta', name: 'Oneonta', st: 'NY', lat: 42.4529, lon: -75.0638, min: 60 },
    { id: 'ithaca', name: 'Ithaca', st: 'NY', lat: 42.4440, lon: -76.5019, min: 60 },
    { id: 'scranton', name: 'Scranton', st: 'PA', lat: 41.4090, lon: -75.6624, min: 60, side: 'r' },
    { id: 'syracuse', name: 'Syracuse', st: 'NY', lat: 43.0481, lon: -76.1474, min: 75, side: 'r' },
    { id: 'wilkesbarre', name: 'Wilkes-Barre', st: 'PA', lat: 41.2459, lon: -75.8813, min: 75, side: 'l' },
    { id: 'utica', name: 'Utica', st: 'NY', lat: 43.1009, lon: -75.2327, min: 110 },
    { id: 'williamsport', name: 'Williamsport', st: 'PA', lat: 41.2412, lon: -77.0011, min: 120 },
    { id: 'middletown', name: 'Middletown', st: 'NY', lat: 41.4459, lon: -74.4229, min: 120 },
    { id: 'albany', name: 'Albany', st: 'NY', lat: 42.6526, lon: -73.7562, min: 135 },
    { id: 'allentown', name: 'Allentown', st: 'PA', lat: 40.6023, lon: -75.4714, min: 135, side: 'l' },
    { id: 'rochester', name: 'Rochester', st: 'NY', lat: 43.1566, lon: -77.6088, min: 150 },
    { id: 'morristown', name: 'Morristown', st: 'NJ', lat: 40.7968, lon: -74.4815, min: 150 },
    { id: 'harrisburg', name: 'Harrisburg', st: 'PA', lat: 40.2732, lon: -76.8867, min: 175 },
    { id: 'philadelphia', name: 'Philadelphia', st: 'PA', lat: 39.9526, lon: -75.1652, min: 185 },
    { id: 'buffalo', name: 'Buffalo', st: 'NY', lat: 42.8864, lon: -78.8784, min: 195 },
    { id: 'nyc', name: 'New York City', st: 'NY', lat: 40.7128, lon: -74.0060, min: 195 },
    { id: 'hartford', name: 'Hartford', st: 'CT', lat: 41.7658, lon: -72.6734, min: 225 }
  ];
  const CITY = Object.fromEntries(CITIES.map((c) => [c.id, c]));
  const MAP = { cx: 320, cy: 280, k: 250 / 240 };

  function place(c) {
    const dx = (c.lon - HOME.lon) * Math.cos(HOME.lat * Math.PI / 180);
    const dy = c.lat - HOME.lat;
    const a = Math.atan2(dx, dy);
    const r = c.min * MAP.k;
    return { x: MAP.cx + r * Math.sin(a), y: MAP.cy - r * Math.cos(a) };
  }
  function crowMiles(c) {
    const R = 3958.8, rad = Math.PI / 180;
    const dLat = (c.lat - HOME.lat) * rad, dLon = (c.lon - HOME.lon) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(HOME.lat * rad) * Math.cos(c.lat * rad) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }
  function fmtDrive(min) {
    const m = Math.round(min / 5) * 5;
    const h = Math.floor(m / 60), r = m % 60;
    if (!h) return `${r} min`;
    return r ? `${h} hr ${r} min` : `${h} hr`;
  }
  function arriveBy(min) {
    const total = 8 * 60 + Math.round(min / 5) * 5;
    let h = Math.floor(total / 60), m = total % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')} ${ap}`;
  }
  function tripLine(min) {
    if (min <= 60) return 'Practically local.';
    if (min <= 120) return 'A podcast there, a podcast back.';
    if (min <= 180) return 'Shorter than a Sunday football broadcast.';
    return 'One road trip for years of turning heads.';
  }

  function shield(num) {
    return `<svg class="shield" viewBox="0 0 30 32"><path d="M2 4 C7 2 10 3.2 15 1.6 C20 3.2 23 2 28 4 L28 13 C28 22 22 27.5 15 30.5 C8 27.5 2 22 2 13 Z" fill="#fff"/><path d="M4 5.5 C8 4 11 5 15 3.6 C19 5 22 4 26 5.5 L26 10 L4 10 Z" fill="var(--shield-red)"/><path d="M4 10 L26 10 L26 13 C26 21 21 25.6 15 28.4 C9 25.6 4 21 4 13 Z" fill="var(--shield-blue)"/><text x="15" y="23" text-anchor="middle">${num}</text></svg>`;
  }

  function buildMap() {
    const svg = $('#map-svg');
    if (!svg) return;
    const { cx, cy, k } = MAP;
    const P = Object.fromEntries(CITIES.map((c) => [c.id, place(c)]));
    const ringAng = 250 * Math.PI / 180;
    const rings = [60, 120, 180, 240].map((m) => {
      const r = m * k;
      const lx = cx + r * Math.sin(ringAng), ly = cy - r * Math.cos(ringAng);
      return `<circle class="m-ring" cx="${cx}" cy="${cy}" r="${r}"/><g transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)})"><rect class="m-ring-bg" x="-22" y="-9" width="44" height="18" rx="2"/><text class="m-ring-lab" text-anchor="middle" dy="4">${m / 60} HR</text></g>`;
    }).join('');
    const polar = (deg, min) => ({ x: cx + min * k * Math.sin(deg * Math.PI / 180), y: cy - min * k * Math.cos(deg * Math.PI / 180) });
    const west = polar(-93, 238), north = polar(-4, 238), ne = polar(74, 238), se = polar(128, 238);
    const road = (pts) => `M${cx},${cy} ${pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}`;
    const corridors = [
      road([P.cortland, P.syracuse, north]),                 // I-81 north
      road([P.scranton, P.wilkesbarre, P.harrisburg]),       // I-81 south
      road([P.elmira, west]),                                // I-86 west
      road([P.oneonta, P.albany, ne]),                       // I-88 east
      road([P.middletown, P.nyc, se])                        // NY-17 east
    ];
    const cities = CITIES.map((c) => {
      const p = P[c.id];
      const side = c.side || (p.x >= cx ? 'r' : 'l');
      const tx = side === 'r' ? p.x + 9 : p.x - 9;
      return `<g class="m-city" data-id="${c.id}"><circle class="m-hit" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14"/><circle class="m-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5"/><text class="m-lab" x="${tx.toFixed(1)}" y="${(p.y + 4.5).toFixed(1)}" text-anchor="${side === 'r' ? 'start' : 'end'}">${esc(c.name)}</text></g>`;
    }).join('');
    svg.insertAdjacentHTML('beforeend', `
      <g class="m-rings">${rings}</g>
      <g class="m-roads">${corridors.map((d) => `<path d="${d}"/>`).join('')}</g>
      <text class="m-north" x="${cx}" y="20" text-anchor="middle">N</text><path class="m-north-tick" d="M${cx},26 V36"/>
      <g id="m-route" class="m-route"><path class="m-route-bed" d=""/><path class="m-route-lane" d=""/></g>
      <g class="m-cities">${cities}</g>
      <g class="m-home"><circle class="m-pulse" cx="${cx}" cy="${cy}" r="10"/><rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" transform="rotate(45 ${cx} ${cy})"/><text class="m-home-lab" x="${cx + 15}" y="${cy + 4}">BINGHAMTON</text></g>`);

    $$('.m-city', svg).forEach((g) => g.addEventListener('click', () => setOrigin(g.dataset.id)));
  }

  function fillCitySelect(sel, withOther) {
    if (!sel) return;
    sel.innerHTML = CITIES.map((c) => `<option value="${c.id}">${esc(c.name)}, ${c.st} (${fmtDrive(c.min)})</option>`).join('') +
      (withOther ? '<option value="other">Somewhere else</option>' : '');
  }

  let flipTimer = 0;
  function setOrigin(id, { fromForm = false } = {}) {
    const c = CITY[id];
    const set = (el, v) => { const n = document.getElementById(el); if (n) n.textContent = v; };
    const qFrom = $('#q-from');
    if (!c) {
      set('sheet-from', 'Somewhere else');
      set('sheet-time', 'Tell us in the notes');
      return;
    }
    const from = $('#from');
    if (from) from.value = id;
    if (qFrom && !fromForm) qFrom.value = id;

    const sign = $('#sign');
    if (sign && !reduceMotion) {
      sign.classList.remove('flip');
      void sign.offsetWidth;
      sign.classList.add('flip');
    }
    clearTimeout(flipTimer);
    flipTimer = setTimeout(() => {
      set('sign-time', fmtDrive(c.min));
      set('sign-from', `${c.name}, ${c.st}`);
    }, reduceMotion ? 0 : 160);
    set('trip-crow', `${crowMiles(c)} mi`);
    set('trip-arrive', `Here by about ${arriveBy(c.min)}`);
    set('trip-line', tripLine(c.min));
    set('sheet-from', `${c.name}, ${c.st}`);
    set('sheet-time', `About ${fmtDrive(c.min)}`);

    const p = place(c);
    const d = `M${MAP.cx},${MAP.cy} L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    $$('#m-route path').forEach((path) => path.setAttribute('d', d));
    $$('.m-city').forEach((g) => g.classList.toggle('on', g.dataset.id === id));
  }

  function initDrive() {
    buildMap();
    const sr = $('#sign-shields');
    if (sr) sr.innerHTML = shield(81) + shield(86) + shield(88);
    fillCitySelect($('#from'), false);
    fillCitySelect($('#q-from'), true);
    const from = $('#from');
    if (from) from.addEventListener('change', () => setOrigin(from.value));
    const qFrom = $('#q-from');
    if (qFrom) qFrom.addEventListener('change', () => setOrigin(qFrom.value, { fromForm: true }));
    setOrigin('syracuse');
  }

  /* ------------------------------------------------------------------
     Quote form
     ------------------------------------------------------------------ */
  function buildSheetText(fd) {
    const c = CITY[fd.get('from')];
    const lines = [
      `CYBERTRUCK BUILD SHEET · ${buildCode()}`,
      '',
      `Name: ${fd.get('name') || ''}`,
      `Email: ${fd.get('email') || '—'}`,
      `Phone: ${fd.get('phone') || '—'}`,
      `Driving from: ${c ? `${c.name}, ${c.st} (about ${fmtDrive(c.min)})` : 'Somewhere else'}`,
      `Cybertruck: ${fd.get('trim') || 'Not specified'}`,
      `Coverage: ${fd.get('coverage') || 'Not specified'}`,
      `Finish and color: ${fd.get('look') || lookName()}`,
      `When: ${fd.get('when') || ''}`
    ];
    const notes = (fd.get('notes') || '').trim();
    if (notes) lines.push('', 'Notes:', notes);
    return lines.join('\n');
  }

  function initForm() {
    const form = $('#quote-form');
    if (!form) return;
    const err = $('#form-error');
    const showErr = (msg) => { if (err) { err.textContent = msg; err.hidden = !msg; } };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const phone = (fd.get('phone') || '').trim();
      if (!name) { showErr('Add your name so we know who to reply to.'); $('#q-name').focus(); return; }
      if (!email && !phone) { showErr('Add an email or a phone number so we can reach you.'); $('#q-email').focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('That email address looks incomplete.'); $('#q-email').focus(); return; }
      showErr('');
      const text = buildSheetText(fd);
      fd.append('build_code', buildCode());
      fd.append('build_sheet', text);

      if (SHOP.formEndpoint) {
        const btn = $('#q-submit');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        try {
          const res = await fetch(SHOP.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(String(res.status));
          form.hidden = true;
          const done = $('#form-done');
          const t = $('#form-done-text');
          if (t) t.textContent = `We'll reply to ${email || phone} with questions and a quote.`;
          if (done) { done.hidden = false; done.focus(); }
          return;
        } catch (ex) {
          if (btn) { btn.disabled = false; btn.textContent = 'Send my build'; }
          showErr('That didn’t go through. Your build sheet is below so nothing is lost.');
        }
      }
      showFallback(text);
    });

    const copy = $('#copy-sheet');
    if (copy) copy.addEventListener('click', () => {
      const ta = $('#fallback-text');
      const ok = () => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy build sheet'; }, 1800); };
      const manual = () => { if (ta) { ta.focus(); ta.select(); } copy.textContent = 'Press Ctrl+C / ⌘C'; };
      if (navigator.clipboard && navigator.clipboard.writeText && ta) navigator.clipboard.writeText(ta.value).then(ok, manual);
      else manual();
    });
  }

  function showFallback(text) {
    const form = $('#quote-form');
    const fb = $('#form-fallback');
    const ta = $('#fallback-text');
    const mail = $('#mail-sheet');
    if (ta) ta.value = text;
    if (mail) mail.href = `mailto:${SHOP.email || ''}?subject=${encodeURIComponent(`Cybertruck build ${buildCode()}`)}&body=${encodeURIComponent(text)}`;
    if (form) form.hidden = true;
    if (fb) { fb.hidden = false; fb.focus(); }
  }

  /* ------------------------------------------------------------------
     Shop details from config.js
     ------------------------------------------------------------------ */
  function bindShop() {
    const tel = (SHOP.phone || '').replace(/[^\d+]/g, '');
    const telHref = tel ? `tel:${tel.length === 10 ? `+1${tel}` : tel}` : '';
    $$('[data-shop]').forEach((el) => { const v = SHOP[el.dataset.shop]; if (v) el.textContent = v; });
    $$('[data-tel]').forEach((el) => { if (telHref) el.href = telHref; });
    $$('[data-mail]').forEach((el) => { if (SHOP.email) el.href = `mailto:${SHOP.email}`; });
    const addr = SHOP.street ? `${SHOP.street}, ${SHOP.city}, ${SHOP.region} ${SHOP.postal}` : `${SHOP.city}, ${SHOP.region} ${SHOP.postal}`;
    $$('[data-shop-address]').forEach((el) => { el.textContent = addr; });
    if (SHOP.instagram) {
      $$('[data-shop-ig]').forEach((el) => { el.href = `https://instagram.com/${SHOP.instagram}`; el.textContent = `@${SHOP.instagram}`; });
      $$('[data-optional="instagram"]').forEach((el) => { el.hidden = false; });
    }
    if (SHOP.name && SHOP.name !== 'FACET') document.title = document.title.replace('FACET', SHOP.name);
    const y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());

    // Structured data for search engines
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'AutomotiveBusiness',
      name: `${SHOP.name} ${SHOP.descriptor || ''}`.trim(),
      description: 'Cybertruck color-change wraps and clear paint protection film in Binghamton, NY.',
      telephone: SHOP.phone,
      email: SHOP.email,
      address: { '@type': 'PostalAddress', streetAddress: SHOP.street || undefined, addressLocality: SHOP.city, addressRegion: SHOP.region, postalCode: SHOP.postal, addressCountry: 'US' },
      areaServed: CITIES.map((c) => ({ '@type': 'City', name: `${c.name}, ${c.st}` })),
      url: SHOP.siteUrl || undefined,
      sameAs: SHOP.instagram ? [`https://instagram.com/${SHOP.instagram}`] : undefined
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);

    // Real photos and reviews, only when provided
    const gallery = Array.isArray(SHOP.gallery) ? SHOP.gallery.filter((g) => g && g.src) : [];
    if (gallery.length) {
      $('#gallery').innerHTML = gallery.map((g) => `<figure class="shot"><img src="${esc(g.src)}" alt="${esc(g.alt || '')}" loading="lazy"><figcaption>${esc(g.caption || '')}</figcaption></figure>`).join('');
      $('#work').hidden = false;
    }
    const reviews = Array.isArray(SHOP.reviews) ? SHOP.reviews.filter((r) => r && r.quote) : [];
    if (reviews.length) {
      $('#review-list').innerHTML = reviews.map((r) => `<figure class="review"><blockquote>${esc(r.quote)}</blockquote><figcaption>${esc(r.name || '')}${r.from ? ` · <span>${esc(r.from)}</span>` : ''}</figcaption></figure>`).join('');
      $('#reviews').hidden = false;
    }
  }

  function initHeader() {
    const h = $('#site-header');
    if (!h) return;
    const onScroll = () => h.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  function boot() {
    installDefs();
    bindShop();
    buildHero();
    initBuilder();
    initMinis();
    applyState();
    initStage();
    buildEtch();
    initDrive();
    initForm();
    initHeader();
    if (!reduceMotion) requestAnimationFrame(shiftLoop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
