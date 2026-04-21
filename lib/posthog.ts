import posthog from 'posthog-js'

let initialized = false

function init() {
  if (initialized || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host:         process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave:false,
    autocapture:      false,
    persistence:      'localStorage',
  })
  initialized = true
}

export function capture(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  init()
  try { posthog.capture(event, props) } catch { /* ignore */ }
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  init()
  try { posthog.identify(userId, traits) } catch { /* ignore */ }
}
