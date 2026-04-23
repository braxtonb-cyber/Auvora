# Aura Step 3 State Machine

## Purpose
Define a mobile-first, cinematic, failure-safe interaction model for Aura Step 3 reveal and post-reveal actions.

## UX Principles
- Reveal is ceremonial, not abrupt.
- Motion communicates hierarchy, not decoration.
- Primary action stays thumb-reachable.
- Failure states preserve confidence and momentum.

## States
1. `idle`
- Step 3 not entered yet.
- Entry condition: Step 2 output accepted.

2. `pre-reveal`
- Brief buffer for compositional setup.
- Motion intent: stage the scene (dim support surfaces, hold primary focal area).

3. `revealing-primary`
- Hero output enters first.
- Motion intent: establish emotional anchor.

4. `revealing-secondary`
- Supporting modules (cards/actions) enter in sequence.
- Motion intent: clarify hierarchy and next action.

5. `ready`
- Fully interactive state.
- Primary CTA, refine, save/share available.

6. `cta-processing`
- User tapped primary CTA or refine.
- Motion intent: acknowledge action immediately; keep context visible.

7. `success-feedback`
- Action completed (save/share/refine success).
- Motion intent: minimal confirmation, no celebratory noise.

8. `recoverable-error`
- Transient/network/validation issue.
- UI keeps user context and offers retry.

9. `degraded-ready`
- Partial content available (fallback composition).
- User can still continue with reduced richness.

10. `fatal-error`
- Non-recoverable for this attempt.
- Exit path offered: back, regenerate, restore previous result.

## Transitions
- `idle -> pre-reveal`: Step 3 mounted.
- `pre-reveal -> revealing-primary`: layout/staging complete.
- `revealing-primary -> revealing-secondary`: hero settled.
- `revealing-secondary -> ready`: interaction unlocked.
- `ready -> cta-processing`: user action initiated.
- `cta-processing -> success-feedback`: action success.
- `cta-processing -> recoverable-error`: action failed transiently.
- `recoverable-error -> cta-processing`: retry.
- `recoverable-error -> ready`: dismiss error, keep context.
- `ready -> degraded-ready`: partial dependency loss detected.
- `degraded-ready -> ready`: dependency restored.
- `recoverable-error -> fatal-error`: retry budget exhausted or hard validation failure.

## Motion Intent By Transition
- `pre-reveal -> revealing-primary`: single focal rise/fade.
- `revealing-primary -> revealing-secondary`: staggered secondary entrance.
- `ready -> cta-processing`: instant tap feedback + subtle lock on duplicate taps.
- `cta-processing -> success-feedback`: quick confirmation pulse/text swap.
- `cta-processing -> recoverable-error`: no shake/drama; calm inline message.

## Failure/Fallback Handling
- Network timeout: enter `recoverable-error`, keep full Step 3 content intact.
- Validation mismatch: keep prior valid result, show targeted retry guidance.
- Missing secondary data: move to `degraded-ready`, do not block primary CTA.
- Hard failure: enter `fatal-error` with explicit “Try again” and “Back” options.

## Guardrails (Anti-Generic)
- Never render Step 3 as a simultaneous card dump.
- Never replace hero with a generic spinner after reveal.
- Never hide primary CTA behind scroll on initial ready state.
- Never use loud/confetti-like success animation.

## Telemetry Hooks (Optional)
- `aura_step3_state_entered` with `state_name`, `result_id`.
- `aura_step3_transition` with `from_state`, `to_state`, `duration_ms`.
- `aura_step3_error` with `error_type`, `recoverable`.
