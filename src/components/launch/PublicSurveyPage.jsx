import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { getProjectBySlug, getCoLaunchProjects, recordSurveyResponseUniversal } from '../../services/opsApi'
import { trackVisit } from '../../services/tracker'
import { updatePageSEO } from '../../utils/seo'

const DEFAULT_ACCENT = '#c81e3c'

// Every colour on this page is derived from one accent value, so changing the project's
// brand colour (or falling back to the default) restyles the whole page with no other edits.
function buildAccent(input) {
  let hex = String(input || '').trim()
  if (/^#[0-9a-f]{3}$/i.test(hex)) hex = '#' + hex.slice(1).split('').map(c => c + c).join('')
  if (!/^#[0-9a-f]{6}$/i.test(hex)) hex = DEFAULT_ACCENT
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  const tint = v => Math.round(v + (255 - v) * 0.4)
  return {
    '--acc': hex,
    '--acc-soft': `rgba(${r},${g},${b},0.14)`,
    '--acc-line': `rgba(${r},${g},${b},0.45)`,
    '--acc-glow': `rgba(${r},${g},${b},0.32)`,
    '--acc-text': `rgb(${tint(r)},${tint(g)},${tint(b)})`,
    '--acc-ink': lum > 0.4 ? '#0a0c10' : '#ffffff',
  }
}

export default function PublicSurveyPage({ slug }) {
  const [project, setProject] = useState(null)
  const [respondentName, setRespondentName] = useState('')
  const [respondentEmail, setRespondentEmail] = useState('')
  const [answers, setAnswers] = useState({})
  const [intentRating, setIntentRating] = useState(8)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchProject = async () => {
      try {
        let fetched = null
        if (slug) {
          try {
            fetched = await getProjectBySlug(slug)
          } catch (e) {}
        }
        if (!fetched) {
          const all = await getCoLaunchProjects()
          const list = Array.isArray(all) ? all : all?.projects || []
          if (slug) {
            const clean = slug.toLowerCase().trim()
            fetched = list.find(p =>
              (p.slug && p.slug.toLowerCase() === clean) ||
              (p.productName && p.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean) ||
              (p.id === clean)
            )
          }
          if (!fetched && list.length > 0) {
            fetched = list[0]
          }
        }
        if (isMounted && fetched) {
          setProject(fetched)
        }
      } catch (err) {
        console.warn('[PublicSurveyPage] Project fetch notice:', err)
      }
    }

    fetchProject()
    trackVisit(`/survey/${slug || 'product'}`, updated => {
      if (isMounted && updated) setProject(prev => ({ ...(prev || {}), ...updated }))
    })

    return () => {
      isMounted = false
    }
  }, [slug])

  useEffect(() => {
    updatePageSEO({
      title: project?.productName ? `Audience Survey — ${project.productName} | CoLaunch` : "Audience Discovery & Research Survey | CoLaunch",
      description: "Help shape our next software product! Share your biggest workflow challenges in 60 seconds.",
      image: "/og-image.svg"
    });
  }, [project?.productName]);

  const productName = project?.productName || 'Software Product'
  const creatorName = project?.creatorName || 'Creator'
  const niche = project?.niche || 'Software Workflows'
  const brandColor = project?.brandColor || project?.brand_color || '#c81e3c'
  
  const rawQuestions = project?.surveyData?.questions ||
    project?.validationCampaign?.researchSurvey?.questions ||
    project?.validationCampaign?.research_survey?.questions ||
    project?.discoverySurvey?.questions

  const questions = (Array.isArray(rawQuestions) && rawQuestions.length > 0)
    ? rawQuestions
    : [
        {
          id: 'q1',
          category: 'Pain Point',
          question: `What is the single most frustrating bottleneck you face when managing ${niche}?`
        },
        {
          id: 'q2',
          category: 'Current Spend',
          question: `What tools or services do you currently pay for monthly? Approximately how much do you spend?`
        },
        {
          id: 'q3',
          category: 'Pricing Validation',
          question: `If ${productName} automates this completely, would a founding member price of $99/year provide positive ROI?`
        },
        {
          id: 'q4',
          category: 'Feature Wishlist',
          question: `What is the #1 must-have feature you need in ${productName} on day one?`
        }
      ]

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const responsePayload = {
        projectId: project?.id,
        slug: slug || project?.slug || project?.productName,
        name: respondentName.trim() || 'Community Member',
        email: respondentEmail.trim(),
        rating: intentRating,
        answers: answers
      }

      const updatedProject = await recordSurveyResponseUniversal(responsePayload)
      if (updatedProject) {
        setProject(updatedProject)
        try {
          window.dispatchEvent(new CustomEvent('forge_project_updated', { detail: updatedProject }))
        } catch (e) {}
      }
      setIsSubmitted(true)
    } catch (err) {
      console.error('Failed saving survey response to database:', err)
      setSubmitError('Your answers could not be saved. Check your connection and send them again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const accentVars = buildAccent(brandColor)
  const answeredCount = questions.filter(q => String(answers[q.id] || '').trim()).length
  const totalCount = questions.length
  const firstName = respondentName.trim().split(/\s+/)[0] || ''
  const preorderHref = `/preorder/${productName.toLowerCase().replace(/[^a-z0-9]/g, '')}`

  return (
    <div className="survey-root" style={accentVars}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .survey-root { min-height: 100vh; background: #07090e; color: #e8eaf0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .survey-root ::selection { background: var(--acc); color: var(--acc-ink); }
        .survey-root .serif { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -0.015em; }
        .sv-bar { position: sticky; top: 0; z-index: 10; background: rgba(7,9,14,.86); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,.07); }
        .sv-track { height: 2px; background: rgba(255,255,255,.08); }
        .sv-fill { height: 100%; background: var(--acc); transition: width .4s ease; }
        .sv-wrap { max-width: 40rem; margin: 0 auto; padding: 0 1.25rem; }
        .sv-muted { color: #98a0ae; }
        .sv-rail { position: relative; padding-left: 3rem; }
        .sv-rail::before { content: ''; position: absolute; left: 1rem; top: 2.25rem; bottom: -1.5rem; width: 1px; background: rgba(255,255,255,.1); }
        .sv-item:last-child .sv-rail::before { display: none; }
        .sv-dot { position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 600; background: #0c0e14; border: 1px solid rgba(255,255,255,.16); color: #98a0ae; transition: all .25s ease; }
        .sv-dot[data-done='true'] { background: var(--acc); border-color: var(--acc); color: var(--acc-ink); }
        .sv-field { width: 100%; background: #0c0e14; border: 1px solid rgba(255,255,255,.1); color: #fff; border-radius: .75rem; padding: .8rem 1rem; font-size: .95rem; line-height: 1.5; outline: none; transition: border-color .15s, box-shadow .15s; font-family: inherit; }
        .sv-field::placeholder { color: #667082; }
        .sv-field:focus { border-color: var(--acc); box-shadow: 0 0 0 3px var(--acc-soft); }
        .sv-scale { display: grid; grid-template-columns: repeat(10, 1fr); gap: .375rem; }
        .sv-pt { height: 2.75rem; border-radius: .625rem; background: #0c0e14; border: 1px solid rgba(255,255,255,.1); color: #aab1bf; font-weight: 600; font-size: .9rem; cursor: pointer; transition: all .15s; font-family: inherit; }
        .sv-pt:hover { border-color: var(--acc-line); color: #fff; }
        .sv-pt[aria-checked='true'] { background: var(--acc); border-color: var(--acc); color: var(--acc-ink); }
        .sv-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: .5rem; padding: .95rem 1.25rem; border-radius: .75rem; border: 0; background: var(--acc); color: var(--acc-ink); font-weight: 700; font-size: .95rem; cursor: pointer; box-shadow: 0 10px 28px -10px var(--acc-glow); transition: transform .1s, opacity .15s; font-family: inherit; }
        .sv-btn:hover { opacity: .92 }
        .sv-btn:active { transform: scale(.99) }
        .sv-btn:disabled { opacity: .5; cursor: default }
        .sv-ghost { padding: .7rem 1.1rem; border-radius: .75rem; border: 1px solid rgba(255,255,255,.14); background: transparent; color: #d7dbe4; font-weight: 600; font-size: .85rem; cursor: pointer; font-family: inherit; }
        .sv-ghost:hover { background: rgba(255,255,255,.05) }
        .survey-root :focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
        @keyframes sv-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        .sv-in { animation: sv-in .4s ease-out both }
        @media (prefers-reduced-motion: reduce) { .sv-in { animation: none } .sv-fill, .sv-dot { transition: none } }
        @media (max-width: 480px) { .sv-pt { height: 2.5rem; font-size: .8rem } .sv-scale { gap: .25rem } }
      `}</style>

      {/* Sticky progress */}
      <header className="sv-bar">
        <div className="sv-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--acc)' }} />
            {productName}
          </span>
          {!isSubmitted && (
            <span className="sv-muted" style={{ fontSize: '.8rem' }} aria-live="polite">
              {answeredCount} of {totalCount} answered
            </span>
          )}
        </div>
        <div className="sv-track" role="presentation">
          <div className="sv-fill" style={{ width: isSubmitted ? '100%' : `${(answeredCount / Math.max(1, totalCount)) * 100}%` }} />
        </div>
      </header>

      <main className="sv-wrap" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {isSubmitted ? (
          <section className="sv-in" style={{ paddingTop: '2rem' }}>
            <span style={{ width: 52, height: 52, borderRadius: 9999, background: 'var(--acc-soft)', border: '1px solid var(--acc-line)', color: 'var(--acc-text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={24} />
            </span>
            <h1 className="serif" style={{ fontSize: 'clamp(2.25rem, 7vw, 3.5rem)', lineHeight: 1.08, margin: '1.25rem 0 .75rem', color: '#fff' }}>
              {firstName ? `Thank you, ${firstName}.` : 'Thank you.'}
            </h1>
            <p style={{ color: '#c3c9d4', lineHeight: 1.65, maxWidth: '32rem', margin: 0 }}>
              Your answers were sent to {creatorName}. They help decide what {productName} does first.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '2rem' }}>
              <a href={preorderHref} className="sv-btn" style={{ width: 'auto', textDecoration: 'none' }}>
                See the founding pre-order page
              </a>
              <button
                type="button"
                className="sv-ghost"
                onClick={() => { setIsSubmitted(false); setAnswers({}) }}
              >
                Send another response
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="sv-in" style={{ marginBottom: '2.5rem' }}>
              <p className="sv-muted" style={{ margin: 0, fontSize: '.9rem' }}>
                From {creatorName}
              </p>
              <h1 className="serif" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: 1.05, margin: '.5rem 0 1rem', color: '#fff' }}>
                Help shape {productName}
              </h1>
              <p style={{ color: '#c3c9d4', lineHeight: 1.65, margin: 0, maxWidth: '34rem' }}>
                {creatorName} is building {productName} with the people who will use it. Your answers decide which features go into the first release.
              </p>
              <p className="sv-muted" style={{ margin: '1rem 0 0', fontSize: '.85rem' }}>
                {totalCount} questions, about 2 minutes. The first one is required.
              </p>
            </section>

            <form onSubmit={handleSubmit}>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '2rem' }}>
                {questions.map((q, idx) => {
                  const done = Boolean(String(answers[q.id] || '').trim())
                  const inputId = `sv-q-${q.id || idx}`
                  return (
                    <li key={q.id || idx} className="sv-item">
                      <div className="sv-rail">
                        <span className="sv-dot" data-done={done} aria-hidden="true">
                          {done ? <Check size={15} /> : idx + 1}
                        </span>
                        <label htmlFor={inputId} style={{ display: 'block' }}>
                          {q.category && (
                            <span className="sv-muted" style={{ display: 'block', fontSize: '.8rem', marginBottom: '.25rem' }}>
                              {q.category}{idx === 0 ? ', required' : ''}
                            </span>
                          )}
                          <span className="serif" style={{ display: 'block', fontSize: 'clamp(1.35rem, 4.5vw, 1.65rem)', lineHeight: 1.25, color: '#fff', marginBottom: '.75rem' }}>
                            {q.question}
                          </span>
                        </label>
                        <textarea
                          id={inputId}
                          rows={3}
                          required={idx === 0}
                          className="sv-field"
                          placeholder="Write what comes to mind. Specific examples help most."
                          value={answers[q.id] || ''}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </li>
                  )
                })}

                {/* Excitement scale */}
                <li className="sv-item">
                  <div className="sv-rail">
                    <span className="sv-dot" data-done="true" aria-hidden="true"><Check size={15} /></span>
                    <p id="sv-rating-label" className="serif" style={{ fontSize: 'clamp(1.35rem, 4.5vw, 1.65rem)', lineHeight: 1.25, color: '#fff', margin: '0 0 .75rem' }}>
                      How excited are you to use {productName}?
                    </p>
                    <div className="sv-scale" role="radiogroup" aria-labelledby="sv-rating-label">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                          key={num}
                          type="button"
                          role="radio"
                          aria-checked={intentRating === num}
                          className="sv-pt"
                          onClick={() => setIntentRating(num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="sv-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginTop: '.6rem' }}>
                      <span>Not interested</span>
                      <span>Need it on day one</span>
                    </div>
                  </div>
                </li>
              </ol>

              {/* Contact */}
              <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                <h2 className="serif" style={{ fontSize: '1.75rem', margin: '0 0 .35rem', color: '#fff' }}>Where should we send your invite?</h2>
                <p className="sv-muted" style={{ margin: '0 0 1.25rem', fontSize: '.9rem' }}>
                  Everyone who answers gets priority access to the founding offer.
                </p>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
                  <div>
                    <label htmlFor="sv-name" style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.4rem', color: '#d7dbe4' }}>Your name</label>
                    <input
                      id="sv-name"
                      type="text"
                      required
                      autoComplete="name"
                      className="sv-field"
                      placeholder="First and last name"
                      value={respondentName}
                      onChange={e => setRespondentName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="sv-email" style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.4rem', color: '#d7dbe4' }}>Your email</label>
                    <input
                      id="sv-email"
                      type="email"
                      required
                      autoComplete="email"
                      className="sv-field"
                      placeholder="you@email.com"
                      value={respondentEmail}
                      onChange={e => setRespondentEmail(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {submitError && (
                <p role="alert" style={{ margin: '1.25rem 0 0', padding: '.75rem 1rem', borderRadius: '.75rem', background: 'rgba(255,90,90,.1)', border: '1px solid rgba(255,90,90,.35)', color: '#ffb3b3', fontSize: '.9rem' }}>
                  {submitError}
                </p>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" disabled={isSubmitting} className="sv-btn">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending</span>
                    </>
                  ) : (
                    <span>Send my answers</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        <footer className="sv-muted" style={{ marginTop: '3rem', fontSize: '.8rem' }}>
          Powered by CoLaunch
        </footer>
      </main>
    </div>
  )
}
