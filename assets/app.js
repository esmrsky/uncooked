import { createStudio, FINISHES, paletteFor, findColor } from './truck3d.js';

const SHOP = window.SHOP || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------
   Build state
   ------------------------------------------------------------------ */
const state = { finish: 'satin', color: 'obsidian', reveal: 56 };
const lastColor = { gloss: 'red', satin: 'obsidian', matte: 'tan', chrome: 'concrete', shift: 'aurora', ppf: 'gloss-clear' };
const EMBER = '#ff5a1a';

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
// The scene's horizon glow follows the film when the film has a strong color.
function glowFor(f = state.finish, id = state.color) {
  const c = findColor(f, id);
  if (!c) return EMBER;
  if (f === 'shift') return c.stops[1];
  if (f === 'ppf' || !c.hex) return EMBER;
  const n = parseInt(c.hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return sat > 0.35 && max > 0.25 ? c.hex : EMBER;
}
function swatchBg(f, c) {
  if (f === 'shift') return `conic-gradient(from 200deg, ${c.stops.join(', ')}, ${c.stops[0]})`;
  if (f === 'ppf') return c.id === 'satin-clear' ? 'linear-gradient(160deg, #b9bfc2, #7f868a)' : 'linear-gradient(160deg, #f4f6f7 0%, #b7bec2 48%, #7f878c 52%, #d2d7da 100%)';
  if (f === 'chrome') return `linear-gradient(170deg, #fff 0%, ${c.hex} 42%, #0b0c0d 52%, ${c.hex} 78%, #fff 100%)`;
  return c.hex;
}

/* ------------------------------------------------------------------
   Studio
   ------------------------------------------------------------------ */
let studio = null;

function framingFor(canvas) {
  const r = canvas.getBoundingClientRect();
  const aspect = r.width / Math.max(1, r.height);
  if (aspect > 1.3) {
    // Wide screens: truck sits right of the headline and above the dock.
    const wide = Math.min(1, (aspect - 1.3) / 0.6);
    return { offset: [0, 0, 0], shift: [0.15 + 0.05 * wide, -0.06], fitWidth: 5.1 + 0.4 * wide, fitHeight: 1.9 };
  }
  return { offset: [0, 0, 0], shift: [0, 0.04], fitWidth: 3.2, fitHeight: 1.45 };
}

function showFallback() {
  const canvas = $('#studio-canvas');
  if (canvas) canvas.hidden = true;
  const fb = $('#studio-fallback');
  if (fb) fb.hidden = false;
  const hint = $('#stage-hint');
  if (hint) hint.hidden = true;
  // Say so, rather than leaving a still image that looks like a frozen 3D view.
  const note = $('#stage-loading');
  if (note) { note.textContent = '3D view unavailable on this device. Your picks still go on your build sheet.'; note.classList.add('failed'); }
  const compare = $('.dock-compare');
  if (compare) compare.hidden = true;
  studio = null;
}

function initStudio() {
  const canvas = $('#studio-canvas');
  if (!canvas) return;
  const stage = $('#stage');
  const hint = $('#stage-hint');
  let ok = false;
  try {
    const test = document.createElement('canvas');
    ok = !!(test.getContext('webgl2') || test.getContext('webgl'));
  } catch (e) { ok = false; }
  if (ok) {
    try {
      studio = createStudio(canvas, {
        reducedMotion: reduceMotion,
        maxDpr: 1.75,
        modelUrl: window.STUDIO_MODEL_URL || 'assets/models/cybertruck.glb',
        reflection: !window.matchMedia('(pointer: coarse)').matches,
        onInteract: () => { if (hint) hint.classList.add('gone'); },
        onReady: () => {
          if (stage) stage.classList.add('ready');
          // Opening: film sweeps on from the tail while the camera settles.
          if (reduceMotion) studio.setReveal(state.reveal);
          else setTimeout(() => sweepTo(state.reveal, 1700), 500);
          applyLook();
        },
        onError: (e) => { console.error('3D truck failed to load:', e); showFallback(); }
      });
    } catch (e) {
      studio = null;
    }
  }
  if (!studio) { showFallback(); return; }
  const applyFraming = () => studio.setFraming(framingFor(canvas));
  applyFraming();
  new ResizeObserver(applyFraming).observe(canvas);
  studio.setReveal(0);
}

let sweepRaf = 0;
function sweepTo(target, ms = 900) {
  if (!studio) return;
  cancelAnimationFrame(sweepRaf);
  const from = studio.getReveal();
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    const v = from + (target - from) * ease(k);
    studio.setReveal(v);
    syncRange(v);
    if (k < 1) sweepRaf = requestAnimationFrame(step);
  };
  sweepRaf = requestAnimationFrame(step);
}

