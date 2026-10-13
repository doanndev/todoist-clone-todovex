---
name: TodoVex
description: A local, offline task manager that files work by colour, drawn as a quiet paint-chip fan deck in warm monochrome.
colors:
  canvas: "hsl(60 11% 98%)"
  card: "hsl(0 0% 100%)"
  sunk: "hsl(45 14% 95%)"
  hover: "hsl(45 14% 94%)"
  ink: "hsl(0 0% 7%)"
  ink-muted: "hsl(45 2% 41%)"
  hairline: "hsl(0 0% 92%)"
  control-stroke: "hsl(60 2% 55%)"
  brick-alert: "hsl(2 54% 40%)"
  rail: "hsl(45 14% 96%)"
  rail-text-muted: "hsl(45 2% 41%)"
  rail-hairline: "hsl(0 0% 92%)"
  night-canvas: "hsl(40 3% 7%)"
  night-card: "hsl(40 3% 9%)"
  night-sunk: "hsl(40 3% 13%)"
  night-hover: "hsl(40 3% 15%)"
  night-ink: "hsl(40 8% 92%)"
  night-ink-muted: "hsl(40 3% 64%)"
  night-hairline: "hsl(40 3% 17%)"
  night-control-stroke: "hsl(40 3% 46%)"
  night-alert: "hsl(3 85% 76%)"
  night-rail: "hsl(40 3% 5%)"
  swatch-red-bg: "#FDEBEC"
  swatch-red-text: "#9F2F2D"
  swatch-blue-bg: "#E1F3FE"
  swatch-blue-text: "#1F6C9F"
  swatch-green-bg: "#EDF3EC"
  swatch-green-text: "#346538"
  swatch-yellow-bg: "#FBF3DB"
  swatch-yellow-text: "#956400"
  swatch-purple-bg: "#F1EAFB"
  swatch-purple-text: "#6B3FA0"
  swatch-teal-bg: "#E2F4F2"
  swatch-teal-text: "#1D6A64"
  swatch-pink-bg: "#FCE9F3"
  swatch-pink-text: "#9E2F65"
  swatch-orange-bg: "#FCEADB"
  swatch-orange-text: "#9A4A10"
  swatch-grey-bg: "#F1F1EF"
  swatch-grey-text: "#37352F"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "'tnum' 1, 'cv11' 1"
rounded:
  chip: "3px"
  sm: "2px"
  md: "4px"
  lg: "6px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "40px"
  rail-sm: "240px"
  rail-lg: "300px"
  measure: "680px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 16px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 16px"
  button-destructive:
    backgroundColor: "{colors.brick-alert}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    height: "40px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 12px"
  swatch-strip:
    backgroundColor: "{colors.swatch-blue-bg}"
    textColor: "{colors.swatch-blue-text}"
    rounded: "{rounded.chip}"
    height: "56px"
    padding: "0 16px 10px"
  project-chip:
    backgroundColor: "{colors.swatch-green-bg}"
    textColor: "{colors.swatch-green-text}"
    rounded: "{rounded.chip}"
    padding: "2px 8px"
  rail-nav-item-active:
    backgroundColor: "hsl(0 0% 7% / 0.07)"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 12px"
---

# Design System: TodoVex

## Overview

**Creative North Star: "The Swatch Deck"**

TodoVex is drawn as a paint-chip fan deck, now printed in warm monochrome. A pale rail holds the deck; each project is a washed-out pastel strip fanned out of it, and colour is the filing system. The strip's bottom bar fills as that project's tasks get done, which is the one signature move. Everything else is quiet: off-white canvas, white cards, near-black ink, 1px hairlines, one grotesque. The task list is the product and chrome never competes with it.

The system is flat and nearly shadowless. Depth comes from tonal steps (canvas, white card, pale rail), from strips sliding out of the deck, and from hairlines. Light and dark are both first-class, and each swatch carries a dark-theme twin so strips never glare on a dark ground. Colour files a project but never carries meaning alone: the project name is always printed beside it.

