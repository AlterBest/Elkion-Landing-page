import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroScene } from './components/HeroScene'
import {
  IconAnalyze,
  IconDatabase,
  IconIngest,
  IconPredict,
  IconShield,
  IconLock,
  IconFlow,
} from './components/Icons'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const navRef = useRef<HTMLDivElement | null>(null)
  const navBarRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const cleanups: Array<() => void> = []
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      const links = gsap.utils.toArray<HTMLAnchorElement>('.nav-links a')
      const indicator = document.querySelector('.nav-indicator') as HTMLElement | null
      const brandEl = navBarRef.current?.querySelector('.brand') as HTMLElement | null
      let activeLink = links[0] ?? null

      const setIndicator = (el: HTMLElement | null) => {
        if (!indicator || !el || !navBarRef.current) return
        const target = (el.querySelector('span') ?? el) as HTMLElement
        const rect = target.getBoundingClientRect()
        const parent = navBarRef.current.getBoundingClientRect()
        gsap.to(indicator, {
          x: rect.left - parent.left,
          width: rect.width,
          duration: 0.25,
          ease: 'power2.out',
        })
      }

      if (indicator && links.length) {
        setIndicator(activeLink ?? brandEl)
        links.forEach((link) => {
          const onEnter = () => {
            activeLink = link
            setIndicator(link)
          }
          link.addEventListener('mouseenter', onEnter)
          link.addEventListener('focus', onEnter)
          cleanups.push(() => link.removeEventListener('mouseenter', onEnter))
          cleanups.push(() => link.removeEventListener('focus', onEnter))
        })
        const onResize = () => setIndicator(activeLink ?? brandEl)
        window.addEventListener('resize', onResize)
        cleanups.push(() => window.removeEventListener('resize', onResize))

        links.forEach((link) => {
          const targetId = link.getAttribute('href')?.replace('#', '')
          if (!targetId) return
          const section = document.getElementById(targetId)
          if (!section) return
          const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter: () => {
              activeLink = link
              setIndicator(link)
            },
            onEnterBack: () => {
              activeLink = link
              setIndicator(link)
            },
          })
          cleanups.push(() => trigger.kill())
        })

        const hero = document.querySelector('.hero') as HTMLElement | null
        if (hero && brandEl) {
          const heroTrigger = ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            onEnter: () => setIndicator(brandEl),
            onEnterBack: () => setIndicator(brandEl),
          })
          cleanups.push(() => heroTrigger.kill())
        }
      }

      if (reduceMotion) return () => cleanups.forEach((cleanup) => cleanup())

      gsap.from('.hero-animate', {
        y: 22,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
      })

      ScrollTrigger.create({
        trigger: document.body,
        start: 'top -40',
        end: 99999,
        toggleClass: { targets: navRef.current, className: 'nav-scrolled' },
        onToggle: () => {
          setIndicator(activeLink ?? brandEl)
        },
      })

      gsap.utils.toArray<HTMLElement>('.reveal-group').forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>('.reveal-item')
        const bars = group.querySelectorAll<HTMLElement>('.bar-fill')
        const line = group.querySelector<HTMLElement>('.draw-line')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        })

        if (items.length) {
          tl.from(items, {
            y: 26,
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.12,
          })
        }

        if (line) {
          tl.fromTo(
            line,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: 'power2.out' },
            '<0.1'
          )
        }

        if (bars.length) {
          tl.fromTo(
            bars,
            { width: '0%' },
            {
              width: (index, element) =>
                (element as HTMLElement).dataset.value ?? '70%',
              duration: 0.9,
              ease: 'power2.out',
              stagger: 0.08,
            },
            '<0.1'
          )
        }
      })

      gsap.utils.toArray<HTMLElement>('.float').forEach((el) => {
        gsap.set(el, { y: 0 })
      })

      gsap.utils.toArray<HTMLElement>('.parallax').forEach((el) => {
        const speed = Number(el.dataset.speed ?? '0.18')
        gsap.to(el, {
          y: () => -window.innerHeight * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

      ScrollTrigger.refresh()

      return () => cleanups.forEach((cleanup) => cleanup())
    },
    { scope: pageRef }
  )

  return (
    <div className="page" ref={pageRef}>
      <header className="nav" ref={navRef}>
        <div className="nav-bar" ref={navBarRef}>
          <span className="nav-indicator" aria-hidden="true"></span>
          <div className="brand"><span>ELKION</span></div>
          <div className="nav-center">
            <nav className="nav-links">
              <a href="#trust"><span>Trust</span></a>
              <a href="#pipeline"><span>Pipeline</span></a>
              <a href="#advantage"><span>Advantage</span></a>
            </nav>
          </div>
          <button className="btn btn-nav-outline nav-cta">Book meeting</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg parallax" data-speed="0.06" aria-hidden="true">
          <Canvas
            dpr={[1, 1.25]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
            frameloop="demand"
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>
        <div className="hero-content hero-center">
          <div className="hero-kicker-block hero-animate">
            <span className="hero-line"></span>
            <span className="hero-kicker">The future of infrastructure</span>
          </div>
          <h1 className="hero-animate hero-title">
            A unified <span className="hero-emphasis">data engine</span> built for enterprise scale.
          </h1>
          <p className="hero-sub hero-animate">
            High-precision processing, predictive modeling, and durable storage.
            One platform, total control.
          </p>
          <button className="btn btn-primary btn-cta hero-cta hero-animate">
            <span>Explore the architecture</span>
            <span className="hero-cta-arrow">→</span>
          </button>
        </div>
        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="hero-metric-label">Performance</span>
            <strong className="hero-metric-value">Sub-sec</strong>
            <span className="hero-metric-desc">
              Average query latency across global clusters
            </span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-label">Capacity</span>
            <strong className="hero-metric-value">Petabyte</strong>
            <span className="hero-metric-desc">
              Scalable cloud-native storage infrastructure
            </span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-label">Reliability</span>
            <strong className="hero-metric-value">99.99%</strong>
            <span className="hero-metric-desc">
              Guaranteed enterprise uptime and durability SLA
            </span>
          </div>
        </div>
      </section>

      <section id="trust" className="section section-air trust">
        <div className="trust-grid">
          <div className="trust-copy reveal-group">
            <p className="kicker reveal-item">Enterprise credibility</p>
            <h2 className="reveal-item">
              Trusted by teams who cannot afford data drift.
            </h2>
            <p className="reveal-item">
              ELKION powers high-stakes data operations with precise results,
              lineage, and built-in resilience.
            </p>
            <div className="trust-actions reveal-item">
              <button className="btn btn-primary btn-cta">Book a meeting</button>
              <button className="btn btn-ghost">View security</button>
            </div>
            <div className="trust-logos reveal-item">
              <img className="logo-img" src="/logos/postgresql.svg" alt="PostgreSQL" />
              <img className="logo-img" src="/logos/kubernetes.svg" alt="Kubernetes" />
              <img className="logo-img" src="/logos/apachekafka.svg" alt="Apache Kafka" />
              <img className="logo-img" src="/logos/prometheus.svg" alt="Prometheus" />
              <img className="logo-img" src="/logos/linux.svg" alt="Linux" />
            </div>
          </div>
          <div className="trust-stack reveal-group">
            <div className="trust-panel reveal-item">
              <img
                className="trust-illustration"
                src="/illustrations/server.svg"
                alt="Enterprise data infrastructure"
              />
              <div className="trust-panel-meta">
                <span>Global SLA</span>
                <strong>99.995%</strong>
              </div>
            </div>
            <div className="trust-stack-cards">
              <div className="trust-card reveal-item">
                <span>Precision</span>
                <strong>99.995%</strong>
              </div>
              <div className="trust-card reveal-item">
                <span>Throughput</span>
                <strong>12x faster</strong>
              </div>
              <div className="trust-card reveal-item">
                <span>Cost efficiency</span>
                <strong>40% lower</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pipeline" className="section section-compact pipeline">
        <div className="section-heading reveal-group">
          <p className="kicker reveal-item">Integrated pipeline</p>
          <h2 className="reveal-item">From ingest to prediction in one spine</h2>
          <p className="reveal-item">
            Stream, store, and model your data without stitching together
            brittle tools or custom glue.
          </p>
        </div>
        <div className="pipeline-stepper reveal-group">
          <span className="pipeline-spine draw-line" aria-hidden="true"></span>
          <div className="pipeline-node reveal-item">
            <span className="pipeline-dot" aria-hidden="true"></span>
            <div className="pipeline-card">
              <IconIngest />
              <h3>Ingest</h3>
              <p>Secure connectors for batch, streaming, and third-party feeds.</p>
            </div>
          </div>
          <div className="pipeline-node reveal-item">
            <span className="pipeline-dot" aria-hidden="true"></span>
            <div className="pipeline-card">
              <IconDatabase />
              <h3>Store</h3>
              <p>Durable, query-optimized storage with smart partitioning.</p>
            </div>
          </div>
          <div className="pipeline-node reveal-item">
            <span className="pipeline-dot" aria-hidden="true"></span>
            <div className="pipeline-card">
              <IconAnalyze />
              <h3>Analyze</h3>
              <p>Deterministic processing with auditable lineage.</p>
            </div>
          </div>
          <div className="pipeline-node reveal-item">
            <span className="pipeline-dot" aria-hidden="true"></span>
            <div className="pipeline-card">
              <IconPredict />
              <h3>Predict</h3>
              <p>Deploy models with monitoring, drift alerts, and guardrails.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="advantage" className="section section-air advantage">
        <div className="advantage-shell">
          <div className="advantage-copy reveal-group">
            <p className="kicker reveal-item">Algorithmic advantage</p>
            <h2 className="reveal-item">Precision without the performance tax.</h2>
            <p className="reveal-item">
              ELKION's proprietary engine outperforms legacy stacks on accuracy
              and throughput while reducing operational overhead.
            </p>
            <div className="advantage-chip reveal-item">
              <IconFlow />
              <span>Top-tier benchmarks across five datasets</span>
            </div>
          </div>
          <div className="advantage-block reveal-group">
            <div className="advantage-compare reveal-item">
              <div className="compare-row">
                <span>ELKION engine</span>
                <div className="bar">
                  <div className="bar-fill" data-value="92%" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="compare-row">
                <span>Legacy stack</span>
                <div className="bar">
                  <div className="bar-fill" data-value="54%" style={{ width: '54%' }}></div>
                </div>
              </div>
              <div className="compare-row">
                <span>Manual workflows</span>
                <div className="bar">
                  <div className="bar-fill" data-value="32%" style={{ width: '32%' }}></div>
                </div>
              </div>
            </div>
            <div className="advantage-inline">
              <div className="metric-card reveal-item">
                <span>Inference latency</span>
                <strong>120ms</strong>
              </div>
              <div className="metric-card reveal-item">
                <span>Vector throughput</span>
                <strong>8.4B/sec</strong>
              </div>
              <div className="metric-card reveal-item">
                <span>Model stability</span>
                <strong>99.98%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="section section-compact architecture">
        <div className="architecture-grid">
          <div className="architecture-copy reveal-group">
            <p className="kicker reveal-item">Enterprise architecture</p>
            <h2 className="reveal-item">Built for scale, observability, and resilience.</h2>
            <p className="reveal-item">
              The ELKION stack combines distributed storage, a vectorized query
              engine, and predictive modeling in one cohesive platform.
            </p>
            <button className="btn btn-primary reveal-item">Review architecture</button>
          </div>
          <div className="architecture-stack reveal-group">
            <div className="stack-layer reveal-item">
              <span>Model Orchestration</span>
              <strong>Multi-tenant deployment control</strong>
            </div>
            <div className="stack-layer reveal-item">
              <span>Real-time Query Engine</span>
              <strong>Vectorized + cost-aware execution</strong>
            </div>
            <div className="stack-layer reveal-item">
              <span>Distributed Storage</span>
              <strong>Petabyte-scale, policy-aware tiers</strong>
            </div>
            <div className="stack-layer reveal-item">
              <span>Secure Ingestion Mesh</span>
              <strong>Zero-trust connectors + schema guardrails</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="governance" className="section section-air governance">
        <div className="governance-shell">
          <div className="governance-copy reveal-group">
            <p className="kicker reveal-item">Governance</p>
            <h2 className="reveal-item">Control, compliance, and full auditability.</h2>
            <p className="reveal-item">
              A governance layer that keeps enterprise teams aligned with
              granular access control, encryption, and lineage tracking.
            </p>
            <div className="governance-pills reveal-item">
              <span>Policy-aware storage</span>
              <span>Zero-trust access</span>
              <span>Immutable audit logs</span>
            </div>
          </div>
          <div className="governance-panels reveal-group">
            <div className="compliance-grid reveal-item">
              <div className="compliance-card">
                <strong>SOC 2</strong>
                <span>Aligned controls</span>
              </div>
              <div className="compliance-card">
                <strong>ISO 27001</strong>
                <span>Ready posture</span>
              </div>
              <div className="compliance-card">
                <strong>GDPR</strong>
                <span>Data residency</span>
              </div>
              <div className="compliance-card">
                <strong>HIPAA</strong>
                <span>Optional module</span>
              </div>
            </div>
            <div className="governance-panel reveal-item">
              <div className="panel-head">
                <h3>Audit readiness</h3>
                <span className="panel-chip">Live</span>
              </div>
              <p>
                Generate exportable audit trails, automated evidence packages,
                and real-time compliance status reports.
              </p>
              <div className="panel-grid">
                <div>
                  <IconShield />
                  <span>Role-based access with delegated approvals.</span>
                </div>
                <div>
                  <IconLock />
                  <span>End-to-end encryption for data in motion and at rest.</span>
                </div>
                <div>
                  <IconFlow />
                  <span>Lineage traces across every pipeline stage.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="section section-compact outcomes">
        <div className="section-heading reveal-group">
          <p className="kicker reveal-item">Outcomes</p>
          <h2 className="reveal-item">Outcomes your executive team can measure</h2>
          <p className="reveal-item">
            Concrete improvements across forecasting, anomaly detection, and
            strategic planning.
          </p>
        </div>
        <div className="outcome-grid reveal-group">
          <article className="outcome-card reveal-item">
            <span className="outcome-label">Forecasting</span>
            <h3>Variance reduction</h3>
            <strong>22%</strong>
            <p>Unified model inputs increase prediction confidence.</p>
          </article>
          <article className="outcome-card reveal-item">
            <span className="outcome-label">Anomaly detection</span>
            <h3>Faster response</h3>
            <strong>3x</strong>
            <p>Detect deviations in real time with automated routing.</p>
          </article>
          <article className="outcome-card reveal-item">
            <span className="outcome-label">Planning</span>
            <h3>Decision velocity</h3>
            <strong>40%</strong>
            <p>Align teams on trusted metrics across business units.</p>
          </article>
        </div>
      </section>

      <section id="faq" className="section section-air faq">
        <div className="faq-grid">
          <div className="faq-list reveal-group">
            <p className="kicker reveal-item">FAQ</p>
            <h2 className="reveal-item">Answers CTOs ask first</h2>
            <p className="reveal-item">
              Fast onboarding, flexible integrations, and enterprise-grade
              governance built in.
            </p>
            <details className="faq-item reveal-item" open>
              <summary>How fast can we migrate our existing stack?</summary>
              <p>
                Most enterprise teams complete phased onboarding in 4-6 weeks
                with dedicated ELKION support.
              </p>
            </details>
            <details className="faq-item reveal-item">
              <summary>Do you support hybrid and multi-cloud deployments?</summary>
              <p>
                Yes. ELKION runs across private, hybrid, and multi-cloud
                environments with data residency controls.
              </p>
            </details>
            <details className="faq-item reveal-item">
              <summary>What security controls are included?</summary>
              <p>
                We provide RBAC, audit trails, encryption, and compliance-ready
                reporting out of the box.
              </p>
            </details>
          </div>
          <aside className="briefing-card reveal-group">
            <p className="kicker reveal-item">Executive briefing</p>
            <h3 className="reveal-item">Ready to align your data stack?</h3>
            <p className="reveal-item">
              Schedule a meeting with our engineering team to review workload
              fit, migration timelines, and ROI projections.
            </p>
            <ul className="briefing-list reveal-item">
              <li>Architecture review with ELKION engineers</li>
              <li>Performance benchmark estimate</li>
              <li>Security posture walkthrough</li>
            </ul>
            <button className="btn btn-primary btn-cta reveal-item">Book a meeting</button>
          </aside>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">ELKION</div>
            <p>
              The unified data engine for precision analysis, predictive
              modeling, and resilient storage at enterprise scale.
            </p>
            <div className="footer-meta">
              <span>Global operations</span>
              <span>99.99% uptime SLA</span>
            </div>
          </div>
          <div className="footer-columns">
            <div>
              <h4>Platform</h4>
              <a href="#pipeline">Pipeline</a>
              <a href="#architecture">Architecture</a>
              <a href="#outcomes">Outcomes</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#trust">Trust</a>
              <a href="#governance">Governance</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <h4>Engage</h4>
              <a href="#">Security</a>
              <a href="#">Compliance</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div className="footer-cta">
            <h4>Executive briefing</h4>
            <p>Schedule time with our engineering team to review your data stack.</p>
            <button className="btn btn-primary btn-cta">Book a meeting</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ELKION. All rights reserved.</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Security</a>
            <a href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
