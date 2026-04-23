# Manual Smoke Regression

## Purpose
Human-runnable smoke suite after each major implementation step to catch premium-UX regressions quickly.

## Run Cadence
- After major UI pass
- After Step 3 logic changes
- Before staging deploy
- Before production deploy

## Environment
- iOS Safari (current)
- Android Chrome (current)
- One smaller-screen device class
- Reduced Motion enabled test on at least one device

## Smoke Flow (15-25 min)
1. Launch + Shell
- App loads without layout break.
- Bottom nav is visible and stable.
- No clipped safe-area content.

2. Aura Step 1 -> Step 2
- Input accepts normal and long prompts.
- Loading state appears once, no duplicate overlays.

3. Aura Step 3 Ceremony
- Reveal is sequenced (hero first, then support).
- Primary CTA is thumb-reachable on first view.
- No stutter or abrupt layout snap.
- Copy feels decisive, not generic filler.

4. Step 3 Actions
- Primary CTA works once per tap.
- Save/history action confirms clearly.
- Retry/refine path preserves user context.

5. Error Paths
- Simulate transient failure (offline/timeout):
  - User sees recoverable error.
  - Retry works without losing prior reveal.
- Simulate hard failure:
  - User gets clear back/regenerate option.

6. Section Differentiation Check
- Open Aura, Scent, Style, Sound, Self.
- Confirm each section has distinct layout rhythm and interaction logic.
- Confirm none feel like relabeled clones.

7. Scent Reality Check (if present in build)
- Wardrobe-first behavior remains intact.
- Situation recommendation prioritizes owned items.
- Product detail sheet opens and closes cleanly.

8. Performance Feel
- No obvious animation frame drops during reveal.
- Tap response feels immediate.
- Scrolling is stable in long content states.

## Regression Triggers (Automatic Fail)
- Step 3 appears as instant card dump.
- Primary action hidden behind initial scroll.
- Two sections become visually/interaction-wise interchangeable.
- Error path clears user context without consent.
- Generic/cheesy copy reappears in hero surfaces.

## Report Template
- Build/commit:
- Device + OS:
- Area tested:
- Result: `PASS` / `FAIL`
- Severity: `P0` / `P1` / `P2`
- Repro steps:
- Evidence: screenshot/video timestamp
- Owner:

## Exit Criteria
Release candidate is smoke-passing when:
- No P0 failures
- No unresolved P1 in Aura Step 3
- Section differentiation check passes on iOS + Android
