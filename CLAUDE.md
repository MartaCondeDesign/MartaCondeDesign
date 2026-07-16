# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is `martacondedesign/martacondedesign`, a GitHub profile repo. The root `README.md` is Marta's profile bio (rendered on her GitHub profile page). The repo also hosts `prototype/`: a mobile-first, click-through functional prototype for a gym class booking app, built to validate whether users can find a class, check availability, and book a slot.

## Running the prototype

No package manager, build step, bundler, linter, or test runner — `prototype/` is plain HTML/CSS/JS with zero dependencies. `index.html` loads regular `<script src>` tags (not ES modules), so it works by opening the file directly in a browser, or via any static server:

```
cd prototype && python3 -m http.server 8934
```

There is no automated test suite. Verify changes by loading the page and clicking through the flow (a headless Chromium is available at `/opt/pw-browsers/chromium` for scripted checks via Playwright).

## Architecture (`prototype/`)

Four plain scripts loaded in a fixed order in `index.html` — order matters, each relies on globals the previous file defines:

1. **`data.js`** — all app data: the `CLASSES` array (6 simulated gym classes), `APP_NAME`, `TIME_OF_DAY_LABELS`, and lookup helpers (`getClassById`, `getDisciplines`, `getLevels`). This is the only file to touch when changing the class catalog.
2. **`icons.js`** — the `Icon` object, one method per icon returning an inline SVG string (e.g. `Icon.calendar(extraClass)`). Icons are hand-drawn line SVGs; there is no external icon library or CDN.
3. **`app.js`** — everything else: the global mutable `state` object, a hand-rolled router (no URL hash/history API involved), all screen render functions, and a single delegated event listener wired up in `attachEvents()`.
4. **`index.html`** — a static shell only: `#app-header`, `#app` (main content), the bottom `.bottom-nav`, plus `#sheet-root` (bottom-sheet modal) and `#toast-root`, all populated by `app.js`.

### Rendering model

- `state.route = { name, params }` drives which screen renders. `mainHtml()` / `headerHtml()` in `app.js` switch on `state.route.name` (`home`, `explore`, `detail`, `confirm`, `bookings`) and return HTML strings assigned via `innerHTML` — there is no virtual DOM/diffing, every render replaces the whole `#app` subtree.
- `navigate(name, params)` pushes onto `state.historyStack` (used by the header back button / `goBack()`); `navigateTab(name)` (bottom nav taps) resets the stack instead, since tabs are top-level destinations.
- All clicks are handled by one delegated listener in `attachEvents()` keyed off `data-action` attributes (e.g. `data-action="open-class" data-id="..."`). New interactive elements should follow this pattern rather than adding per-element listeners or inline `onclick`.
- `render(opts)` supports `opts.preserveFocus` (re-focuses the same control after an in-place re-render, via `captureFocus`/`restoreFocus` — used for filter chips and live search) and `opts.silent` (skips both focus-restore and the default "focus the screen heading" behavior used on real navigation).

### State & persistence

- `state.seats` mirrors `CLASSES[].available` but is a mutable per-class remaining-seat count. `state.bookings` is the list of `{id, classId, status: 'confirmed'|'cancelled', createdAt}`. Both persist to `localStorage` under `novafit_prototype_v1` via `persist()`/`loadPersisted()` — there is no backend, no API calls.
- `bookClass`, `cancelBooking`, and `hasActiveBooking` in `app.js` are the only functions that should mutate `state.seats` / `state.bookings`.
- Booking and cancellation both go through a bottom-sheet confirmation step (`openSheet` / `sheetHtml`) before mutating state — don't wire a button directly to `bookClass`/`cancelBooking`.

## Design constraints

These are intentional product/design decisions from the original brief — preserve them when editing:

- Mobile-first at a 390px reference width. Wider viewports get a cosmetic phone-frame via a `@media (min-width: 431px)` rule in `styles.css`, but the layout must keep working unframed on real mobile viewports.
- Single accent color (blue, `--color-accent` in `styles.css`), no gradients, no 3D illustrations.
- 8px spacing scale via CSS custom properties (`--space-1` … `--space-7`); 12px border radius for cards (`--radius-card`).
- Every status (class full, booking cancelled, etc.) is communicated with an icon *and* a text label, never color alone. All tap targets are ≥44×44px (`--tap-min`). Form inputs use real `<label for>` elements, not placeholder-only labels.