function syncRange(v) {
  const r = $('#reveal');
  if (!r) return;
  r.value = String(Math.round(v));
  r.style.setProperty('--p', `${v}%`);
  r.setAttribute('aria-valuetext', `${Math.round(v)} percent wrapped`);
}

/* ------------------------------------------------------------------
   Builder UI
   ------------------------------------------------------------------ */
function renderTabs() {
  const host = $('#finish-group');
  if (!host) return;
  host.innerHTML = Object.entries(FINISHES).map(([k, f]) =>
    `<label class="tab"><input type="radio" name="finish" value="${k}" id="finish-${k}"${k === state.finish ? ' checked' : ''}><span>${f.label}</span></label>`).join('');
}
function renderSwatches() {
  const host = $('#color-group');
  if (!host) return;
  host.innerHTML = paletteFor(state.finish).map((c) =>
    `<label class="sw" title="${esc(c.name)}"><input type="radio" name="color" value="${c.id}" id="color-${c.id}"${c.id === state.color ? ' checked' : ''} aria-label="${esc(c.name)}"><span class="sw-chip" style="background:${swatchBg(state.finish, c)}"></span></label>`).join('');
}

let lookEdited = false;
let thumbTimer = 0;
function applyLook({ animate = false } = {}) {
  const name = lookName();
  const code = buildCode();
  if (studio) {
    studio.setLook(state.finish, state.color);
    studio.setGlow(glowFor());
    if (animate && studio.getReveal() < 40) sweepTo(Math.max(state.reveal, 56), 1000);
  }
  document.documentElement.style.setProperty('--glow', glowFor());
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('readout-name', name);
  set('readout-note', FINISHES[state.finish].note);
  set('build-name', name);
  set('build-code', code);
  const q = $('#q-look');
  if (q && !lookEdited) q.value = `${name} (${code})`;
  // Snapshot the live truck for the booking card.
  clearTimeout(thumbTimer);
  thumbTimer = setTimeout(() => {
    if (!studio) return;
    try { const img = $('#build-thumb'); const url = studio.capture('image/jpeg', 0.82, { offset: [0, 0.02, 0], shift: [0, 0], fitWidth: 3.6, fitHeight: 1.5, reveal: 100 }); if (img && url) img.src = url; } catch (e) { /* keep the static image */ }
  }, 600);
}

function setBuild(finish, color, { animate = true } = {}) {
  state.finish = finish;
  state.color = color;
  lastColor[finish] = color;
  const radio = document.getElementById(`finish-${finish}`);
  if (radio) radio.checked = true;
  renderSwatches();
  applyLook({ animate });
}

