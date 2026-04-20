import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic()

// ─── Domain system prompts ─────────────────────────────────────────────────────

const SYSTEMS: Record<string, string> = {
  style: `You are AUVORA's style oracle — a highly specific, discerning fashion advisor who thinks like a stylist that understands psychology as much as aesthetics. You create outfit concepts based on the user's current energy and occasion. Be specific: name real garments, textures, cuts, colors, layering strategies, and accessories. Never say "a nice top" — say "an ivory silk charmeuse camisole" or "an oversized grey melton wool blazer." Every suggestion should feel achievable yet elevated. You understand that dressing is a decision-making tool, not decoration.`,

  scent: `You are AUVORA's fragrance oracle — a master perfumer who understands scent as presence, memory, and mood architecture. You create precise scent profiles matched to the user's energy and occasion. Name real fragrances (house + name), describe notes with accuracy and poetry, explain the psychology of each choice. You understand how scent affects how others perceive you and how you perceive yourself. Every reading should make the user feel like they've just discovered something made for them.`,

  sound: `You are AUVORA's sonic oracle — a music director and mood architect who understands how sound shapes energy, presence, and inner state. You create curated listening environments based on the user's current aura. Name specific artists, suggest real tracks (format: "Artist — Track Title"), describe the sonic texture and BPM range, and explain why this particular sonic world holds this particular aura. Think like someone programming the soundtrack to a film where the user is the main character.`,
}

// ─── Response schemas ──────────────────────────────────────────────────────────

const SCHEMAS: Record<string, string> = {
  style: `Respond ONLY with a raw JSON object — no markdown, no explanation:
{
  "concept": "2–4 word evocative concept name (e.g. 'Quiet Authority', 'Midnight Scholar')",
  "story": "2–3 sentence editorial description of the overall look and why it fits this energy",
  "pieces": ["specific garment 1", "specific garment 2", "specific garment 3", "specific garment 4", "specific accessory"],
  "palette": ["#hex1", "#hex2", "#hex3"],
  "occasion": "best occasion this works for",
  "tip": "one sharp, specific styling tip that elevates the whole look",
  "avoid": "one thing to avoid that would undercut this aura"
}`,

  scent: `Respond ONLY with a raw JSON object — no markdown, no explanation:
{
  "profile": "2–3 word scent profile name (e.g. 'Dark Amber Wood', 'Green Citrus Musk')",
  "story": "2–3 sentences describing the scent's character and why it fits this aura",
  "topNotes": ["note 1", "note 2", "note 3"],
  "midNotes": ["note 1", "note 2", "note 3"],
  "baseNotes": ["note 1", "note 2"],
  "fragrances": [
    { "house": "brand name", "name": "fragrance name", "why": "one sentence why it fits" },
    { "house": "brand name", "name": "fragrance name", "why": "one sentence why it fits" },
    { "house": "brand name", "name": "fragrance name", "why": "one sentence why it fits" }
  ],
  "ritual": "specific application ritual — where to apply, how much, when",
  "mood": "the mood this scent creates in a room"
}`,

  sound: `Respond ONLY with a raw JSON object — no markdown, no explanation:
{
  "playlistName": "evocative playlist name (e.g. 'Gold Hour Static', 'Velvet Frequency')",
  "atmosphere": "2–3 sentences describing the sonic world and why it holds this aura",
  "tracks": [
    { "artist": "Artist Name", "title": "Track Title", "why": "one sentence on why it fits" },
    { "artist": "Artist Name", "title": "Track Title", "why": "one sentence on why it fits" },
    { "artist": "Artist Name", "title": "Track Title", "why": "one sentence on why it fits" },
    { "artist": "Artist Name", "title": "Track Title", "why": "one sentence on why it fits" },
    { "artist": "Artist Name", "title": "Track Title", "why": "one sentence on why it fits" }
  ],
  "artists": ["artist 1", "artist 2", "artist 3"],
  "bpm": "BPM range (e.g. '72–88 BPM') or descriptor (e.g. 'slow-building')",
  "energy": "one word energy descriptor",
  "genres": ["genre 1", "genre 2"]
}`,
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { domain, vibe, profile } = await req.json()

    if (!domain || !SYSTEMS[domain]) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
    }

    if (!vibe?.trim()) {
      return NextResponse.json({ error: 'Vibe is required' }, { status: 400 })
    }

    // Enrich context with user's calibration profile if available
    const profileContext = profile
      ? `\n\nUser context: preparing for a ${profile.moment} moment, natural aura direction is ${profile.vibe}, currently focused on ${profile.focus}.`
      : ''

    const userMessage = `User's current energy / occasion: "${vibe.trim()}"${profileContext}\n\n${SCHEMAS[domain]}`

    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 800,
      system:     SYSTEMS[domain],
      messages:   [{ role: 'user', content: userMessage }],
    })

    const raw   = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = raw.replace(/```json|```/g, '').trim()

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(clean)
    } catch {
      const match = clean.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse response')
      parsed = JSON.parse(match[0])
    }

    return NextResponse.json({ domain, ...parsed })
  } catch (err: unknown) {
    console.error('[generate-domain]', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
