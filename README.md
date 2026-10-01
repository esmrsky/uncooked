# Cybertruck wrap studio website

A one-page site for a Cybertruck-focused wrap and PPF shop in Binghamton, NY. It's written for Southern Tier locals first, and also makes the case for drivers coming from Syracuse, Scranton, Albany or New York City.

Plain HTML, CSS and JavaScript. No build step and no framework. The only library is [three.js](https://threejs.org) (MIT) plus its glTF loader and meshopt decoder, bundled in `assets/vendor/` so the site doesn't depend on a CDN.

## What's on the page

| Section | What it does |
| --- | --- |
| **Studio (hero)** | A live 3D Cybertruck in a dark studio. Visitors drag to turn it, pick a finish (gloss, satin, matte, chrome, color-shift, clear PPF) and a color, and slide to compare the wrap with bare stainless. Color-shift is angle-dependent, so each flat panel shows its own shade as the truck turns. The horizon glow follows the chosen color. "Copy link" shares a specific build (`#build-satin-obsidian`). |
| **The craft** | A short statement on why the Cybertruck is hard to wrap well. |
| **Know the truck** | A side profile with six labeled problem areas, in the style of the Tesla UI. |
| **Services** | Full color change, PPF, and accents or two-tone, plus a consult card. |
| **Finishes** | A poster wall with one render per finish. "Try it live" loads that finish on the 3D truck. |
| **Visit** | Local (Southern Tier towns, address, directions) and regional (drive times) side by side. |
| **Process, FAQ, Book** | Four steps, common questions, and a booking form pre-filled with the visitor's build and a snapshot of their truck. |

## The 3D truck

The truck is a glTF model in `assets/models/cybertruck.glb`, scaled to Tesla's published length (223.7 in). The page loads it after the rest of the page, shows "Loading the truck" meanwhile, and fades it in.

Films are applied by one shader layer (`makeFilm` in `assets/truck3d.js`). It reads the model's own metalness map to find bare stainless, and only those areas get the film. Tires, glass, trim, the tonneau and lights keep their own look. Each finish is a set of physical properties: clearcoat for gloss, roughness for satin and matte, tinted metal for chrome, a clear coat over the steel for PPF, and an angle-dependent blend for color-shift.

**Model license:** the model file was supplied by the shop owner and has no license or author info embedded. Confirm the license allows commercial use on a website and add any required credit to the footer before launch.

**Swapping the model:** any Cybertruck glTF/GLB works if it has a metalness map that marks the stainless panels. Re-compress large files with `gltf-transform meshopt in.glb out.glb` (the page includes the meshopt decoder). On phones the floor reflection is turned off to halve the drawing work.

## Before launch: replace the placeholders

Everything lives in **`assets/config.js`**:

- **`name`**: "FACET" is a placeholder working name. Also find-and-replace `FACET` in `index.html` (the `<title>` and visible fallbacks).
- **`phone`, `email`, `street`, `hours`**: all placeholders. The phone number is a fictional 555 number.
- **`formEndpoint`**: see "Receiving consult requests" below.
- **`siteUrl`**, **`instagram`**
- **`turnaround`**: shown in the process and FAQ. Make sure it matches reality.
- **`gallery`**: real photos of your Cybertruck work. The "Recent builds" section stays hidden until you add at least one. **This is the biggest upgrade you can make.**
- **`reviews`**: real reviews only. Hidden until you add some.

Also review the copy that describes your process (the craft statement, the six problem areas, the four steps and the FAQ). It describes standard professional practice, so edit anything that doesn't match how you work, including the "by appointment" and "see film samples in person" lines.

## Swapping renders for real photos

The images in `assets/renders/` are renders of the 3D model, labeled on the page as "Rendered in our 3D studio." As you shoot your own work, replace them with real photos at the same file names and aspect ratios:

| File | Used for | Shape |
| --- | --- | --- |
| `fin-*.jpg` | Finish posters | 3:4 portrait |
| `svc-*.jpg` | Service cards | 16:10 |
| `details.jpg` | Labeled side profile | wide, truck in profile. If you replace it, re-position the six `--x`/`--y` callouts in `index.html`. |
| `hero.jpg` | Shown only on the rare device without WebGL | 16:9 |

## Receiving consult requests

With `formEndpoint` empty, submitting the form shows the customer a formatted build sheet they can copy, email or text to you. It works, but it adds friction.

To get submissions straight to your inbox, create a free form endpoint at [Formspree](https://formspree.io), [Getform](https://getform.io) or [Basin](https://usebasin.com) and paste the URL into `formEndpoint`. Each submission includes a `build_code` (e.g. `CT-SAT-OBS`) and a plain-text `build_sheet`.

## Hosting

Any static host works: GitHub Pages, Netlify, Cloudflare Pages or Vercel. The site uses ES modules, so open it through a web server rather than as a local `file://` page (e.g. `python3 -m http.server`).

- **GitHub Pages**: Settings → Pages → deploy from branch → root folder. The old site in `_archive/` starts with an underscore, so GitHub Pages (Jekyll) won't publish it.
- Once you have a real domain, change the `og:image` meta tag in `index.html` to the full URL (e.g. `https://yourdomain.com/assets/og.jpg`) so link previews show the truck.

## Files

```
index.html            page content
assets/config.js      shop details (edit this)
assets/site.css       design
assets/app.js         page logic: builder UI, callouts, booking form
assets/truck3d.js     studio: lighting, camera, film shader, model loading
assets/models/        the Cybertruck model (GLB, meshopt-compressed)
assets/vendor/        three.js, glTF loader, meshopt decoder (MIT license included)
assets/renders/       still renders used on the page
assets/og.jpg         link-preview image
favicon.svg
_archive/             the previous site, kept for reference
```
