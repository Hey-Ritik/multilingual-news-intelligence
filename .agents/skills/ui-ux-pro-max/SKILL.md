---
name: ui-ux-pro-max
description: >-
  Professional UI/UX and design intelligence skill. Provides comprehensive design systems,
  visual styles (Swiss Editorial, Bento Grid, Modern Minimalist, Neo-Brutalist, Dark Mode),
  curated color palettes, typography hierarchies, micro-interaction standards, and strict
  WCAG 2.1 AA accessibility guidelines for crafting top-tier web applications.
---

# UI/UX Pro Max: Design System & UX Intelligence

This skill provides deterministic rules, patterns, and guidelines for designing and implementing
high-converting, aesthetically refined, and accessible user interfaces.

---

## 1. Visual Style Archetypes

Select the appropriate visual archetype based on product domain:

### Archetype A: Swiss International / Editorial Intelligence (Current Project)
* **Core Characteristics**: Strict modular grid, asymmetric compositions, oversized grotesque typography, hairline borders (`1px`), bold signature accent color (e.g. Burnt Orange `#E85D26`), high contrast, generous negative space.
* **Border Radius**: Square (`rounded-none` or `rounded-xs: 2px`), reserved pills (`rounded-full`) exclusively for primary CTAs and status chips.
* **Dividers**: Thin `1px` lines (`#E5E3DE` on light, `#2A2A2A` on dark) with optional corner crosshairs (`+`) or monospace section coordinates.
* **Palette**: Warm Off-White (`#F7F5F0`), Almost Black (`#171717`), Pure White, signature accent.

### Archetype B: Bento Grid / Modern SaaS
* **Core Characteristics**: Asymmetrical rounded cards (`rounded-xl` to `rounded-2xl`), varying aspect ratios, visual hierarchy grouping features into self-contained pods.
* **Visual Weight**: One hero card (occupying 2x2 or 2x1 grid space) paired with smaller supplementary feature tiles.
* **Surface Styling**: Clean borders (`border-slate-200/80` or `border-white/10`), subtle backdrop blur, soft shadows (`shadow-sm`).

### Archetype C: Precision Dark Mode
* **Surface Hierarchy**:
  * Base Background: `#0B0B0B` or `#111111` (never pure `#000000` across the entire viewport to avoid OLED smearing and visual harshness).
  * Layer 1 Surface: `#171717` / `#1A1A1A`.
  * Layer 2 Elevated: `#222222` / `#262626`.
* **Border Delineation**: `1px solid rgba(255, 255, 255, 0.08)` to separate overlapping dark cards without needing heavy shadows.
* **Text Contrast**: Primary text `#F7F5F0` (95%), Secondary text `#A3A099` (70%), Tertiary/Metadata `#76726B` (50%).

---

## 2. Color System Architecture

Every cohesive interface must follow a tokenized color role structure:

1. **Brand Primary (The Signature)**: Single dominant accent color used for primary actions, active indicators, and hero highlights. (e.g., `#E85D26`).
2. **Brand Secondary / Hover**: 10-15% darker or higher saturation for interactive states (`#C7471D`).
3. **Neutrals (Surfaces & Canvas)**:
   * Canvas / Background: Light (`#F7F5F0`), Dark (`#171717`).
   * Card Surfaces: Pure White (`#FFFFFF`) or Dark Surface (`#1C1C1C`).
   * Borders & Rules: Light Grey (`#E5E3DE`), Dark Border (`#2A2A2A`).
4. **Semantics**:
   * Success: `#10B981` (Emerald)
   * Warning: `#F59E0B` (Amber)
   * Error: `#EF4444` (Rose / Red)
   * Information: `#3B82F6` (Blue / Sky)

### WCAG Contrast Rules
* Normal text (< 18pt or < 14pt bold): Minimum **4.5:1** contrast ratio against its background.
* Large text (≥ 18pt or ≥ 14pt bold): Minimum **3:1** contrast ratio.
* UI components and graphical objects (borders, icons, radio buttons): Minimum **3:1** contrast ratio against adjacent surfaces.

---

## 3. Typography Rules & Hierarchy

* **Scale Ratio**: Use a Major Third (1.250) or Minor Third (1.200) ratio.
* **Headings**:
  * Hero Display: `text-5xl` to `text-8xl`, `font-black`, `tracking-tighter` (`-0.03em` to `-0.05em`), line-height `0.88` to `0.96`.
  * Section Headers (H2): `text-3xl` to `text-5xl`, `font-bold`, line-height `1.05`.
  * Subsection (H3): `text-xl` to `text-2xl`, `font-semibold`.
* **Body Text**:
  * Size: `text-sm` (14px) for dense data/dashboards, `text-base` (16px) for editorial reading.
  * Line Height: `leading-relaxed` (1.5 to 1.65). Never use tight line-height on multi-line body copy.
* **Metadata & Eyebrows**:
  * Monospace font (`JetBrains Mono`, `Geist Mono`), `text-[10px]` to `text-xs`, uppercase, tracking `0.15em` to `0.22em`.

---

## 4. Interaction, Motion & States

Every interactive element MUST support complete state machine specifications:

| State | Visual Treatment |
| :--- | :--- |
| **Idle** | Clean default contrast, clear affordance. |
| **Hover** | 150-200ms smooth transition, subtle elevation or color shift (`hover:bg-...`, `hover:border-...`). |
| **Active / Pressed** | Subtle physical depress (`active:scale-[0.98]` or `active:translate-y-0.5`). |
| **Focus Visible** | Unmistakable 2px focus ring with 2px offset (`focus-visible:ring-2 focus-visible:ring-offset-2`). |
| **Loading** | Spinner or animated skeleton loader with matching geometry; disable pointer events. |
| **Disabled** | `opacity-50 pointer-events-none cursor-not-allowed`. |
| **Empty State** | Illustrated or icon-driven layout with clear title, descriptive helper text, and a primary CTA. Never leave an empty container blank. |

### Micro-interaction Timing:
* Standard UI transitions: `150ms` to `200ms` with `ease-out`.
* Sheet / Drawer slide-ins: `250ms` to `350ms` with `cubic-bezier(0.16, 1, 0.3, 1)`.
* Parallax / Scroll triggers: Pinned smoothly with Scrub (`1` to `1.5` damping).

---

## 5. Critical UX Anti-Patterns to Avoid

1. ❌ **Scroll-jacking or Disabling Native Scroll**: Never trap or override native wheel dynamics without smooth fallback.
2. ❌ **Low-Contrast Gray-on-Gray Text**: Avoid `#94A3B8` on light gray backgrounds. Keep text readable.
3. ❌ **Tiny Click Targets**: Never create interactive buttons smaller than 44x44px touch targets on mobile devices.
4. ❌ **Mystery Meat Navigation**: Never use ambiguous icons without text labels or clear tooltips.
5. ❌ **Layout Shifts (CLS)**: Always provide explicit aspect ratios or skeleton placeholders for images and dynamic data.
6. ❌ **Fabricated / Fake Data in Dashboards**: Always provide honest empty states or clearly labeled sample datasets.
