# AUVORA Step 3 QA Checklist

## Scope
Step 3 is the ceremonial reveal moment after generation. This checklist validates whether the reveal feels premium, intentional, and mobile-first.

## Pass Criteria Summary
- Reveal feels composed, not abrupt.
- Visual hierarchy is clear within 2 seconds.
- Primary action is reachable one-handed on modern phones.
- Motion supports meaning, never distracts.
- UI does not resemble generic template dashboards.

## Test Setup
- Devices: iPhone 13/14/15, Pixel 7/8, one small-screen device (iPhone SE class).
- Conditions: normal mode, low power mode, reduced motion enabled.
- Run at least 3 generated outputs with varied content density.

## Ceremony And Reveal
- `PASS`: Reveal opens with a clear sense of sequence (arrival -> focus -> action).
- `PASS`: Hero element appears first, supporting elements follow with intentional delay.
- `PASS`: No jarring jumps in layout between loading state and final state.
- `FAIL`: Reveal appears as an instant content dump with no pacing.
- `FAIL`: Skeleton-to-final transition causes major visual shift.

## Motion Quality
- `PASS`: Motion durations feel calm and premium (not twitchy or sluggish).
- `PASS`: Entrance motion reinforces hierarchy (primary before secondary).
- `PASS`: Motion curves feel soft and deliberate; no harsh linear snaps.
- `PASS`: Reduced-motion setting preserves clarity without broken sequencing.
- `FAIL`: Multiple elements animate simultaneously without priority.
- `FAIL`: Decorative motion competes with readability.

## Hierarchy And Readability
- `PASS`: User can identify the three most important elements in order.
- `PASS`: Primary aura output is dominant over metadata and controls.
- `PASS`: Typography contrast and spacing maintain clarity in dim environments.
- `FAIL`: Supporting copy competes with hero output.
- `FAIL`: Section boundaries are ambiguous during quick scanning.

## Thumb-Zone Interaction (Mobile)
- `PASS`: Primary CTA is comfortably reachable in one-hand usage.
- `PASS`: Bottom actions have minimum safe tap target (44x44+).
- `PASS`: No critical action is trapped near hard-to-reach top corners.
- `FAIL`: User must shift grip to complete the core Step 3 action.
- `FAIL`: CTA is visually strong but physically awkward to tap.

## Anti-Generic Visual Failures
- `PASS`: Reveal feels editorial and branded, not “AI SaaS panel.”
- `PASS`: Surface treatment has depth and restraint (no noisy gradients or random glow).
- `PASS`: Content blocks feel composed, not card-stacked boilerplate.
- `FAIL`: Looks like interchangeable template UI.
- `FAIL`: Overused tropes (default chips everywhere, flat white text blocks, random sparkle effects).

## Content Fit At Reveal
- `PASS`: Copy reads decisive and curated, not hedged or over-explained.
- `PASS`: Labels are concise; no filler language.
- `FAIL`: Generic output language (“based on your preferences,” “you might like”).

## Performance Feel (Perceived)
- `PASS`: Step 3 feels responsive even when data is rich.
- `PASS`: No visible stutter during reveal transitions.
- `FAIL`: Animation frame drops are noticeable on standard devices.

## QA Logging Template
- Build/commit:
- Device/OS:
- Scenario:
- Result: `PASS` / `FAIL`
- Failure category: ceremony | motion | hierarchy | thumb-zone | anti-generic | performance
- Evidence: screen recording + timestamp
- Severity: P0 blocker / P1 major / P2 polish

## Release Gate
Step 3 is release-ready only if:
- 0 unresolved P0 issues
- 0 unresolved P1 issues in ceremony/motion/hierarchy/thumb-zone
- At least one full pass on iOS and Android with reduced-motion check included