function initBuilder() {
  renderTabs();
  renderSwatches();
  $('#finish-group')?.addEventListener('change', (e) => {
    if (e.target.name !== 'finish') return;
    setBuild(e.target.value, lastColor[e.target.value]);
  });
  $('#color-group')?.addEventListener('change', (e) => {
    if (e.target.name !== 'color') return;
    setBuild(state.finish, e.target.value);
  });
  const range = $('#reveal');
  if (range) {
    syncRange(state.reveal);
    range.addEventListener('input', () => {
      cancelAnimationFrame(sweepRaf);
      state.reveal = +range.value;
      syncRange(state.reveal);
      if (studio) studio.setReveal(state.reveal);
    });
  }
  $('#q-look')?.addEventListener('input', () => { lookEdited = true; });

  const copy = $('#copy-link');
  if (copy) copy.addEventListener('click', () => {
    const url = `${location.href.split('#')[0]}#build-${state.finish}-${state.color}`;
    const done = (msg) => { copy.textContent = msg; setTimeout(() => { copy.textContent = 'Copy link'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(() => done('Copied'), () => done('Couldn’t copy'));
    else done('Couldn’t copy');
  });

  // "Try it live" on the posters
  $$('.poster [data-finish]').forEach((btn) => btn.addEventListener('click', () => {
    setBuild(btn.dataset.finish, btn.dataset.color, { animate: false });
    $('#studio')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (studio && studio.getReveal() < 90) setTimeout(() => sweepTo(100, 1100), reduceMotion ? 0 : 500);
  }));

  // Service cards preselect the coverage in the form
  $$('.service [data-coverage]').forEach((btn) => btn.addEventListener('click', () => {
    const r = document.getElementById(btn.dataset.coverage);
    if (r) r.checked = true;
    $('#book')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }));

  // Shared build links: #build-satin-obsidian
  const m = location.hash.match(/^#build-([a-z]+)-([a-z-]+)$/);
  if (m && FINISHES[m[1]] && findColor(m[1], m[2])) {
    state.finish = m[1]; state.color = m[2]; lastColor[m[1]] = m[2];
    renderTabs(); renderSwatches();
  }
}

/* ------------------------------------------------------------------
   Detail callouts
   ------------------------------------------------------------------ */
function initDetails() {
  const buttons = $$('.callout');
  const items = $$('#detail-list li');
  const select = (i) => {
    buttons.forEach((b, k) => b.classList.toggle('on', k === i));
    items.forEach((li, k) => li.classList.toggle('on', k === i));
  };
  buttons.forEach((b, i) => {
    b.addEventListener('mouseenter', () => select(i));
    b.addEventListener('focus', () => select(i));
    b.addEventListener('click', () => select(i));
  });
  items.forEach((li, i) => li.addEventListener('mouseenter', () => select(i)));
  select(0);
}

/* ------------------------------------------------------------------
   Booking form
   ------------------------------------------------------------------ */
function buildSheetText(fd) {
  const lines = [
    `CYBERTRUCK BUILD · ${buildCode()}`,
    '',
    `Name: ${fd.get('name') || ''}`,
    `Based in: ${fd.get('town') || '—'}`,
    `Email: ${fd.get('email') || '—'}`,
    `Phone: ${fd.get('phone') || '—'}`,
    `Cybertruck: ${fd.get('trim') || 'Not specified'}`,
    `Thinking about: ${fd.get('coverage') || 'Not specified'}`,
    `Finish and color: ${fd.get('look') || lookName()}`,
    `When: ${fd.get('when') || ''}`
  ];
  const notes = String(fd.get('notes') || '').trim();
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
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
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
        const t = $('#form-done-text');
        if (t) t.textContent = `We’ll reply to ${email || phone} with questions and a quote.`;
        const done = $('#form-done');
        if (done) { done.hidden = false; done.focus(); }
        return;
      } catch (ex) {
        if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
        showErr('That didn’t go through. Your build sheet is below so nothing is lost.');
      }
    }
    const fb = $('#form-fallback');
    const ta = $('#fallback-text');
    const mail = $('#mail-sheet');
    if (ta) ta.value = text;
    if (mail) mail.href = `mailto:${SHOP.email || ''}?subject=${encodeURIComponent(`Cybertruck build ${buildCode()}`)}&body=${encodeURIComponent(text)}`;
    form.hidden = true;
    if (fb) { fb.hidden = false; fb.focus(); }
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

/* ------------------------------------------------------------------
   Shop details from config.js
   ------------------------------------------------------------------ */
const AREA = ['Binghamton, NY', 'Vestal, NY', 'Johnson City, NY', 'Endicott, NY', 'Endwell, NY', 'Conklin, NY', 'Owego, NY', 'Ithaca, NY', 'Cortland, NY', 'Elmira, NY', 'Oneonta, NY', 'Syracuse, NY', 'Utica, NY', 'Scranton, PA', 'Wilkes-Barre, PA', 'Albany, NY', 'Rochester, NY', 'Allentown, PA', 'Philadelphia, PA', 'New York, NY'];

function bindShop() {
  const tel = (SHOP.phone || '').replace(/[^\d+]/g, '');
  const telHref = tel ? `tel:${tel.length === 10 ? `+1${tel}` : tel}` : '';
  $$('[data-shop]').forEach((el) => { const v = SHOP[el.dataset.shop]; if (v) el.textContent = v; });
  $$('[data-tel]').forEach((el) => { if (telHref) el.href = telHref; });
  $$('[data-mail]').forEach((el) => { if (SHOP.email) el.href = `mailto:${SHOP.email}`; });
  const addr = SHOP.street ? `${SHOP.street}, ${SHOP.city}, ${SHOP.region} ${SHOP.postal}` : `${SHOP.city}, ${SHOP.region} ${SHOP.postal}`;
  $$('[data-shop-address]').forEach((el) => { el.textContent = addr; });
  const dir = $('#directions');
  if (dir) dir.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SHOP.street ? `${SHOP.name} ${SHOP.street}, ` : ''}${SHOP.city}, ${SHOP.region} ${SHOP.postal}`)}`;
  if (SHOP.instagram) {
    $$('[data-shop-ig]').forEach((el) => { el.href = `https://instagram.com/${SHOP.instagram}`; el.textContent = `@${SHOP.instagram}`; });
    $$('[data-optional="instagram"]').forEach((el) => { el.hidden = false; });
  }
  if (SHOP.name && SHOP.name !== 'FACET') document.title = document.title.replace('FACET', SHOP.name);
  const y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: SHOP.name,
    description: 'Cybertruck color-change wraps and paint protection film in Binghamton, NY.',
    telephone: SHOP.phone,
    email: SHOP.email,
    address: { '@type': 'PostalAddress', streetAddress: SHOP.street || undefined, addressLocality: SHOP.city, addressRegion: SHOP.region, postalCode: SHOP.postal, addressCountry: 'US' },
    areaServed: AREA.map((name) => ({ '@type': 'City', name })),
    url: SHOP.siteUrl || undefined,
    sameAs: SHOP.instagram ? [`https://instagram.com/${SHOP.instagram}`] : undefined
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);

  const gallery = Array.isArray(SHOP.gallery) ? SHOP.gallery.filter((g) => g && g.src) : [];
  if (gallery.length) {
    $('#gallery').innerHTML = gallery.map((g) => `<figure class="shot"><img src="${esc(g.src)}" alt="${esc(g.alt || '')}" loading="lazy"><figcaption>${esc(g.caption || '')}</figcaption></figure>`).join('');
    $('#work').hidden = false;
  }
  const reviews = Array.isArray(SHOP.reviews) ? SHOP.reviews.filter((r) => r && r.quote) : [];
  if (reviews.length) {
    $('#review-list').innerHTML = reviews.map((r) => `<figure class="review"><blockquote>${esc(r.quote)}</blockquote><figcaption>${esc(r.name || '')}${r.from ? ` · ${esc(r.from)}` : ''}</figcaption></figure>`).join('');
    $('#reviews').hidden = false;
  }
}

function initNav() {
  const nav = $('#nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ------------------------------------------------------------------ */
bindShop();
initNav();
initBuilder();
initStudio();
applyLook();
initDetails();
initForm();
