# Stupid Trust — public bucket upload

Upload the CONTENTS of this folder (not the folder itself, unless you want
the app at /stupid-trust/) to the root of a public bucket / static host.

Files:
- index.html — the app (open this URL)
- manifest.webmanifest — PWA manifest
- sw.js — service worker (offline + install)
- icon-192.png, icon-512.png, icon.svg — app icons

Checklist:
1. All files public-readable, same directory, same origin.
2. Serve over HTTPS (a CDN / load balancer in front of the bucket is fine).
   Plain http:// only works on localhost; file:// will NOT install as a PWA.
3. Set the bucket's index document to index.html (or just open index.html directly).
4. Cache headers: index.html, manifest.webmanifest and sw.js should be
   no-cache or short-lived; icons can be cached long. If you change
   index.html, bump CACHE in sw.js (stupid-trust-v13 -> stupid-trust-v14)
   and re-upload, or installed apps may keep the old offline copy.
5. Test: open the HTTPS URL, install it, and check two devices sync. Settings (gear) should show "Stupid Trust · Version 13" at the bottom.

Notes:
- No build step, no account, no server code. Gun data goes to the
  castrater.xyz/gun peer; the Gun library loads from jsDelivr.
- Wire names inside the code (safecall-v1 protocol, safecall-* browser
  storage keys) are intentionally unchanged so existing circles and
  backups keep working. Only the visible name changed to Stupid Trust.

Two screens only: Setup (once, then it disappears) and Confirm Trust (every call). Your phone signals automatically while you are on Confirm Trust — there is no call toggle to remember. If there is only one other person in your group, they are picked automatically.

Design: one screen at a time — Setup once, then a single Confirm screen (status, secret words, person, Yes/No at the bottom). Everything technical lives behind the gear icon (Settings sheet), not in the main flow.

Cache troubleshooting (if an upload looks unchanged):
- Open the URL in a private window first. If that shows the new design, the old copy is in your normal browser / installed app, not the bucket.
- Open the URL with a throwaway query, e.g. ?v=7. If that shows the new design, a CDN/bucket HTTP cache is serving the old index.html.
- Open <your-url>/sw.js in the browser and search for stupid-trust-v. If it still says v6 or older, the bucket has not replaced sw.js yet, whatever the page shows.
- If you can set headers in QConsole, set index.html and sw.js to no-cache / short-lived; icons can stay long-lived.
- Installed app still old after that: uninstall it, or in DevTools Application > Service Workers > Unregister, then reload.
- Settings (gear) now shows "Stupid Trust · Version 7" at the bottom — that tells you exactly which build you are looking at.

Empty group: when no one else has joined yet, the main screen shows a big 'Copy invite link' button instead of Yes/No — Yes/No only appears once someone is there to check.

Empty group invite: tapping 'Invite someone' opens a one-job invite sheet — link + Copy button + trusted-channel note only. No backup, leave, or install clutter. The gear also opens that simple sheet while the group is empty.

Aesthetics v12: brutal/neo — Space Grotesk (body) + Syne (display), near-black #0a0a0b, industrial yellow #ffd200, sharp corners, thick borders, hard offset shadows. Same single-screen flow, no new steps.

Fix v13: secret words now size by longest word (GLACIER and 12-letter words no longer overflow the yellow card), tighter word-spacing, smaller hard shadows, no horizontal overflow.
