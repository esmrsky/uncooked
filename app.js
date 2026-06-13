/* ============ uncooked — shared logic ============ */

/* localStorage can throw (privacy modes, blocked storage) — never let it break the page */
function storeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* persistence is a nice-to-have */ }
}

/* ---------- shared chrome ---------- */

function renderNav() {
  const el = document.getElementById("nav");
  if (!el) return;
  el.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html"><span class="un">un</span>cooked</a>
      <div class="nav-links">
        <a href="quiz.html">Diagnostic</a>
        <a href="pattern.html">Patterns</a>
        <a href="help.html">Get help</a>
      </div>
    </div>`;
}

function renderFooter() {
  const el = document.getElementById("footer");
  if (!el) return;
  el.innerHTML = `
    <div class="wrap">
      <div>
        <p><strong><span style="color:var(--cool)">un</span>cooked</strong> — for people who are smoked and done pretending otherwise.</p>
        <p>This site is education and encouragement, not therapy, diagnosis, or a substitute for professional care.</p>
        <p><a href="why.html">Curious about the Bible overlap? The full argument →</a></p>
      </div>
      <div>
        <p><a href="crisis.html">Thinking about suicide or self-harm? Support is here →</a></p>
        <p><a href="help.html">Care &amp; counseling resources →</a></p>
      </div>
    </div>`;
}

/* ---------- pattern grid (used on index + pattern fallback) ---------- */

function patternGridHTML() {
  return Object.values(PATTERNS).map(p => `
    <a class="card" href="pattern.html?p=${p.slug}">
      <div class="num">PATTERN ${p.num}</div>
      <h3>${p.name}</h3>
      <p class="tag">${p.tag}</p>
    </a>`).join("");
}

/* ---------- pattern page ---------- */

function renderPatternPage() {
  const root = document.getElementById("pattern-root");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("p");
  const p = slug && Object.hasOwn(PATTERNS, slug) ? PATTERNS[slug] : null;

  if (!p) {
    document.title = "The Patterns — uncooked";
    root.innerHTML = `
      <header class="pattern-header wrap">
        <div class="kicker">The field guide</div>
        <h1>Six ways people get cooked</h1>
        <p class="tagline">Most ruts aren't random — they're loops with known mechanics. Find yours, see how it runs, and learn the counter-practice. Or <a href="quiz.html">take the diagnostic</a> and let it find you.</p>
      </header>
      <div class="wrap"><div class="grid">${patternGridHTML()}</div></div>`;
    return;
  }

  document.title = `${p.name} — uncooked`;

  const para = (arr) => arr.map(t => `<p>${t}</p>`).join("");
  const loop = p.loop.map(s =>
    `<li><span class="step-title">${s.t}</span><span class="step-body">${s.b}</span></li>`).join("");
  const refs = p.science.refs.map(r => `<li>${r}</li>`).join("");

  const doneKey = `uncook_steps_${p.slug}`;
  let done = [];
  try { done = JSON.parse(storeGet(doneKey)) || []; } catch { done = []; }

  const steps = p.practice.steps.map((s, i) => `
    <div class="practice-step ${done[i] ? "done" : ""}">
      <label>
        <input type="checkbox" data-step="${i}" ${done[i] ? "checked" : ""}>
        <span><h4>${s.t}</h4><p>${s.b}</p></span>
      </label>
    </div>`).join("");

  const related = p.related.map(rs => {
    const r = PATTERNS[rs];
    return `<a class="card" href="pattern.html?p=${r.slug}">
      <div class="num">PATTERN ${r.num}</div><h3>${r.name}</h3><p class="tag">${r.tag}</p></a>`;
  }).join("");

  const bible = p.bible ? `
    <details class="flyout">
      <summary><span class="flyout-icon">📜</span> <strong>The old map</strong> — ${p.bible.title} <span class="faint">(optional)</span></summary>
      <div class="flyout-body">
        ${para(p.bible.paras)}
        <blockquote>${p.bible.quote.text}<cite>— ${p.bible.quote.cite}</cite></blockquote>
        <h4>Where it overlaps with the protocol</h4>
        <ul class="overlaps">${p.bible.overlaps.map(o => `<li>${o}</li>`).join("")}</ul>
        <p class="faint">Interested in the bigger picture? <a href="why.html">The full overlap argument is here</a> — including what it does and doesn't claim.</p>
      </div>
    </details>` : "";

  root.innerHTML = `
    <header class="pattern-header wrap">
      <div class="kicker">Pattern ${p.num} of 06</div>
      <h1>${p.name}</h1>
      <p class="tagline">${p.tag}</p>
    </header>

    <div class="wrap">
      ${para(p.hook)}

      <h2>How the loop runs</h2>
      <ol class="loop-steps">${loop}</ol>

      <div class="section-label sci">What's happening in your brain</div>
      <h2 class="mt-0">The mechanism</h2>
      <div class="callout"><div class="callout-title" style="color:var(--cool)">The short version</div><p>${p.science.tldr}</p></div>
      ${para(p.science.paras)}
      <details><summary class="faint" style="cursor:pointer">Sources &amp; further reading</summary>
        <ul class="refs">${refs}</ul>
      </details>

      <h2>The counter-practice</h2>
      <p>${p.practice.lead}</p>
      ${p.practice.safety ? `
      <div class="callout warn">
        <div class="callout-title">Read this first</div>
        <p>${p.practice.safety}</p>
      </div>` : ""}
      <div id="practice-steps">${steps}</div>
      <p class="faint">Checkboxes save on this device, so you can come back to your plan. <button class="linklike" onclick="window.print()">Print this page</button> if paper works better.</p>

      <div class="one-thing">
        <div class="callout-title">If you only do one thing</div>
        <p>${p.practice.oneThing}</p>
      </div>

      ${bible}

      <div class="callout warn">
        <div class="callout-title">A line you should not cross alone</div>
        <p>If this pattern involves a substance you can't stop, or thoughts of suicide or self-harm — that's beyond a website, and getting real help is the strong move, not the weak one. <a href="help.html">Care resources are here</a>, and <a href="crisis.html">crisis support is here</a>.</p>
      </div>

      <div class="related">
        <h2>Loops that feed this one</h2>
        <div class="grid">${related}</div>
        <p style="margin-top:1.5em"><a href="pattern.html">← All six patterns</a> · <a href="quiz.html">Take the diagnostic</a></p>
      </div>
    </div>`;

  document.getElementById("practice-steps").addEventListener("change", (e) => {
    const i = e.target.dataset?.step;
    if (i === undefined) return;
    done[i] = e.target.checked;
    storeSet(doneKey, JSON.stringify(done));
    e.target.closest(".practice-step").classList.toggle("done", e.target.checked);
  });
}

/* ---------- quiz ---------- */

function renderQuiz() {
  const root = document.getElementById("quiz-root");
  if (!root) return;

  let i = 0;            // current question index
  const picks = [];     // chosen option per question

  function showQuestion() {
    const q = QUIZ[i];

    root.innerHTML = `
      <div class="quiz-progress"><div class="bar" style="width:${Math.round((i / QUIZ.length) * 100)}%"></div></div>
      <p class="faint">Question ${i + 1} of ${QUIZ.length}</p>
      <p class="quiz-q">${q.q}</p>
      ${q.opts.map((o, j) => `<button class="quiz-opt" data-j="${j}">${o.text}</button>`).join("")}
      ${i > 0 ? `<button class="quiz-back" id="back">← back</button>` : ""}
    `;

    root.querySelectorAll(".quiz-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        picks[i] = QUIZ[i].opts[+btn.dataset.j];
        i++;
        if (i >= QUIZ.length) showResults();
        else { showQuestion(); window.scrollTo(0, 0); }
      });
    });

    const back = document.getElementById("back");
    if (back) back.addEventListener("click", () => { i--; showQuestion(); });
  }

  function showResults() {
    const scores = {};
    Object.keys(PATTERNS).forEach(k => scores[k] = 0);
    picks.forEach(opt => {
      Object.entries(opt.w).forEach(([k, v]) => scores[k] += v);
    });

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const max = ranked[0][1] || 1;
    const [first, second] = ranked;
    const p1 = PATTERNS[first[0]];
    const p2 = PATTERNS[second[0]];
    const secondClose = second[1] >= first[1] - 1 && second[1] > 0;

    const bars = ranked.map(([k, v]) => `
      <div class="result-bar-row">
        <span class="label">${PATTERNS[k].name.replace("The ", "")}</span>
        <div class="result-bar-track"><div class="result-bar-fill" style="width:${Math.round((v / max) * 100)}%"></div></div>
      </div>`).join("");

    root.innerHTML = `
      <div class="quiz-progress"><div class="bar" style="width:100%"></div></div>
      <h1 style="font-size:2rem">Found it. Here's your loop.</h1>
      <p class="dim">No judgment — a loop is a mechanism, not a verdict. Knowing which one you're in is most of the battle.</p>

      <a class="card result-primary" href="pattern.html?p=${p1.slug}" style="margin:1.5em 0; display:block">
        <div class="num">YOUR PRIMARY PATTERN</div>
        <h3 style="font-size:1.5rem">${p1.name}</h3>
        <p class="tag">${p1.tag}</p>
        <p style="margin:14px 0 0; color:var(--cool); font-weight:600">Read your full breakdown →</p>
      </a>

      ${secondClose ? `
      <a class="card" href="pattern.html?p=${p2.slug}" style="display:block; margin-bottom:1.5em">
        <div class="num">RUNNING A CLOSE SECOND</div>
        <h3>${p2.name}</h3>
        <p class="tag">${p2.tag}</p>
      </a>` : ""}

      <h3>Your full profile</h3>
      ${bars}
      <p class="faint" style="margin-top:1em">Most people run 2–3 loops that feed each other. Your primary is the one to start with — the others usually loosen when it does.</p>

      <div class="callout warn">
        <div class="callout-title">Real talk before you go</div>
        <p>If what's underneath your answers includes thoughts of suicide or self-harm, a quiz isn't the tool for that — <a href="crisis.html">crisis support is here</a>, free and anonymous, right now. If a substance has you, <a href="help.html">real care is here</a>.</p>
      </div>

      <p style="margin-top:2em"><button class="quiz-back" id="retake">↻ retake the diagnostic</button></p>
    `;

    document.getElementById("retake").addEventListener("click", () => {
      i = 0; picks.length = 0; showQuestion(); window.scrollTo(0, 0);
    });
  }

  showQuestion();
}

/* ---------- boot ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderFooter();
  renderPatternPage();
  renderQuiz();
  const grid = document.getElementById("pattern-grid");
  if (grid) grid.innerHTML = patternGridHTML();
});
