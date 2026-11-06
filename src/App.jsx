import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Check,
  ChevronDown, Clock3, Compass, Cpu, Filter, Heart, MapPin, Menu, Music2, Palette,
  Search, Sparkles, Ticket, Trophy, X, BriefcaseBusiness, GraduationCap, Building2,
  Paintbrush, Mic2,
} from 'lucide-react'
import { events, categories } from './data/events'

const categoryIcons = { Sparkles, Cpu, Music2, Trophy, BriefcaseBusiness, GraduationCap, Palette, Building2, Paintbrush, Mic2 }
const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('evently-theme') || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('evently-theme', theme)
  }, [theme])
  return [theme, () => setTheme(theme === 'light' ? 'dark' : 'light')]
}

function readBookings() {
  try {
    const saved = JSON.parse(localStorage.getItem('evently-bookings') || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    console.warn('Saved Evently registrations could not be read from local storage.')
    return []
  }
}

function App() {
  const [theme, toggleTheme] = useTheme()
  const [bookings, setBookings] = useState(readBookings)
  const saveBooking = (booking) => {
    const next = [booking, ...readBookings()]
    localStorage.setItem('evently-bookings', JSON.stringify(next))
    setBookings(next)
  }
  return (
    <div className="app-shell">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/events" element={<PageTransition><Explore /></PageTransition>} />
            <Route path="/events/:id" element={<PageTransition><EventDetails /></PageTransition>} />
            <Route path="/register/:id" element={<PageTransition><Register saveBooking={saveBooking} /></PageTransition>} />
            <Route path="/registrations" element={<PageTransition><MyRegistrations bookings={bookings} /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

function PageTransition({ children }) {
  const reduced = useReducedMotion()
  return <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>{children}</motion.div>
}

function Header({ theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMenuOpen(false), [location.pathname])
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" to="/" aria-label="Evently home"><span className="brand-mark"><Sparkles size={18} /></span><span>evently<span className="brand-dot">.</span></span></Link>
        <button className="mobile-menu icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink><NavLink to="/events">Explore events</NavLink><NavLink to="/registrations">My registrations</NavLink>
        </nav>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title="Toggle color theme"><span>{theme === 'light' ? '☾' : '☀'}</span></button>
          <Link className="button button-primary button-small nav-cta" to="/events">Find an event <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div><Link className="brand footer-brand" to="/"><span className="brand-mark"><Sparkles size={17} /></span><span>evently<span className="brand-dot">.</span></span></Link><p>Make room for your next great memory.</p></div>
        <div className="footer-links"><Link to="/events">Explore events</Link><Link to="/registrations">My registrations</Link><a href="mailto:hello@evently.example">Get in touch</a></div>
        <div className="footer-note"><span className="status-dot" /> Made for moments that matter</div>
      </div>
      <div className="footer-bottom"><span>© 2026 Evently. Made with intention.</span><span>Independent events. Real connections.</span></div>
    </footer>
  )
}

function EventCard({ event, index = 0 }) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.article className="event-card" initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.24) }}>
      <Link to={`/events/${event.id}`} className="event-image-link" aria-label={`View ${event.title}`}>
        <EventImage className="event-image" src={event.image} alt={`${event.title} event`} loading="lazy" />
        <span className="image-category">{event.category}</span>
      </Link>
      <div className="event-card-body">
        <div className="event-date"><CalendarDays size={14} /> {dateFormatter.format(new Date(event.date))}<span className="date-separator">·</span>{event.time.split('–')[0].trim()}</div>
        <Link to={`/events/${event.id}`} className="event-card-title">{event.title}</Link>
        <p className="event-description">{event.description}</p>
        <p className="event-location"><MapPin size={14} />{event.venue}</p>
        <div className="event-card-bottom"><span className="event-price">from {event.price}</span><Link to={`/events/${event.id}`} className="button button-outline">View details <ArrowRight size={14} /></Link></div>
      </div>
    </motion.article>
  )
}

function EventImage({ src, alt, className, loading = 'lazy' }) {
  const [failed, setFailed] = useState(false)
  return <img className={className} src={failed ? '/event-fallback.svg' : src} alt={alt} loading={loading} onError={(event) => {
    if (failed) event.currentTarget.onerror = null
    else setFailed(true)
  }} />
}

