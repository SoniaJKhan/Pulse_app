import React, { useState, useCallback, useEffect } from 'react'

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Google Business', 'Email']
const CONTENT_TYPES = ['Post', 'Reel / Video', 'Story', 'Carousel', 'Email Campaign']
const TONES = ['Inspiring', 'Educational', 'Friendly & Warm', 'Professional', 'Playful', 'Urgent / Promotional']
const GOALS = ['Drive Bookings', 'Brand Awareness', 'Community Engagement', 'Education', 'Promotion / Offer', 'Client Testimonials']
const IDEA_COUNTS = [5, 8, 12]

const TOOLS = [
  { id: 'caption',  label: 'Caption Writer',  desc: 'Generate platform-ready captions' },
  { id: 'ideas',    label: 'Ideas Generator', desc: 'Build a monthly content plan' },
  { id: 'hashtags', label: 'Hashtag Builder', desc: 'Generate tiered hashtag sets' },
  { id: 'brief',    label: 'Content Brief',   desc: 'Create a structured creative brief' },
  { id: 'images',   label: 'Image Library',   desc: 'Search Unsplash for free images' },
]

// ─── Mock generation ──────────────────────────────────────────────────────────

function generateCaption(bizName, platform, contentType, topic, tone) {
  const name = bizName || 'our studio'
  const t = topic || 'wellness'
  const emojis = { 'Inspiring': '✨', 'Educational': '💡', 'Friendly & Warm': '🌿', 'Professional': '📌', 'Playful': '🎉', 'Urgent / Promotional': '🚨' }
  const ctas = { Instagram: 'Book via the link in bio', Facebook: 'Click the button below to book', TikTok: 'Follow for more and drop a comment below', LinkedIn: 'Connect with us or send a DM to learn more', 'Google Business': 'Call us or book online today', Email: 'Click below to reserve your spot' }
  const em = emojis[tone] || '✨'
  const cta = ctas[platform] || 'Book now'
  const safeTopic = t.replace(/\s+/g, '').toLowerCase()
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const hashtagLine = { Instagram: `#wellness #${safeTopic} #selfcare #wellnessjourney #${safeName} #healthylifestyle #mindfulness`, Facebook: `#wellness #${safeTopic} #${safeName}`, TikTok: `#wellness #${safeTopic} #fyp #wellnesstok #healthylifestyle`, LinkedIn: `#wellness #health #${safeTopic} #wellbeing` }[platform] || ''
  const variants = {
    'Inspiring': [`${em} ${t} has the power to change everything.\n\nAt ${name}, we've seen first-hand how ${t} transforms not just how you look, but how you feel, move, and show up in the world.\n\nEvery session is an investment in the version of yourself you're working towards.\n\n${cta} 🌟\n\n${hashtagLine}`],
    'Educational': [`Did you know? ${t} can make a real difference in how you feel every day.\n\nHere are 3 things that might surprise you:\n\n1️⃣ It works on multiple levels — physical, mental, and emotional\n2️⃣ Consistency matters more than intensity\n3️⃣ The best results come when it's tailored to you\n\nAt ${name}, we personalise every experience. ${cta}. 💡\n\n${hashtagLine}`],
    'Friendly & Warm': [`Hey ${name} community! 🌿\n\nWe wanted to share something close to our hearts: ${t}.\n\nWe hear it all the time from our clients: "I wish I'd started sooner." Whether you're brand new or coming back after a break, there's no better time than now.\n\n${name} is your space — warm, welcoming, and completely judgement-free. ${cta} 💛\n\n${hashtagLine}`],
    'Professional': [`At ${name}, we approach ${t} with evidence-based precision and genuine client care.\n\nOur methodology is built on ongoing professional development, client-centred programmes, and measurable outcomes — because you deserve results that last.\n\n${cta} to discuss how we can support your goals.\n\n${hashtagLine}`],
    'Playful': [`Okay, can we just talk about ${t} for a second?! 😄\n\nBecause our clients at ${name} are absolutely obsessed — and honestly? We don't blame them.\n\nThe results speak for themselves, but more than that? The vibe. The community. The whole experience.\n\n${cta} — you won't regret it! 🎉\n\n${hashtagLine}`],
    'Urgent / Promotional': [`🚨 Heads up — this is time-sensitive.\n\nWe're opening up a limited number of ${t} spots this month, and we'd love to see you in one of them.\n\n✅ Personalised approach from day one\n✅ Welcoming, supportive environment\n✅ Real, lasting results\n\nSpots are limited. ${cta} before they're gone.\n\n${hashtagLine}`],
  }
  const pool = variants[tone] || variants['Inspiring']
  return pool[Math.floor(Math.random() * pool.length)]
}

