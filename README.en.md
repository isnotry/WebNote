# WebNote · Online Notepad

[简体中文](README.md) | **English**

![No sign-up](https://img.shields.io/badge/signup-not%20required-brightgreen)
![No build step](https://img.shields.io/badge/build-none-blue)
![Single-file backend](https://img.shields.io/badge/backend-1%20file-lightgrey)
![Self-hosted data](https://img.shields.io/badge/data-self--hosted-orange)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

> A no-sign-up online notepad — write a note, get a shareable link in one click, it self-destructs after 7 days, and everything stays on your own server.

![Screenshot](https://cdn.jsdelivr.net/gh/isnotry/WebNote@main/docs/screenshot-en.png)

---

## What it is

WebNote shortens "jot something down and send a link" to its shortest path: open the homepage, type, and get a shareable URL in one click — no registration, no login, no account left behind.

The frontend is plain HTML / CSS / JavaScript with no build step at all. The backend is a single `server.js` whose only dependencies are `express` and `uuid`; every route, validation rule and cleanup job lives in that one file.

Each note is written to the server's local `notes/` directory as a JSON file. **There is no database and no third-party service involved**, and the server deletes every note after 7 days. Keep your own copy of anything you want to keep for good.

## Features

- **No sign-up** — there is no account system, just open the homepage and write
- **One-click sharing** — creating a note immediately yields a UUID-based link you can copy and send
- **Automatic expiry** — every note gets a hard 7-day lifetime and is physically deleted afterwards
- **Bilingual UI** — switch between Chinese and English without a page reload
- **Light & dark themes** — a round toggle button; the theme is inlined on the first frame, so there is no flash
- **Build-free frontend** — no webpack or vite; edit the HTML, refresh, done
- **Content filtering** — the frontend and backend share the same 19-word banned list: the client blocks first, the server backs it up
- **Self-hosted** — data lands on your own disk and port, with no external service in the loop
- **Docker ready** — a `Dockerfile` ships with the repo, one command to run

## Quick start

### Run locally

```bash
npm install
npm start
```

The server listens on port 8080 by default — open `http://localhost:8080` in your browser.

### Run with Docker

```bash
docker build -t webnote .
docker run -d -p 8080:8080 -v "$PWD/notes:/app/notes" --name webnote webnote
```

Notes live in `/app/notes` inside the container; mount it with `-v` or the notes vanish along with the container.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP listening port |

## Content validation rules

The banned-word list is hard-coded in both `server.js` and `public/script.js`. The rule is a plain `content.includes(word)` **substring match** — one hit rejects the whole note.

| Input | Result | Notes |
|---|---|---|
| Empty or whitespace-only | Blocked by the client | The client alerts "please enter note content" and focuses the editor; no request is sent |
| Contains a banned word (e.g. 赌博) | Creation refused | The client lists the matched words first; bypassing the client still gets a 400 from the server |
| 「这项规定非法人组织也适用」 | False positive | No tokenizer is involved, so 「非法」 matches inside 「非法人」 |
| Normal text, line breaks included | Created successfully | Stored verbatim in JSON; the detail page preserves line breaks and indentation |
| Contains `<script>alert(1)</script>` | Created, but never parsed | The detail page writes it via `textContent`, so HTML stays plain text |
| Request body over 100 KB | Returns 413 outright | `express.json()` caps bodies at 100 KB by default, so it never reaches validation |
| Sensitive words outside the list | Allowed through | The list holds only 19 words, with no fuzzy, pinyin or homophone matching |

## UI reference

| Location | Element | Purpose |
|---|---|---|
| Top right | Round theme button | Toggles light / dark and stores the choice in `webnote-theme` |
| Top right | `English` / `中文` button | Switches the UI language and stores it in `webnote-lang`, without reloading |
| Middle of the page | Note textarea | A 15-row editor whose placeholder follows the current language |
| Below the textarea | "Create Note" button | Calls `POST /api/notes`, then reveals the result card |
| Result card | Read-only link input | Shows the full share URL; one click selects all of it |
| Result card | "Copy Link" button | Writes to the clipboard and restores its label after 2 seconds |
| Result card | "Click to open note →" | Opens that note in a new tab |
| Note page, top left | "← Back to Home" | Returns to the create page |
| Note page, bottom | "Copy Content" button | Copies the note body, restoring its label after 2 seconds |

## Keyboard shortcuts

The project registers no custom shortcuts and installs no global `keydown` listener — everything below is default native behaviour:

| Action | Effect | Notes |
|---|---|---|
| Click the link input | Selects the whole share URL | Bound to `click`, so you can then hit Ctrl / Cmd+C manually |
| Tab / Shift+Tab | Moves focus between inputs and buttons | Native `input`, `textarea` and `button` behaviour |
| Enter / Space | Activates the focused button | Native button behaviour |
| Enter (inside the textarea) | Inserts a line break | Enter is not bound to submit; click the button when done |
| Ctrl / Cmd+Z | Undoes typing | Browser-native, works inside the textarea |

## API

### Create a note

```http
POST /api/notes
Content-Type: application/json

{ "content": "note content" }
```

```json
{
  "id": "6f1c2b3a-…-9d4e",
  "url": "/note/6f1c2b3a-…-9d4e",
  "expiresAt": "2026-03-31T06:11:34.793Z"
}
```

### Read a note

```http
GET /api/notes/:id
```

Returns `{ id, content, createdAt, expiresAt }`; an expired or missing note yields `404` with `{ "error": "…" }`.

### Open the note page

```http
GET /note/:id
```

The ID is checked against a UUID regex: a malformed ID or a missing file renders `notfound.html`, an expired note is deleted first and then renders `expired.html`, and a valid note renders `note.html`, which then fetches the read endpoint itself.

## Expiry & cleanup rules

```text
expiresAt       = createdAt + EXPIRY_DAYS × 24 × 60 × 60 × 1000
On read (lazy)  : now > expiresAt                        → delete the note file, return 404
Sweeper (hourly): now − file mtime > EXPIRY_DAYS × 24h   → delete the file
```

- `EXPIRY_DAYS` sits at the top of `server.js`, defaults to `7`, and is read by both creation and expiry checks
- Opening a note link performs that expiry check right away: a hit **physically deletes** the file and only then renders `expired.html`
- The sweeper runs once an hour, plus once on server startup. It compares against the **file mtime** rather than the `expiresAt` inside the JSON — the file is written exactly once at creation, so the two agree in practice
- The read API uses the same lazy-delete logic; it just returns a JSON 404 instead of an error page
- Share links carry no access control: anyone holding the UUID can read the note — no auth, no password, no burn-after-reading

## Data & privacy

All data is written to **the machine you run the service on**, and nowhere else. There is no analytics, no third-party font or CDN dependency, and every page asset is same-origin.

| Storage | Content | Lifetime |
|---|---|---|
| Server `notes/<uuid>.json` | Note body, creation time, expiry time | Deleted after 7 days |
| Browser `localStorage` → `webnote-lang` | UI language `zh` / `en` | Kept until you clear it manually |
| Browser `localStorage` → `webnote-theme` | Theme `light` / `dark` | Kept until you clear it manually |

The server sets no cookies and records no visitor identifiers; it only prints access and error lines to stdout. **The share link itself is the credential** — anyone with the full link can read the note, so keep sensitive content out of it.

## Project layout

```text
WebNote/
├── public/
│   ├── index.html              # Create page: textarea + create button + result card
│   ├── note.html               # Detail page: body + created / expiry time + copy button
│   ├── expired.html            # Note-expired page
│   ├── notfound.html           # Note-not-found page
│   ├── i18n.js                 # zh / en dictionaries plus language detection and switching
│   ├── script.js               # Create-page interactions: validation, submit, copy link
│   └── styles.css              # Site-wide styles (theme tokens also live in each HTML <style>)
├── docs/
│   ├── screenshot.png          # Chinese UI screenshot (used by README.md)
│   └── screenshot-en.png       # English UI screenshot (used by README.en.md)
├── notes/                      # Note data directory, created at runtime, not committed
├── server.js                   # The entire backend
├── Dockerfile                  # node:18-alpine image
├── package.json
├── LICENSE
├── README.md                   # Chinese primary version
└── README.en.md                # English version (this file)
```

## Development notes

- Change the lifetime: `const EXPIRY_DAYS = 7;` at the top of `server.js`
- Change the cleanup interval: the millisecond value in `setInterval(cleanExpiredNotes, 60 * 60 * 1000)` inside `server.js`
- Change the banned words: `server.js` and `public/script.js` each hold an **identically-worded array** and must be edited together — the client copy only saves a request, the server copy is the real defence
- Change the port: use the `PORT` environment variable, never hard-code it
- Change theme colours: the dark tokens live in `:root[data-theme="dark"]`, and `index.html`, `note.html`, `expired.html` and `notfound.html` each carry an inline copy in `<head>` — edit one, edit all four, or the first-frame colours will disagree
- Change the style cache: `styles.css` is linked as `?v=2`; bump the number after a big style change
- Add new copy: fill in both the `zh` and `en` dictionaries, otherwise `i18n.js` renders the raw key; an **empty string is a valid value** (English leaves `editor.expiresAt` blank because the sentence needs no trailing word)
- Run in development: `npm run dev`, identical to `npm start` (both run `node server.js` directly, with no file watcher)
- Project conventions: no frontend dependencies, no build step, and CSS variables instead of a component library

## Browser support

| Feature used | Minimum version | Purpose |
|---|---|---|
| CSS custom properties + `data-theme` | Everything but IE | The whole light / dark token system |
| `color-mix(in srgb, …)` | Chrome 111 / Safari 16.2 / Firefox 113 | Translucent backgrounds of the theme and language buttons |
| `navigator.clipboard.writeText` | Requires a secure context | Copy link, copy note body |
| SVG sprite via `<use href="#id">` | Chrome 50 / Safari 12 / Firefox 55 | The five icons: theme, note, lock, link, sparkle |
| `prefers-reduced-motion` | Same as above | Disables every transition when matched |

Known limitations and fallbacks:

- **The clipboard API is refused outside HTTPS and localhost** — the code already falls back to `document.execCommand('copy')`: `note.html` uses a temporary textarea, the create page uses `select()` then copies
- **`color-mix()` invalidates the whole declaration on older browsers** — buttons degrade to a transparent background with a border; functionality is unaffected
- **Pages force `color-scheme: only light`** — this stops the OS dark mode from recolouring form controls
- **The inline `<style>` and theme script in `<head>`** exist so the theme is decided on the very first frame and no flash occurs; do not remove them while editing those files

## License

[MIT](LICENSE) © 2026 isnotry
