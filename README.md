# uncooked

A site for people who are smoked — depressed, aimless, addicted, stuck in loops —
that helps them see which loop has them, what it's doing to their brain, and the
concrete, evidence-backed counter-practice to get out. Biblical overlaps are
presented as small optional "old map" flyout cards, never as the main spine.

## Structure

- `index.html` — landing: the hook, the science-first pitch, pattern grid
- `quiz.html` — the 3-minute diagnostic; 8 weighted questions; scores entirely client-side, answers never leave the page
- `pattern.html` — renders any of the six patterns from `data.js` via `?p=<slug>`; with no param, shows the full field guide grid
- `why.html` — the optional deep dive: the honest science-meets-scripture convergence argument, linked from the flyout cards and footer (not main nav)
- `help.html` — care resources: counseling, doctors, addiction help, community
- `crisis.html` — dedicated suicide/crisis support page (988 + chat, Crisis Text Line, Trevor Project, veterans, international); all crisis contact info lives here only
- `data.js` — all content: six patterns (loop mechanics, science TL;DR + sources, practice protocol with optional safety warnings, optional bible flyout card) and the quiz
- `app.js` — shared chrome, pattern renderer, quiz engine, practice-step checklist persistence (localStorage, fault-tolerant)
- `styles.css` — the whole look; dark theme, ember (cooked) / teal (uncooked) accents, print styles for the protocols

## The six patterns

1. **The Numbing Loop** — dopamine tolerance (Lembke) → 30-day reset (with alcohol/benzo + ED safety carve-outs)
2. **The Comparison Trap** — social rank / relative deprivation → feed hygiene, gratitude, capitalization
3. **The Isolation Spiral** — loneliness hypervigilance (Cacioppo, Holt-Lunstad) → structured community + service
4. **The Aimless Drift** — purpose & maximizer research (Frankl, Boyle, Schwartz) → behavioral activation, satisfice-and-commit
5. **The Resentment Loop** — rumination & forgiveness research (Nolen-Hoeksema, Worthington) → REACH-style release
6. **The Anxiety Spiral** — intolerance of uncertainty, wandering mind (Killingsworth, Brewer) → input diet, worry window, weekly off-day

Each pattern's "old map" flyout card holds its biblical case study and the
verse↔practice overlaps; closed by default.

## Running locally

Any static server works:

```sh
python3 -m http.server 8642
```

(`pattern.html` and `quiz.html` render via JS, so use a server rather than `file://`.)

## Deploying

No build step, no backend, no dependencies beyond Google Fonts. Drop the folder on
Netlify, Vercel, GitHub Pages, or any static host as-is.

Before public launch, still missing:
- An about page — who runs this and why (big trust factor for this audience; only you can write it)
- An `og:image` (1200×630 PNG) for share cards — OG title/description tags are in place
- Ideally: a clinician and a pastor reviewing the copy

## Editing content

All copy lives in `data.js`. To add a seventh pattern: add an entry to `PATTERNS`
(copy an existing one's shape — `bible` and `practice.safety` are optional fields),
reference its slug from at least one quiz option's weights, and add it to a couple
of `related` arrays.

## Positioning guardrails (read before editing copy)

- Science and solution are the spine; the Bible material is opt-in (flyout cards + `why.html`), never load-bearing for the protocols.
- Convergence, never proof. `why.html` explicitly disclaims "neuroscience proves the Bible" and admits the practice list is curated.
- Science claims trace to named researchers; contested findings (e.g. choice overload) are hedged in the text itself.
- Medical safety carve-outs stay: alcohol/benzo withdrawal and eating-disorder warnings on the numbing protocol.
- Crisis contact details (hotline numbers) live only on `crisis.html`; other pages link to it with explicit language ("thinking about suicide or self-harm"), not euphemisms.
- Not therapy, and says so. Medication and counseling are framed as front-line, not backup.
