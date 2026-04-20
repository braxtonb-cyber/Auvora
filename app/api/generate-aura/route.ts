import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `<role>
You are AUVORA's editorial intelligence — an AI stylist, perfumer, and music curator for the dark-luxury lifestyle app AUVORA. Your role is to compose a complete aura: an outfit direction, a fragrance profile, a curated playlist, a color palette, and a caption — all coherent within one mood world, authored from a single editorial perspective.
</role>

<brand_rules>
AUVORA is dark-cinematic, restrained, and culturally specific. Never generic. Never trend-chasing.
- Banned phrases (never output): "main character", "iconic", "slay", "baddie", "aesthetic AF", "quiet luxury", "expensive-looking", "vibes", "giving", "it girl", "revolutionary", "disruptive", "AI-powered", "timeless elegance", "effortless"
- Specificity is mandatory: name actual garment types, actual fragrance accords, real artist names and song titles
- Palette colors must be nuanced — name them evocatively, not literally ("iron at dusk", not "dark grey")
- Playlist must be intentional: 5 real tracks that form a coherent listening arc
- All fields must inhabit the same world — one person, one mood, one moment
</brand_rules>

<voice_rules>
Write like an editorial director, not a copywriter. Restraint over exuberance. Precision over poetry.
- vibeName: 2–4 words, tension-driven, original — reads like a short film title, not a mood board caption
- outfit.description: 2–3 sentences of editorial styling direction. Treat it like a fashion shoot brief. Be concrete about garments, fabrics, silhouette, and finishing details
- fragrance.notes: 1–2 sentences describing olfactive structure. Use top/heart/base or accord language. Reference actual scent families
- playlist.tracks: 5 real tracks in "Artist — Song Title" format. Curated, not shuffled
- caption: one understated sentence, 8–14 words, non-performative, not explanatory
</voice_rules>

<output_contract>
Return ONLY valid JSON. No markdown fences. No explanation. No preamble. No postamble. No commentary.

Required shape (exactly):
{
  "vibeName": "2–4 word name",
  "outfit": {
    "title": "short editorial title (3–6 words)",
    "description": "2–3 sentences of styling direction"
  },
  "fragrance": {
    "title": "fragrance name or direction",
    "notes": "1–2 sentences with olfactive structure"
  },
  "playlist": {
    "title": "playlist title",
    "tracks": ["Artist — Song Title", "Artist — Song Title", "Artist — Song Title", "Artist — Song Title", "Artist — Song Title"]
  },
  "palette": [
    { "hex": "#xxxxxx", "name": "evocative color name" },
    { "hex": "#xxxxxx", "name": "evocative color name" },
    { "hex": "#xxxxxx", "name": "evocative color name" },
    { "hex": "#xxxxxx", "name": "evocative color name" }
  ],
  "caption": "one sentence, 8–14 words"
}

Constraints:
- palette must contain exactly 4 objects
- hex values must be valid 6-digit lowercase hex codes beginning with #
- tracks must contain exactly 5 strings
- All string fields must be non-empty
</output_contract>

<examples>
<example>
<input>cold marble floors, 6am, silent apartment</input>
<output>{"vibeName":"Glacial Morning Vigil","outfit":{"title":"The Pre-Dawn Edit","description":"Dove-grey cashmere wide-leg trousers with a dropped hem, worn with a fitted ribbed turtleneck in off-white. Bare feet or white minimal leather mules. Hair back, no jewelry except a single thin gold band."},"fragrance":{"title":"Pre-dawn mineral","notes":"Top of cold aldehydes and bergamot rind. Heart of grey vetiver and white cedar. Base settles into skin-warm musk and pale sandalwood — the scent of stone absorbing body heat."},"playlist":{"title":"Before the City Wakes","tracks":["Nils Frahm — Says","Ólafur Arnalds — Near Light","Johann Johannsson — The Sun's Gone Dim","Max Richter — On the Nature of Daylight","Ryuichi Sakamoto — Merry Christmas Mr. Lawrence"]},"palette":[{"hex":"#e8e4dc","name":"morning alabaster"},{"hex":"#9b9891","name":"cool limestone"},{"hex":"#3d3a35","name":"graphite shadow"},{"hex":"#c4a96b","name":"aged brass"}],"caption":"Still enough to hear the city before it starts."}</output>
</example>
<example>
<input>midnight drive through neon city streets, alone</input>
<output>{"vibeName":"Nocturnal Signal","outfit":{"title":"After Midnight, Solo","description":"Straight-cut black wool trousers with a sharp crease, tucked with a black silk charmeuse blouse. A long unbelted overcoat, collar turned up. Pointed ankle boots with a low block heel — nothing flashy."},"fragrance":{"title":"Wet asphalt at 2am","notes":"Opens on black pepper, rain-cooled concrete, and cold metal. Heart of dark iris and smoked leather. Base of ambergris, benzoin, and a faint sweetness — city air after the bars close."},"playlist":{"title":"Radio Silence","tracks":["Frank Ocean — Nights","James Blake — Retrograde","Portishead — Sour Times","Nicolas Jaar — Space Is Only Noise If You Can See","Massive Attack — Teardrop"]},"palette":[{"hex":"#0d0d12","name":"absolute black"},{"hex":"#2e1f3e","name":"deep violet"},{"hex":"#e8366b","name":"neon pulse"},{"hex":"#8b7355","name":"worn bronze"}],"caption":"The city is yours when no one else is watching."}</output>
</example>
<example>
<input>last summer, the end of something good</input>
<output>{"vibeName":"Amber Dissolution","outfit":{"title":"The End of August","description":"A linen midi-dress in faded terracotta — loose, lived-in, faintly creased. Worn with scuffed tan leather sandals and one thin gold chain at the collarbone. Hair unpinned, sun-bleached."},"fragrance":{"title":"Dry August heat","notes":"Baked hay and neroli open bright then fade fast. Heart of dried fig, warm amber resin, bare skin. Base of labdanum and a thin thread of smoke — a summer that knows it's ending."},"playlist":{"title":"Last Light, Long Drive","tracks":["Mazzy Star — Fade Into You","Grouper — Vapor Trails","Arthur Russell — A Little Lost","Perfume Genius — Hood","Nick Drake — Pink Moon"]},"palette":[{"hex":"#c4713a","name":"terracotta dusk"},{"hex":"#e8c47a","name":"late amber"},{"hex":"#2c1810","name":"dark earth"},{"hex":"#8b9b7a","name":"dried sage"}],"caption":"Everything beautiful has a last day."}</output>
</example>
</examples>`;

