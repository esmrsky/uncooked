# Cybertruck wrap studio website

A one-page site for a Cybertruck-focused wrap shop in Binghamton, NY. Its job is to convince owners hours away that the drive is worth it.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework. Open `index.html` in a browser, or host the folder anywhere static.

## What's on the page

| Section | What it does |
| --- | --- |
| **Hero / builder** | A to-scale Cybertruck. Visitors drag across it to see wrap vs. bare stainless, then pick a finish (gloss, satin, matte, chrome, color-shift, clear PPF) and a color. Color-shift follows the pointer like a change in viewing angle. "Copy build link" shares a specific build (`#build-satin-olive`). |
| **The truck** | An etched line drawing with Tesla's published dimensions and six numbered problem areas that show you know this truck. |
| **Finishes** | Six mini trucks, one per finish, with what each is like to live with. "Try it" loads that finish onto the big truck. |
| **The drive** | A map with towns placed by real compass direction and drive time, and an interstate-style sign showing the drive from the visitor's town. |
| **Two trips** | How an out-of-town job works, plus things to do in Binghamton while you're in town. |
| **FAQ** | The questions people ask before committing to the drive. |
| **Quote form** | Pre-filled with the visitor's build and hometown. |

## Before launch: replace the placeholders

Everything lives in **`assets/config.js`**:

- **`name`**: "FACET" is a placeholder working name. Also find-and-replace `FACET` in `index.html` (the `<title>` and visible fallbacks).
- **`phone`, `email`, `street`, `hours`**: all placeholders. The phone number is a fictional 555 number.
- **`formEndpoint`**: see "Receiving quote requests" below.
- **`siteUrl`**, **`instagram`**
- **`turnaround`**: shown in the trip plan and FAQ. Make sure it matches reality.
- **`gallery`**: real photos of your Cybertruck work. The "Recent builds" section stays hidden until you add at least one. **This is the single biggest upgrade you can make.** Nobody drives three hours without seeing the work.
- **`reviews`**: real reviews only. Hidden until you add some. Reviews that mention where the customer drove from ("drove in from Scranton") are gold.

Also review the copy in `index.html` that describes your process: the six problem areas, the four trip steps and the FAQ answers. It describes standard professional practice, so edit anything that doesn't match how you work.

## Receiving quote requests

With `formEndpoint` empty, submitting the form shows the customer a formatted build sheet they can copy, email or text to you. It works, but it adds friction.

To get submissions straight to your inbox, create a free form endpoint at [Formspree](https://formspree.io), [Getform](https://getform.io) or [Basin](https://usebasin.com) and paste the URL into `formEndpoint`. Each submission includes a `build_code` (e.g. `CT-SAT-OLV`) and a plain-text `build_sheet`.

## Hosting

Any static host works: GitHub Pages, Netlify, Cloudflare Pages or Vercel.

- **GitHub Pages**: Settings → Pages → deploy from branch → root folder. The old site in `_archive/` starts with an underscore, so GitHub Pages (Jekyll) won't publish it.
- Once you have a real domain, change the `og:image` meta tag in `index.html` to the full URL (e.g. `https://yourdomain.com/assets/og.jpg`) so link previews show the truck.

## Editing drive times

Drive times live in `CITIES` in `assets/app.js`, in approximate minutes in normal traffic. Adding a town means adding one line with its latitude, longitude and minutes. The map places it automatically.

## Files

```
index.html        page content
assets/config.js  shop details (edit this)
assets/site.css   design
assets/app.js     truck renderer, builder, map, form
assets/og.jpg     link-preview image
favicon.svg
_archive/         the previous site, kept for reference
```
