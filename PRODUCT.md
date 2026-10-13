# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two audiences, both confirmed: (1) a person who manages their own tasks every day on their own machine and wants a fast, calm tool they can leave open all day; (2) a developer using this repo as a base to extend (features, components), who needs consistent tokens and components rather than one-off styling.

## Product Purpose
TodoVex is a Todoist-style task manager that runs entirely offline on the user's machine. It lets one person capture tasks, break them into sub-tasks, group them into projects, tag them with labels, and review what is due today or upcoming. Success is that adding and clearing a task takes seconds and the list stays readable as it grows.

## Positioning
A local-first Todoist clone: no account, no sign-in, no network or AI dependency. Data lives in a local Convex deployment (`.convex/local/`), and the user is always "Local user".

## Operating Context
Run with `npm run dev` (Next.js on :3000 plus a local Convex backend on :3210). Used in a desktop browser during the day; the layout also has to work on a phone-width viewport (sidebar becomes a mobile nav). Surfaces: landing page (`/`), then the app under `/loggedin`: Inbox, Today, Upcoming, Projects list, a project page, search results, add-task form and task dialog.

## Capabilities and Constraints
- Tasks: name, description, priority (Lowest, Low, Medium, High, Urgent), schedule, project, label; complete and uncomplete; edit; delete; sub-tasks under a task (sub-tasks keep a single day).
- Schedule: a task is one all-day date, a range of days, or a timed span (start and end date and time). It can repeat daily, weekly (chosen weekdays), monthly or yearly, every N, ending never, on a date or after N times. A repeating task is stored once and generated per view; each repeat is ticked on its own. Stored fields: `dueDate` (start), `endDate`, `allDay`, `recurrence`, `completedOccurrences`.
- Projects and labels: create and delete projects; create labels. Each project and label has a colour, picked from nine named swatches at creation and changeable later (the system project stays grey). Labels show as a tag icon plus name on a tinted chip; priority is colour-coded from grey (Lowest) to red (Urgent).
- Quick add: the top-bar search box adds a task when the text starts with `+`, as `+name#project#label`. An unknown or ambiguous project or label is an error and nothing is created; defaults are Unfiled and the first label. The system project "Inbox" cannot be deleted. Seeded system labels: Personal, Work, Shopping.
- Views: Inbox, Today (with overdue), Upcoming (the next 60 days grouped by day), Calendar (month, week and day grids; click a day or time slot to add, click a task to open it), per-project page, search (case-insensitive substring over task name and description).
- Removed on purpose: authentication and every AI feature (suggestions, vector search). Do not reintroduce sign-in, avatars, or "AI" language.
- Stack is fixed: Next.js 14 App Router, React 18, Tailwind CSS 3, shadcn/ui on Radix primitives, lucide-react icons, react-hook-form with zod, date-fns and moment, Convex for data. Behavior and data model must not change as part of visual work.
- UI copy is English and stays English.
- Undecided: whether the sidebar "Filters & Labels" entry becomes a real page (its route does not exist today).

## Brand Commitments
Name is TodoVex. The existing logo mark and favicon in `public/` stay unless the user says otherwise. No other voice or identity constraints were stated.

## Evidence on Hand
No testimonials, customer logos, metrics, or screenshots of real usage exist; none may be invented. The landing page previously used `public/mobile.png` and `public/desktop.png` product screenshots, which show the old UI and are stale after the redesign.

## Product Principles
- The task list is the product; chrome never competes with it.
- Fast to capture, quiet to scan: the common actions (add, complete, reschedule) take the fewest steps.
- Honest about being local and offline; no claims the app cannot back up.
- One consistent system of tokens and components, so a developer can extend the app without restyling.
- Light and dark are both first-class and meet WCAG AA.

## Accessibility & Inclusion
Target WCAG 2.1 AA in both light and dark modes: visible focus, keyboard-operable dialogs, sufficient contrast, and motion that respects reduced-motion preferences.