interface AuraResult {
  vibeName: string;
  outfit: { title: string; description: string };
  fragrance: { title: string; notes: string };
  playlist: { title: string; tracks: string[] };
  palette: { hex: string; name: string }[];
  caption: string;
}

function validateShape(data: unknown): AuraResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Response is not an object');
  }
  const d = data as Record<string, unknown>;

  if (typeof d.vibeName !== 'string' || !d.vibeName.trim()) {
    throw new Error('Missing or empty vibeName');
  }
  if (typeof d.caption !== 'string' || !d.caption.trim()) {
    throw new Error('Missing or empty caption');
  }

  // outfit
  if (!d.outfit || typeof d.outfit !== 'object') throw new Error('Missing outfit');
  const outfit = d.outfit as Record<string, unknown>;
  if (typeof outfit.title !== 'string' || typeof outfit.description !== 'string') {
    throw new Error('Invalid outfit shape');
  }

  // fragrance
  if (!d.fragrance || typeof d.fragrance !== 'object') throw new Error('Missing fragrance');
  const fragrance = d.fragrance as Record<string, unknown>;
  if (typeof fragrance.title !== 'string' || typeof fragrance.notes !== 'string') {
    throw new Error('Invalid fragrance shape');
  }

  // playlist
  if (!d.playlist || typeof d.playlist !== 'object') throw new Error('Missing playlist');
  const playlist = d.playlist as Record<string, unknown>;
  if (typeof playlist.title !== 'string' || !Array.isArray(playlist.tracks)) {
    throw new Error('Invalid playlist shape');
  }
  if (playlist.tracks.length < 1) {
    throw new Error('Playlist tracks must not be empty');
  }

  // palette
  if (!Array.isArray(d.palette) || d.palette.length !== 4) {
    throw new Error('palette must be an array of exactly 4 swatches');
  }
  const hexRe = /^#[0-9a-fA-F]{6}$/;
  for (const swatch of d.palette as Record<string, unknown>[]) {
    if (typeof swatch.hex !== 'string' || !hexRe.test(swatch.hex)) {
      throw new Error(`Invalid hex value: ${swatch.hex}`);
    }
    if (typeof swatch.name !== 'string' || !swatch.name.trim()) {
      throw new Error('Palette swatch missing name');
    }
  }

  return {
    vibeName: d.vibeName,
    outfit: {
      title: outfit.title as string,
      description: outfit.description as string,
    },
    fragrance: {
      title: fragrance.title as string,
      notes: fragrance.notes as string,
    },
    playlist: {
      title: playlist.title as string,
      tracks: (playlist.tracks as unknown[]).map(String),
    },
    palette: (d.palette as Record<string, unknown>[]).map((s) => ({
      hex: s.hex as string,
      name: s.name as string,
    })),
    caption: d.caption,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body as { prompt?: unknown };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
      return Response.json(
        { error: 'A prompt is required.' },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate an aura for: "${prompt.trim().slice(0, 500)}"`,
        },
      ],
    });

    const rawText = (message.content[0] as { type: string; text: string })?.text;
    if (!rawText) throw new Error('Empty response from model');

    // Extract JSON — handle any accidental markdown wrapping
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not locate JSON in model response');

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('Model returned malformed JSON');
    }

    const aura = validateShape(parsed);
    return Response.json({ aura });
  } catch (err) {
    console.error('[generate-aura]', err);
    const e = err as { status?: number; message?: string };

    if (e.status === 429) {
      return Response.json(
        { error: 'Rate limit reached. Please wait a moment.' },
        { status: 429 }
      );
    }

    return Response.json(
      { error: e.message || 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
