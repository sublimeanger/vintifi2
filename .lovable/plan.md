
## Vintifi — Phase 1: Design System & Landing Page

Here's the complete implementation plan based on your design brief. This is a large build, so I'll work through it methodically in one shot.

---

### 🎨 Design System Foundation
- **Replace the colour system** in `index.css` — swapping out the generic blue-white palette for Vintifi's warm "Editorial Warmth" tokens: coral primary (`hsl(350, 80%, 58%)`), rich charcoal secondary, warm near-white background (`hsl(30, 15%, 98%)`), and status colours (teal success, amber warning, gold accent)
- **Load Google Fonts** in `index.html` — Sora (display/headings), DM Sans (body/UI), JetBrains Mono (prices/data)
- **Update Tailwind config** with `font-display`, `font-body`, `font-mono` families, shadow tokens, and border radius scale
- **Create `src/lib/motion.ts`** — central animation config with spring presets (snappy, gentle, smooth, bouncy) and stagger constants

---

### 🧩 Reusable Components
- **`BeforeAfterSlider`** — the signature Vintifi component. Interactive drag slider with clip-path reveal, animated handle (white circle, 40px, with chevron arrows), auto-reveal wipe animation on first view, touch + mouse support
- **`ScrollReveal`** — wrapper that fades + slides children into view on scroll (once), with configurable direction and stagger delay. Respects `prefers-reduced-motion`

---

### 🏗️ Landing Page Sections (7 + Nav + Footer)

**Sticky Navigation (`MarketingNav`)**
- Transparent on load → frosted glass (`backdrop-blur`) after 100px scroll
- "Vintifi" wordmark in Sora Bold coral
- Desktop links (Features, Pricing, How It Works) + "Get Started Free" primary CTA button
- Mobile: logo + hamburger → full-screen overlay menu

**Section 1 — Hero (`HeroSection`)**
- Centred headline: *"Turn phone photos into sales."* (Sora 800, clamp 2.5–4rem, -0.03em tracking)
- Subheadline in DM Sans, two CTA buttons ("Get Started Free" + "See How It Works ↓")
- The **interactive BeforeAfterSlider** as the hero visual, with full auto-reveal sequence (image wipe at t=800ms, handle bounce at t=1600ms)
- Subtle hero glow (radial gradient, barely visible coral tint behind headline)
- Staggered entrance animation on all hero elements

**Section 2 — Social Proof Bar (`SocialProofBar`)**
- Slim strip with qualitative proof: "Built for Vinted sellers · Professional photos in seconds · No design skills needed"
- Star icon in gold, stats in JetBrains Mono, warm sunken background

**Section 3 — Transformation Gallery (`TransformationGallery`)**
- Headline: *"See the difference."*
- 3 mini BeforeAfterSliders in photo cards (radius-xl, portrait 4:5): Background Removal, Flat-Lay Pro, AI Model Shot
- Desktop: 3-column grid; Mobile: horizontal scroll with snap, cards at 85vw (peeks next card)
- Staggered scroll reveal (0.08s per card)
- Placeholder gradient images used (labelled clearly) until real photos are provided

**Section 4 — How It Works (`HowItWorks`)**
- Headline: *"Professional listings in 3 steps."*
- 3 step cards with large decorative step numbers (Sora 800, light coral), icon, title, description
- Desktop: horizontal row with connecting line arrows; Mobile: vertical stack with dots

**Section 5 — Feature Showcase (`FeatureShowcase`)**
- Headline: *"Everything you need to sell faster."*
- 4 editorial feature blocks, alternating image/text layout
- Feature 1 (Photo Studio): largest, full-width background, "Most Popular Feature" premium badge
- Features 2–4 (Smart Descriptions, Price Intelligence, Trend Radar): smaller, alternating
- UI mockup placeholder screens for each feature

**Section 6 — Pricing (`PricingSection`)**
- Headline: *"Simple pricing. Start free."*
- Monthly/Annual toggle with animated price countdown
- 3 tier cards: Free (£0), Pro (£9.99, elevated -8px, "Most Popular" coral badge, primary border), Business (£24.99)
- Check icons in success green, feature bullets, CTA buttons
- "Top up anytime from £2.99" note below

**Section 7 — Final CTA (`FinalCTA`)**
- Dark gradient background
- Headline: *"Your next listing deserves better photos."*
- Single large coral primary button (beacon on dark background)

**Footer**
- Very dark background, Vintifi wordmark white, tagline, Product + Legal columns
- Muted link colours → hover to white

---

### 📱 Responsive Behaviour
- All sections adapt at mobile breakpoint: hero CTAs stack, gallery scrolls horizontally, How It Works stacks vertically, pricing Pro card moves to top
- Hamburger menu on mobile with full-screen overlay
- Minimum 44px touch targets throughout

---

### ⚡ Motion Details
- All scroll-triggered animations play **once** and are disabled for `prefers-reduced-motion`
- Hero entrance sequence: headline → subheadline → CTAs → comparison (staggered)
- Before/after auto-reveal: clip-path wipe (1.2s) → slider handle bounce
- Cards lift on hover (`translateY(-2px)`) with shadow expansion
- Pricing price numbers animate when toggling monthly/annual
