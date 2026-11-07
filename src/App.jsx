import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import InkRidges from './component/InkRidges'
import DitherFooter from './component/DitherFooter'
import './App.css'

/* ── Countdown ───────────────────────────────────────────────── */
function Countdown({ target }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime({ d, h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  const pad = (n) => String(n).padStart(2, '0')
  return (
    <div className="countdown" aria-label="Countdown to NALAI 2027">
      {[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([k, label], i) => (
        <>
          {i > 0 && <span className="countdown-sep" aria-hidden="true">:</span>}
          <div className="countdown-item" key={k}>
            <span className="countdown-num">{pad(time[k])}</span>
            <span className="countdown-label">{label}</span>
          </div>
        </>
      ))}
    </div>
  )
}

/* ── FAQ Item ────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button
        className="faq-question"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {q}
        <span className="faq-chevron" aria-hidden="true">▾</span>
      </button>
      <div className="faq-answer" role="region">
        <p className="faq-answer-inner">{a}</p>
      </div>
    </div>
  )
}

/* ── Main App ────────────────────────────────────────────────── */
export default function App() {
  const [preloaded, setPreloaded] = useState(false)
  const [pct, setPct] = useState(0)
  const [navScrolled, setNavScrolled] = useState(false)
  const [footerActive, setFooterActive] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [passActive, setPassActive] = useState(false)
  const [passData, setPassData] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [filmSubmitted, setFilmSubmitted] = useState(false)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [activePillar, setActivePillar] = useState(0)
  const lenisRef = useRef(null)

  // Event date: Jan 10 2027
  const eventDate = new Date('2027-01-10T09:00:00+05:30').getTime()

  /* Preloader */
  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) {
        p = 100
        setPct(100)
        clearInterval(interval)
        setTimeout(() => setPreloaded(true), 400)
      } else {
        setPct(Math.floor(p))
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  /* Lenis smooth scroll */
  useEffect(() => {
    if (!preloaded) return
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })
    lenisRef.current = lenis
    let frame = 0
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [preloaded])

  /* Scroll reveal */
  useEffect(() => {
    if (!preloaded) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [preloaded])

  /* Nav appears only after the hero marquee has fully passed. */
  useEffect(() => {
    const onScroll = () => {
      const marquee = document.querySelector('.marquee-neo-section')
      if (!marquee) return
      setNavScrolled(marquee.getBoundingClientRect().bottom <= 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const footer = document.querySelector('.footer')
    if (!footer) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setFooterActive(entry.isIntersecting && entry.intersectionRatio > 0.45),
      { threshold: [0.45] },
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [preloaded])


  const showToast = (msg) => {
    setToast(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const handleRegister = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const name = fd.get('name')
    const org = fd.get('org')
    setPassData({ name, org })
    setSubmitted(true)
    setPassActive(true)
    showToast('🎉 Registration confirmed! Your delegate pass is ready.')
  }

  const handleFilmSubmit = (e) => {
    e.preventDefault()
    setFilmSubmitted(true)
    showToast('🎬 Film submission received! We\'ll be in touch.')
  }

  const scrollTo = (id) => {
    setNavOpen(false)
    const target = document.getElementById(id)
    if (!target) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.8, lock: false })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const SPEAKERS = [
    { name: 'To Be Announced', role: 'Chief Minister of Kerala', org: 'Government of Kerala', init: '🏛️', tba: true },
    { name: 'To Be Announced', role: 'IT Minister', org: 'Government of Kerala', init: '💼', tba: true },
    { name: 'Keynote Speaker', role: 'AI & Deep Tech', org: 'Industry Leader', init: '🤖' },
    { name: 'Keynote Speaker', role: 'Startups & Innovation', org: 'Ecosystem Builder', init: '🚀' },
    { name: 'Panel Speaker', role: 'Higher Education', org: 'Engineering College', init: '🎓' },
    { name: 'Panel Speaker', role: 'Government AI Policy', org: 'Kerala IT Dept', init: '📋' },
  ]

  const AGENDA = [
    { time: '09:00 AM', title: 'Registration & Welcome Coffee', desc: 'Arrive, collect your delegate pass, and meet fellow attendees.', track: 'ceremony' },
    { time: '10:00 AM', title: 'Inaugural Ceremony', desc: 'Welcome address by dignitaries, lighting of the lamp, and official launch of NALAI 2027.', track: 'ceremony' },
    { time: '10:45 AM', title: 'Keynote: The AI Roadmap for Keralam', desc: 'Vision address on how AI will transform governance, industry, and education in Kerala.', track: 'main' },
    { time: '11:30 AM', title: 'AI Demonstrations — Live Showcase', desc: 'Startups and engineering colleges present their AI prototypes in interactive booths.', track: 'demo' },
    { time: '12:30 PM', title: 'Networking Lunch', desc: 'Connect with government officials, industry leaders, faculty, and students.', track: 'ceremony' },
    { time: '02:00 PM', title: 'Panel: AI Labs & Engineering Colleges MoU', desc: 'Formal signing of AI Lab Memoranda of Understanding with engineering colleges across Kerala.', track: 'ceremony' },
    { time: '03:00 PM', title: 'Startup Pitch Arena', desc: 'Selected AI startups pitch to a panel of investors and industry mentors.', track: 'main' },
    { time: '04:00 PM', title: 'Short Film Contest — Screening & Awards', desc: 'Screening of the winning short films, followed by prize distribution.', track: 'demo' },
    { time: '05:00 PM', title: 'Valedictory & Vote of Thanks', desc: 'Closing remarks, acknowledgements, and farewell.', track: 'ceremony' },
  ]

  const LABS = [
    { name: 'College of Engineering, Trivandrum', type: 'Engineering College', icon: '🏫' },
    { name: 'TKM College of Engineering', type: 'Engineering College', icon: '🏫' },
    { name: 'Model Engineering College', type: 'Engineering College', icon: '🏫' },
    { name: 'CUSAT', type: 'University', icon: '🎓' },
    { name: 'IIT Palakkad', type: 'Premier Institute', icon: '⚗️' },
    { name: 'NIT Calicut', type: 'Premier Institute', icon: '⚗️' },
    { name: 'Kerala Startup Mission', type: 'Govt. Agency', icon: '🚀' },
    { name: 'Industry Partners', type: 'TBA', icon: '🤝' },
  ]

  const FAQS = [
    { q: 'Is registration free?', a: 'Yes, participation is free for all delegates. We only ask that you register in advance so we can plan logistics and prepare your delegate kit.' },
    { q: 'Where exactly is the event?', a: 'The proposed venue is TICC, Thiruvananthapuram. The TCS campus is the fallback. The final venue will be confirmed and updated here.' },
    { q: 'What should I bring?', a: 'Your government-issued photo ID and your digital delegate pass (sent to your email after registration). ID will be verified at the entrance.' },
    { q: 'Can I submit a short film?', a: 'Yes! Use the Short Film Contest section to submit your entry. Details on the theme, maximum duration, and rules will be published soon.' },
    { q: 'Is there parking at the venue?', a: 'Parking details will be updated once the venue is finalised. We encourage delegates to use public transport.' },
    { q: 'Who can attend NALAI 2027?', a: 'Anyone interested in AI — students, faculty, working professionals, government officials, startups, and media. The event is open to all.' },
    { q: 'Will there be a live stream?', a: 'We are exploring a live stream option. Sign up for updates and we will notify you.' },
    { q: 'How is my data used?', a: 'Your data is shared only with the event organisers for logistics. We follow the DPDP Act and will never sell your data to third parties.' },
  ]

  const INTERESTS = ['Generative AI', 'Computer Vision', 'NLP / LLMs', 'AI in Healthcare', 'EdTech & AI', 'AI for Governance', 'Robotics', 'AI Policy', 'Startup Ecosystem', 'AI Research']

  const marqueItems = [
    'NALAI 2027', '10 January 2027', 'TICC Thiruvananthapuram', "Tomorrow's Keralam",
    '3000+ Delegates', 'AI Ecosystem Summit', 'TCS Presents', 'MoU with Engineering Colleges',
    'Short Film Contest', 'AI Demonstrations', 'Free Entry', 'Kerala × AI',
  ]

  const ECOSYSTEM_PILLARS = [
    {
      id: 'gov',
      code: '01 / GOV',
      title: 'State Policy & Public-Scale AI',
      desc: 'Unifying digital infrastructure, state datasets, and governance to pioneer ethical, citizen-first AI for 3.5 crore citizens.',
      metrics: [
        { val: '100%', label: 'Citizen Access' },
        { val: 'DPDP', label: 'Compliant Governance' },
      ],
      telemetry: 'STATEWIDE DEPLOYMENT // ZERO ENTRY BARRIER',
      sector: 'GOVERNMENT OF KERALA',
    },
    {
      id: 'ind',
      code: '02 / IND',
      title: 'Enterprise Tech & Global Compute',
      desc: 'Anchored by Tata Consultancy Services — bridging world-class industrial compute, venture syndicates, and real-world deployment.',
      metrics: [
        { val: 'TCS', label: 'Host & Lead Anchor' },
        { val: 'Global', label: 'Venture Network' },
      ],
      telemetry: 'ENTERPRISE ARCHITECTURE // HIGH-THROUGHPUT',
      sector: 'INDUSTRY & MULTINATIONALS',
      coord: 'TCS PEETHAM & TICC',
    },
    {
      id: 'aca',
      code: '03 / ACA',
      title: '20+ College AI Lab MoUs',
      desc: 'Formal on-stage signing of AI lab partnerships across CET, CUSAT, IIT Palakkad, NIT Calicut, and 50+ engineering institutes.',
      metrics: [
        { val: '20+', label: 'Lab MoUs' },
        { val: '50,000+', label: 'Engineers Impacted' },
      ],
      telemetry: 'ACADEMIC SYNDICATE // TALENT PIPELINE',
      sector: 'PREMIER ENGINEERING COLLEGES',
      coord: 'STATEWIDE LAB HUBS',
    },
    {
      id: 'str',
      code: '04 / STR',
      title: 'Startup Arena & Pitch Stage',
      desc: 'Kerala Startup Mission backed arena where deeptech founders, student visionaries, and angel syndicates deploy high-conviction capital.',
      metrics: [
        { val: 'Live', label: 'Pitch Arena' },
        { val: 'KSUM', label: 'Ecosystem Partner' },
      ],
      telemetry: 'DEEPTECH INCUBATION // CAPITAL ALLOCATION',
      sector: 'STARTUPS & FOUNDERS',
      coord: 'VENTURE ARENA STAGE',
    },
  ]

  return (
    <>
      {/* Noise overlay */}
      <div className="noise" aria-hidden="true" />


      {/* Preloader */}
      <div className={`preloader${preloaded ? ' hidden' : ''}`} role="status" aria-live="polite">
        <div className="preloader-logo">NAL<span>AI</span> 2027</div>
        <div className="preloader-bar">
          <div className="preloader-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="preloader-pct">{pct}%</div>
      </div>

      {/* Skip link */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      {/* Toast */}
      <div className={`toast${toastVisible ? ' show' : ''}`} aria-live="polite">{toast}</div>

      {/* ── Navigation ── */}
      <nav className={`nav${navScrolled ? ' scrolled' : ' hero-hidden'}${footerActive ? ' footer-hidden' : ''}`} aria-label="Main navigation">
        <a href="#hero" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollTo('hero') }}>
          <span className="dot" aria-hidden="true" />
          NAL<span style={{ color: 'var(--teal)' }}>AI</span>&nbsp;2027
        </a>
        <div className={`nav-links${navOpen ? ' open' : ''}`}>
          {[['about', 'About'], ['speakers', 'Speakers'], ['agenda', 'Agenda'], ['film', 'Film'], ['venue', 'Venue'], ['faq', 'FAQ']].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id) }}>{label}</a>
          ))}
          <a href="#register" className="nav-cta" onClick={(e) => { e.preventDefault(); scrollTo('register') }}>Register Free →</a>
        </div>
        <button
          className={`nav-toggle${navOpen ? ' open' : ''}`}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          onClick={() => setNavOpen(!navOpen)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <main id="main-content">
        {/* ── Hero ── */}
        <section id="hero" className="hero">
          {/* Ink ridges WebGL hero background */}
          <InkRidges
            className="ink-ridges-background"
            layers={5}
            seed={7}
            horizon={0.62}
            mist={0.9}
            drift={0.05}
            parallax={0.03}
            paintIn={2400}
            sun
            sunPosition={[0.78, 0.74]}
            sunSize={0.07}
            sunColor="#e45c3a"
            moon={false}
            scrollDepth={0.35}
            inkColor="#f4f1eb"
            grain={0.85}
            clouds={0.35}
            glow={0.45}
            birds={5}
            birdsEvery={14}
            dprCap={1.5}
            label="Animated sumi-e mountain landscape"
          />

          <div className="hero-content">

            <p className="hero-tagline">TCS Presents</p>

            <h1 className="hero-title">
              NAL<em>AI</em><br />2027
            </h1>

            <p className="hero-sub">
              Kerala's largest AI ecosystem summit — bringing together government, industry,
              engineering colleges, startups and students for <em>Tomorrow's Keralam</em>.
            </p>

            <Countdown target={eventDate} />

            <div className="hero-actions">
              <a href="#register" className="btn btn-primary" onClick={(e) => { e.preventDefault(); scrollTo('register') }}>
                Register Free →
              </a>
              <a href="#agenda" className="btn btn-outline" onClick={(e) => { e.preventDefault(); scrollTo('agenda') }}>
                View Agenda
              </a>
            </div>

            <div className="hero-meta">
              {[
                ['Date', '10 Jan 2027'],
                ['Venue', 'TICC, Trivandrum'],
                ['Delegates', '3,000+'],
                ['Entry', 'Free'],
                ['Hosted by', 'TCS'],
              ].map(([label, value]) => (
                <div className="hero-meta-item" key={label}>
                  <p className="label">{label}</p>
                  <p className="value">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-scroll-hint" aria-hidden="true">
            <div className="arrow" />
            Scroll
          </div>
        </section>

        {/* ── Marquee (Neo-Brutalist & Slanted) ── */}
        <div className="marquee-neo-section" aria-hidden="true">
          <div className="marquee-neo-wrap">
            {/* Strip 1: Electric Teal -> Left */}
            <div className="marquee-strip strip-teal">
              <div className="marquee-track track-left">
                {[...marqueItems, ...marqueItems].map((item, i) => (
                  <span
                    className={`marquee-item${item === 'Free Entry' || item === 'NALAI 2027' ? ' is-badge' : ''}`}
                    key={`t-${i}`}
                  >
                    <span className="marquee-text">{item}</span>
                    <span className="sep">★</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Strip 2: Stark Black -> Right */}
            <div className="marquee-strip strip-dark">
              <div className="marquee-track track-right">
                {[...marqueItems.slice().reverse(), ...marqueItems.slice().reverse()].map((item, i) => (
                  <span
                    className={`marquee-item${item === "Tomorrow's Keralam" || item === 'AI Ecosystem Summit' ? ' is-badge-alt' : ''}`}
                    key={`d-${i}`}
                  >
                    <span className="marquee-text">{item}</span>
                    <span className="sep">⚡</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── About (Awwwards Architectural Editorial & Cybernetic HUD) ── */}
        <section id="about" className="about-section" aria-labelledby="about-title">
          <div className="section" style={{ paddingBottom: 0 }}>
            {/* Header Telemetry Bar */}
            <div className="about-header-meta reveal">
              <span className="meta-tag">
                Summit Charter // Convergence Matrix
              </span>
              <span className="meta-coord">
                <span className="pulse-beacon" aria-hidden="true" />
                8.5241° N, 76.9366° E · TICC TRIVANDRUM
              </span>
            </div>

            <div className="about-grid">
              {/* Left Column: Typographic Narrative & Metric Pods */}
              <div className="about-left-col">
                <div>
                  <h2 id="about-title" className="about-hero-title reveal">
                    Where Kerala Meets <br />
                    <span className="text-gradient">The Sovereign Age</span> <br />
                    <em>of Intelligence.</em>
                  </h2>

                  <p className="about-lead-copy reveal reveal-delay-1">
                    A singular inflection point for 3.5 crore citizens — uniting state governance,
                    deep-tech industry, premier research academia, and the next wave of founders
                    under one roof.
                  </p>

                  <p className="about-sub-copy reveal reveal-delay-2">
                    Hosted by Tata Consultancy Services on 10 January 2027, NALAI convenes
                    Kerala's entire technology apparatus. From live neural prototypes and
                    multi-college AI Lab MoUs to the startup pitch arena and national keynote dialogues,
                    this is the launchpad for <em>Tomorrow's Keralam</em>.
                  </p>
                </div>

                {/* Avionics-grade HUD Metric Pods */}
                <div className="about-stat-grid reveal reveal-delay-3">
                  <div className="about-hud-card">
                    <span className="card-sys-id">CAPACITY</span>
                    <span className="card-val">3,000+</span>
                    <span className="card-label">Expected Delegates</span>
                    <span className="card-sub">Engineers, Founders & Leaders</span>
                  </div>

                  <div className="about-hud-card">
                    <span className="card-sys-id">CONVERGENCE</span>
                    <span className="card-val">10 JAN</span>
                    <span className="card-label">One-Day Summit</span>
                    <span className="card-sub">09:00 — 18:00 IST · TICC</span>
                  </div>

                  <div className="about-hud-card">
                    <span className="card-sys-id">SYNDICATE</span>
                    <span className="card-val">20+ LABS</span>
                    <span className="card-label">College AI MoUs</span>
                    <span className="card-sub">CET · CUSAT · NIT · IIT</span>
                  </div>

                  <div className="about-hud-card">
                    <span className="card-sys-id">BARRIER</span>
                    <span className="card-val">₹0.00</span>
                    <span className="card-label">Free Entry for All</span>
                    <span className="card-sub">100% Subsidised by TCS & Partners</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Cybernetic Kerala AI Nexus HUD */}
              <div className="about-nexus-console reveal reveal-delay-2" role="region" aria-label="Ecosystem Nexus Console">
                {/* Console Topbar */}
                <div className="nexus-topbar">
                  <div className="nexus-topbar-title">
                  </div>
                  <div className="nexus-topbar-meta">
                    {ECOSYSTEM_PILLARS[activePillar].coord}
                  </div>
                </div>

                {/* Radar Viewport */}
                <div className="nexus-radar-viewport" aria-hidden="true">
                  <div className="nexus-grid-overlay" />

                  <svg className="radar-svg" viewBox="0 0 400 290" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="radarSweepGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 145) rotate(0) scale(140)">
                        <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.25" />
                        <stop offset="70%" stopColor="var(--teal)" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Concentric coordinate circles */}
                    <circle cx="200" cy="145" r="32" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <circle cx="200" cy="145" r="68" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="200" cy="145" r="105" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <circle cx="200" cy="145" r="132" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="6 6" />

                    {/* Crosshairs & Angle Ticks */}
                    <line x1="30" y1="145" x2="370" y2="145" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="200" y1="15" x2="200" y2="275" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    <text x="200" y="25" textAnchor="middle" fill="var(--text-3)" fontSize="8" fontFamily="var(--mono)" letterSpacing="0.1em">000°</text>
                    <text x="360" y="148" textAnchor="end" fill="var(--text-3)" fontSize="8" fontFamily="var(--mono)">090°</text>
                    <text x="200" y="270" textAnchor="middle" fill="var(--text-3)" fontSize="8" fontFamily="var(--mono)">180°</text>
                    <text x="40" y="148" textAnchor="start" fill="var(--text-3)" fontSize="8" fontFamily="var(--mono)">270°</text>

                    {/* Rotating Radar Sweep Beam */}
                    <g className="radar-sweep-beam">
                      <path d="M200 145 L200 15 A130 130 0 0 1 292 53 Z" fill="url(#radarSweepGrad)" />
                      <line x1="200" y1="145" x2="292" y2="53" stroke="var(--teal)" strokeWidth="1.5" strokeOpacity="0.8" />
                    </g>

                    {/* Active Sector Dynamic Connection Laser */}
                    {activePillar === 0 && <line x1="200" y1="145" x2="200" y2="55" stroke="var(--teal)" strokeWidth="2" strokeDasharray="4 2" />}
                    {activePillar === 1 && <line x1="200" y1="145" x2="305" y2="145" stroke="var(--teal)" strokeWidth="2" strokeDasharray="4 2" />}
                    {activePillar === 2 && <line x1="200" y1="145" x2="200" y2="235" stroke="var(--teal)" strokeWidth="2" strokeDasharray="4 2" />}
                    {activePillar === 3 && <line x1="200" y1="145" x2="95" y2="145" stroke="var(--teal)" strokeWidth="2" strokeDasharray="4 2" />}

                    {/* Central Cybernetic Core */}
                    <g className="radar-core-pulse">
                      <circle cx="200" cy="145" r="22" fill="rgba(0,255,170,0.06)" stroke="var(--teal)" strokeWidth="1.5" />
                      <circle cx="200" cy="145" r="14" fill="rgba(123,94,248,0.2)" stroke="var(--indigo)" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="200" cy="145" r="5" fill="var(--teal)" />
                    </g>

                    {/* 4 Sector Nodes (Interactive Clickable Vectors) */}
                    {/* Node 0: GOV */}
                    <g onClick={() => setActivePillar(0)} style={{ cursor: 'pointer' }}>
                      <circle cx="200" cy="55" r={activePillar === 0 ? "13" : "9"} fill={activePillar === 0 ? "var(--teal)" : "rgba(13,15,30,0.9)"} stroke={activePillar === 0 ? "#000" : "var(--teal)"} strokeWidth="2" />
                      <text x="200" y="38" textAnchor="middle" fill={activePillar === 0 ? "var(--teal)" : "var(--text-2)"} fontSize="9" fontWeight="700" fontFamily="var(--mono)">01 · GOV</text>
                    </g>

                    {/* Node 1: IND */}
                    <g onClick={() => setActivePillar(1)} style={{ cursor: 'pointer' }}>
                      <circle cx="305" cy="145" r={activePillar === 1 ? "13" : "9"} fill={activePillar === 1 ? "var(--teal)" : "rgba(13,15,30,0.9)"} stroke={activePillar === 1 ? "#000" : "var(--indigo)"} strokeWidth="2" />
                      <text x="305" y="172" textAnchor="middle" fill={activePillar === 1 ? "var(--teal)" : "var(--text-2)"} fontSize="9" fontWeight="700" fontFamily="var(--mono)">02 · IND</text>
                    </g>

                    {/* Node 2: ACA */}
                    <g onClick={() => setActivePillar(2)} style={{ cursor: 'pointer' }}>
                      <circle cx="200" cy="235" r={activePillar === 2 ? "13" : "9"} fill={activePillar === 2 ? "var(--teal)" : "rgba(13,15,30,0.9)"} stroke={activePillar === 2 ? "#000" : "var(--teal)"} strokeWidth="2" />
                      <text x="200" y="260" textAnchor="middle" fill={activePillar === 2 ? "var(--teal)" : "var(--text-2)"} fontSize="9" fontWeight="700" fontFamily="var(--mono)">03 · ACA</text>
                    </g>

                    {/* Node 3: STR */}
                    <g onClick={() => setActivePillar(3)} style={{ cursor: 'pointer' }}>
                      <circle cx="95" cy="145" r={activePillar === 3 ? "13" : "9"} fill={activePillar === 3 ? "var(--teal)" : "rgba(13,15,30,0.9)"} stroke={activePillar === 3 ? "#000" : "var(--orange)"} strokeWidth="2" />
                      <text x="95" y="172" textAnchor="middle" fill={activePillar === 3 ? "var(--teal)" : "var(--text-2)"} fontSize="9" fontWeight="700" fontFamily="var(--mono)">04 · STR</text>
                    </g>
                  </svg>
                </div>

                {/* Interactive Pillar Selector Tabs */}
                <div className="nexus-tabs" role="tablist">
                  {ECOSYSTEM_PILLARS.map((pillar, idx) => (
                    <button
                      key={pillar.id}
                      className={`nexus-tab-btn${activePillar === idx ? ' active' : ''}`}
                      onClick={() => setActivePillar(idx)}
                      role="tab"
                      aria-selected={activePillar === idx}
                    >
                      <span className="tab-index">{pillar.code.split(' / ')[0]}</span>
                      <span>{pillar.code.split(' / ')[1]}</span>
                    </button>
                  ))}
                </div>

                {/* Active Pillar Readout Body */}
                <div className="nexus-body" role="tabpanel">
                  <div className="nexus-pillar-tag">
                    <span>// {ECOSYSTEM_PILLARS[activePillar].sector}</span>
                  </div>

                  <h3 className="nexus-pillar-title">
                    {ECOSYSTEM_PILLARS[activePillar].title}
                  </h3>

                  <p className="nexus-pillar-desc">
                    {ECOSYSTEM_PILLARS[activePillar].desc}
                  </p>

                  <div className="nexus-telemetry-badge">
                    {ECOSYSTEM_PILLARS[activePillar].telemetry}
                  </div>

                  {/* Dynamic Metrics Row */}
                  <div className="nexus-stats-row">
                    {ECOSYSTEM_PILLARS[activePillar].metrics.map((m, mi) => (
                      <div className="nexus-metric-box" key={mi}>
                        <span className="metric-num">{m.val}</span>
                        <span className="metric-txt">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── Speakers ── */}
        <section id="speakers" aria-labelledby="speakers-title">
          <div className="section">
            <p className="section-label reveal">Speakers & Guests</p>
            <h2 id="speakers-title" className="section-title reveal">Voices shaping<br />the future</h2>
            <p className="section-sub reveal reveal-delay-1">
              Confirmed speakers and guests will be listed here. Speaker information including
              bios and session details will be announced soon.
            </p>
            <div className="speakers-grid">
              {SPEAKERS.map((s, i) => (
                <article className="speaker-card reveal" key={i} style={{ transitionDelay: `${i * 0.07}s` }}>
                  <div className="speaker-avatar">{s.init}</div>
                  {s.tba
                    ? <p className="speaker-name" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>To Be Confirmed</p>
                    : <p className="speaker-name">{s.name}</p>
                  }
                  <p className="speaker-role">{s.role}</p>
                  <p className="speaker-org">{s.org}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── Agenda ── */}
        <section id="agenda" aria-labelledby="agenda-title">
          <div className="section">
            <p className="section-label reveal">Programme</p>
            <h2 id="agenda-title" className="section-title reveal">A day in the<br />life of NALAI</h2>
            <p className="section-sub reveal reveal-delay-1">
              The full agenda for 10 January 2027 — from inaugural ceremony through to valedictory.
              All times are IST. Subject to change.
            </p>
            <div className="agenda-timeline">
              {AGENDA.map((item, i) => (
                <article className="agenda-item reveal" key={i} style={{ transitionDelay: `${i * 0.06}s` }}>
                  <p className="agenda-time">{item.time}</p>
                  <h3 className="agenda-title">{item.title}</h3>
                  <p className="agenda-desc">{item.desc}</p>
                  <span className={`agenda-track track-${item.track}`}>{item.track === 'main' ? 'Main Stage' : item.track === 'demo' ? 'Demo Zone' : 'Ceremony'}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Film Contest ── */}
        <section id="film" className="film-section" aria-labelledby="film-title">
          {/* Film strip borders */}
          <div className="film-strip-top" aria-hidden="true">
            {Array.from({ length: 50 }, (_, i) => <div key={i} className="film-hole" />)}
          </div>
          <div className="film-strip-bottom" aria-hidden="true">
            {Array.from({ length: 50 }, (_, i) => <div key={i} className="film-hole" />)}
          </div>

          <div className="film-content">
            <p className="section-label reveal">🎬 Short Film Contest</p>
            <h2 id="film-title" className="section-title reveal">Lights. Camera.<br /><em style={{ color: 'var(--teal)', fontStyle: 'italic' }}>AI.</em></h2>
            <p className="section-sub reveal reveal-delay-1">
              Got a story to tell about artificial intelligence? Submit your short film and compete
              for the NALAI 2027 trophy, certificate, and recognition across Kerala's tech community.
            </p>

            <div className="film-grid">
              <div>
                <div className="film-info-cards">
                  {[
                    { icon: '🎯', title: 'Theme', desc: 'AI and its impact on people and society in Kerala. Details to be published.' },
                    { icon: '⏱️', title: 'Duration', desc: 'Maximum film duration TBA. Short, punchy films are encouraged.' },
                    { icon: '📅', title: 'Deadline', desc: 'Submission deadline to be announced. Check back soon.' },
                    { icon: '🏆', title: 'Prizes', desc: 'Trophy and certificate for the winner and runner-up. Plus recognition at the summit.' },
                    { icon: '🌐', title: 'Language', desc: 'Malayalam, English, or a mix — your story, your voice.' },
                  ].map((c) => (
                    <div className="film-info-card reveal" key={c.title}>
                      <span className="icon">{c.icon}</span>
                      <div>
                        <p className="title">{c.title}</p>
                        <p className="desc">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Film submission form */}
              <div className="reveal reveal-delay-1">
                {filmSubmitted ? (
                  <div className="success-screen active glass" style={{ borderRadius: 'var(--r-xl)', padding: '48px' }}>
                    <div className="success-icon">🎬</div>
                    <h3 className="success-title">Submission Received!</h3>
                    <p className="success-sub">We'll review your film and be in touch before the event. Fingers crossed!</p>
                  </div>
                ) : (
                  <form onSubmit={handleFilmSubmit} style={{ padding: '32px', background: 'var(--surface2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-xl)', color: 'var(--text-1)', marginBottom: '24px' }}>Submit Your Film</h3>

                    <div className="form-group">
                      <label className="form-label" htmlFor="film-name">Lead Filmmaker <span className="req">*</span></label>
                      <input id="film-name" name="film-name" type="text" className="form-input" placeholder="Your full name" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="film-team">Team Members</label>
                      <input id="film-team" name="film-team" type="text" className="form-input" placeholder="Names of team members (optional)" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="film-email">Email <span className="req">*</span></label>
                        <input id="film-email" name="film-email" type="email" className="form-input" placeholder="your@email.com" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="film-phone">Phone <span className="req">*</span></label>
                        <input id="film-phone" name="film-phone" type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="film-college">College / Organisation <span className="req">*</span></label>
                      <input id="film-college" name="film-college" type="text" className="form-input" placeholder="Your institution" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="film-title-input">Film Title <span className="req">*</span></label>
                      <input id="film-title-input" name="film-title" type="text" className="form-input" placeholder="Title of your short film" required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="film-lang">Language <span className="req">*</span></label>
                        <select id="film-lang" name="film-lang" className="form-select" required>
                          <option value="">Select language</option>
                          <option>Malayalam</option>
                          <option>English</option>
                          <option>Malayalam + English</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="film-duration">Duration (minutes) <span className="req">*</span></label>
                        <input id="film-duration" name="film-duration" type="number" min="1" max="15" className="form-input" placeholder="e.g. 5" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="film-link">YouTube / Drive Link <span className="req">*</span></label>
                      <input id="film-link" name="film-link" type="url" className="form-input" placeholder="https://..." required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="film-synopsis">Synopsis (~50 words) <span className="req">*</span></label>
                      <textarea id="film-synopsis" name="film-synopsis" className="form-textarea" rows={3} placeholder="Briefly describe your film..." required />
                    </div>
                    <div className="form-group">
                      <label className="form-checkbox">
                        <input type="checkbox" required />
                        <span className="form-checkbox-text">I declare that this film is original, rights are cleared, and I have the authority to submit it. ✓</span>
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary form-submit" style={{ borderRadius: 'var(--r-md)' }}>Submit Film →</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── AI Labs ── */}
        <section id="labs" aria-labelledby="labs-title">
          <div className="section">
            <p className="section-label reveal">AI Labs & Partners</p>
            <h2 id="labs-title" className="section-title reveal">Building Kerala's<br />AI infrastructure</h2>
            <p className="section-sub reveal reveal-delay-1">
              NALAI 2027 will see the signing of AI Lab MoUs between TCS and engineering
              colleges across Kerala, laying the groundwork for a state-wide AI education network.
            </p>
            <div className="labs-grid">
              {LABS.map((lab, i) => (
                <div className="lab-card reveal" key={i} style={{ transitionDelay: `${i * 0.05}s` }}>
                  <div className="lab-icon">{lab.icon}</div>
                  <p className="lab-name">{lab.name}</p>
                  <p className="lab-type">{lab.type}</p>
                </div>
              ))}
            </div>
            <p className="reveal" style={{ marginTop: '32px', fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.1em' }}>
              * Final list of MoU partners to be confirmed. More colleges and industry partners to be announced.
            </p>
          </div>
        </section>

        {/* ── Register ── */}
        <section id="register" className="register-section" aria-labelledby="register-title">
          <div className="section">
            <p className="section-label reveal" style={{ justifyContent: 'center' }}>Secure Your Spot</p>
            <h2 id="register-title" className="section-title reveal" style={{ textAlign: 'center' }}>
              Register for<br /><em style={{ color: 'var(--teal)', fontStyle: 'italic' }}>NALAI 2027</em>
            </h2>
            <p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto', textAlign: 'center' }}>
              Free entry. Finish in under 2 minutes. Get your personalised delegate pass instantly.
            </p>

            {submitted ? (
              <div className="success-screen active reveal" style={{ marginTop: '48px' }}>
                <div className="success-icon">🎟️</div>
                <h3 className="success-title">You're Registered!</h3>
                <p className="success-sub">Check your email for your delegate pass and QR code. See you at TICC on 10 January 2027!</p>
                <button className="btn btn-primary" onClick={() => setPassActive(true)}>View My Pass</button>
              </div>
            ) : (
              <form className="register-form-wrap" onSubmit={handleRegister} noValidate>
                <div className="form-row">
                  <div className="form-group reveal">
                    <label className="form-label" htmlFor="reg-name">Full Name <span className="req">*</span></label>
                    <input id="reg-name" name="name" type="text" className="form-input" placeholder="Your full name" required />
                  </div>
                  <div className="form-group reveal reveal-delay-1">
                    <label className="form-label" htmlFor="reg-email">Email <span className="req">*</span></label>
                    <input id="reg-email" name="email" type="email" className="form-input" placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group reveal">
                    <label className="form-label" htmlFor="reg-phone">Mobile / WhatsApp <span className="req">*</span></label>
                    <input id="reg-phone" name="phone" type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div className="form-group reveal reveal-delay-1">
                    <label className="form-label" htmlFor="reg-org">College / Organisation <span className="req">*</span></label>
                    <input id="reg-org" name="org" type="text" className="form-input" placeholder="Your institution or company" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group reveal">
                    <label className="form-label" htmlFor="reg-type">I am a… <span className="req">*</span></label>
                    <select id="reg-type" name="type" className="form-select" required>
                      <option value="">Select category</option>
                      <option>Student</option>
                      <option>Working Professional</option>
                      <option>Faculty</option>
                      <option>Government</option>
                      <option>Startup</option>
                      <option>Media</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group reveal reveal-delay-1">
                    <label className="form-label" htmlFor="reg-desig">Year / Designation <span className="req">*</span></label>
                    <input id="reg-desig" name="desig" type="text" className="form-input" placeholder="e.g. 3rd Year B.Tech / Software Engineer" required />
                  </div>
                </div>
                <div className="form-group reveal">
                  <label className="form-label" htmlFor="reg-city">City <span className="req">*</span></label>
                  <input id="reg-city" name="city" type="text" className="form-input" placeholder="Your city" required />
                </div>
                <div className="form-group reveal">
                  <label className="form-label">Topics I'm interested in</label>
                  <div className="tags-grid">
                    {INTERESTS.map((interest) => (
                      <span key={interest}>
                        <input className="tag-option" type="checkbox" id={`tag-${interest}`} name="interests" value={interest} />
                        <label className="tag-label" htmlFor={`tag-${interest}`}>{interest}</label>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group reveal">
                  <label className="form-label" htmlFor="reg-access">Any accessibility needs?</label>
                  <input id="reg-access" name="access" type="text" className="form-input" placeholder="e.g. wheelchair access, sign language interpreter (optional)" />
                </div>
                <div className="form-group reveal">
                  <label className="form-label" htmlFor="reg-source">How did you hear about us?</label>
                  <select id="reg-source" name="source" className="form-select">
                    <option value="">Select one</option>
                    <option>Social Media</option>
                    <option>College / Organisation</option>
                    <option>Friend / Colleague</option>
                    <option>News / Media</option>
                    <option>TCS Communication</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group reveal">
                  <label className="form-checkbox">
                    <input type="checkbox" id="reg-consent" name="consent" required />
                    <span className="form-checkbox-text">
                      I agree to share my data with the NALAI 2027 organisers for event purposes, in accordance with India's DPDP Act. ✓
                    </span>
                  </label>
                </div>
                <button type="submit" id="register-btn" className="btn btn-primary form-submit reveal" style={{ borderRadius: 'var(--r-md)' }}>
                  Register & Get My Pass →
                </button>
                <p className="form-privacy reveal">
                  🔒 Your data is stored securely and used only for NALAI 2027 logistics. We follow the Digital Personal Data Protection Act, 2023.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ── Venue ── */}
        <section id="venue" aria-labelledby="venue-title">
          <div className="section">
            <p className="section-label reveal">Getting There</p>
            <h2 id="venue-title" className="section-title reveal">Venue & Travel</h2>
            <p className="section-sub reveal reveal-delay-1">
              NALAI 2027 will be held at TICC, Thiruvananthapuram (proposed), with the TCS
              campus as a fallback. Venue confirmation and detailed directions coming soon.
            </p>
            <div className="venue-grid">
              <div className="venue-map reveal">
                <div className="venue-map-placeholder">
                  <div className="icon">📍</div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-sm)', color: 'var(--teal)', marginBottom: '8px', letterSpacing: '0.1em' }}>TICC, Trivandrum</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>Detailed map to be updated once venue is confirmed</p>
                </div>
              </div>
              <div className="venue-info-list reveal reveal-delay-1">
                {[
                  { icon: '🏛️', label: 'Primary Venue', value: 'TICC, Thiruvananthapuram (Proposed)' },
                  { icon: '🔄', label: 'Fallback Venue', value: 'TCS Campus, Thiruvananthapuram' },
                  { icon: '👥', label: 'Capacity', value: 'Up to 3,000 delegates (external) or 1,000 (TCS campus)' },
                  { icon: '🚌', label: 'Public Transport', value: 'Details to be updated. We encourage public transport.' },
                  { icon: '🅿️', label: 'Parking', value: 'To be confirmed once venue is finalised.' },
                  { icon: '📅', label: 'Event Date', value: '10 January 2027 (Tentative)' },
                ].map((item) => (
                  <div className="venue-info-item" key={item.label}>
                    <span className="icon">{item.icon}</span>
                    <div>
                      <p className="label">{item.label}</p>
                      <p className="value">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── FAQ ── */}
        <section id="faq" aria-labelledby="faq-title">
          <div className="section" style={{ textAlign: 'center' }}>
            <p className="section-label reveal" style={{ justifyContent: 'center' }}>Got Questions?</p>
            <h2 id="faq-title" className="section-title reveal">Frequently Asked</h2>
            <div className="faq-list">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
            <p className="reveal" style={{ marginTop: '48px', fontSize: 'var(--text-base)', color: 'var(--text-2)' }}>
              Still have questions? Email us at{' '}
              <a href="mailto:nalai2027@tcs.com" style={{ color: 'var(--teal)' }}>nalai2027@tcs.com</a>
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-top">
          <div className="footer-brand">
            <p className="logo">NAL<span>AI</span> 2027</p>
            <p>Tomorrow's Keralam. Kerala's largest AI ecosystem summit, hosted by TCS on 10 January 2027 at TICC, Thiruvananthapuram.</p>
          </div>
          <div className="footer-col">
            <h4>Navigate</h4>
            <ul>
              {[['about', 'About'], ['speakers', 'Speakers'], ['agenda', 'Agenda'], ['film', 'Film Contest']].map(([id, label]) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id) }}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Event</h4>
            <ul>
              {[['labs', 'AI Labs & Partners'], ['register', 'Register'], ['venue', 'Venue & Travel'], ['faq', 'FAQ']].map(([id, label]) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id) }}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:nalai2027@tcs.com">nalai2027@tcs.com</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">DPDP Compliance</a></li>
            </ul>
          </div>
          </div>
          <div className="footer-bottom">
            <p>© 2027 NALAI — Presented by TCS</p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="Twitter/X">𝕏</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>
        </div>
        <DitherFooter />
      </footer>

      {/* ── Delegate Pass Modal ── */}
      {passActive && passData && (
        <div className="delegate-pass-overlay active" role="dialog" aria-modal="true" aria-labelledby="pass-title">
          <div className="delegate-pass">
            <button className="pass-close" aria-label="Close delegate pass" onClick={() => setPassActive(false)}>✕</button>
            <div className="pass-header">
              <p className="pass-event-name">NAL<span>AI</span> 2027</p>
              <span className="pass-tag">Delegate</span>
            </div>
            <h2 id="pass-title" className="pass-name">{passData.name}</h2>
            <p className="pass-org">{passData.org}</p>
            <div className="pass-qr" aria-label="Delegate QR code">
              {/* Simple SVG QR placeholder */}
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="30" height="30" fill="none" stroke="black" strokeWidth="4" />
                <rect x="18" y="18" width="14" height="14" fill="black" />
                <rect x="60" y="10" width="30" height="30" fill="none" stroke="black" strokeWidth="4" />
                <rect x="68" y="18" width="14" height="14" fill="black" />
                <rect x="10" y="60" width="30" height="30" fill="none" stroke="black" strokeWidth="4" />
                <rect x="18" y="68" width="14" height="14" fill="black" />
                <rect x="60" y="60" width="8" height="8" fill="black" />
                <rect x="72" y="60" width="8" height="8" fill="black" />
                <rect x="60" y="72" width="8" height="8" fill="black" />
                <rect x="72" y="72" width="8" height="8" fill="black" />
                <rect x="44" y="10" width="8" height="8" fill="black" />
                <rect x="10" y="44" width="8" height="8" fill="black" />
                <rect x="44" y="44" width="8" height="8" fill="black" />
              </svg>
            </div>
            <div className="pass-footer">
              <span>10 JAN 2027 · TICC, TVM</span>
              <span style={{ color: 'var(--teal)' }}>NALAI-2027</span>
            </div>
            <div className="pass-actions">
              <button
                className="btn btn-primary"
                onClick={() => { showToast('📱 Pass saved! Share it on LinkedIn or Instagram.'); setPassActive(false) }}
              >
                Share Pass
              </button>
              <button className="btn btn-outline" onClick={() => setPassActive(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
