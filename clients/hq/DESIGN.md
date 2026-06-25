# HQ — Design Brief & Reference

**Client:** HQ Private Member Club  
**Location:** Provo, Utah  
**Opening:** Summer 2026  
**Status:** Design exploration — direction approved (Option 09 Industrial)

---

## The Club

HQ is a referral-first private members' club for builders, stewards, and long-horizon thinkers. It is not a coworking space or a networking event. It is a room for people who think in decades, value discretion, and want to do serious work alongside people worth knowing.

The physical space is a historic building — warm brick, arching windows, high ceilings. The design language of the site should feel like an extension of that room.

### Voice

- Direct. No filler.
- Restrained confidence — the club doesn't need to sell itself loudly.
- Institutional weight. Words like "discretion," "standard," "signal," "steward."
- Italic emphasis for the phrases that matter.

### Taglines (from invite card)

> "Some rooms change the trajectory of a life."  
> "HQ was built for depth."  
> "A place to think clearly, recover quietly, and build alongside people worth knowing."  
> "The room matters. So does who enters it."

---

## Visual Direction

**Concept:** A candlelit brick vault. The site feels like stepping inside the building at night — warm, serious, quiet.

The building's architecture (arching windows, aged brick) is the primary visual reference. These elements should read as structural — not decorative overlays — because the UI elements themselves take the arch shape.

**What to avoid:** Anything that reads as startup, coworking, or hospitality marketing. No hero gradients in purple. No floating cards with drop shadows. No stock photography of smiling professionals.

---

## Color Palette

| Token | Hex | Use |
|---|---|---|
| `--void` | `#0b0907` | Page background, deepest backgrounds |
| `--surface` | `#131008` | Section surfaces (manifesto, pillars, house) |
| `--lift` | `#1c1610` | Cards, elevated surfaces |
| `--brick` | `#271609` | Membership + closing sections (brick wall) |
| `--cream` | `#e8dfc8` | Primary text |
| `--cream-2` | `#b0a488` | Secondary text, captions |
| `--gold` | `#c49838` | Accent — links, eyebrows, Roman numerals |
| `--gold-2` | `#ddb850` | Hover states, italic emphasis |
| `--rule` | `rgba(196,152,56,.1)` | Dividing lines, borders |

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / Headlines | Playfair Display | 400 | Serif. Use italic (`em`) for key phrases. |
| Body / UI | DM Sans | 300–400 | Clean, light. |
| Labels / Eyebrows | DM Sans | 400 | 9–10px, letter-spacing .2–.3em, uppercase |

**Loading from:** Google Fonts  
```
Playfair Display: ital,wght@0,400;0,500;1,400;1,500
DM Sans: opsz,wght@9..40,300;9..40,400
```

---

## Brick Texture

Applied to `#membership` and `#closing` sections via CSS pseudo-elements on a `#271609` background.

**Horizontal courses** (`::before`):
```css
background-image: repeating-linear-gradient(
  180deg,
  rgba(255,255,255,.12) 0px,
  rgba(255,255,255,.12) 2px,
  transparent 2px,
  transparent 26px
);
```

**Vertical joints — running bond** (`::after`):
```css
background-image:
  repeating-linear-gradient(90deg, transparent 0px, transparent 70px,
    rgba(255,255,255,.07) 70px, rgba(255,255,255,.07) 72px),
  repeating-linear-gradient(90deg, transparent 0px, transparent 70px,
    rgba(255,255,255,.07) 70px, rgba(255,255,255,.07) 72px);
background-size: 72px 56px, 72px 56px;
background-position: 0 0, -36px 28px;
```

Bricks: 70px × 26px with 2px joints. Second gradient offset by half-brick (−36px) and one course (28px) for running bond. Mortar is lighter than brick (12% / 7% white) — candle-lit surfaces catch light on the joints.

> **To upgrade:** Replace CSS texture with a generated seamless brick image.  
> Prompt: `seamless tileable dark warm brick texture, aged industrial brick wall, deep charcoal brown with warm amber undertones, dim moody lighting, close-up flat shot, no shadows, photorealistic, 4k`

---

## Arch Shape

The four membership steps (Referral / Application / Agreement / Access) are rendered as architectural arches — the arch shape IS the UI element, not a decoration.

```css
border-radius: 50% 50% 0 0;
```

Pure percentage border-radius scales with element width:
- Desktop (4 columns, ~260px wide): tall Gothic-ish pointed arches
- Tablet (2 columns, ~420px wide): rounder Romanesque arches

Both are historically valid for a warm brick building.

**Arch void interior:**
- Background: `#080604` (deep void, darker than the wall)
- Crown glow: `radial-gradient(ellipse at 50% 0%, rgba(196,152,56,.22) 0%, transparent 58%)` at 30% opacity, brightens on hover
- Surround: `box-shadow: inset 0 0 0 1px rgba(196,152,56,.24)`

---

## Logo

Two versions in use:
- `hq-logo-white.png` — nav, loader (dark backgrounds)
- `hq-logo-maroon.png` — available for light-background use

---

## Membership Flow (4 Steps)

| # | Step | Label | Description |
|---|---|---|---|
| I | Referral | Step One | A current member establishes the first signal of trust. |
| II | Application | Step Two | Profile, intent, contribution, and standards reviewed together. |
| III | Agreement | Step Three | Confidentiality, conduct, and member discretion confirmed. |
| IV | Access | Step Four | Approved members enter the private portal. |

---

## Four Pillars

| # | Name | Verb | Description |
|---|---|---|---|
| I | Curated Signal | Gather | A smaller room, intentionally composed. |
| II | Sanctuary with Edge | Reflect | Quiet that sharpens judgment. |
| III | Work Worth Inheriting | Create | Boardrooms and pods for long-horizon work. |
| IV | Clarity as Advantage | Renew | Recovery suites for people who return sharper. |

---

## Page Structure (Option 09)

1. **Loader** — HQ white logo, 1.4s hold, fades out
2. **Hero** — full-bleed photo, parallax, headline + CTA
3. **Manifesto** — two-column: pull quote + body copy
4. **Membership** — brick wall section, 4 arches
5. **Pillars** — 4-column grid on dark surface
6. **Space** — split: photo + amenities list
7. **The House** — principles + member experience card
8. **Closing** — brick section, centred CTA
9. **Footer** — minimal, one line

---

## Animations

| Element | Animation |
|---|---|
| Hero elements | Staggered fade-up after loader (1.6s + 150ms per element) |
| Scroll sections | `IntersectionObserver` → `.reveal` class → `opacity 0→1, translateY 28px→0` |
| Stagger delays | `.d1–.d4` classes (100–400ms) |
| Hero parallax | `scrollY * 0.22` on hero image |
| Nav | Frosted glass on scroll > 48px |

---

## Assets Needed

- [ ] Seamless brick texture image (see prompt above)
- [ ] Interior photography (boardroom, recovery suites, gathering space)
- [ ] Final hero image (current: placeholder `hero.jpg`)
- [ ] HQ favicon

---

## Client Notes

- Harvey approved the front of the invite card as the right tone: warm, confident, radiating lines from bottom-left, cream/linen background, maroon logo
- He asked to "tie in the arching windows and brick into the website background" — executed as structural arch UI elements + CSS brick texture
- Direction: Option 09 Industrial (dark, fluent, HQ logo loader, 4-arch membership section)
- Live design review: `jakedev.org/clients/hq/`
