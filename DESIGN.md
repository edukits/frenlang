# EduKits Frenlang - Style Reference

> Product design guide

**Theme:** light

Frenlang should feel like a bright, practical learning kit: playful enough for students, clear enough for teachers, and unmistakably EduKits. The visual system builds on the lighter EduKits blue already used across the app and main EduKits site. The interface stays open, mostly white, and low-clutter, with tactile primary buttons, rounded controls, simple learning illustrations, and short confident copy.

## Colors

| Name                | Value     | Role                                                                       |
| ------------------- | --------- | -------------------------------------------------------------------------- |
| EduKits Blue        | `#0ea5e9` | Primary CTAs, active navigation, brand headlines, key progress indicators. |
| EduKits Blue Bright | `#0284c7` | Secondary actions, links, hover highlights, active form controls.          |
| EduKits Blue Light  | `#e0f2fe` | Active row states, selected tags, subtle learning panels.                  |
| Button Blue Base    | `#0ea5e9` | Primary button surface.                                                    |
| Button Blue Deep    | `#0369a1` | Solid bottom shadow for primary buttons.                                   |
| French Red          | `#d60000` | Error states and small brand accent moments inspired by the app logo.      |
| Sunshine            | `#ffc928` | Illustration accent for energy, rewards, and progress.                     |
| Mint                | `#35c98b` | Illustration accent and positive states.                                   |
| Lavender            | `#8f7cff` | Illustration accent only.                                                  |
| Snow                | `#ffffff` | Page backgrounds, button text, card surfaces.                              |
| Cloud               | `#dbe3ef` | Borders, dividers, secondary button outlines.                              |
| Silver              | `#8b95a5` | Metadata, placeholder text, disabled states.                               |
| Graphite            | `#566070` | Body copy and supporting text.                                             |
| Ink                 | `#273244` | Primary UI text.                                                           |

## Typography

### display - Brand Headlines

- **Font:** Konnect SemiBold
- **Fallback:** Baloo 2, Inter
- **Weights:** 600
- **Sizes:** 48px, 60px
- **Line height:** 1.08-1.15
- **Letter spacing:** 0

### ui - Product Text

- **Font:** Inter from Google Fonts
- **Fallback:** system sans-serif
- **Weights:** 400, 500, 600, 700, 800
- **Sizes:** 13px, 14px, 15px, 17px, 20px, 32px
- **Line height:** 1.25-1.55
- **Letter spacing:** 0

### Type Scale

| Role       | Size | Line Height | Letter Spacing |
| ---------- | ---- | ----------- | -------------- |
| caption    | 13px | 1.4         | 0              |
| body       | 15px | 1.5         | 0              |
| heading-sm | 20px | 1.25        | 0              |
| heading    | 32px | 1.18        | 0              |
| heading-lg | 48px | 1.12        | 0              |
| display    | 60px | 1.08        | 0              |

## Spacing & Layout

**Base unit:** 4px

**Density:** comfortable

- **Page max-width:** 1140px
- **Section gap:** 72-112px
- **Card padding:** 24px
- **Element gap:** 16px

### Border Radius

- **Cards:** 12px
- **Inputs:** 12px
- **Buttons:** 12px
- **Tags and pills:** 999px

## Components

### EduKits Blue Headline

**Role:** Major page titles and motivating section headers.

Use Konnect SemiBold at 48px or 60px. Headlines should be short, direct, and blue. Avoid using Konnect for small labels or dense body copy.

### Tactile Primary Button

**Role:** Main actions such as sign in, create, save, and get started.

Primary buttons use Konnect SemiBold, EduKits blue, white text, 12px radius, and a solid darker-blue bottom shadow: `box-shadow: 0 4px 0 #0369a1`. On press, move the button down and shorten the shadow so it feels physical.

### Learning Card

**Role:** Lists, vocabulary, flashcards, dashboard summaries.

Cards are flat white surfaces with a Cloud border. They do not use soft elevation shadows. Interactive cards can use a blue border or light-blue background on hover.

### Inline Text Link

**Role:** Links inside copy or secondary actions.

Links use EduKits Blue Bright (`#0284c7`) and underline on hover. Avoid red, purple, or gray links except for destructive actions.

### Study Illustration

**Role:** Visual anchor for major screens.

Illustrations should feel kit-like: rounded learning tiles, simple stationery shapes, French flag cues, check marks, stars, and friendly geometric characters. Use EduKits Blue as the anchor with Sunshine, Mint, Lavender, and small French Red accents.

## Do's and Don'ts

### Do

- Use EduKits Blue for primary CTAs, active navigation, progress, and brand headlines.
- Use Konnect SemiBold for buttons and large headings.
- Keep controls rounded, chunky, and easy to tap.
- Use tactile bottom shadows only on primary action buttons.
- Keep learning cards flat with borders instead of soft shadows.
- Pair important empty states or hero sections with simple learning-kit imagery.
- Use EduKits Blue Bright for text links and secondary interactive states.
- Keep copy short, encouraging, and practical.

### Don't

- Don't use green as the primary action colour.
- Don't use sharp-cornered controls.
- Don't put traditional soft shadows on every card.
- Don't use Konnect for dense tables, metadata, form labels, or paragraph text.
- Don't use color alone to communicate destructive or edited states.
- Don't make the interface feel like a marketing landing page once a user is signed in; prioritize the learning workflow.

## Elevation

The product is mostly flat. Depth is reserved for primary buttons through a solid bottom shadow. Dialogs and menus may use a crisp border and subtle separation, but should not look like floating glass panels.

## Imagery

The imagery language is educational and maker-oriented rather than mascot-heavy. Use bold rounded shapes, app-logo blue, French language cues, flashcard stacks, check marks, stars, and workbook-like objects. Imagery should support the learning task and never overpower the UI.

## Layout

Use a centered max-width layout on a white background. Public pages can use an asymmetric hero with a large learning-kit illustration and a concise action block. Authenticated pages should be denser: clear headers, visible primary actions, flat cards, and scan-friendly tables. Alternate between single-column focus screens and two-column layouts only when it helps users decide what to do next.