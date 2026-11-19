# Fade Theory — build notes

Spec homepage to pitch to the owner (target fee ₹25–30k). Static HTML/CSS/ES modules, no build step.

## Brief
```
Business:       Fade Theory, barbershop in Koregaon Park, Pune. Fades, beard work, hot-towel shaves, kids' cuts.
Primary action: Call to book a chair (only contact we know exists is a phone number on their Wix page).
Proof we have:  4.7 stars on Google, ~380 reviews (user's figure: "like 380" — shown as "380+", verify).
3 adjectives:   exact, unhurried, sharp.
Signature:      "The fade, worked out" — a code-drawn hair specimen whose fade line climbs
                taper → low → mid → high as you scroll, with a guard ruler that reads out the
                clipper guard at each height. The shop's name is literally "Fade Theory": the
                signature *is* the theory of a fade.
```

## Assumptions (user not available)
- No photos/logo/colours available, and no image/video generation allowed → hero is type + a
  procedural canvas (no stock photos pretending to be the shop).
- Web search found no listing for this shop, so phone, street address, hours, prices, Instagram,
  team names and opening year are unknown. Visible text uses dotted "stand-in" chips (`.tbc`,
  each with `data-ask`) so the demo reads cleanly in front of the owner; machine-facing values
  (tel: href, JSON-LD, social hrefs) keep double-brace placeholders so slop_check flags them until filled.
- Pincode 411001 used for Koregaon Park (public fact). No aggregateRating in JSON-LD (Google
  disallows self-serving review markup).
- Shave steps and service descriptions are standard barbering practice — owner must confirm
  they match how *his* shop does it.
- Builder credit per Harish's global rule (LinkedIn / X / GitHub); his URLs are "to be filled"
  in USER.md, so hrefs are placeholders.

## Tokens
| Token | Value | From |
|---|---|---|
| `--clipper` | oklch(17% 0.012 250) | clipper body / cape black, blue-tinted |
| `--steam` | oklch(95.5% 0.006 230) | hot-towel steam, cool white |
| `--steel` | oklch(64% 0.014 240) | razor steel, muted text |
| `--barbicide` | oklch(68% 0.13 215) | the blue disinfectant jar on every barber's counter |
| `--skin` | oklch(56% 0.07 52) | canvas ground: a Pune client's skin tone, not a pink default |

Type: **Big Shoulders Display** (condensed, Chicago sign-painter heritage → barber signage) for
display; **Schibsted Grotesk** for text. Radius: 2px everywhere (razor-edged).

## Wireframes
```
HERO (dark, pinned ~200% scroll)
| Fade Theory                        [Call to book] |
| FADES, WORKED OUT       |  ┌ specimen canvas ─┐ #4 |
| TO THE MILLIMETRE.      |  │ hair strokes ↑   │ #3 |
| lede: KP barbershop…    |  │ fade line moves  │ #1 |
| 4.7 on Google, 380+     |  └──────────────────┘ #0 |
| [Call] See the menu     |  Taper Low Mid High (buttons) + caption |

MENU (light) — dense priced list, no cards
| The chair menu                                       |
| FADES ............ description ............ ₹ (tbc) |
| BEARD WORK ....... ...                               |
| HOT-TOWEL SHAVE .. ...                               |
| KIDS' CUTS ....... ...                               |

SHAVE (light, split) — the one real sequence on the page
| Hot towel → oil → lather → razor → cold towel (5 columns desktop, stacked mobile)

PROOF (light) — oversized number + honest line + link to Google
| 4.7  ★★★★☆(70% fill)  | "Read all 380+ on Google rather than 3 picked here" |

VISIT (dark) — address, hours, phone, map link, CTA again
FOOTER — socials + small builder credit + demo note
Mobile: sticky bottom bar [Call to book][Directions]
```

## Principles
1. The page explains the craft (guard numbers, fade heights) instead of praising it.
2. No invented proof: one real number, sent to Google for the rest.
3. Signage-loud type, razor-quiet everything else: one accent, one radius, one motion moment.

## Plan review against the tell list
- Near-black + bright accent is a 2026 tell → accent is Barbicide blue, which comes from the
  trade, used only on the rating, focus states and the canvas fade-line marker.
- Condensed all-caps display: barber signage justifies it; no ALL-CAPS eyebrows anywhere.
- Shave steps are numbered because they are a real sequence.
- No fade-up on every section: only the hero is animated; sections are static.
- No middle-dot meta strings.

## QA log
(see bottom — appended during rounds)

### Round 1
- Stage buttons said Taper/Low/Mid/High while JS stages were Low/Mid/High/Skin → relabelled.
- Hair read as "brown rain" → added a per-row coverage pass (the fade reads as darkness
  first, strands second), thicker long strands.
- Ruler repeated "Top scissor" four times → ruler now places one tick per guard band for the
  current fade, thinned so labels never collide; the #4 weight line is highlighted.
- Phone: specimen sat above the H1 → H1 first, smaller display size, plate 38svh, hero CTA
  moved to sticky call bar.
### Round 2
- Subtracted: the light "sheen" strands (decoration that made the texture look like rain).
- OG image rendered from the hero at 1200×630 (og.png).
- slop_check: only FAIL is unfilled placeholders (phone, address, hours, price range,
  Instagram, builder links) — by design until the owner supplies them. WARN "WebGL without
  DPR cap" is a false positive (matches the word "three" in copy; no WebGL used; canvas DPR is
  capped at 2).
