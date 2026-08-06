# Follow-ups

Known gaps left after wiring this site to the backend. Each was seen and
judged, not missed. Nothing here blocks the site.

## Do this first

**Rotate the Telegram bot token.** `src/constants/index.js` used to hold a
live bot token and chat id in plain text, shipped to every visitor in the
bundle. The file is deleted and the form now posts to the backend, which
holds the token server-side — but **deleting a file does not revoke a
credential**. `git show 416f020:src/constants/index.js` still returns it,
and every commit at or before that point carries it.

Rotate via @BotFather, put the new token only in the backend's `.env`, and
confirm the old one returns 401.

Related: during development the test suite ran once against the old
component, which still called Telegram directly. A fabricated lead
("Иван / +998901234567 / Тест") was probably delivered to the real sales
channel. Worth checking and deleting.

## Decisions a human should make

**`useApi` has no shared cache.** `ProductsSection` and `Footer` each fetch
`/api/category/` on the home page — two requests for the same small,
unpaginated list. Harmless today; a shared cache is a real design decision,
not a patch.

**Uzbek trade terminology.** The site says *iskala* for scaffolding
(`qurilish iskalalari`), corrected from an earlier *inshoot* (a structure,
not scaffolding). A native speaker in the trade should confirm this is the
term customers use.

**`axios` is still in `package.json`** but no source file imports it — it
is tree-shaken out of the bundle. Removing it is coupled to
`ContactSection.test.jsx`, which imports it for a "never calls Telegram"
guard. That guard is also weak: the component no longer imports axios at
all, so it can only ever pass, and it would not catch a raw
`fetch('https://api.telegram.org/…')`. Asserting on a stubbed global
`fetch` would be a stronger guard and would free the dependency.

## Accessibility

- The phone input (`react-international-phone`) has no accessible name.
  Pre-existing; it is why its test reaches for `document.querySelector`.
- Gallery thumbnails all share the product or project name as their `alt`,
  so a screen reader cannot tell them apart.
- The language `<select>`'s `aria-label` resolves to the *current value*
  ("Русский"), naming the value rather than the control. It needs its own
  key ("Язык" / "Til").

## Cleanups worth one commit each

**The gallery block is duplicated.** `ProductDetail.jsx` and
`PortfolioDetail.jsx` carry ~40 identical lines — route-key reset,
active-image derivation, thumbnail JSX — differing only in field names.
Extracting `useGallery(data, routeId)` returning
`{gallery, activeItem, main, setActiveId}` is a clean change with parallel
test suites already in place to prove it.

**`npm run lint` exits non-zero** on one error:
`react-refresh/only-export-components` in `LanguageContext.jsx`, because
the file exports both the provider and its hook. Standard React shape;
moving `useLanguage` to its own file would silence it.

**`formatDate` splits on `-`** and would misformat a full ISO datetime.
The backend field is a `DateField` so it emits date-only today —
`value.split('T')[0]` would make it future-proof.

**Gallery order** relies on the backend returning `images` pre-sorted;
`images[].order` is never consulted client-side.

## Deployment notes

The API origin is baked in **at build time** from `VITE_API_URL`. A
production build without it now throws rather than silently shipping the
localhost fallback. CI sets it from the `DX_FRONT_API_URL` secret.

The build runs in GitHub Actions, not on the server: the server's Node is
22.8 and Vite 7 needs >= 22.12, and a production box should not carry a
build toolchain. CI tars `dist/` and pipes it over SSH to
`/usr/local/bin/dx-front-deploy`, pinned as a forced command, which
unpacks to a timestamped release and swaps the `current` symlink. The last
five releases are kept, so a rollback is one `ln -sfn` on the server.