The build diverged slightly from the first brief: chip corners are 3px (not 2px), strips are 56px tall (not 62px), and the strip's right side carries the open count only (no code). A later restyle (quieter, minimal, colour and ornament only, no layout change) replaced the saturated opaque swatches, the dark rail in light mode and the 2px ink rules with what is documented below.

**Key Characteristics:**
- Warm off-white canvas, white cards, near-black ink; hue belongs to filing (project and label colours) and to urgency (the priority ramp), never to controls.
- Eight pastel project swatches plus a neutral Grey, each a light pair and a dark twin, every light pair at WCAG AA.
- The rail is light in light mode (near-black only in dark mode); its tints are rail-foreground at 6 to 7% opacity.
- One grotesque (Hanken Grotesk) with tabular figures on for the whole page.
- Square chips (3px), modest controls (4px), 1px hairlines, near-zero shadow.
- State is always redundant: position, weight, label, never colour alone.

## Colors

A restrained warm-monochrome ground with ink, where all chroma belongs to the project pastels. Values are HSL channels in `app/globals.css` (hsl() form in the frontmatter, which is normative).

### Primary
- **Ink** (`ink`, #121212): text, the primary button fill, the checked checkbox, focus ring, selection. Unfilled priority bars are hairline. In dark mode it inverts to Night Ink.

### Secondary
- **Project Swatches** (`swatch-*-bg` / `swatch-*-text`): Red, Blue, Green, Yellow, Purple, Teal, Pink, Orange. These are not global CSS variables. They live in `lib/swatch.ts` as `{ name, bg, fg, bgDark, fgDark }` and are applied through four per-element custom properties (`--sw-bg`, `--sw-fg`, `--sw-bg-dark`, `--sw-fg-dark`) set by `swatchStyle()` and read by the `SWATCH_CLASS` constant, so light shows the pastel and dark shows its twin. Light pairs are in the frontmatter (lowest contrast 4.62:1). Dark twins (bg / text): Red #3B2527 / #F4B8B5, Blue #1F3342 / #9ECBEA, Green #243329 / #A9D1AE, Yellow #3A3320 / #E6C97A, Purple #302742 / #CDB6EA, Teal #1F3535 / #9AD3CE, Pink #3C2532 / #EFB3D0, Orange #3C2D20 / #EDBB8F. A project's colour is the one the user picked, from nine named swatches (these eight plus Grey); a project without a pick (older ones) falls back to an automatic colour by id hash, stepping forward so no two share one while a free colour remains. The automatic colours of existing projects never shift when another project is added.
- **Grey** (`swatch-grey-*`; dark twin #26282A / #D7D8D3): the neutral swatch for the system project, displayed as "Unfiled". The Inbox view is a different thing: it lists every open task across all projects.

### Neutral
- **Canvas** (`canvas`, #FBFBFA) page ground; **Card** (`card`, white) for inputs, dialogs, popovers, add-task form; **Sunk** (`sunk`) secondary fills; **Hover** (`hover`) hover and accent fills.
- **Ink Muted** (`ink-muted`) secondary text, held at AA. **Hairline** (`hairline`, #EAEAEA) row dividers and borders. **Control Stroke** (`control-stroke`) input and checkbox outlines, held darker than the hairline so controls meet non-text contrast.
- **Rail** (`rail`) the sidebar ground: warm pale in light mode, **Night Rail** in dark mode. **Rail Text Muted** and **Rail Hairline** carry its secondary text and rules. Active and hover rail items are rail-foreground at 7% and 6%. The rail has its own focus outline in rail-foreground.
- **Brick Alert** (`brick-alert`) destructive actions and overdue states; **Night Alert** its dark-mode counterpart.
- Dark mode: Night Canvas, Night Card, Night Sunk, Night Hover, Night Ink, Night Ink Muted, Night Hairline, Night Control Stroke carry the same roles.

### Named Rules
**The Chroma Belongs To Filing Rule.** Hue appears in three places only: a project pastel, a label's tinted chip, and the priority ramp (grey, blue, amber, orange, red). UI chrome, buttons, links, toggles and badges stay on canvas, card, ink and rail.

**The Fixed Pairing Rule.** A swatch background and its foreground are one object, and light and dark twins swap together. Never set text on a swatch in any colour but its own `fg` / `fgDark`.

**The Name Beside The Colour Rule.** Every swatch is printed with its project's name. Colour files; the label identifies. The pastels are deliberately close in value, so nothing may depend on telling them apart.

## Typography

**Display Font:** Hanken Grotesk (with ui-sans-serif, system-ui, sans-serif), loaded via next/font as `--font-sans`.
**Body Font:** Hanken Grotesk.
**Label/Mono Font:** none. Tabular figures from the same face (`font-feature-settings: "tnum" 1, "cv11" 1` on body) handle dates and counts.

**Character:** One grotesque at confident weights, tightly tracked at display sizes. Hierarchy comes from size and weight, not from a second face.

### Hierarchy
- **Display** (700, 3.25rem to 4.5rem, 1.02, -0.03em): landing headline only; never above 6rem.
- **Headline** (700, 36px mobile / 44px md, 1, -0.03em): the page title on every app view, sitting on a 1px hairline rule.
- **Title** (600, 17px, snug): task names; completed tasks drop to 400 muted with a line-through.
- **Body** (500 to 600, 15px): navigation, buttons (600), inputs, rail labels.
- **Label** (600, 13px; 500 tabular for counts and dates): section labels in the rail, open counts, due dates, meta line (14px muted).

### Named Rules
**The One Grotesque Rule.** One family. Emphasis is weight and size, never a second typeface.

**The Tabular Figures Rule.** Dates, counts and percentages align on tabular numerals so the right-hand due-date column stays ruled.

## Layout

A two-column shell: sticky rail (240px at md, 300px at lg) and a fluid content column. Below md the rail becomes a top-bar sheet. The content column holds one reading measure: `main` is max 760px with 40px side padding at md, so the list is 680px wide (16px padding on phones). Pages stack a headline with meta on a 1px hairline rule, then ruled task rows (12px vertical padding, hairline between), then the add-task action at the end of the list.

Task rows are a flex line: checkbox, name and description, then on sm and up a right group of project chip, a fixed 25px priority slot, and a right-aligned due date (min 5.5rem). Below sm that group folds under the title. Spacing runs on a 4px base with 6px gaps between rail strips, 12px row rhythm, and 24px below page headers. The landing page uses a wider 1280px frame with the swatch fan at poster scale beside the headline; its closing band uses the light rail tokens with a white code block.

## Elevation & Depth

Flat by default. Depth is tonal and positional: a pale rail beside the canvas, white cards on it, the active strip pulled 12px out of the deck, hovered strips sliding 6px, and hairlines organising rows. The only real shadow is one faint ambient drop shared by every floating layer: dialog, toast, popover, menu, select, sheet and the Spotlight panel. Cards, rows, strips and calendar events carry none. Strips and the project-page colour bar carry a 1px inset hairline instead of a shadow. Dialog and sheet scrims are black at 30%.

### Shadow Vocabulary
- **Ambient drop** (`box-shadow: 0 8px 32px rgba(0,0,0,0.06)`): floating layers only (dialog, toast, popover, menu, select, sheet, Spotlight panel).
- **Swatch hairline** (`box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06)`; `rgba(255,255,255,0.06)` in dark): the edge of every strip and the project colour bar, so pale fills stay legible on the canvas.

### Named Rules
**The Pulled-From-The-Deck Rule.** Selection is shown by moving the strip (translate -12px, extra right padding) plus `aria-current`, not by glow or shadow.

**The Fill Bar Rule.** Progress is a bar along a swatch's bottom edge (5px in the rail, 7px at poster scale, currentColor at 30% opacity so it tints with the swatch text), animating width with `cubic-bezier(0.16, 1, 0.3, 1)` (700ms; 1100ms for the landing intro). It is the one celebrated motion; reduced-motion collapses all animation.

## Shapes

Square and quiet. Swatch strips and project chips use a 3px corner (strips round only the left side, `rounded-l-[3px]`, as if cut from a fan). Controls (buttons, inputs, nav items, dialogs) use a 4px to 6px radius from `--radius: 0.375rem` (lg 6px, md 4px, sm 2px). Checkboxes are square (3px corner) with a 1.5px control-stroke outline. Priority bars are 3px-wide bars with a 1px corner. No pills and no circles: dots in menus are 2px-cornered squares. Borders are 1px hairlines everywhere (page title rule, add-task form, toast, rows); the only heavier lines are the 1.5px checkbox stroke and the 2px focus outline.

## Components

### Buttons
- **Shape:** gently squared (4px radius), 40px tall (sm 36px, lg 44px), 15px semibold.
- **Primary:** ink fill, white text, 16px horizontal padding; hover at 90% opacity.
- **Outline / Secondary / Ghost:** card fill with control-stroke border; sunk fill; ghost shows hover fill only. Destructive uses Brick Alert.
- **Hover / Focus:** press scales to 0.98; focus is a 2px ring in the ring colour with 2px offset (rail-foreground inside the rail).

### Inputs / Fields
- **Style:** 40px tall, card fill, 1px control-stroke border, 4px radius, 15px text.
- **Focus:** border shifts to ink plus the global 2px outline. Disabled drops to 50% opacity.

### Navigation
- **Rail:** 40px nav items (Inbox, Today, Upcoming) at 15px medium; the active item takes a rail-foreground 7% tint, semibold weight and `aria-current`; hover is the 6% tint. Counts sit right in tabular figures. Section labels ("Projects", "Labels") are 13px sentence-case semibold muted text, not uppercase.
- **Mobile:** the rail content moves into a sheet opened from the top bar, which also holds search and the theme toggle.

### Signature Component: Swatch Strip
The fan-deck chip. A 56px-tall strip (80/96px at poster scale) filled with the project pastel (twin in dark), name left (15px semibold, truncated), "N open" right (13px tabular), a 1px inset hairline edge, and a fill bar along the bottom edge. Active strips are pulled out 12px; hover slides 6px. The aria-label reads name, open count and percent done. Strips stack with 6px gaps inside the rail, indented 20px; the same component is reused at poster scale on the landing page.

### Task Row
Hairline-ruled row with a square checkbox (check pops in over 220ms), 17px semibold title, truncated muted description, a project chip in the project's pastel, a fixed 25px priority slot holding the five-step bar ramp (Lowest draws nothing; filled bars in the level's colour, unfilled in hairline, heights 4/6/8/12/16px), and a right-aligned tabular due date. Rows enter with a 260ms 4px rise.

### Label Tag and Priority Colour
A label is a tag icon plus its name on a tinted 3px chip, using the same pastel pairs as projects but a separate ring (Teal, Purple, Green, Pink, Blue) so red, orange and yellow stay free for urgency. Priority reads as heat: grey, blue, amber, orange, red. Bars draw in the level's solid colour and a chip tints its name; Lowest (the default) draws nothing in a row. A colour is never the only cue: the name, the bar height and the icon are always present.

### Colour Picker
Projects and labels carry an optional colour, chosen from nine named swatches (the eight pastels plus Grey) in a row of 32px solid squares with a check on the chosen one. They are native radio inputs, so arrow keys and screen readers work. The same palette opens in a popover from a project's page header and from a label chip in the rail, to recolour what exists. A project or label without a chosen colour keeps its automatic one, and the system project stays Grey.

### Spotlight
The top-bar search box is also quick add. Typing searches open tasks; starting with `+` switches to add mode: `+name#project#label`, with a Task, Project, Label preview, suggestions after each `#`, Tab to complete, Enter to add, Esc to close. An unknown or ambiguous project or label shows an error and creates nothing. It is an ARIA combobox and its panel is as wide as the field.

### Calendar
A full-width page (up to 1400px, the one exception to the 680px list measure) with Month, Week and Day views, a Today button, previous and next, and New task. Month is a seven-column grid: all-day tasks are tinted chips in the project's pastel, timed ones are a small square, the time and the name; three show per day with "+N more", and on phones each task collapses to a thin colour bar and a tap opens the day. Week and Day are a 24 hour grid (52px an hour) under an all-day strip, with overlapping tasks side by side and a red line for now. Clicking an empty day or slot opens the task form there; clicking a task opens its dialog. Repeats are generated per view, and a ticked repeat is struck through.

### Task Form
One form serves add, edit and sub-task, in three wrappers: a hairline card at the end of a list, a flat block in the sub-task column, and the bare body of a dialog that already has a title. It reads top to bottom as the name (20px semibold, borderless, underline on focus), a one-row description that grows with its text, then property chips, then Cancel and the primary button. Chips are 36px outline buttons (control-stroke border, 4px radius): a first row for when (date, repeat) and a second for what it is (priority, label, project). Each chip shows its current value, so the form summarises the task without being opened. The date chip opens a popover with quick picks (Today, Tomorrow, Next week), a Monday-first calendar, then "Set a time" and "Add an end date" behind plain toggles; the repeat chip opens its rule (every N, weekdays, end). Native date and time inputs handle the rest, so the popovers stay one column wide. Sub-tasks show date and priority only. When adding a task, the name also takes `name#project#label` (the same syntax and matching as Spotlight): the Project and Label chips follow what is typed, show it live and lock while it is there, an unknown or ambiguous name is a quiet hint that turns into an error on Create, and `#` is always a separator. Escape closes a popover first and the form second; Enter adds the task; Cmd or Ctrl and Enter adds from the description.

### Project Chip
A 3px-cornered inline label in the project's pastel with its paired text colour, 12px semibold, max 9rem, truncated. Reads "Unfiled" for the system project.

## Do's and Don'ts

### Do:
- **Do** keep the list to one reading measure: 680px of content inside the 760px `main`.
- **Do** keep a fixed 25px slot for priority bars so due dates align in one right-hand column.
- **Do** apply swatches only through `swatchStyle()` plus `SWATCH_CLASS`, so every strip and chip gets its paired light and dark colours, and print the project's name beside or inside every swatch.
- **Do** give any new light swatch a dark twin and keep the light pair at WCAG AA (4.5:1 or better).
- **Do** keep rules at 1px hairline; use the control stroke for anything interactive.
- **Do** show state with more than colour: position (pulled-out strip), weight and line-through (completed), bar height (priority), `aria-current`, text labels.
- **Do** use tabular figures for dates and counts, and sentence case for section labels.
- **Do** call the system project "Unfiled" and keep "Inbox" for the all-open-tasks view.
- **Do** keep light and dark at WCAG AA, with visible 2px focus outlines on every interactive element.
- **Do** keep motion short and eased with `cubic-bezier(0.16, 1, 0.3, 1)`, and honour reduced-motion.

### Don't:
- **Don't** add eyebrows, kickers or small uppercase overlines above headings.
- **Don't** introduce a monospace or second display face as a style device. (The landing run-command block is functional code display, not a pattern for headings or labels.)
- **Don't** use em-dashes in copy.
- **Don't** colour interactive chrome (buttons, links, toggles) with a project swatch or any accent; hue belongs to projects, labels and priority only.
- **Don't** saturate the swatches, add gradients, or put a swatch's light colours on a dark ground.
- **Don't** add shadows to cards, rows, strips or calendar events; the ambient drop on floating layers is the single shadow.
- **Don't** use glyph or emoji icons; icons are lucide line icons at 1.75 stroke. The one exception is the check and plus drawn inside a 20px control (checkbox, colour swatch, add-task square), which run at 2.5 to 3 so they stay legible at 14 to 16px.
- **Don't** widen the task list past 680px or let the priority slot grow or collapse.
- **Don't** reintroduce sign-in, avatars or AI language.
