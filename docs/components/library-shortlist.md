# AUVORA Component Library Shortlist

## Goal
Choose primitives that preserve premium mobile feel while keeping implementation velocity high.

## Quick Recommendations
- Use **Radix** for accessibility-critical primitives.
- Use **Vaul** for mobile-first drawers/sheets.
- Use **shadcn/ui** as a starter layer, then heavily brand.
- Use **custom builds** for hero surfaces and signature reveal moments.

## Decision Matrix
| Option | Best For | Avoid When | Notes |
|---|---|---|---|
| Radix UI | Accessible primitives (dialog, popover, tabs, menu) | You need finished premium visuals out of the box | Strong foundation, low visual opinion |
| Vaul | Bottom sheets, mobile gestures, product detail overlays | Desktop-first panel patterns | Excellent for thumb-zone UX and scent detail sheets |
| shadcn/ui | Fast scaffolding, consistent baseline components | You plan to keep default visual styles | Great for speed; default look must be redesigned |
| Custom Build | Hero reveal, branded transitions, signature cards | Accessibility or interaction complexity is high and untested | Use for distinct brand moments only |

## Recommended Use In AUVORA
- **Aura Step 3 reveal**: custom surface built on Radix-safe primitives.
- **Scent product detail sheet**: Vaul + custom styling.
- **Form controls and utility UI**: shadcn/ui primitives, visually restyled.
- **Critical popovers/dialogs**: Radix primitives with brand skin.

## Guardrails
- Never ship default shadcn visuals unchanged in core brand surfaces.
- Avoid mixing multiple gesture systems in the same flow.
- Validate focus management and keyboard behavior on every overlay.
- Keep motion style centralized; do not let each library animate differently.

## Implementation Heuristic
- Start with accessibility and interaction correctness.
- Then apply AUVORA visual language.
- If a surface is brand-defining, prefer custom composition over library defaults.