function FeaturedBanner({ event }) {
  return (
    <article className="featured-banner">
      <Link to={`/events/${event.id}`} className="featured-banner-image" aria-label={`Explore ${event.title}`}>
        <EventImage src={event.image} alt={`${event.title} event`} />
        <span className="featured-label"><Sparkles size={14} /> FEATURED EVENT</span>
      </Link>
      <div className="featured-banner-copy">
        <span className="eyebrow">{event.category} <span className="feature-divider">/</span> {event.city}</span>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div className="featured-meta"><span><CalendarDays size={15} />{dateFormatter.format(new Date(event.date))} · {event.time.split('–')[0].trim()}</span><span><MapPin size={15} />{event.venue}</span></div>
        <Link className="button button-primary" to={`/events/${event.id}`}>Explore this event <ArrowRight size={15} /></Link>
      </div>
    </article>
  )
}

function SectionHeading({ eyebrow, title, copy, link, linkText = 'Explore all events' }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{link && <Link className="text-link heading-link" to={link}>{linkText}<ArrowRight size={15} /></Link>}</div>
}

function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const featured = events.find((event) => event.featured)
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> YOUR NEXT GREAT STORY STARTS HERE</span>
          <h1>Discover Experiences.<br /><span>Create Memories.</span></h1>
          <p>Find extraordinary events, connect with people and experience moments worth remembering.</p>
          <div className="hero-actions"><Link className="button button-primary" to="/events">Explore events <ArrowRight size={16} /></Link><a className="button button-outline" href="#featured">Discover more <ArrowUpRight size={15} /></a></div>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/events${query ? `?q=${encodeURIComponent(query)}` : ''}`) }}>
            <Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search events" placeholder="Looking for something in particular?" /><button className="search-submit" type="submit" aria-label="Search events"><ArrowRight size={17} /></button>
          </form>
          <div className="hero-social-proof"><div className="avatar-stack"><span>R</span><span>A</span><span>M</span><span>S</span></div><div><strong>Good company, guaranteed.</strong><small>Join 2,400+ curious people</small></div><div className="proof-stars" aria-label="5 out of 5 stars">★★★★★</div></div>
        </div>
        <div className="hero-art">
          <div className="hero-image-frame"><EventImage src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=88" alt="A crowd enjoying a live outdoor event at sunset" loading="eager" /></div>
          <div className="hero-photo-caption"><span>MAKE THE MOMENT</span><span>01 — {String(events.length).padStart(2, '0')}</span></div>
          <div className="hero-photo-note"><span className="note-icon"><CalendarDays size={16} /></span><div><strong>Good things are happening</strong><small>Find your next favourite moment</small></div></div>
        </div>
      </section>

      <section className="featured-section section-pad" id="featured">
        <SectionHeading eyebrow="A GOOD PLACE TO START" title="Plans worth getting excited about" copy="A few special things coming up, picked with you in mind." link="/events" />
        <FeaturedBanner event={featured} />
      </section>

      <section className="category-section section-pad">
        <SectionHeading eyebrow="FOLLOW YOUR CURIOSITY" title="A little something for everyone" copy="Whatever you’re into, there’s a place for you here." />
        <div className="category-grid">{categories.slice(1).map((category) => { const Icon = categoryIcons[category.icon]; return <Link key={category.name} to={`/events?category=${category.name}`} className={`category-tile tone-${category.tone}`}><span className="category-icon"><Icon size={20} /></span><span>{category.name}</span><ArrowUpRight className="category-arrow" size={16} /><small>{events.filter((e) => e.category === category.name).length} hand-picked event</small></Link> })}</div>
      </section>

      <section className="why-section section-pad"><div className="why-intro"><span className="eyebrow">WHY EVENTLY</span><h2>More than a date<br />on the calendar.</h2><p>We make finding your next great experience feel as good as being there.</p></div><div className="why-points"><article><span>01</span><div><h3>Chosen with care</h3><p>Thoughtful gatherings, hand-picked for the moments and people that matter.</p></div></article><article><span>02</span><div><h3>Made for connection</h3><p>Discover fresh ideas, meet like-minded people, and feel part of something.</p></div></article><article><span>03</span><div><h3>Easy to say yes</h3><p>Find the details you need and save your spot in just a few simple steps.</p></div></article></div></section>

      <section className="numbers-strip"><div className="numbers-inner"><div><strong>2.4k<span>+</span></strong><small>curious attendees</small></div><div><strong>36</strong><small>moments made</small></div><div><strong>12</strong><small>cities & counting</small></div><p>Not just events.<br /><em>Good things happening.</em></p></div></section>

      <section className="upcoming-section section-pad"><SectionHeading eyebrow="MAKE A DATE WITH YOURSELF" title="Coming up soon" copy="Clear your calendar. These are the ones you’ll be glad you went to." link="/events" />      <div className="event-grid">{events.filter((event) => event.id !== featured.id).slice(0, 3).map((event, i) => <EventCard key={event.id} event={event} index={i} />)}</div></section>

      <CountdownFeature event={events[1]} />

      <section className="about-section section-pad"><div className="about-photo"><EventImage src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=85" alt="Friends connecting and laughing together at an event" /><span className="photo-caption"><Heart size={15} fill="currentColor" /> The best part is who you meet.</span></div><div className="about-copy"><span className="eyebrow">A LITTLE ABOUT US</span><h2>Life happens<br />between the plans.</h2><p>We think the best stories start when you say yes to something new. Evently brings thoughtful people and wonderful experiences a little closer together.</p><p>No endless scrolling. No “maybe next time.” Just good events, picked with care, and a gentle nudge to show up.</p><Link className="text-link" to="/events">Find your next thing <ArrowRight size={15} /></Link><div className="about-signoff">See you out there, <span>Team Evently <Sparkles size={15} /></span></div></div></section>

      <section className="cta-section"><div><span className="eyebrow">YOUR PEOPLE ARE OUT THERE</span><h2>Make a little room<br />for something wonderful.</h2><p>Pick a plan. Bring a friend. See what happens.</p></div><Link className="button button-white" to="/events">Find your next event <ArrowRight size={16} /></Link></section>
    </>
  )
}

function Countdown({ date }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(date).getTime() - Date.now()))
  useEffect(() => {
    const id = window.setInterval(() => setRemaining(Math.max(0, new Date(date).getTime() - Date.now())), 1000)
    return () => window.clearInterval(id)
  }, [date])
  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining / 3600000) % 24)
  const minutes = Math.floor((remaining / 60000) % 60)
  const seconds = Math.floor((remaining / 1000) % 60)
  return <div className="countdown" aria-label={`${days} days, ${hours} hours until event`}>{[[days, 'days'], [hours, 'hrs'], [minutes, 'min'], [seconds, 'sec']].map(([value, label]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><small>{label}</small></div>)}</div>
}

function CountdownFeature({ event }) {
  return <section className="countdown-feature"><div className="countdown-copy"><span className="eyebrow">THE COUNTDOWN IS ON</span><h2>Good music.<br /><em>Good company.</em></h2><p>The kind of night that stays with you. Get your spot before the last song.</p><Link className="button button-primary" to={`/events/${event.id}`}>Get your tickets <ArrowRight size={16} /></Link></div><div className="countdown-photo"><EventImage src={event.image} alt={`${event.title} live music event`} /><div className="countdown-overlay"><span>{event.title}</span><Countdown date={event.date} /></div></div></section>
}

function Explore() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const [query, setQuery] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || 'All events')
  const [sort, setSort] = useState('soonest')
  const normalized = query.trim().toLowerCase()
  const visibleEvents = events.filter((event) => {
    const matchesCategory = category === 'All events' || event.category === category
    const matchesQuery = !normalized || `${event.title} ${event.category} ${event.city} ${event.venue} ${event.description}`.toLowerCase().includes(normalized)
    return matchesCategory && matchesQuery
  }).sort((a, b) => sort === 'latest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date))
  return (
    <div className="explore-page page-pad">
      <div className="page-intro"><span className="eyebrow">YOUR NEXT YES IS HERE</span><h1>Find your kind<br className="desktop-break" /> of <em>wonderful.</em></h1><p>Good events, thoughtful people, and a reason to get out there.</p></div>
      <div className="explore-tools"><label className="explore-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events, places, or ideas" aria-label="Search events, places, or ideas" />{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</label><label className="sort-control"><Filter size={16} /><span>Sort:</span><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort events"><option value="soonest">Soonest first</option><option value="latest">Latest first</option></select><ChevronDown size={14} /></label></div>
      <div className="filter-row" aria-label="Filter by category">{categories.map((item) => { const Icon = categoryIcons[item.icon]; return <button key={item.name} className={`filter-chip ${category === item.name ? 'active' : ''}`} onClick={() => setCategory(item.name)} aria-pressed={category === item.name}><Icon size={15} />{item.name}</button> })}</div>
      {category === 'All events' && !normalized && <FeaturedBanner event={events.find((event) => event.featured)} />}
      <div className="results-meta"><span><strong>{visibleEvents.length}</strong> {visibleEvents.length === 1 ? 'good thing' : 'good things'} to look forward to</span><span>Showing all upcoming events</span></div>
      {visibleEvents.length ? <div className="event-grid explore-grid">{visibleEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}</div> : <div className="empty-state"><span><Search size={24} /></span><h2>No events found (yet).</h2><p>Try a different search or open up your category filters.</p><button className="button button-primary" onClick={() => { setQuery(''); setCategory('All events') }}>Show me everything</button></div>}
      <div className="local-note"><BadgeCheck size={17} /><span>Every event is hand-picked by our little team. Your next favourite thing is in here somewhere.</span></div>
    </div>
  )
}

function EventDetails() {
  const { id } = useParams()
  const event = events.find((item) => item.id === id)
  if (!event) return <NotFound />
  return <div className="details-page page-pad">
    <Link className="back-link" to="/events"><ArrowLeft size={15} /> All events</Link>
    <div className="detail-hero"><EventImage src={event.image} alt={`${event.title} event`} loading="eager" /><div className="detail-hero-shade" /><span className="detail-category">{event.category}</span><h1>{event.title}</h1><p><MapPin size={16} />{event.venue}</p></div>
    <div className="details-layout"><article className="details-main">
      <div className="detail-facts"><div><span><CalendarDays size={17} /></span><div><small>DATE & TIME</small><strong>{dateFormatter.format(new Date(event.date))}</strong><p>{event.time}</p></div></div><div><span><MapPin size={17} /></span><div><small>LOCATION</small><strong>{event.city}</strong><p>{event.venue}</p></div></div><div><span><Ticket size={17} /></span><div><small>YOUR TICKET</small><strong>From {event.price}</strong><p>{event.seats} spots available</p></div></div></div>
      <div className="detail-section"><span className="eyebrow">THE FEELING</span><h2>Here’s what it’s all about.</h2><p>{event.description}</p></div>
      <div className="detail-section"><span className="eyebrow">A FEW GOOD REASONS</span><h2>What to look forward to</h2><ul className="highlight-list">{event.highlights.map((item) => <li key={item}><span><Check size={15} /></span>{item}</li>)}</ul></div>
      <div className="organizer-card"><span className="organizer-avatar"><Sparkles size={19} /></span><div><small>PUT TOGETHER WITH CARE BY</small><strong>{event.organizer}</strong><p>Making good things happen, one gathering at a time.</p></div><BadgeCheck size={19} /></div>
    </article><aside className="booking-card"><span className="eyebrow">SAVE YOUR SPOT</span><h3>It’s going to be a good one.</h3><p>Just {event.seats} spots left for this gathering.</p><div className="booking-price">{event.price}<small> / person</small></div><div className="booking-countdown-label"><Clock3 size={15} /> Time until we meet</div><Countdown date={event.date} /><Link className="button button-primary booking-button" to={`/register/${event.id}`}>Register now <ArrowRight size={16} /></Link><small className="booking-footnote"><BadgeCheck size={14} /> Easy registration · No payment required</small></aside></div>
  </div>
}

function Register({ saveBooking }) {
  const { id } = useParams()
  const initialEvent = events.find((event) => event.id === id) || events[0]
  const [selectedId, setSelectedId] = useState(initialEvent.id)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(null)
  const selectedEvent = events.find((event) => event.id === selectedId)
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your full name.'
    else if (form.name.trim().length < 2) next.name = 'Name should be at least 2 characters.'
    if (!form.email.trim()) next.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.phone.trim()) next.phone = 'Please enter your phone number.'
    else if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) next.phone = 'Enter a valid 10-digit Indian mobile number.'
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const booking = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), eventId: selectedId, reference: `EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, createdAt: new Date().toISOString() }
    saveBooking(booking)
    setConfirmed(booking)
  }
  if (confirmed) return <div className="confirmation-page page-pad"><div className="confirmation-card"><span className="confirmation-check"><Check size={30} /></span><span className="eyebrow">YOU’RE ON THE LIST</span><h1>Something good<br /><em>is happening.</em></h1><p>Thanks, {confirmed.name.split(' ')[0]}. Your spot at <strong>{events.find((event) => event.id === confirmed.eventId)?.title}</strong> is saved.</p><div className="reference-box"><span>YOUR BOOKING REFERENCE</span><strong>{confirmed.reference}</strong></div><div className="confirmation-note"><BadgeCheck size={16} />Your registration is saved in this browser on this device.</div><div className="confirmation-actions"><Link className="button button-primary" to="/registrations">View my registrations <ArrowRight size={16} /></Link><Link className="text-link" to="/events">Discover more events</Link></div></div></div>
  return <div className="register-page page-pad"><div className="register-intro"><Link className="back-link" to={`/events/${selectedId}`}><ArrowLeft size={15} /> Back to event</Link><span className="eyebrow">ONE LITTLE STEP</span><h1>Save your <em>spot.</em></h1><p>Tell us a little about yourself. Your next good memory awaits.</p><div className="register-event-preview"><EventImage src={selectedEvent.image} alt="" /><div><small>YOU’RE SIGNING UP FOR</small><strong>{selectedEvent.title}</strong><span><CalendarDays size={13} />{dateFormatter.format(new Date(selectedEvent.date))} · {selectedEvent.city}</span></div></div></div>
    <form className="register-form" onSubmit={submit} noValidate><span className="eyebrow">YOUR DETAILS</span><h2>Let’s get to know you.</h2><p className="form-subtitle">All fields are required. No spam, ever.</p>
      <label className="form-label" htmlFor="full-name">Full name</label><input id="full-name" className={`form-input ${errors.name ? 'has-error' : ''}`} autoComplete="name" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }) }} placeholder="e.g. Aanya Mehta" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
      <label className="form-label" htmlFor="email">Email address</label><input id="email" type="email" className={`form-input ${errors.email ? 'has-error' : ''}`} autoComplete="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
      <label className="form-label" htmlFor="phone">Mobile number</label><input id="phone" type="tel" className={`form-input ${errors.phone ? 'has-error' : ''}`} autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }) }} placeholder="+91 98765 43210" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />{errors.phone && <span className="field-error" id="phone-error">{errors.phone}</span>}
      <label className="form-label" htmlFor="event">Choose an event</label><select id="event" className="form-input form-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{events.map((event) => <option key={event.id} value={event.id}>{event.title} — {event.city}</option>)}</select>
      <button className="button button-primary submit-button" type="submit">Save my spot <ArrowRight size={16} /></button><div className="privacy-note"><BadgeCheck size={15} />Demo registration only. Your details stay in this browser.</div>
    </form></div>
}

