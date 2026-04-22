'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps { onComplete: () => void }

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [exit, setExit] = useState(false)

  useEffect(() => {
    const a = setTimeout(() => setExit(true), 3000)
    const b = setTimeout(() => onComplete(), 3550)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [onComplete])

  return (
    <>
      <div className={`splash ${exit ? 'out' : ''}`}>
        <div className="bg" />
        <div className="camera">
          <img className="icon base" src="/icon.png?v=2" alt="" draggable={false} />
          <img className="icon ribbon" src="/icon.png?v=2" alt="" draggable={false} />
          <img className="icon areveal" src="/icon.png?v=2" alt="" draggable={false} />
          <img className="icon orbcopy" src="/icon.png?v=2" alt="" draggable={false} />
          <div className="bloom" />
          <div className="sheen" />
        </div>
        <div className="copy">
          <h1>AUVORA</h1>
          <p>aura operating system</p>
        </div>
      </div>

      <style jsx>{`
        .splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#030208;overflow:hidden;pointer-events:none;user-select:none;transition:opacity .6s cubic-bezier(.22,1,.36,1)}
        .splash.out{opacity:0}
        .bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(92,39,140,.22),transparent 28%),radial-gradient(circle at 50% 55%,rgba(255,190,98,.06),transparent 18%),#030208}
        .camera{position:relative;width:min(84vw,420px);aspect-ratio:1;transform-origin:48.6% 44.4%;animation:pull 2.7s cubic-bezier(.16,1,.3,1) forwards}
        .icon{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:drop-shadow(0 28px 72px rgba(0,0,0,.42));pointer-events:none;-webkit-user-drag:none}
        .base{opacity:0;animation:baseIn 1s ease-out 1.2s forwards}
        .ribbon{clip-path:circle(0% at 48.6% 44.4%);animation:ribbon 1.1s cubic-bezier(.7,0,.2,1) .12s forwards}
        .areveal{opacity:0;clip-path:inset(0 0 100% 0);animation:areveal .86s cubic-bezier(.16,1,.3,1) .96s forwards}
        .orbcopy{opacity:0;mix-blend-mode:screen;clip-path:circle(8% at 48.6% 44.4%);animation:orb .92s cubic-bezier(.16,1,.3,1) .52s forwards}
        .bloom{position:absolute;left:48.6%;top:44.4%;width:18%;height:18%;transform:translate(-50%,-50%) scale(.45);border-radius:999px;background:radial-gradient(circle,rgba(255,220,150,.95) 0%,rgba(232,162,76,.5) 36%,rgba(122,63,20,0) 78%);filter:blur(14px);opacity:0;mix-blend-mode:screen;animation:bloom 1.02s cubic-bezier(.16,1,.3,1) .52s forwards}
        .sheen{position:absolute;inset:0;background:linear-gradient(104deg,transparent 32%,rgba(255,244,220,.38) 48%,transparent 63%);mix-blend-mode:screen;filter:blur(10px);opacity:0;transform:translateX(-120%) rotate(-10deg);animation:sheen 1s ease-out .8s forwards;border-radius:28%}
        .copy{position:absolute;left:50%;bottom:clamp(52px,9vh,88px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;animation:copyIn .75s cubic-bezier(.16,1,.3,1) 2s forwards}
        h1{margin:0;font-family:var(--font-cormorant),'Cormorant Garamond',serif;font-size:clamp(2.3rem,8vw,3.4rem);font-weight:300;letter-spacing:.24em;line-height:1;text-transform:uppercase;color:#d9bc86;text-shadow:0 0 28px rgba(201,149,75,.12)}
        p{margin:0;font-family:var(--font-mono),'DM Mono',monospace;font-size:.56rem;letter-spacing:.34em;text-transform:uppercase;color:rgba(217,188,134,.56)}
        @keyframes pull{0%{transform:scale(4.2)}24%{transform:scale(3.2)}52%{transform:scale(2.05)}76%{transform:scale(1.22)}100%{transform:scale(1)}}
        @keyframes ribbon{from{clip-path:circle(0% at 48.6% 44.4%)}to{clip-path:circle(42% at 48.6% 44.4%)}}
        @keyframes areveal{0%{opacity:0;clip-path:inset(0 0 100% 0)}12%{opacity:1}100%{opacity:1;clip-path:inset(0 0 0 0)}}
        @keyframes orb{0%{opacity:0;transform:scale(1)}46%{opacity:.92;transform:scale(1.022)}100%{opacity:.36;transform:scale(1)}}
        @keyframes bloom{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}42%{opacity:.95;transform:translate(-50%,-50%) scale(1.18)}100%{opacity:.28;transform:translate(-50%,-50%) scale(1)}}
        @keyframes baseIn{from{opacity:0}to{opacity:1}}
        @keyframes sheen{0%{opacity:0;transform:translateX(-120%) rotate(-10deg)}18%{opacity:1}100%{opacity:0;transform:translateX(120%) rotate(-10deg)}}
        @keyframes copyIn{from{opacity:0;transform:translateX(-50%) translateY(18px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>
    </>
  )
}
