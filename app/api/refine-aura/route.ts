// app/api/refine-aura/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic()

export async function POST(req: Request) {
  try {
    const { currentAura, userRequest } = await req.json()

    if (!userRequest?.trim()) {
      return NextResponse.json({ error: 'No request provided' }, { status: 400 })
    }

    const auraContext = currentAura
      ? `
Current aura details:
- Vibe: ${currentAura.vibe}
- Outfit direction: ${currentAura.outfit}
- Fragrance: ${currentAura.fragrance}
- Playlist: ${currentAura.playlist}
- Caption: ${currentAura.caption}
`
      : 'No current aura loaded.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 320,
      system: `You are AUVORA's personal aura copilot — a sophisticated, stylish AI advisor who helps users refine and evolve their aura. You are elegant, precise, and genuinely insightful. You have taste.

${auraContext}

Your role: respond to the user's refinement request with a brief, evocative suggestion (2–4 sentences). Be specific. Reference actual details from the current aura when pivoting. Write in an editorial luxury tone — like a very good personal stylist who also understands mood and music.

Always end your response with a single line:
→ Try: [a refined vibe phrase the user can generate from — 6–15 words, evocative and specific]

Do not use bullet points. Do not explain what you're doing. Just advise.`,
      messages: [{ role: 'user', content: userRequest.trim() }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ text })
  } catch (err: unknown) {
    console.error('[refine-aura]', err)
    const message = err instanceof Error ? err.message : 'Refinement failed'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