function MyRegistrations({ bookings }) {
  return <div className="registrations-page page-pad"><div className="page-intro registrations-intro"><span className="eyebrow">YOUR PLANS, ALL IN ONE PLACE</span><h1>Good things<br />are <em>on the way.</em></h1><p>Every spot you’ve saved, gathered here.</p></div>
    {bookings.length ? <div className="bookings-list">{bookings.map((booking) => { const event = events.find((item) => item.id === booking.eventId); if (!event) return null; return <article className="booking-item" key={booking.reference}><EventImage src={event.image} alt="" /><div className="booking-item-content"><span className="booking-item-category">{event.category} · {booking.reference}</span><h2>{event.title}</h2><p><CalendarDays size={15} />{dateFormatter.format(new Date(event.date))}<span>·</span><MapPin size={15} />{event.city}</p><small>Registered as {booking.name} · {booking.email}</small></div><Link className="button button-outline" to={`/events/${event.id}`}>Event details <ArrowUpRight size={15} /></Link></article> })}</div> : <div className="empty-state registrations-empty"><span><Ticket size={25} /></span><h2>Nothing on the calendar. Yet.</h2><p>Your next lovely plan is just around the corner.</p><Link className="button button-primary" to="/events">Find something good <ArrowRight size={16} /></Link></div>}
    <div className="storage-disclaimer"><BadgeCheck size={16} /><p>Your registrations are saved in this browser using local storage. This demo doesn’t send information to a server, and your bookings won’t sync across devices.</p></div>
  </div>
}

function NotFound() {
  return <div className="not-found page-pad"><span className="not-found-icon"><Compass size={27} /></span><span className="eyebrow">A LITTLE OFF THE MAP</span><h1>This isn’t the<br /><em>place you’re looking for.</em></h1><p>Let’s get you back to the good stuff.</p><Link className="button button-primary" to="/">Take me home <ArrowRight size={16} /></Link></div>
}

export default App
