import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { parseScentProfile } from '@/lib/scent/profile-builders'
import {
  buildSituationPrompt,
  emptyWardrobeSituationFallback,
  validateSituationResponse,
} from '@/lib/scent/situation-prompt'

const anthropic = new Anthropic()

function extractTextContent(content: Anthropic.Messages.ContentBlock[]): string {
  const firstText = content.find((block) => block.type === 'text')
  return firstText && firstText.type === 'text' ? firstText.text : ''
}

function extractJsonObject(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Could not locate JSON in situation response')
    return JSON.parse(match[0])
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      situation?: unknown
      scentProfile?: unknown
    }

    if (typeof body.situation !== 'string' || body.situation.trim().length < 3) {
      return NextResponse.json(
        { error: 'Situation text is required.' },
        { status: 400 }
      )
    }

    const profile = parseScentProfile(body.scentProfile)

    if (profile.wardrobe.filter((item) => item.owned).length === 0) {
      const recommendation = emptyWardrobeSituationFallback(body.situation, profile)
      return NextResponse.json({ recommendation })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 420,
      system:
        'You are AUVORA\'s scent advisory system. Output concise, structured editorial JSON only. Do not include markdown.',
      messages: [
        {
          role: 'user',
          content: buildSituationPrompt(body.situation, profile),
        },
      ],
    })

    const rawText = extractTextContent(message.content)
    if (!rawText) throw new Error('Empty model response')

    const parsed = extractJsonObject(rawText)
    const recommendation = validateSituationResponse(parsed, profile)

    return NextResponse.json({ recommendation })
  } catch (err: unknown) {
    console.error('[scent-situation]', err)

    const errorMessage = err instanceof Error ? err.message : 'Scent situation request failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
