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
   index.html, bump CACHE in sw.js (stupid-trust-v17 -> stupid-trust-v18)
   and re-upload, or installed apps may keep the old offline copy.
5. Test: open the HTTPS URL, install it, and check two devices sync. Settings (gear) should show "Stupid Trust · Version 17" at the bottom.

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

Fix v14: invited people who auto-join via a link now get a name prompt on the Confirm screen if they have no name yet (and a Your name field in Settings to change it later) — previously they were stuck as 'Someone' with nowhere to set a handle.

Fix v15 APPROVAL-GATED INVITES: invite links no longer carry the group secret (#c + #i only). Opening a link only opens a Request screen — forwarding it lets no one in. The requester taps Request to join, an existing member sees 'People asking to join' on Confirm and taps Approve/Decline. On Approve, the secret is encrypted to the requester's key (SEA shared secret) and only they can decrypt it. Old bearer links (#c + #s, or id.secret codes) no longer join directly. IMPORTANT: a secret already shared via an old bearer link is already out — to truly lock out forwarders of an old link, start a NEW group and re-invite with v15 links.

Fix v16 WORDS-ONLY HUMAN MODE: Yes/No tap dropped. Confirm screen is now just secret words + who you are talking to + whether they are on this screen right now. You hear the words, you compare them in your head, done — no tap, no green verdict. The old challenge code still auto-replies if an older client sends one, but v16 never sends a challenge from the UI.

Clean-up v17 NO BACKWARD COMPAT: challenge/response system, Yes/No tap code, verifyCard, old bearer-link handling, dead call toggle, dead save-name button, dead helpers (sleep/randomHex/shortPub/setPeer) all deleted. App is now: Setup / Request to join / Confirm (words + talking to + live check) + approval-gated invites + backup/install. Old links are simply invalid — ask for a new invite link.
