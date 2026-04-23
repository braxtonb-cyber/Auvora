/**
 * Oracle phrase pool for the GenerateCeremony loading state.
 *
 * Voice: tarot reader, not chatbot. Short, atmospheric, slightly poetic.
 * Never explanatory, never performative, never technical.
 *
 * Rules:
 *   • 4–8 words per phrase
 *   • lowercase (reads as thought, not announcement)
 *   • present continuous or present tense — "finding," "settling," "arriving"
 *   • ellipsis optional, not mandatory
 *   • avoid "your" when "the" will do — keep it ambient, not possessive
 *   • no emoji, no gerund-heavy phrasing
 *
 * Tune by ear. If a phrase sounds like a load spinner caption, replace it.
 */

export const ORACLE_PHRASES: readonly string[] = [
  'reading the air around your words',
  'something warm is taking shape',
  'the outline is settling',
  'color is arriving in layers',
  'listening for the signal beneath',
  'this one is finding its temperature',
  'almost — the shape is nearly yours',
  'holding the light for a moment',
  'the grain of the moment is coming in',
  'a small weather is forming',
] as const;

/**
 * Returns a shuffled copy of the phrase pool. Each ceremony instance gets
 * its own ordering so repeat generations don't feel scripted.
 */
export function shufflePhrases(): string[] {
  const copy = [...ORACLE_PHRASES];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
