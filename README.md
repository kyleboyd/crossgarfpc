# Crossgar Free Presbyterian Church — website

A five-page static site, built from the 75th-Anniversary invite as the style tile.
Navy + antique-gold + warm-paper palette, Americane headings / Orpheus body,
photographic hero frames in the style of gty.org.

## Pages
- `index.html` — Home: hero, Sunday & midweek service times, **Upcoming at Crossgar**
  calendar rail, ministries **bento grid**, history teaser, welcome CTA.
- `new-to-crossgar.html` — Welcome, **video placeholder** for Rev. Raymond Morrow,
  what to expect, and the **ABC of Salvation**.
- `history.html` — Our history (1951 → 2026), narrative + timeline.
- `live.html` — Live video-stream frame, service schedule, recent sermons,
  links to SermonAudio / Facebook / YouTube.
- `contact.html` — Address, phone, map slot, service times.

## To go live — three things to plug in
1. **Fonts.** The site references the licensed *Americane* and *Orpheus* fonts first,
   and falls back to Archivo + Cormorant Garamond (loaded from Google Fonts).
   To use the real fonts, add the web-font files to `assets/fonts/` and uncomment
   the `@font-face` block near the top of `css/styles.css`.
2. **Photography.** Every navy panel marked with a small ring/tag is a photo slot.
   Replace the `.photo-slot` div with an `<img>` (hero, welcome video poster,
   history, contact map).
3. **Live stream & sermons.** On `live.html`, drop the SermonAudio / Facebook /
   YouTube webcast `<iframe>` into the `.video-frame`, and wire the sermon list to
   your SermonAudio broadcaster feed (`sermonaudio.com/broadcasters/crossgar`).
   The live badge in the header/live page turns red automatically during service
   windows (Sun 11:30 & 19:00, Wed 20:00) — adjust in `js/main.js` if needed.

## Details on file
Address 83–85 Killyleagh Street, Crossgar, Co. Down, BT30 9DQ ·
Tel 028 9753 1226 · Facebook /crossgarfree · SermonAudio /broadcasters/crossgar.
Update the YouTube handle placeholder (`@crossgarfree`) once confirmed.

No build step or dependencies — open `index.html` in a browser, or upload the
folder to any web host.
