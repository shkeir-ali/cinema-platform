'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const NS = 'http://www.w3.org/2000/svg'

function mkNS(tag: string, attrs: Record<string, string>) {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcSeg(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  a1: number,
  a2: number,
) {
  const s1 = polar(cx, cy, r1, a1),
    e1 = polar(cx, cy, r1, a2)
  const s2 = polar(cx, cy, r2, a1),
    e2 = polar(cx, cy, r2, a2)
  const lg = a2 - a1 > 180 ? 1 : 0
  return `M ${s1.x} ${s1.y} A ${r1} ${r1} 0 ${lg} 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${r2} ${r2} 0 ${lg} 0 ${s2.x} ${s2.y} Z`
}

function buildMiniReel(
  containerEl: Element,
  cx: number,
  cy: number,
  outerR: number,
) {
  const r1 = outerR * 0.4
  const r2 = outerR * 0.84
  for (let i = 0; i < 3; i++) {
    const base = i * 120
    containerEl.appendChild(
      mkNS('path', {
        d: arcSeg(cx, cy, r1, r2, base + 12.5, base + 107.5),
        fill: '#080604',
        stroke: 'rgba(255,255,255,0.03)',
        'stroke-width': '0.5',
      }),
    )
  }
  for (let i = 0; i < 36; i++) {
    const ang = (i / 36) * 360 - 90
    const rad = (ang * Math.PI) / 180
    const pr = outerR - 2
    const px = cx + pr * Math.cos(rad)
    const py = cy + pr * Math.sin(rad)
    containerEl.appendChild(
      mkNS('rect', {
        x: String(px - 1),
        y: String(py - 2.5),
        width: '2',
        height: '5',
        rx: '0.5',
        fill: 'rgba(255,255,255,0.06)',
        transform: `rotate(${ang + 90}, ${px}, ${py})`,
      }),
    )
  }
}

export default function Hero() {
  useEffect(() => {
    // Build reel windows
    const reel1 = document.getElementById('camReel1Windows')
    const reel2 = document.getElementById('camReel2Windows')
    if (reel1) buildMiniReel(reel1, 95, 78, 29)
    if (reel2) buildMiniReel(reel2, 162, 78, 29)

    // Camera light cone
    const camera = document.getElementById('filmCamera')
    const hero = document.querySelector('.hero') as HTMLElement | null
    const conePoly = document.getElementById('lightConePolygon')
    const coneSvg = document.getElementById('lightConeSvg')
    if (!camera || !hero || !conePoly || !coneSvg) return

    let lightOn = false
    let sequenceDone = false

    function updateCone() {
      const svgRect = (coneSvg as Element).getBoundingClientRect()
      const lensEl = document.getElementById('lensCenter')
      const lensRect = lensEl
        ? lensEl.getBoundingClientRect()
        : (camera as Element).getBoundingClientRect()
      const camSvg = document.getElementById('filmCamera') as SVGSVGElement | null
      const camRect = camSvg ? camSvg.getBoundingClientRect() : lensRect
      const scaleY = camRect.height / 310
      const scaleX = camRect.width  / 215
      const lx         = camRect.left - svgRect.left + 60 * scaleX
      const lensTop    = camRect.top  - svgRect.top  + 132 * scaleY
      const lensBottom = camRect.top  - svgRect.top  + 166 * scaleY
      const ly         = (lensTop + lensBottom) / 2
      const hH = svgRect.height
      const hW = svgRect.width

      const grad = document.getElementById('coneGrad')
      if (grad) {
        grad.setAttribute('x1', String(lx))
        grad.setAttribute('y1', String(ly))
        grad.setAttribute('x2', '0')
        grad.setAttribute('y2', String(ly))
        grad.setAttribute('gradientUnits', 'userSpaceOnUse')
      }
      const maskRect = document.getElementById('coneMaskRect')
      if (maskRect) {
        maskRect.setAttribute('height', String(hH))
        maskRect.setAttribute('width', String(hW))
      }
      ;(conePoly as Element).setAttribute(
        'points',
        `${lx},${lensTop} ${lx},${lensBottom} 0,${-hH * 0.15} 0,${hH * 1.15}`,
      )
    }

    updateCone()

    const cinemaEl = document.querySelector('.hero-name em') as HTMLElement | null

    // Reserve height then clear "Writing about" for typewriter
    const preEl = document.querySelector('.hero-name-pre') as HTMLElement | null
    if (preEl) {
      preEl.style.minHeight = preEl.offsetHeight + 'px'
      preEl.textContent = ''
    }

    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    function setLight(on: boolean) {
      hero!.classList.toggle('light-on', on)
      conePoly!.classList.remove('cone-on', 'cone-off')
      ;(conePoly as HTMLElement).style.opacity = on ? '1' : '0'
    }

    async function runStartup() {
      await wait(800)

      // Phase 1: type "Writing about"
      if (preEl) {
        const preText = document.createTextNode('')
        const preCursor = document.createElement('span')
        preCursor.className = 'hero-cursor'
        preEl.appendChild(preText)
        preEl.appendChild(preCursor)

        const preWord = 'Writing about'
        for (let i = 0; i < preWord.length; i++) {
          await wait(175)
          preText.data += preWord[i]
        }

        await wait(400)
        preCursor.style.animation = 'none'
        preCursor.style.transition = 'opacity 0.3s ease'
        preCursor.style.opacity = '0'
        await wait(320)
        preCursor.remove()
      }

      // Phase 2: pause, then light flicker blink sequence
      await wait(1000)
      const blinks = [90, 130, 70, 200, 110, 90, 160, 70, 90, 300]
      for (let i = 0; i < blinks.length; i++) {
        setLight(i % 2 === 0)
        await wait(blinks[i])
      }

      // Settle on — light reveals "cinema."
      lightOn = true
      sequenceDone = true
      hero!.classList.add('light-on')
      ;(conePoly as HTMLElement).style.opacity = ''
      conePoly!.classList.remove('cone-on', 'cone-off')
      void (conePoly as HTMLElement).offsetWidth
      conePoly!.classList.add('cone-on')
    }

    runStartup()

    async function handleCameraClick() {
      if (!sequenceDone) return

      if (lightOn) {
        // Turn off immediately
        lightOn = false
        hero!.classList.remove('light-on')
        conePoly!.classList.remove('cone-on', 'cone-off')
        void (conePoly as HTMLElement).offsetWidth
        conePoly!.classList.add('cone-off')
      } else {
        // Blink sequence then turn on
        sequenceDone = false
        updateCone()
        const blinks = [90, 130, 70, 200, 110, 90, 160, 70, 90, 300]
        for (let i = 0; i < blinks.length; i++) {
          setLight(i % 2 === 0)
          await wait(blinks[i])
        }
        lightOn = true
        sequenceDone = true
        hero!.classList.add('light-on')
        ;(conePoly as HTMLElement).style.opacity = ''
        conePoly!.classList.remove('cone-on', 'cone-off')
        void (conePoly as HTMLElement).offsetWidth
        conePoly!.classList.add('cone-on')
      }
    }

    camera.addEventListener('click', handleCameraClick)
    window.addEventListener('resize', () => {
      if (lightOn) updateCone()
    })

    const mq = window.matchMedia('(min-width: 1025px)')
    function handleMq(e: MediaQueryListEvent | MediaQueryList) {
      if (!e.matches) {
        lightOn = false
        hero!.classList.remove('light-on')
        conePoly!.classList.remove('cone-on', 'cone-off')
      } else if (!lightOn && sequenceDone) {
        lightOn = true
        hero!.classList.add('light-on')
        updateCone()
        conePoly!.classList.remove('cone-on', 'cone-off')
        void (conePoly as HTMLElement).offsetWidth
        conePoly!.classList.add('cone-on')
      }
    }

    mq.addEventListener('change', handleMq as (e: MediaQueryListEvent) => void)
    handleMq(mq)

    return () => {
      camera.removeEventListener('click', handleCameraClick)
      mq.removeEventListener(
        'change',
        handleMq as (e: MediaQueryListEvent) => void,
      )
    }
  }, [])

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-frame">No. 001</span>
          Film Criticism &amp; Essays
        </div>
        <h1 className="hero-name">
          <span className="hero-name-pre">Writing about</span>
          <em>cinema.</em>
        </h1>
        <p className="hero-tagline">
          Honest reviews, personal essays, and curated lists — from a film
          obsessive who believes every frame tells a story.
        </p>
        <div className="hero-actions">
          <Link href="/reviews" className="hero-btn-primary">
            Browse Reviews
          </Link>
          <Link href="/essays" className="hero-btn-secondary">
            Read Essays →
          </Link>
        </div>
      </div>

      {/* Light cone overlay */}
      <div className="hero-light-overlay" aria-hidden="true">
        <svg id="lightConeSvg" preserveAspectRatio="none">
          <defs>
            <linearGradient
              id="coneGrad"
              x1="100%"
              y1="50%"
              x2="0%"
              y2="50%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f5ede0" stopOpacity="0.42" />
              <stop offset="12%" stopColor="#e8d8b8" stopOpacity="0.48" />
              <stop offset="45%" stopColor="#c8b88a" stopOpacity="0.32" />
              <stop offset="80%" stopColor="#a09070" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#887860" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="coneVFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="black" />
              <stop offset="18%" stopColor="white" />
              <stop offset="82%" stopColor="white" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <mask id="coneSoftMask" maskUnits="userSpaceOnUse">
              <rect
                id="coneMaskRect"
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#coneVFade)"
              />
            </mask>
          </defs>
          <polygon
            id="lightConePolygon"
            points="0,0"
            fill="url(#coneGrad)"
            opacity="0"
            mask="url(#coneSoftMask)"
          />
        </svg>
      </div>

      {/* Film camera */}
      <div className="hero-camera">
        <svg
          id="filmCamera"
          viewBox="0 0 215 310"
          width="215"
          height="310"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <defs>
            <radialGradient
              id="camBodyGrad"
              cx="38%"
              cy="30%"
              r="70%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#38322c" />
              <stop offset="100%" stopColor="#0e0c0a" />
            </radialGradient>
            <radialGradient
              id="camMagGrad"
              cx="35%"
              cy="28%"
              r="65%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#2a2420" />
              <stop offset="100%" stopColor="#0a0806" />
            </radialGradient>
            <radialGradient
              id="lensGlassGrad"
              cx="35%"
              cy="30%"
              r="60%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#1a2a3a" />
              <stop offset="55%" stopColor="#080c10" />
              <stop offset="100%" stopColor="#030506" />
            </radialGradient>
            <linearGradient id="lensGlowGrad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#fff4a0" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#c8922a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c8922a" stopOpacity="0" />
            </linearGradient>
            <radialGradient
              id="sReelGrad"
              cx="38%"
              cy="32%"
              r="65%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#2e2a26" />
              <stop offset="100%" stopColor="#0e0c0a" />
            </radialGradient>
            <linearGradient id="barrelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2520" />
              <stop offset="40%" stopColor="#1c1814" />
              <stop offset="100%" stopColor="#0e0c0a" />
            </linearGradient>
            <linearGradient id="tripodGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a3c28" />
              <stop offset="50%" stopColor="#5a4a30" />
              <stop offset="100%" stopColor="#3a2e1c" />
            </linearGradient>
            <filter id="camShadow" x="-5%" y="-5%" width="115%" height="115%">
              <feDropShadow
                dx="2"
                dy="6"
                stdDeviation="6"
                floodColor="rgba(0,0,0,0.5)"
              />
            </filter>
            <radialGradient
              id="floorShadowGrad"
              cx="55%"
              cy="50%"
              r="50%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#1a1510" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#1a1510" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1a1510" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Floor shadow */}
          <ellipse
            cx="128"
            cy="344"
            rx="98"
            ry="10"
            fill="url(#floorShadowGrad)"
          />

          {/* Tripod */}
          <line
            x1="130"
            y1="210"
            x2="130"
            y2="340"
            stroke="#2a2216"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <line
            x1="124"
            y1="210"
            x2="28"
            y2="338"
            stroke="url(#tripodGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="136"
            y1="210"
            x2="208"
            y2="338"
            stroke="url(#tripodGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            stroke="#3a3020"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            d="M 59 297 L 130 305 L 185 297"
          />
          <line
            x1="130"
            y1="305"
            x2="130"
            y2="312"
            stroke="#3a3020"
            strokeWidth="2.5"
          />
          <ellipse
            cx="28"
            cy="339"
            rx="8"
            ry="3.5"
            fill="#2e2416"
            opacity="0.9"
          />
          <ellipse
            cx="208"
            cy="339"
            rx="8"
            ry="3.5"
            fill="#2e2416"
            opacity="0.9"
          />
          <ellipse
            cx="130"
            cy="341"
            rx="8"
            ry="3.5"
            fill="#2e2416"
            opacity="0.9"
          />
          <circle
            cx="83"
            cy="262"
            r="3.5"
            fill="none"
            stroke="#4a3c28"
            strokeWidth="1.5"
          />
          <circle
            cx="168"
            cy="262"
            r="3.5"
            fill="none"
            stroke="#4a3c28"
            strokeWidth="1.5"
          />

          {/* Camera body + tripod head */}
          <g transform="translate(8,0)">
            {/* Tripod head */}
            <rect x="94" y="200" width="54" height="14" rx="3" fill="#1e1a14" />
            <rect
              x="100"
              y="194"
              width="42"
              height="10"
              rx="2"
              fill="#252018"
            />
            <rect
              x="100"
              y="194"
              width="42"
              height="3"
              rx="1"
              fill="rgba(255,255,255,0.05)"
            />
            <line
              x1="148"
              y1="204"
              x2="172"
              y2="218"
              stroke="#1c1814"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="173" cy="219" r="4" fill="#151210" />

            {/* Camera body */}
            <rect
              x="62"
              y="104"
              width="122"
              height="90"
              rx="6"
              fill="url(#camBodyGrad)"
            />
            <rect
              x="62"
              y="104"
              width="122"
              height="5"
              rx="3"
              fill="rgba(255,255,255,0.07)"
            />
            <rect x="62" y="104" width="8" height="90" rx="3" fill="#1a1612" />
            <rect
              x="62"
              y="188"
              width="122"
              height="6"
              rx="3"
              fill="rgba(0,0,0,0.35)"
            />
            <rect
              x="74"
              y="116"
              width="60"
              height="66"
              rx="3"
              fill="rgba(0,0,0,0.18)"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <circle
              cx="82"
              cy="124"
              r="5"
              fill="#1a1612"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <circle cx="82" cy="124" r="2.5" fill="#242018" />
            <circle
              cx="96"
              cy="124"
              r="4"
              fill="#1a1612"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <rect
              x="108"
              y="118"
              width="22"
              height="12"
              rx="2"
              fill="#0a0e08"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <rect x="110" y="120" width="18" height="8" rx="1" fill="#0e1a0a" />
            <rect
              x="76"
              y="168"
              width="55"
              height="6"
              rx="3"
              fill="#181412"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <circle cx="85" cy="171" r="2" fill="#242018" />
            <circle cx="96" cy="171" r="2" fill="#242018" />
            <circle cx="107" cy="171" r="2" fill="#242018" />

            {/* Film magazine */}
            <rect
              x="152"
              y="96"
              width="38"
              height="104"
              rx="5"
              fill="url(#camMagGrad)"
            />
            <rect
              x="152"
              y="96"
              width="38"
              height="5"
              rx="2.5"
              fill="rgba(255,255,255,0.06)"
            />
            <rect
              x="152"
              y="194"
              width="38"
              height="6"
              rx="3"
              fill="rgba(0,0,0,0.3)"
            />
            <rect
              x="149"
              y="130"
              width="6"
              height="18"
              rx="2"
              fill="#141210"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <rect
              x="158"
              y="108"
              width="22"
              height="72"
              rx="3"
              fill="rgba(0,0,0,0.15)"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />

            {/* Reel mount bar */}
            <rect x="72" y="96" width="88" height="12" rx="4" fill="#1c1814" />
            <rect
              x="72"
              y="96"
              width="88"
              height="4"
              rx="2"
              fill="rgba(255,255,255,0.06)"
            />

            {/* Film reels */}
            <g className="cam-reel-group" id="camReel1Group">
              <circle
                cx="95"
                cy="78"
                r="30"
                fill="url(#sReelGrad)"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1.5"
              />
              <circle
                cx="95"
                cy="78"
                r="29"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
              <g id="camReel1Windows" />
              <circle
                cx="95"
                cy="78"
                r="11"
                fill="#141210"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="1.5"
              />
              <circle
                cx="95"
                cy="78"
                r="7"
                fill="#0e0c0a"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              <circle cx="95" cy="78" r="3.5" fill="#1c1814" />
            </g>
            <g className="cam-reel-group" id="camReel2Group">
              <circle
                cx="162"
                cy="78"
                r="30"
                fill="url(#sReelGrad)"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1.5"
              />
              <circle
                cx="162"
                cy="78"
                r="29"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
              <g id="camReel2Windows" />
              <circle
                cx="162"
                cy="78"
                r="11"
                fill="#141210"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="1.5"
              />
              <circle
                cx="162"
                cy="78"
                r="7"
                fill="#0e0c0a"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              <circle cx="162" cy="78" r="3.5" fill="#1c1814" />
            </g>

            {/* REC dot */}
            <circle cx="96" cy="124" r="2.2" className="cam-rec-dot" fill="#d03020" />

            {/* Viewfinder */}
            <rect
              x="142"
              y="90"
              width="18"
              height="14"
              rx="3"
              fill="#1a1612"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <rect x="144" y="92" width="14" height="10" rx="2" fill="#0a0e14" />
            <rect
              x="144"
              y="92"
              width="14"
              height="3"
              rx="1"
              fill="rgba(255,255,255,0.06)"
            />

            {/* Lens assembly */}
            <rect
              x="55"
              y="141"
              width="9"
              height="16"
              rx="2"
              fill="#2a2420"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1"
            />
            <polygon
              points="2,132 55,140 55,158 2,166"
              fill="url(#barrelGrad)"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <line
              x1="2"
              y1="132"
              x2="55"
              y2="140"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1.5"
            />
            <line
              x1="2"
              y1="166"
              x2="55"
              y2="158"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="1.5"
            />
            <polygon
              points="2,132 55,140 55,149 2,149"
              fill="rgba(255,255,255,0.025)"
            />

            {/* Focus ring */}
            <polygon
              points="31,135 42,138 42,160 31,163"
              fill="#222018"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1.2"
            />
            <line
              x1="33"
              y1="137"
              x2="40"
              y2="139"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="33"
              y1="141"
              x2="40"
              y2="142"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="33"
              y1="145"
              x2="40"
              y2="146"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="33"
              y1="149"
              x2="40"
              y2="149"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="33"
              y1="153"
              x2="40"
              y2="154"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="33"
              y1="157"
              x2="40"
              y2="158"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="33"
              y1="161"
              x2="40"
              y2="162"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />

            {/* Aperture ring */}
            <polygon
              points="8,130 19,133 19,165 8,168"
              fill="#1e1c16"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.2"
            />
            <line
              x1="10"
              y1="133"
              x2="17"
              y2="134"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="10"
              y1="137"
              x2="17"
              y2="138"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="10"
              y1="161"
              x2="17"
              y2="162"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <line
              x1="10"
              y1="165"
              x2="17"
              y2="166"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />

            {/* Front lens face */}
            <rect
              x="-4"
              y="132"
              width="8"
              height="34"
              rx="1"
              fill="#1a1612"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1.5"
            />
            <rect
              x="-5"
              y="134"
              width="4"
              height="30"
              rx="1"
              fill="url(#lensGlassGrad)"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <rect
              x="-5"
              y="134"
              width="4"
              height="10"
              rx="1"
              fill="rgba(255,255,255,0.07)"
            />
            <line
              x1="-5"
              y1="132"
              x2="4"
              y2="132"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
            <line
              x1="-5"
              y1="166"
              x2="4"
              y2="166"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="1.5"
            />

            {/* Lens glow */}
            <rect
              x="-22"
              y="132"
              width="18"
              height="34"
              rx="2"
              fill="url(#lensGlowGrad)"
              className="lens-glow-ring"
            />

            {/* Anchors for JS */}
            <circle
              id="lensCenter"
              cx="-5"
              cy="149"
              r="1"
              fill="none"
              opacity="0"
            />
            <circle
              id="lensTipTop"
              cx="-5"
              cy="132"
              r="1"
              fill="none"
              opacity="0"
            />
            <circle
              id="lensTipBot"
              cx="-5"
              cy="166"
              r="1"
              fill="none"
              opacity="0"
            />
            <circle
              id="coneOrigin"
              cx="55"
              cy="149"
              r="1"
              fill="none"
              opacity="0"
            />
          </g>
        </svg>
      </div>

      {/* Stats */}
      <div className="hero-stats">
        <div className="hero-stat-item">
          <div className="hero-stat-num">1,240</div>
          <div className="hero-stat-label">Films</div>
        </div>
        <div className="hero-stat-sep" />
        <div className="hero-stat-item">
          <div className="hero-stat-num">48</div>
          <div className="hero-stat-label">Reviews</div>
        </div>
        <div className="hero-stat-sep" />
        <div className="hero-stat-item">
          <div className="hero-stat-num">12</div>
          <div className="hero-stat-label">Essays</div>
        </div>
        <div className="hero-stat-sep" />
        <div className="hero-stat-item">
          <div className="hero-stat-num">6</div>
          <div className="hero-stat-label">Lists</div>
        </div>
      </div>
    </section>
  )
}
