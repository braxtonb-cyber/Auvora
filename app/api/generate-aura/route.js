import Anthropic from '@anthropic-ai/sdk';
import { validateAura } from '@/lib/utils';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are AUVORA's editorial intelligence.

Voice: dark-luxury, composed, specific before poetic, emotionally intelligent, contemporary, culturally literate.

Your output must feel curated and authored. No generic filler, no trend-chasing slang, no startup hype.

Hard bans (never output these phrases): "main character energy", "iconic", "slay", "baddie", "aesthetic AF", "revolutionary", "disruptive", "AI-powered magic", "quiet luxury", "expensive-looking", "soul portal awakening".

Use routine terminology if feature language is needed.

Return ONLY valid JSON. No markdown. No explanation. No backticks.

Required output structure:
{
  "vibe_name": "2-4 words, tension-driven, original, non-generic",
  "outfit": "2-4 sentences with concrete garments, fabrics, silhouette, and finishing details",
  "fragrance": "1-3 sentences with specific olfactive structure and/or precise references",
  "playlist": "4-6 line-separated entries in format: Song Title — Artist Name",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "caption": "One understated sentence, 6-14 words, memorable and controlled"
}

Quality standards:
- Specificity first. Use concrete references over abstract adjectives.
- Keep all fields coherent: one person, one mood architecture, one world.
- Outfit must read like editorial styling direction, not a shopping list.
- Fragrance must describe structure (top/heart/base or equivalent scent profile).
- Playlist must be intentional and credible, never generic genre filler.
- Colors should be nuanced and harmonious in temperature and contrast.
- Caption should be elegant, brief, and non-performative.

Never output anything except the JSON object.`;

class GuardrailValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GuardrailValidationError';
  }
}

function parseAndValidateAura(rawText) {
  // Extract JSON from response (handle any accidental markdown)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new GuardrailValidationError('Could not extract JSON from response');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new GuardrailValidationError('Invalid JSON in AI response');
  }

  try {
    return validateAura(parsed);
  } catch (err) {
    throw new GuardrailValidationError(
      err instanceof Error ? err.message : 'Guardrail validation failed'
    );
  }
}

async function generateAuraAttempt(trimmedPrompt, options = {}) {
  const { recovery = false, previousFailure = '' } = options;

  const recoveryInstruction = recovery
    ? `\n\nRecovery pass: the previous draft failed validation (${previousFailure || 'quality guardrails'}). Regenerate from scratch with stricter compliance to schema, specificity, banned-language avoidance, and AUVORA tone consistency.`
    : '';

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate an aura from this routine input: "${trimmedPrompt}".${recoveryInstruction}`,
      },
    ],
  });

  const rawText = message.content[0]?.text;
  if (!rawText) {
    throw new Error('No content in AI response');
  }

  return parseAndValidateAura(rawText);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
      return Response.json(
        { error: 'A routine input is required.' },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim().slice(0, 500);
    let validated;

    try {
      validated = await generateAuraAttempt(trimmedPrompt);
    } catch (err) {
      if (!(err instanceof GuardrailValidationError)) {
        throw err;
      }

      console.warn(
        '[generate-aura] recovery pass triggered due to guardrail failure:',
        err.message
      );

      validated = await generateAuraAttempt(trimmedPrompt, {
        recovery: true,
        previousFailure: err.message,
      });
    }

    return Response.json({ aura: validated });
  } catch (err) {
    console.error('[generate-aura]', err);

    if (err.status === 429) {
      return Response.json(
        { error: 'Rate limit reached. Please wait a moment.' },
        { status: 429 }
      );
    }

    return Response.json(
      { error: err.message || 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