function generateIdeas(bizName, bizType, theme, count) {
  const type = (bizType || '').toLowerCase()
  const banks = {
    yoga: [
      { idea: 'Instructor spotlight — share the story and training background of a key team member', type: 'Post', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: 'Morning yoga flow for beginners Reel — short, accessible, highly shareable', type: 'Reel', platform: 'Instagram + TikTok', priority: 'High' },
      { idea: '"A day in the studio" time-lapse Story series — give followers a behind-the-scenes look', type: 'Story', platform: 'Instagram', priority: 'Medium' },
      { idea: 'Educational carousel: 5 breathing techniques for stress relief', type: 'Carousel', platform: 'Instagram', priority: 'High' },
      { idea: 'Client transformation story (with permission) — before/after mindset and lifestyle', type: 'Post', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: '"What to expect at your first class" explainer — address fears and remove barriers', type: 'Reel', platform: 'Instagram + TikTok', priority: 'Medium' },
      { idea: 'Monthly schedule announcement with new class additions', type: 'Post', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: 'Instagram poll: What class do you want more of?', type: 'Story', platform: 'Instagram', priority: 'Medium' },
      { idea: 'Sound bath / restorative class teaser Reel with ASMR-style audio', type: 'Reel', platform: 'Instagram + TikTok', priority: 'Medium' },
      { idea: 'Local collab post with a complementary wellness brand', type: 'Post', platform: 'Instagram + Facebook', priority: 'Low' },
      { idea: 'Member of the month feature — build community and social proof', type: 'Post', platform: 'Instagram', priority: 'Medium' },
      { idea: '"5 reasons to try yoga if you\'ve always wanted to" — targeting first-time clients', type: 'Carousel', platform: 'Instagram', priority: 'Medium' },
    ],
    default: [
      { idea: 'Practitioner or team spotlight — introduce the face behind the brand', type: 'Post', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: 'Educational tip carousel relevant to your core service offering', type: 'Carousel', platform: 'Instagram', priority: 'High' },
      { idea: 'Client success story or testimonial — authentic and results-focused', type: 'Post', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: '"What to expect on your first visit" — removes barriers for new clients', type: 'Reel', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: 'FAQ Story series — answers your top 5 most common client questions', type: 'Story', platform: 'Instagram', priority: 'Medium' },
      { idea: 'Seasonal offer or promotion announcement', type: 'Post', platform: 'Instagram + Facebook', priority: 'High' },
      { idea: 'Behind the scenes content — builds trust and personality', type: 'Reel', platform: 'Instagram + TikTok', priority: 'Medium' },
      { idea: 'Community engagement post — poll, question, or challenge', type: 'Story', platform: 'Instagram', priority: 'Medium' },
      { idea: 'Partnership announcement with a complementary local business', type: 'Post', platform: 'Instagram + Facebook', priority: 'Low' },
      { idea: '"Why choose us" differentiator post — highlights your unique strengths', type: 'Post', platform: 'Instagram + Facebook', priority: 'Medium' },
      { idea: 'User-generated content re-share with credit — builds social proof', type: 'Post', platform: 'Instagram', priority: 'Low' },
      { idea: 'Educational explainer Reel — 30–60 seconds, your topic of expertise', type: 'Reel', platform: 'Instagram + TikTok', priority: 'Medium' },
    ],
  }
  let bank = banks.default
  if (type.includes('yoga') || type.includes('wellness') || type.includes('pilates') || type.includes('fitness')) bank = banks.yoga
  const shuffled = [...bank].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function generateHashtags(bizName, bizType, platform, location) {
  const type = (bizType || '').toLowerCase()
  const safeName = (bizName || 'studio').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const safeLoc  = (location || '').replace(/\s+/g, '').toLowerCase()
  const nicheTags = { yoga: ['#yogalife', '#yogapractice', '#yogainspiration', '#yogacommunity', '#yogateacher', '#wellnesslifestyle', '#mindfulmovement', '#yogaeveryday'], default: ['#wellness', '#wellnessjourney', '#healthyliving', '#selfcare', '#wellnesscommunity', '#holistichealth', '#wellnesslifestyle', '#mindfulness'] }
  const broadTags = { yoga: ['#wellness', '#selfcare', '#mindfulness', '#healthylifestyle', '#yogalove', '#wellbeing', '#holistichealth', '#movement'], default: ['#health', '#lifestyle', '#selfcare', '#wellbeing', '#healthy', '#mindfulness', '#inspiration', '#community'] }
  const key = type.includes('yoga') || type.includes('pilates') || type.includes('fitness') ? 'yoga' : 'default'
  const pm = { Instagram: { note: 'Instagram: use 8–15 hashtags. Mix niche, broad, and local for best reach.' }, Facebook: { note: 'Facebook: keep it to 3–5 hashtags max. Fewer is more effective here.' }, TikTok: { note: 'TikTok: 4–6 hashtags. Prioritise trending and niche tags over broad.' }, LinkedIn: { note: 'LinkedIn: 3–5 hashtags. Focus on professional and industry-specific tags.' }, default: { note: 'Use 5–10 hashtags. Mix niche and broad for optimal reach.' } }[platform] || { note: 'Use 5–10 hashtags.' }
  return {
    brand: [`#${safeName}`, safeLoc ? `#${safeLoc}${safeName}` : null].filter(Boolean),
    niche: nicheTags[key] || nicheTags.default,
    broad: broadTags[key] || broadTags.default,
    local: safeLoc ? [`#${safeLoc}`, `#${safeLoc}wellness`, `#${safeLoc}business`, `#${safeLoc}local`] : ['#localwellness', '#supportlocal', '#localbusiness', '#communityhealth'],
    platformNote: pm.note,
  }
}

function generateBrief(bizName, bizType, platform, contentType, goal, keyMessage) {
  const name = bizName || 'Client'
  const objectiveMap = { 'Drive Bookings': `Drive direct bookings via ${platform} by creating compelling, trust-building content that creates urgency.`, 'Brand Awareness': `Increase brand visibility in the ${(bizType||'wellness').toLowerCase()} market by showcasing ${name}'s personality and expertise.`, 'Community Engagement': `Build a loyal, engaged community around ${name} by encouraging genuine interaction and conversation.`, 'Education': `Position ${name} as the go-to authority by delivering valuable, actionable educational content.`, 'Promotion / Offer': `Drive conversions on a specific promotion by communicating the offer with clarity and urgency.`, 'Client Testimonials': `Build social proof through authentic client stories that help prospective clients see themselves in ${name}'s results.` }
  const creativeMap = { 'Reel / Video': 'Natural lighting, real environment. Show real people and genuine moments. Trending audio OR practitioner voiceover.', 'Carousel': 'Clean, on-brand slide design with consistent typography. Optimise for mobile readability.', 'Story': 'Casual, in-the-moment feel. Use interactive elements (polls, question boxes) to drive engagement.', 'Post': 'High-quality image with clear subject. On-brand colour palette. Caption does the heavy lifting.', 'Email Campaign': 'Clean, mobile-first template. Brand header image, clear hierarchy, single primary CTA button.' }
  const deliverables = { 'Reel / Video': '□ 30–60 second video edit (portrait 9:16 + square 1:1 crop)\n□ Thumbnail image\n□ Caption with hashtags', 'Carousel': '□ 5–8 slides (PNG exports, 1:1 ratio)\n□ Cover slide designed for feed preview\n□ Caption with hashtags', 'Story': '□ 1–3 story frames (9:16 ratio)\n□ Interactive element specifications\n□ Brief story caption or link overlay', 'Post': '□ Static image (1:1 and 4:5 crops)\n□ Caption with hashtags\n□ Alt text (accessibility)', 'Email Campaign': '□ HTML email template (mobile-first)\n□ Plain text fallback\n□ Subject line (+ 2 A/B test variants)' }[contentType] || '□ Creative asset\n□ Caption\n□ Hashtags'
  return `CONTENT BRIEF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCLIENT     ${name}\nPLATFORM   ${platform}\nFORMAT     ${contentType}\nGOAL       ${goal}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOBJECTIVE\n\n${objectiveMap[goal] || objectiveMap['Brand Awareness']}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nKEY MESSAGE\n\n${keyMessage || `${name} offers [specific transformation] for [target audience] in a [differentiating way].`}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCREATIVE DIRECTION\n\nVisual: ${creativeMap[contentType] || creativeMap['Post']}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDELIVERABLES\n\n${deliverables}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNOTES FOR CREATIVE TEAM\n\n• Keep brand colours and typography consistent with existing assets\n• All talent / client content must have written permission on file\n• Review caption for platform character limits before publishing\n• Submit for client approval before scheduling`
}

// ─── Brand Kit ────────────────────────────────────────────────────────────────

function BrandKit({ clientId }) {
  const storageKey = `pulse_brand_kit_${clientId}`
  const [kit, setKit] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {} } catch { return {} }
  })
  const [relevantInput, setRelevantInput] = useState('')
  const [offlimitInput, setOfflimitInput] = useState('')
  const [saved, setSaved] = useState(false)

  const update = (key, val) => setKit(k => ({ ...k, [key]: val }))

  const addTag = (key, input, setInput) => {
    const tag = input.trim()
    if (!tag) return
    const existing = kit[key] || []
    if (!existing.includes(tag)) update(key, [...existing, tag])
    setInput('')
  }

  const removeTag = (key, tag) => update(key, (kit[key] || []).filter(t => t !== tag))

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(kit))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={bk.wrap}>
      <div style={bk.header}>
        <div>
          <h3 style={bk.title}>Brand Kit</h3>
          <p style={bk.sub}>Saved brand identity — used to guide all content generation for this client.</p>
        </div>
        <button style={bk.saveBtn} onClick={save}>
          {saved ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
          ) : 'Save Brand Kit'}
        </button>
      </div>

      <div style={bk.grid}>
        {/* Colours */}
        <div style={bk.field}>
          <label style={bk.label}>Primary Colour</label>
          <div style={bk.colourRow}>
            <input
              type="color"
              style={bk.colourPicker}
              value={kit.primaryColor || '#C4874A'}
              onChange={e => update('primaryColor', e.target.value)}
            />
            <input
              type="text"
              style={{ ...bk.textInput, flex: 1 }}
              value={kit.primaryColor || '#C4874A'}
              onChange={e => update('primaryColor', e.target.value)}
              placeholder="#C4874A"
            />
          </div>
        </div>

        <div style={bk.field}>
          <label style={bk.label}>Secondary Colour</label>
          <div style={bk.colourRow}>
            <input
              type="color"
              style={bk.colourPicker}
              value={kit.secondaryColor || '#4A7C5C'}
              onChange={e => update('secondaryColor', e.target.value)}
            />
            <input
              type="text"
              style={{ ...bk.textInput, flex: 1 }}
              value={kit.secondaryColor || '#4A7C5C'}
              onChange={e => update('secondaryColor', e.target.value)}
              placeholder="#4A7C5C"
            />
          </div>
        </div>

        {/* Brand Voice */}
        <div style={{ ...bk.field, gridColumn: '1 / -1' }}>
          <label style={bk.label}>Brand Voice</label>
          <textarea
            style={{ ...bk.textInput, minHeight: '64px', resize: 'vertical' }}
            value={kit.brandVoice || ''}
            onChange={e => update('brandVoice', e.target.value)}
            placeholder="e.g. Warm, professional, and empowering. We speak to our clients like trusted friends who happen to be wellness experts."
          />
        </div>

        {/* Relevant Topics */}
        <div style={bk.field}>
          <label style={bk.label}>Relevant Topics</label>
          <div style={bk.tagInput}>
            <input
              type="text"
              style={bk.tagTextInput}
              value={relevantInput}
              onChange={e => setRelevantInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag('relevantTopics', relevantInput, setRelevantInput)}
              placeholder="Type topic, press Enter"
            />
            <button style={bk.addTagBtn} onClick={() => addTag('relevantTopics', relevantInput, setRelevantInput)}>+</button>
          </div>
          <div style={bk.tags}>
            {(kit.relevantTopics || []).map(tag => (
              <span key={tag} style={bk.tag}>
                {tag}
                <button style={bk.removeTag} onClick={() => removeTag('relevantTopics', tag)}>×</button>
              </span>
            ))}
            {(kit.relevantTopics || []).length === 0 && (
              <span style={bk.tagPlaceholder}>No topics added yet</span>
            )}
          </div>
        </div>

        {/* Off-limit Topics */}
        <div style={bk.field}>
          <label style={bk.label}>Off-Limit Topics</label>
          <div style={bk.tagInput}>
            <input
              type="text"
              style={bk.tagTextInput}
              value={offlimitInput}
              onChange={e => setOfflimitInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag('offlimitTopics', offlimitInput, setOfflimitInput)}
              placeholder="Type topic, press Enter"
            />
            <button style={bk.addTagBtn} onClick={() => addTag('offlimitTopics', offlimitInput, setOfflimitInput)}>+</button>
          </div>
          <div style={bk.tags}>
            {(kit.offlimitTopics || []).map(tag => (
              <span key={tag} style={{ ...bk.tag, background: 'rgba(196,80,58,0.1)', color: '#C4503A' }}>
                {tag}
                <button style={{ ...bk.removeTag, color: '#C4503A' }} onClick={() => removeTag('offlimitTopics', tag)}>×</button>
              </span>
            ))}
            {(kit.offlimitTopics || []).length === 0 && (
              <span style={bk.tagPlaceholder}>No off-limit topics added</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const bk = {
  wrap: { borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', gap: '12px', flexWrap: 'wrap' },
  title: { fontSize: '14px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '2px' },
  sub: { fontSize: '12px', color: 'var(--mid-grey)', margin: 0 },
  saveBtn: {
    padding: '6px 14px', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '5px',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '0 20px 18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  colourRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  colourPicker: { width: '36px', height: '36px', border: '1.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer', padding: '2px' },
  textInput: {
    padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '13px', color: 'var(--dark)', background: 'var(--bg-card)',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
  },
  tagInput: { display: 'flex', gap: '6px' },
  tagTextInput: {
    flex: 1, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '12.5px', color: 'var(--dark)', background: 'var(--bg-card)',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
  },
  addTagBtn: {
    width: '30px', height: '30px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '5px', minHeight: '28px' },
  tag: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'rgba(196,135,74,0.12)', color: 'var(--accent)',
    fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
  },
  removeTag: {
    background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
    fontSize: '14px', lineHeight: 1, padding: '0 1px', fontWeight: 700,
  },
  tagPlaceholder: { fontSize: '12px', color: 'var(--mid-grey)', fontStyle: 'italic' },
}

// ─── Image Library ────────────────────────────────────────────────────────────

function ImageLibrary({ onUseImage }) {
  const [query, setQuery] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasKey] = useState(() => !!localStorage.getItem('pulse_unsplash_key'))
  const [usedId, setUsedId] = useState(null)

  const search = async () => {
    const key = localStorage.getItem('pulse_unsplash_key')
    if (!key || !query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=${key}`)
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setImages(data.results || [])
      if ((data.results || []).length === 0) setError('No results found. Try a different search term.')
    } catch (e) {
      setError('Could not reach Unsplash. Check your API key in Settings.')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  if (!hasKey) {
    return (
      <div style={il.empty}>
        <span style={{ fontSize: '36px', marginBottom: '12px' }}>🖼️</span>
        <p style={il.emptyTitle}>Image library not configured</p>
        <p style={il.emptySub}>Add your Unsplash API key in Settings to enable the image library and search 3M+ free photos directly in the AI Studio.</p>
        <a href="#settings" style={il.settingsLink} onClick={e => e.preventDefault()}>→ Go to Settings → Connected Platforms</a>
      </div>
    )
  }

  return (
    <div style={il.wrap}>
      <div style={il.searchRow}>
        <input
          type="text"
          style={il.searchInput}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search Unsplash — e.g. yoga studio, healthy food, spa…"
        />
        <button style={il.searchBtn} onClick={search} disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && <p style={{ padding: '10px 20px', fontSize: '13px', color: 'var(--red)' }}>{error}</p>}

      {images.length === 0 && !loading && !error && (
        <div style={il.emptySearch}>
          <span style={{ fontSize: '30px', marginBottom: '8px' }}>🔍</span>
          <p style={{ fontSize: '13px', color: 'var(--mid-grey)' }}>Search above to browse Unsplash photos for your content.</p>
        </div>
      )}

      {images.length > 0 && (
        <div style={il.grid}>
          {images.map(img => (
            <div key={img.id} style={il.imgCard}>
              <img src={img.urls.small} alt={img.alt_description || img.description || 'photo'} style={il.img} />
              <div style={il.imgOverlay}>
                <button
                  style={{ ...il.useBtn, ...(usedId === img.id ? il.usedBtn : {}) }}
                  onClick={() => {
                    setUsedId(img.id)
                    if (onUseImage) onUseImage(img)
                  }}
                >
                  {usedId === img.id ? '✓ Used' : 'Use This Image'}
                </button>
              </div>
              {img.user?.name && (
                <p style={il.credit}>Photo by {img.user.name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const il = {
  wrap: { display: 'flex', flexDirection: 'column', minHeight: '400px' },
  searchRow: { display: 'flex', gap: '10px', padding: '18px 20px', borderBottom: '1px solid var(--border)' },
  searchInput: {
    flex: 1, padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '13.5px', color: 'var(--dark)', background: 'var(--bg-card)',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
  },
  searchBtn: {
    padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '18px 20px', overflowY: 'auto', flex: 1 },
  imgCard: { position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
  img: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' },
  imgOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(26,26,26,0)', display: 'flex',
    alignItems: 'flex-end', justifyContent: 'center', padding: '10px',
    transition: 'background 0.2s', opacity: 0,
    '&:hover': { background: 'rgba(26,26,26,0.4)', opacity: 1 },
  },
  useBtn: {
    padding: '6px 14px', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  usedBtn: { background: '#4A7C5C' },
  credit: { position: 'absolute', bottom: '4px', left: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.5)' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '60px 24px', textAlign: 'center',
  },
  emptyTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Libre Baskerville', serif", marginBottom: '8px' },
  emptySub: { fontSize: '13.5px', color: 'var(--mid-grey)', maxWidth: '380px', lineHeight: 1.6, marginBottom: '16px' },
  settingsLink: { fontSize: '13px', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' },
  emptySearch: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' },
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const fLabel = { fontSize: '11.5px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }
const fInput = { width: '100%', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', color: 'var(--dark)', fontFamily: "'Outfit', sans-serif", background: 'var(--bg-card)', boxSizing: 'border-box', outline: 'none' }

function Field({ label, children }) {
  return <div><label style={fLabel}>{label}</label>{children}</div>
}

function Select({ value, onChange, options }) {
  return (
    <select style={fInput} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: copied ? 'rgba(74,124,92,0.1)' : 'none', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '7px 13px', fontSize: '12.5px', fontWeight: 600, color: copied ? '#4A7C5C' : 'var(--mid-grey)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s' }}>
      {copied ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  )
}

function GenerateButton({ onClick, loading }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', background: loading ? 'rgba(196,135,74,0.6)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13.5px', fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: "'Outfit', sans-serif" }}>
      {loading ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.9s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Generating…</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Generate with AI</>}
    </button>
  )
}

function EmptyOutput({ toolLabel }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: '10px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(196,135,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--mid-grey)', margin: 0, maxWidth: '220px', lineHeight: 1.5 }}>
        Fill in the inputs and click <strong>Generate with AI</strong> to see your {toolLabel.toLowerCase()} here.
      </p>
    </div>
  )
}

// ─── Tool Panels ──────────────────────────────────────────────────────────────

function CaptionTool({ client, loading, onGenerate, output, onAddToCalendar }) {
  const [platform, setPlatform] = useState('Instagram')
  const [contentType, setContentType] = useState('Post')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Inspiring')
  const charCount = output?.length || 0
  const charLimit = platform === 'Instagram' ? 2200 : platform === 'TikTok' ? 2200 : platform === 'LinkedIn' ? 3000 : null
  return (
    <div style={s.twoPanel}>
      <div style={s.inputPanel}>
        <p style={s.toolDesc}>Generate a platform-ready caption based on your topic and desired tone. Tailored to {client.businessName}.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Platform"><Select value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
          <Field label="Content Type"><Select value={contentType} onChange={setContentType} options={CONTENT_TYPES} /></Field>
          <Field label="Topic / Subject *">
            <input type="text" style={fInput} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. spring yoga schedule, new treatment, team intro" />
          </Field>
          <Field label="Tone">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {TONES.map(t => (
                <button key={t} type="button" onClick={() => setTone(t)} style={{ padding: '5px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", border: `1.5px solid ${tone === t ? 'var(--accent)' : 'var(--border)'}`, background: tone === t ? 'rgba(196,135,74,0.1)' : 'transparent', color: tone === t ? 'var(--accent)' : 'var(--mid-grey)' }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <GenerateButton loading={loading} onClick={() => onGenerate(generateCaption(client.businessName, platform, contentType, topic, tone))} />
        </div>
      </div>
      <div style={s.outputPanel}>
        {output ? (
          <>
            <div style={s.outputHeader}>
              <span style={{ fontSize: '12px', color: 'var(--mid-grey)', fontWeight: 500 }}>
                {charCount.toLocaleString()} chars{charLimit && <span style={{ color: charCount > charLimit ? 'var(--red)' : 'inherit' }}> / {charLimit.toLocaleString()} limit</span>}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CopyButton text={output} />
                <button type="button" onClick={() => onAddToCalendar({ platform, contentType, caption: output })} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 13px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add to Calendar
                </button>
              </div>
            </div>
            <textarea readOnly value={output} style={{ ...fInput, flex: 1, resize: 'none', lineHeight: 1.65, background: 'var(--bg)', fontSize: '13px', minHeight: '320px' }} />
          </>
        ) : <EmptyOutput toolLabel="Caption" />}
      </div>
    </div>
  )
}

function IdeasTool({ client, loading, onGenerate, output }) {
  const [theme, setTheme] = useState('')
  const [count, setCount] = useState(8)
  return (
    <div style={s.twoPanel}>
      <div style={s.inputPanel}>
        <p style={s.toolDesc}>Generate a set of ready-to-use content ideas for {client.businessName}'s content plan.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Monthly Theme (optional)">
            <input type="text" style={fInput} value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. spring refresh, mental health awareness" />
          </Field>
          <Field label="Number of Ideas">
            <div style={{ display: 'flex', gap: '8px' }}>
              {IDEA_COUNTS.map(n => (
                <button key={n} type="button" onClick={() => setCount(n)} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", border: `1.5px solid ${count === n ? 'var(--accent)' : 'var(--border)'}`, background: count === n ? 'rgba(196,135,74,0.1)' : 'transparent', color: count === n ? 'var(--accent)' : 'var(--mid-grey)' }}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <GenerateButton loading={loading} onClick={() => onGenerate(generateIdeas(client.businessName, client.businessType, theme, count))} />
        </div>
      </div>
      <div style={s.outputPanel}>
        {output && output.length > 0 ? (
          <>
            <div style={s.outputHeader}>
              <span style={{ fontSize: '12px', color: 'var(--mid-grey)', fontWeight: 500 }}>{output.length} idea{output.length !== 1 ? 's' : ''} generated</span>
              <CopyButton text={output.map((r, i) => `${i + 1}. ${r.idea}\n   Type: ${r.type} · Platform: ${r.platform} · Priority: ${r.priority}`).join('\n\n')} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {output.map((row, i) => {
                const pc = { High: { bg: 'rgba(74,124,92,0.1)', color: '#4A7C5C' }, Medium: { bg: 'rgba(196,135,74,0.12)', color: '#C4874A' }, Low: { bg: 'rgba(138,132,128,0.1)', color: '#8A8480' } }[row.priority] || {}
                return (
                  <div key={i} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(196,135,74,0.1)', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13.5px', color: 'var(--dark)', margin: '0 0 7px', lineHeight: 1.5 }}>{row.idea}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '10px' }}>{row.type}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(138,132,128,0.1)', color: '#8A8480', padding: '2px 8px', borderRadius: '10px' }}>{row.platform}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, background: pc.bg, color: pc.color, padding: '2px 8px', borderRadius: '10px' }}>{row.priority} priority</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : <EmptyOutput toolLabel="Content Ideas" />}
      </div>
    </div>
  )
}

function HashtagTool({ client, loading, onGenerate, output }) {
  const [platform, setPlatform] = useState('Instagram')
  const [location, setLocation] = useState('')
  const allTags = output ? [...output.brand, ...output.niche, ...output.broad, ...output.local].join(' ') : ''
  return (
    <div style={s.twoPanel}>
      <div style={s.inputPanel}>
        <p style={s.toolDesc}>Generate a tiered hashtag strategy for {client.businessName} — brand, niche, broad, and local tags.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Platform"><Select value={platform} onChange={setPlatform} options={PLATFORMS.filter(p => p !== 'Email')} /></Field>
          <Field label="Location (optional)">
            <input type="text" style={fInput} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Melbourne, Sydney, Brisbane" />
          </Field>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <GenerateButton loading={loading} onClick={() => onGenerate(generateHashtags(client.businessName, client.businessType, platform, location))} />
        </div>
      </div>
      <div style={s.outputPanel}>
        {output ? (
          <>
            <div style={s.outputHeader}>
              <span style={{ fontSize: '12px', color: 'var(--mid-grey)', fontWeight: 500 }}>{[...output.brand, ...output.niche, ...output.broad, ...output.local].length} tags total</span>
              <CopyButton text={allTags} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {output.platformNote && (
                <div style={{ margin: '12px 18px 4px', padding: '10px 14px', background: 'rgba(196,135,74,0.07)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                  <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, margin: 0 }}>{output.platformNote}</p>
                </div>
              )}
              {[
                { label: 'Brand', tags: output.brand, color: '#7C3AED', bg: '#F5F3FF' },
                { label: 'Niche', tags: output.niche, color: '#2563EB', bg: '#EFF6FF' },
                { label: 'Broad', tags: output.broad, color: 'var(--mid-grey)', bg: 'rgba(138,132,128,0.1)' },
                { label: 'Local', tags: output.local, color: '#4A7C5C', bg: 'rgba(74,124,92,0.1)' },
              ].map(group => (
                <div key={group.label} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{group.label} Tags</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {group.tags.map(tag => (
                      <span key={tag} style={{ background: group.bg, color: group.color, fontSize: '12.5px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ padding: '14px 18px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Full Set (copy-ready)</p>
                <p style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.8, margin: 0 }}>{allTags}</p>
              </div>
            </div>
          </>
        ) : <EmptyOutput toolLabel="Hashtags" />}
      </div>
    </div>
  )
}

function BriefTool({ client, loading, onGenerate, output }) {
  const [platform, setPlatform] = useState('Instagram')
  const [contentType, setContentType] = useState('Post')
  const [goal, setGoal] = useState('Drive Bookings')
  const [keyMessage, setKeyMessage] = useState('')
  return (
    <div style={s.twoPanel}>
      <div style={s.inputPanel}>
        <p style={s.toolDesc}>Generate a full structured content brief ready to hand off to your creative team.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Platform"><Select value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
          <Field label="Content Format"><Select value={contentType} onChange={setContentType} options={CONTENT_TYPES} /></Field>
          <Field label="Campaign Goal"><Select value={goal} onChange={setGoal} options={GOALS} /></Field>
          <Field label="Key Message (optional)">
            <textarea style={{ ...fInput, minHeight: '72px', resize: 'vertical' }} value={keyMessage} onChange={e => setKeyMessage(e.target.value)} placeholder={`e.g. ${client.businessName} helps clients feel their best through personalised care`} />
          </Field>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <GenerateButton loading={loading} onClick={() => onGenerate(generateBrief(client.businessName, client.businessType, platform, contentType, goal, keyMessage))} />
        </div>
      </div>
      <div style={s.outputPanel}>
        {output ? (
          <>
            <div style={s.outputHeader}>
              <span style={{ fontSize: '12px', color: 'var(--mid-grey)', fontWeight: 500 }}>Content brief ready</span>
              <CopyButton text={output} />
            </div>
            <textarea readOnly value={output} style={{ ...fInput, flex: 1, resize: 'none', lineHeight: 1.65, background: 'var(--bg)', fontSize: '12.5px', fontFamily: 'monospace', minHeight: '360px' }} />
          </>
        ) : <EmptyOutput toolLabel="Content Brief" />}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AIStudio({ client, onAddContent, onSwitchToCalendar }) {
  const [activeTool, setActiveTool] = useState('caption')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState({ caption: null, ideas: null, hashtags: null, brief: null })

  const handleGenerate = useCallback((toolId, result) => {
    setLoading(true)
    setTimeout(() => { setOutputs(prev => ({ ...prev, [toolId]: result })); setLoading(false) }, 900)
  }, [])

  const handleAddToCalendar = useCallback(({ platform, contentType, caption }) => {
    const platformMap = { 'Reel / Video': 'Reel', 'Carousel': 'Post' }
    onAddContent({ clientId: client.id, platforms: [platform], contentType: platformMap[contentType] || contentType, caption, status: 'Draft', scheduledDate: '', scheduledTime: '', clientApproval: 'Awaiting Review', visualDirection: '' })
    onSwitchToCalendar()
  }, [client.id, onAddContent, onSwitchToCalendar])

  return (
    <div>
      {/* Studio header */}
      <div style={s.studioHeader}>
        <div>
          <h3 style={s.studioTitle}>AI Studio</h3>
          <p style={s.studioSub}>Content tools for {client.businessName}</p>
        </div>
        <div style={s.betaBadge}>Beta</div>
      </div>

      {/* Brand Kit */}
      <BrandKit clientId={client.id} />

      {/* Tool selector */}
      <div style={s.toolBar}>
        {TOOLS.map(tool => (
          <button key={tool.id} type="button" onClick={() => setActiveTool(tool.id)} style={{ ...s.toolBtn, ...(activeTool === tool.id ? s.toolBtnActive : {}) }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Tool content */}
      <div style={s.toolContent}>
        {activeTool === 'caption'  && <CaptionTool  client={client} loading={loading} onGenerate={r => handleGenerate('caption', r)}  output={outputs.caption}  onAddToCalendar={handleAddToCalendar} />}
        {activeTool === 'ideas'    && <IdeasTool    client={client} loading={loading} onGenerate={r => handleGenerate('ideas', r)}    output={outputs.ideas} />}
        {activeTool === 'hashtags' && <HashtagTool  client={client} loading={loading} onGenerate={r => handleGenerate('hashtags', r)} output={outputs.hashtags} />}
        {activeTool === 'brief'    && <BriefTool    client={client} loading={loading} onGenerate={r => handleGenerate('brief', r)}    output={outputs.brief} />}
        {activeTool === 'images'   && <ImageLibrary onUseImage={(img) => console.log('Image selected:', img.urls.full)} />}
      </div>
    </div>
  )
}

const s = {
  studioHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' },
  studioTitle: { fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: '0 0 2px', fontFamily: "'Libre Baskerville', serif" },
  studioSub: { fontSize: '12px', color: 'var(--mid-grey)', margin: 0 },
  betaBadge: { background: 'rgba(196,135,74,0.1)', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.05em' },
  toolBar: { display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg)', overflowX: 'auto' },
  toolBtn: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '11px 20px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", color: 'var(--mid-grey)', whiteSpace: 'nowrap', marginBottom: '-1px' },
  toolBtnActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  toolContent: { background: 'var(--bg-card)', minHeight: '400px' },
  twoPanel: { display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '460px' },
  inputPanel: { borderRight: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--bg)' },
  toolDesc: { fontSize: '12.5px', color: 'var(--mid-grey)', lineHeight: 1.55, margin: '0 0 18px' },
  outputPanel: { display: 'flex', flexDirection: 'column', minHeight: '460px' },
  outputHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)', gap: '10px', flexWrap: 'wrap', flexShrink: 0 },
}
