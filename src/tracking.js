// ============ TRACKING CONFIGURATION ============
// Empty string = that tool never loads: no script tag, no network request, no console errors.
//
// GA4 runs INSIDE the GTM container, not from here. Created 2026-10-11 under Lucas's own
// Summit Media accounts (not G360, which other people can see):
//   GTM container  GTM-524JZKF7 (Summit Media account)
//   GA4 property   558470602, measurement ID G-NS9PT60FWG (Summit Media Analytics account)
// The container's GA4 event tag forwards every event that track() pushes below.
export const GTM_ID = 'GTM-524JZKF7'
export const META_PIXEL_ID = ''
export const CLARITY_ID = ''

// LGPD: this is Brazilian traffic on a mental-health quiz run by a licensed psychologist
// (name, email, WhatsApp collected). Whether/how to ask consent before loading any of this is
// a pending decision with Lucas/Karla, NOT decided here. Every loader below checks this one
// function first, so when that decision lands, this is the only place that needs to change.
export function trackingAllowed() {
  return true
}

let initialized = false

// Call once, e.g. on app mount. Loads only the tools that have an ID set.
export function initTracking() {
  if (initialized) return
  initialized = true
  if (!trackingAllowed()) return

  if (GTM_ID) loadGTM(GTM_ID)
  if (META_PIXEL_ID) loadMetaPixel(META_PIXEL_ID)
  if (CLARITY_ID) loadClarity(CLARITY_ID)
}

// The canonical Summit GTM loader (same as tcg-nextjs/src/components/analytics/GtmLoader.tsx):
// loads on the first gesture, or 1s AFTER THE FIRST PAINTED FRAME, whichever comes first. Never
// flatten the fallback to a plain setTimeout from navigation start; that exact change cost TCG and
// G360 20-30 PageSpeed points. See divisions/software/plan-2026-08-31-gtm-standardization.md.
// Events pushed before GTM boots wait in window.dataLayer and are replayed in order.
function loadGTM(id) {
  window.dataLayer = window.dataLayer || []
  let loaded = false
  const evts = ['scroll', 'pointerdown', 'keydown', 'touchstart', 'mousemove']
  function load() {
    if (loaded) return
    loaded = true
    evts.forEach((e) => window.removeEventListener(e, load))
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
    document.head.appendChild(script)
  }
  evts.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }))
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.setTimeout(load, 1000)
    })
  })
}

function loadMetaPixel(id) {
  /* eslint-disable */
  ;(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */
  window.fbq('init', id)
  window.fbq('track', 'PageView')
}

function loadClarity(id) {
  /* eslint-disable */
  ;(function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        ;(c[a].q = c[a].q || []).push(arguments)
      }
    t = l.createElement(r)
    t.async = 1
    t.src = 'https://www.clarity.ms/tag/' + i
    y = l.getElementsByTagName(r)[0]
    y.parentNode.insertBefore(t, y)
  })(window, document, 'clarity', 'script', id)
  /* eslint-enable */
}

// Meta has its own standard event names for a couple of ours; everything else is sent as a
// custom event on every tool that's loaded.
const META_STANDARD_EVENTS = {
  lead_submit: 'Lead',
  checkout_click: 'InitiateCheckout',
}

// Fans an event out to whichever tools are loaded (no-op for a tool with no ID, and a full
// no-op if trackingAllowed() is false).
//
// HEALTH DATA — HARD RULE: params must never contain quiz answers, score, result level, name,
// email or WhatsApp. This is a mental-health quiz (LGPD-sensitive). Only pass small, non-
// identifying params like which button was clicked.
//
// Every param key any event uses is listed here and reset to undefined on each push. GTM's data
// layer is a running merge, so without the reset a `step` from quiz_step would ride along on the
// next checkout_click. Add new keys here AND as a Data Layer Variable in the GTM container.
const PARAM_KEYS = ['step', 'step_number', 'button']

export function track(event, params = {}) {
  if (!trackingAllowed()) return

  if (GTM_ID) {
    window.dataLayer = window.dataLayer || []
    const reset = Object.fromEntries(PARAM_KEYS.map((k) => [k, undefined]))
    window.dataLayer.push({ ...reset, ...params, event })
  }

  if (META_PIXEL_ID && typeof window.fbq === 'function') {
    const standardName = META_STANDARD_EVENTS[event]
    if (standardName) {
      window.fbq('track', standardName, params)
    } else {
      window.fbq('trackCustom', event, params)
    }
  }

  if (CLARITY_ID && typeof window.clarity === 'function') {
    window.clarity('event', event)
  }
}

// Appends UTM params to the Kiwify checkout URL so a sale can be attributed back to the quiz.
// Passes through any utm_* already on the landing URL untouched; only fills in utm_source,
// utm_medium and utm_content when the visitor's URL didn't already have them.
export function buildCheckoutUrl(baseUrl, buttonSource) {
  let url
  try {
    url = new URL(baseUrl)
  } catch {
    return baseUrl
  }

  const landing = new URLSearchParams(window.location.search)
  ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = landing.get(key)
    if (value) url.searchParams.set(key, value)
  })

  if (!landing.get('utm_source')) url.searchParams.set('utm_source', 'quiz')
  if (!landing.get('utm_medium')) url.searchParams.set('utm_medium', 'result_page')
  if (!landing.get('utm_content')) url.searchParams.set('utm_content', buttonSource)

  return url.toString()
}
