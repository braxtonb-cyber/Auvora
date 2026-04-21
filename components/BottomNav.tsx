'use client'

import { useEffect, useState } from 'react'

export type AuvoraTab = 'aura' | 'style' | 'scent' | 'sound' | 'profile'

interface BottomNavProps {
  activeTab: AuvoraTab
  onTabChange: (tab: AuvoraTab) => void
}

const TABS = [
  {
    id: 'aura' as AuvoraTab,
    label: 'Aura',
    live: true,
    // Custom SVG icon
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10" cy="10" r="4"
          fill={active ? '#c4a46b' : 'none'}
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
        />
        <circle
          cx="10" cy="10" r="7.5"
          fill="none"
          stroke={active ? 'rgba(196,164,107,0.35)' : 'rgba(255,255,255,0.1)'}
          strokeWidth="0.5"
          strokeDasharray={active ? 'none' : '2 2'}
        />
      </svg>
    ),
  },
  {
    id: 'style' as AuvoraTab,
    label: 'Style',
    live: true,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="4" y="7" width="12" height="9" rx="1.5"
          fill="none"
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
        />
        <path
          d="M7 7V5.5C7 4.12 8.12 3 9.5 3h1C11.88 3 13 4.12 13 5.5V7"
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'scent' as AuvoraTab,
    label: 'Scent',
    live: true,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 16V8M7 11c0-1.66 1.34-3 3-3s3 1.34 3 3"
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M8 6c0-1.1.9-2 2-2s2 .9 2 2"
          stroke={active ? 'rgba(196,164,107,0.5)' : 'rgba(255,255,255,0.15)'}
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <path
          d="M6.5 5.5C6.5 3.57 8.07 2 10 2s3.5 1.57 3.5 3.5"
          stroke={active ? 'rgba(196,164,107,0.25)' : 'rgba(255,255,255,0.08)'}
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <rect x="8" y="15" width="4" height="2" rx="0.5" fill={active ? 'rgba(196,164,107,0.4)' : 'rgba(255,255,255,0.15)'} />
      </svg>
    ),
  },
  {
    id: 'sound' as AuvoraTab,
    label: 'Sound',
    live: true,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 7.5v5M8 5v10M11 7.5v5M14 5v10"
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'profile' as AuvoraTab,
    label: 'Profile',
    live: true,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10" cy="7.5" r="2.5"
          fill="none"
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
        />
        <path
          d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6"
          stroke={active ? '#c4a46b' : 'rgba(255,255,255,0.3)'}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

const T = {
  bg:      '#0a0908',
  border:  'rgba(255,255,255,0.05)',
  gold:    '#c4a46b',
  textSub: '#4a4540',
  fontM:   'var(--font-mono), "DM Mono", monospace',
  fontC:   'var(--font-cormorant), "Cormorant Garamond", serif',
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [mounted, setMounted] = useState(false)
  const [pressedTab, setPressedTab] = useState<AuvoraTab | null>(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  const activeTabIndex = TABS.findIndex(t => t.id === activeTab)
  // With space-around and 5 tabs, centers land at 10%, 30%, 50%, 70%, 90%
  const indicatorLeft = `${activeTabIndex * 20 + 10}%`

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(6,6,6,0.94)',
        borderTop: `0.5px solid ${T.border}`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s',
      }}
    >
      {/* Sliding indicator — rides above the active tab, spring physics */}
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: indicatorLeft,
            transform: 'translateX(-50%)',
            width: 20,
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
            transition: mounted ? 'left 0.45s cubic-bezier(0.16,1,0.3,1)' : 'none',
            opacity: mounted ? 1 : 0,
            boxShadow: `0 0 8px ${T.gold}66`,
          }}
        />

        {/* Tab buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '10px 8px 12px',
          }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const isPressed = pressedTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                onPointerDown={() => setPressedTab(tab.id)}
                onPointerUp={() => setPressedTab(null)}
                onPointerLeave={() => setPressedTab(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'transform 0.12s cubic-bezier(0.16,1,0.3,1), opacity 0.12s ease',
                  transform: isPressed ? 'scale(0.88)' : 'scale(1)',
                  opacity: isPressed ? 0.6 : 1,
                }}
              >
                {/* Icon with spring scale on active */}
                <div
                  style={{
                    transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
                    transform: isActive ? 'scale(1.12)' : 'scale(1)',
                  }}
                >
                  {tab.icon(isActive)}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontFamily: T.fontM,
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: isActive ? T.gold : T.textSub,
                    transition: 'color 0.25s ease',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
