import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import {
  fallbackParseWardrobeInput,
  toWardrobeItems,
  validateParsedWardrobePayload,
} from '@/lib/scent/import-parser'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are AUVORA's wardrobe parser for scent products.

Task:
- Parse raw user text containing owned fragrance products.
- Output only a JSON array.
- Each item should have: name, brand, family, notes, seasons, occasions, sweetness, freshness, projection, longevity, layeringRole, productType.

Rules:
- family must be one of: gourmand, amber, woody, fresh, citrus, aquatic, floral, musky, spicy, oriental
- seasons values from: spring, summer, fall, winter
- occasions values from: everyday, office, date night, casual, gym, travel, formal, special occasion
- sweetness/freshness/projection/longevity are 1-10 numbers
- layeringRole one of: anchor, booster, projection, softener
- productType one of: fragrance, body_mist, body_spray, body_oil, body_cream, fragrance_oil, roll_on_oil
- If uncertain, still return your best structured guess
- Never return markdown
- Never include commentary
`

function extractJsonArray(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Could not parse wardrobe JSON output')
    return JSON.parse(match[0])
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { input?: unknown }

    if (typeof body.input !== 'string' || body.input.trim().length < 2) {
      return NextResponse.json({ error: 'Wardrobe input is required.' }, { status: 400 })
    }

    let parsedItems = fallbackParseWardrobeInput(body.input)

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Parse this owned fragrance input:\n\n${body.input.trim().slice(0, 4000)}`,
          },
        ],
      })

      const firstText = response.content.find((block) => block.type === 'text')
      const raw = firstText && firstText.type === 'text' ? firstText.text : ''

      if (raw) {
        const parsed = extractJsonArray(raw)
        parsedItems = validateParsedWardrobePayload(parsed)
      }
    } catch (aiError) {
      console.warn('[scent-import-wardrobe] AI parse failed; using fallback parser', aiError)
    }

    const wardrobeItems = toWardrobeItems(parsedItems)

    return NextResponse.json({
      parsed: parsedItems,
      wardrobeItems,
    })
  } catch (error: unknown) {
    console.error('[scent-import-wardrobe]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse wardrobe input' },
      { status: 500 }
    )
  }
}
