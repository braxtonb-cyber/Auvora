'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'entering' | 'exiting'>('entering')

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase('exiting'), 3200)
    const doneTimer = setTimeout(() => onComplete(), 3800)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <>
      <div className={`auvora-splash ${phase === 'exiting' ? 'is-exiting' : ''}`}>
        <div className="auvora-splash__ambient auvora-splash__ambient--one" />
        <div className="auvora-splash__ambient auvora-splash__ambient--two" />
        <div className="auvora-splash__grain" />

        <div className="auvora-splash__camera">
          <div className="auvora-splash__sheen" />

          <svg
            className="auvora-splash__mark"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="goldStroke" x1="128" y1="96" x2="392" y2="416" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F5E5BB" />
                <stop offset="0.34" stopColor="#E6C98A" />
                <stop offset="0.68" stopColor="#C39A58" />
                <stop offset="1" stopColor="#8D6738" />
              </linearGradient>
              <linearGradient id="goldRibbon" x1="112" y1="260" x2="400" y2="260" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F7E9C3" />
                <stop offset="0.35" stopColor="#E7C982" />
                <stop offset="0.7" stopColor="#C8954B" />
                <stop offset="1" stopColor="#8C6435" />
              </linearGradient>
              <radialGradient id="orbGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(256 252) rotate(90) scale(52)">
                <stop offset="0" stopColor="#FFC98A" stopOpacity="0.95" />
                <stop offset="0.42" stopColor="#E09A48" stopOpacity="0.62" />
                <stop offset="1" stopColor="#8C4D1B" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="panelGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(256 248) rotate(90) scale(190)">
                <stop offset="0" stopColor="#4A236C" stopOpacity="0.28" />
                <stop offset="1" stopColor="#070509" stopOpacity="0" />
              </radialGradient>
              <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="16" />
              </filter>
              <filter id="orbBlur" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="24" />
              </filter>
            </defs>

            <rect x="20" y="20" width="472" height="472" rx="118" fill="#070509" />
            <rect x="20" y="20" width="472" height="472" rx="118" fill="url(#panelGlow)" />

            <ellipse className="auvora-splash__panel-glow" cx="256" cy="248" rx="118" ry="82" fill="#5A2D7A" fillOpacity="0.12" filter="url(#softBlur)" />
            <ellipse className="auvora-splash__orb-glow" cx="256" cy="252" rx="42" ry="42" fill="url(#orbGlow)" filter="url(#orbBlur)" />

            <g transform="translate(0 2)">
              <path className="auvora-splash__a-line auvora-splash__left-leg" d="M164 398L244 108" stroke="url(#goldStroke)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
              <path className="auvora-splash__a-line auvora-splash__right-leg" d="M348 398L268 108" stroke="url(#goldStroke)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
              <path className="auvora-splash__a-line auvora-splash__apex-bar" d="M228 108H284" stroke="url(#goldStroke)" strokeWidth="24" strokeLinecap="round" pathLength="1" />

              <path className="auvora-splash__infinity-shadow" d="M112 258C148 210 210 210 245 258C281 306 343 306 400 258C343 210 281 210 245 258C210 306 148 306 112 258Z" stroke="#24172B" strokeWidth="46" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
              <path className="auvora-splash__infinity-ribbon" d="M112 258C148 210 210 210 245 258C281 306 343 306 400 258C343 210 281 210 245 258C210 306 148 306 112 258Z" stroke="url(#goldRibbon)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />

              <circle className="auvora-splash__orb-core" cx="256" cy="252" r="11" fill="#F0C88A" />
              <circle className="auvora-splash__orb-hot" cx="256" cy="252" r="5" fill="#FFF3D8" />
            </g>
          </svg>
        </div>

        <div className="auvora-splash__copy-wrap">
          <h1 className="auvora-splash__wordmark">AUVORA</h1>
          <p className="auvora-splash__tagline">aura operating system</p>
        </div>
      </div>

      <style jsx>{`
        .auvora-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          background: radial-gradient(circle at 50% 42%, rgba(50, 20, 76, 0.22), transparent 36%), #040306;
          overflow: hidden;
          pointer-events: none;
          user-select: none;
          opacity: 1;
          transition: opacity 0.72s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .auvora-splash.is-exiting {
          opacity: 0;
        }

        .auvora-splash__ambient {
          position: absolute;
          border-radius: 999px;
          filter: blur(56px);
          opacity: 0.38;
          mix-blend-mode: screen;
          animation: auvoraAmbientFloat 5.6s ease-in-out infinite;
        }

        .auvora-splash__ambient--one {
          width: 42vw;
          height: 42vw;
          max-width: 300px;
          max-height: 300px;
          background: rgba(109, 59, 164, 0.18);
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
        }

        .auvora-splash__ambient--two {
          width: 34vw;
          height: 34vw;
          max-width: 240px;
          max-height: 240px;
          background: rgba(255, 194, 126, 0.08);
          bottom: 17%;
          left: 50%;
          transform: translateX(-50%);
          animation-duration: 4.8s;
          animation-direction: alternate;
        }

        .auvora-splash__grain {
          position: absolute;
          inset: -20%;
          opacity: 0.06;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45) 0.5px, transparent 0.75px),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.32) 0.5px, transparent 0.75px),
            radial-gradient(circle at 35% 72%, rgba(255,255,255,0.25) 0.5px, transparent 0.75px);
          background-size: 18px 18px, 24px 24px, 22px 22px;
          animation: auvoraGrain 9s linear infinite;
        }

        .auvora-splash__camera {
          position: relative;
          width: min(72vw, 360px);
          aspect-ratio: 1;
          display: grid;
          place-items: center;
          animation: auvoraCameraPullBack 2.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center center;
          will-change: transform, opacity;
        }

        .auvora-splash__mark {
          width: 100%;
          height: auto;
          overflow: visible;
          filter: drop-shadow(0 26px 72px rgba(0, 0, 0, 0.46));
        }

        .auvora-splash__sheen {
          position: absolute;
          inset: 8%;
          background: linear-gradient(104deg, transparent 30%, rgba(255, 244, 220, 0.32) 48%, transparent 62%);
          mix-blend-mode: screen;
          filter: blur(8px);
          opacity: 0;
          transform: translateX(-120%) rotate(-10deg);
          animation: auvoraSheenSweep 1s ease-out 1.66s forwards;
          border-radius: 32px;
        }

        .auvora-splash__copy-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          animation: auvoraCopyLift 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.92s both;
          opacity: 0;
        }

        .auvora-splash__wordmark {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 8vw, 3.5rem);
          font-weight: 300;
          letter-spacing: 0.24em;
          line-height: 1;
          color: #d9bc86;
          text-transform: uppercase;
          text-shadow: 0 0 26px rgba(201, 149, 75, 0.12);
        }

        .auvora-splash__tagline {
          font-family: var(--font-mono), 'DM Mono', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(217, 188, 134, 0.56);
        }

        .auvora-splash__panel-glow {
          animation: auvoraPanelGlow 2.7s ease-out forwards;
          transform-origin: center center;
        }

        .auvora-splash__orb-glow {
          animation: auvoraOrbPulse 1.45s ease-out 0.32s forwards;
          transform-origin: center center;
        }

        .auvora-splash__orb-core,
        .auvora-splash__orb-hot {
          opacity: 0;
          transform-origin: center center;
          animation: auvoraOrbCoreIn 0.48s cubic-bezier(0.16, 1, 0.3, 1) 0.86s forwards;
        }

        .auvora-splash__orb-hot {
          animation-delay: 0.95s;
        }

        .auvora-splash__infinity-shadow,
        .auvora-splash__infinity-ribbon,
        .auvora-splash__a-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }

        .auvora-splash__infinity-shadow {
          opacity: 0.92;
          animation: auvoraRibbonDraw 1.18s cubic-bezier(0.7, 0, 0.2, 1) 0.18s forwards;
        }

        .auvora-splash__infinity-ribbon {
          filter: drop-shadow(0 0 18px rgba(226, 175, 102, 0.2));
          animation:
            auvoraRibbonDraw 1.08s cubic-bezier(0.7, 0, 0.2, 1) 0.28s forwards,
            auvoraRibbonGlow 1.25s ease-out 0.28s forwards;
        }

        .auvora-splash__left-leg {
          animation: auvoraLineDraw 0.82s cubic-bezier(0.16, 1, 0.3, 1) 1.02s forwards;
        }

        .auvora-splash__right-leg {
          animation: auvoraLineDraw 0.82s cubic-bezier(0.16, 1, 0.3, 1) 1.14s forwards;
        }

        .auvora-splash__apex-bar {
          animation: auvoraLineDraw 0.42s cubic-bezier(0.16, 1, 0.3, 1) 1.5s forwards;
        }

        @keyframes auvoraCameraPullBack {
          0% {
            transform: translate3d(0, 44px, 0) scale(1.95);
          }
          28% {
            transform: translate3d(-4px, 26px, 0) scale(1.82);
          }
          56% {
            transform: translate3d(0, 10px, 0) scale(1.34);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes auvoraRibbonDraw {
          0% {
            stroke-dashoffset: 1;
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes auvoraRibbonGlow {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes auvoraLineDraw {
          0% {
            stroke-dashoffset: 1;
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes auvoraOrbPulse {
          0% {
            opacity: 0;
            transform: scale(0.55);
          }
          40% {
            opacity: 0.88;
            transform: scale(1.12);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes auvoraOrbCoreIn {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes auvoraSheenSweep {
          0% {
            opacity: 0;
            transform: translateX(-120%) rotate(-10deg);
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(120%) rotate(-10deg);
          }
        }

        @keyframes auvoraCopyLift {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes auvoraAmbientFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0px) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-10px) scale(1.05);
          }
        }

        @keyframes auvoraGrain {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(2%, 1.5%, 0);
          }
        }

        @keyframes auvoraPanelGlow {
          0% {
            opacity: 0.2;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
