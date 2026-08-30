/**
 * Single source of truth for site-wide copy and links.
 * All copy is taken from the approved landing-page spec (2026-08-28).
 * The page is English-only by design.
 */
export const site = {
  name: 'Arte Museum Special Edition in Sydney',
  domain: 'sydney.artemuseum.com',
  brand: 'ARTE MUSEUM',
  city: 'SYDNEY',

  hero: {
    /**
     * Background media. If `video.src` is set the hero renders an autoplaying,
     * muted, looping video (per spec) with `image` as poster/fallback; set
     * `video: null` to use the still image only.
     * Footage: Arte Museum Busan, Musée d'Orsay special exhibition (26s loop,
     * silent). Replace if artwork curation changes what may be shown.
     */
    image: { src: '/media/hero-orsay.jpg', small: '/media/hero-orsay-800.jpg' },
    video: { mp4: '/media/hero.mp4', poster: '/media/hero-poster.jpg' } as
      | { webm?: string; mp4?: string; poster?: string }
      | null,
    eyebrow: 'ARTE MUSEUM SPECIAL EDITION IN SYDNEY · COMING 2027',
    // Rendered on two lines, matching the approved design.
    titleLines: ['Sydney, step into', 'Eternal Nature.'],
    sub: 'The signature works of Arte Museum, in one 45-minute journey',
    cta: 'JOIN THE WAITLIST',
  },

  form: {
    title: 'Be the first to know.',
    desc: "Enter your email and we'll let you know the moment opening dates and tickets are announced, plus early access before the public.",
    placeholder: 'you@email.com',
    button: 'GET EARLY ACCESS',
    micro: 'No spam, just the news you asked for. Unsubscribe anytime.',
    consentHtml:
      'I agree to receive Arte Museum Special Edition in Sydney updates by email from Arte Museum. I’ve read the <a href="#" data-open-privacy class="consent-link">Privacy Collection Notice</a>.',
    success: "You're on the list. We'll be in touch as soon as there's news.",
    errors: {
      consent: 'Please tick the box so we can send you updates.',
      email: 'Please enter a valid email address.',
      duplicate: "You're already on the list. We'll keep you posted.",
      generic: 'Something went wrong. Please try again in a moment.',
    },
  },

  footer: {
    copyright: '© 2026 Arte Museum · Presented by d’strict Co., Ltd.',
  },

  links: {
    // TODO(final): confirm the global Arte Museum privacy-policy URL before launch.
    privacyPolicy: 'https://artemuseum.com/policy/privacy',
    // TODO(final): confirm the official Instagram account for Sydney before launch.
    instagram: 'https://www.instagram.com/artemuseum_official/',
    contact: 'https://www.dstrict.com/CONTACT',
  },

  meta: {
    title: 'Arte Museum Special Edition in Sydney — Coming 2027',
    description:
      "Sydney, step into Eternal Nature. The signature works of Arte Museum, in one 45-minute journey. Join the waitlist for opening dates, tickets and early access.",
  },
} as const;
