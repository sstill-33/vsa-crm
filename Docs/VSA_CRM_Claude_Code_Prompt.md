# VSA Acquisition Pipeline CRM — Claude Code Build Prompt

## PROJECT OVERVIEW

Build a full-featured **Acquisition Pipeline CRM** called **"VSA CRM"** for **VSA (an aviation holding company)** that replaces an Excel-based acquisition tracking spreadsheet. This is used by **C-suite executives** to track companies they are targeting for acquisition. The app must be **lightning-fast to use, mobile-first, visually minimal, and executive-grade**. Think Bloomberg Terminal meets Apple design — dense information, zero clutter.

The T3 Stack project is already scaffolded. You are building inside it.

---

## TECH STACK (Already Scaffolded)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4+
- **API**: tRPC
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (use `DATABASE_URL` env var — I will connect to Railway Postgres)
- **Auth**: None (skip auth for now — single-user executive tool)
- **Import alias**: `~/`
- **Package manager**: pnpm

---

## DATABASE SCHEMA (Drizzle ORM)

Create all schema in `src/server/db/schema.ts`. Use Drizzle's `pgTable`, `pgEnum`, etc.

### Enums

```typescript
export const pipelineStageEnum = pgEnum('pipeline_stage', [
  'Identified',
  'On the Horizon',
  'Initial Outreach',
  'Talking',
  'NDA Signed',
  'Due Diligence',
  'LOI Submitted',
  'Under Negotiation',
  'Closed - Won',
  'Closed - Lost',
  'On Hold',
]);

export const companyCategoryEnum = pgEnum('company_category', [
  'PMA/STC Mfg.',
  'OEM / PMA/STC Mfg.',
  'Distributor',
  'Distributor/PMA Mfg.',
  'Repair Station',
  'STC',
  'MRO',
  'OEM',
  'Other',
]);

export const priorityEnum = pgEnum('priority', ['High', 'Medium', 'Low']);

export const ndaStatusEnum = pgEnum('nda_status', ['Yes', 'No', 'Pending', 'N/A']);

export const regionEnum = pgEnum('region', [
  'Midwest',
  'West',
  'South',
  'Northeast',
  'International',
]);

export const revenueBracketEnum = pgEnum('revenue_bracket', [
  '<$1M',
  '$1M-$3M',
  '$3M-$5M',
  '$5M-$10M',
  '$10M-$25M',
  '$25M-$50M',
  '$50M-$100M',
  '$100M+',
  'TBD',
]);
```

### Companies Table (core entity)

```typescript
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  pipelineStage: pipelineStageEnum('pipeline_stage').notNull().default('Identified'),
  category: companyCategoryEnum('category').notNull(),
  specialty: varchar('specialty', { length: 500 }),
  ndaStatus: ndaStatusEnum('nda_status').notNull().default('N/A'),
  location: varchar('location', { length: 255 }),
  region: regionEnum('region'),
  estimatedRevenue: varchar('estimated_revenue', { length: 100 }), // free text like "$5M - $7M"
  revenueBracket: revenueBracketEnum('revenue_bracket').default('TBD'),
  website: varchar('website', { length: 500 }),
  priority: priorityEnum('priority').default('Medium'),

  // Contact Info
  primaryContactName: varchar('primary_contact_name', { length: 255 }),
  primaryContactTitle: varchar('primary_contact_title', { length: 255 }),
  primaryContactEmail: varchar('primary_contact_email', { length: 255 }),
  primaryContactPhone: varchar('primary_contact_phone', { length: 50 }),

  // Deal Info
  askingPrice: varchar('asking_price', { length: 100 }),
  estimatedEbitda: varchar('estimated_ebitda', { length: 100 }),
  employeeCount: integer('employee_count'),
  yearFounded: integer('year_founded'),
  ownershipType: varchar('ownership_type', { length: 100 }), // "Family-Owned", "Private Equity", etc.

  // Fit Assessment
  strategicFitNotes: text('strategic_fit_notes'),
  synergyNotes: text('synergy_notes'),

  // Internal tracking
  assignedTo: varchar('assigned_to', { length: 255 }),
  source: varchar('source', { length: 255 }), // how we found them: "referral", "research", "conference"
  tags: text('tags'), // comma-separated tags for filtering

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastContactDate: timestamp('last_contact_date'),
  nextFollowUpDate: timestamp('next_follow_up_date'),
  stageChangedAt: timestamp('stage_changed_at').defaultNow(),
});
```

### Activity Log Table (interaction history)

```typescript
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // 'call', 'email', 'meeting', 'note', 'stage_change', 'document'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  contactPerson: varchar('contact_person', { length: 255 }),
  outcome: varchar('outcome', { length: 255 }), // 'positive', 'neutral', 'negative', 'pending'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }),
});
```

### Documents/Links Table

```typescript
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  documentName: varchar('document_name', { length: 255 }).notNull(),
  documentType: varchar('document_type', { length: 100 }), // 'NDA', 'LOI', 'Financial', 'Presentation', 'Other'
  url: varchar('url', { length: 1000 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## SEED DATA

Create a seed script at `src/server/db/seed.ts` that inserts ALL 25 companies from the Excel data below. Run it via a `package.json` script (`"db:seed": "npx tsx src/server/db/seed.ts"`).

Here is the exact data to seed:

| Company Name | Pipeline Stage | Category | Specialty | Under NDA | Location | Est. Rev | Website |
|---|---|---|---|---|---|---|---|
| AeroTwin, Inc | Talking | PMA/STC Mfg. | Cessna Modifications | Yes | Anchorage, AK | $2M - $3M | www.aerotwin.com |
| Steve's Aircraft | Talking | PMA/STC Mfg. | Fuel Strainers / Gascolators | No | White City, OR | $2M - $3M | www.stevesaircraft.com |
| Aviation Enterprise LLC | Talking | PMA/STC Mfg. | Jet Parts & Components | Yes | Newnan, GA | $4M - $6M | www.aelparts.com |
| Lear Chemical | Talking | PMA/STC Mfg. | Anti-corrosion Lubricants | Yes | Ontario, Canada | TBD | www.learchem.com |
| Knots 2U | Talking | PMA/STC Mfg. | Plastics | Yes | Burlington, WI | $7M-$8M | www.knots2u.net |
| Kenmore | Talking | PMA/STC Mfg. | Airframe Parts | No | Seattle, WA | $5M | www.kenmoreairharbor.com |
| Coastal Air Strike | Talking | PMA/STC Mfg. | Airframe Parts | Yes | Immokalee, FL | $500K | www.coastalairstrike.com |
| Aero Brakes | Talking | PMA/STC Mfg. | Airframe Parts | Yes | Lago Vista, TX | $5M | www.aerobrake.com |
| Mid Continent/Tru Blue | Talking | OEM / PMA/STC Mfg. | Batteries/Electronics | No | Wichita, KS | $80M | www.mcico.com |
| Sporty | On the Horizon | Distributor | Aircraft Supplies | N/A | Batavia, OH | $15M-$20M | www.sportys.com |
| Ralmark Company | On the Horizon | OEM / PMA/STC Mfg. | Pulleys | N/A | Kingston, PA | $7M - $10M | www.ralmark.com |
| Univair | On the Horizon | Distributor/PMA Mfg. | General | N/A | Aurora, CO | $5M - $7M | www.univair.com |
| Aero-Classics | On the Horizon | PMA/STC Mfg. | Heat Transfer Products | N/A | La Verne, CA | $5M - $7M | www.aero-classics.com |
| Rapco | On the Horizon | PMA/STC Mfg. | Brakes, Pumps, Valves & Pneumatics | N/A | Hartland, WI | $5M - $7M | www.rapcoinc.com |
| Weldon Pump | On the Horizon | PMA/STC Mfg. | Brakes & Valves | N/A | Oakwood Village, OH | $17M - $22M | www.weldonpumps.com |
| Lee Aerospace | On the Horizon | OEM / PMA/STC Mfg. | Windshields and windows | N/A | Wichita, KS | $25M | www.leeaerospace.com |
| Webco | On the Horizon | PMA/STC Mfg. | Piper PMA and Comanche repair station | N/A | Newton, KS | $2M | www.webcoaircraft.com |
| JP Instruments | On the Horizon | PMA/STC Mfg. | Digital Displays | N/A | Costa Mesa, CA | $1M | www.jpinstruments.com |
| B&C Specialty | On the Horizon | PMA/STC Mfg. | Alternators/Lycoming Oil Filter Adapters | N/A | Newton, KS | $1M | www.bandc.com |
| Texas Skyways | On the Horizon | STC | Engine STCs | N/A | Boerne, TX | $3M | www.txskyways.com |
| KS Avionics | On the Horizon | PMA/STC Mfg. | Sensors and probes | N/A | N. Canton, OH | $4M | www.ksavionics.com |
| Approved Turbo Components | On the Horizon | Repair Station | Turbo Overhauler | N/A | Vero Beach, FL | $2M | www.approvedturbo.com |
| Mike's Fuel Metering | On the Horizon | Repair Station | Fuel systems overhauler | N/A | Tulsa, OK | TBD | — |
| PowerFlow Systems | On the Horizon | PMA/STC Mfg. | Tuned Exhaust Systems | N/A | Daytona Beach, FL | $4M | www.powerflowsystems.com |
| Wilco | On the Horizon | PMA/STC Mfg. | Airframes | N/A | Wichita, KS | $2M - $5M | www.wilcoaircraftparts.com |

Map `region` automatically based on state:
- **Midwest**: WI, KS, OH
- **West**: AK, OR, WA, CA, CO
- **South**: GA, FL, TX, OK
- **Northeast**: PA
- **International**: Canada

Map `revenueBracket` automatically by parsing the `estimatedRevenue` string.

---

## tRPC API ROUTER

Create comprehensive tRPC routers in `src/server/api/routers/`:

### `company.ts` router — all CRUD + filtering

```
- getAll: returns all companies, supports filtering by: stage, category, region, revenueBracket, ndaStatus, priority, search (company name text search). Supports sorting by any column. Returns with computed fields: daysSinceLastContact, isOverdue (no contact in 30 days for "Talking" stage).
- getById: returns single company with all activities and documents
- create: insert new company
- update: partial update any fields. If pipelineStage changes, automatically log a stage_change activity and update stageChangedAt
- delete: soft-delete consideration, but for now hard delete
- getStats: returns all dashboard metrics (see Dashboard section)
- bulkUpdateStage: update multiple company stages at once
- getDueSoonFollowUps: returns companies with nextFollowUpDate within 7 days
- getStaleDeals: companies in "Talking" with no activity in 30+ days
```

### `activity.ts` router

```
- getByCompanyId: returns activities for a company, sorted newest first
- create: create activity entry (with auto-timestamp)
- getRecent: returns most recent 20 activities across all companies (for dashboard feed)
```

### `document.ts` router

```
- getByCompanyId: returns documents for a company
- create: add document link
- delete: remove document
```

---

## FRONTEND PAGES & COMPONENTS

### Design System Requirements

- **Color palette**: Dark navy (#0f172a) for sidebar/headers, white/slate-50 backgrounds for content areas, blue-600 (#2563eb) as primary accent, emerald for positive states, amber for warnings, red for critical.
- **Typography**: Use `font-sans` (Inter/system). Large numbers in dashboard cards should be `text-3xl font-bold`. Body text `text-sm`. Labels `text-xs uppercase tracking-wide text-slate-500`.
- **Spacing**: Generous whitespace. Cards with `p-6`. Consistent `gap-4` or `gap-6` grids.
- **Border radius**: `rounded-xl` for cards, `rounded-lg` for buttons and inputs.
- **Shadows**: Subtle `shadow-sm` on cards. No heavy drop shadows.
- **Mobile**: Everything must work at 375px width. Use responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- **Transitions**: `transition-all duration-200` on interactive elements.
- **Empty states**: Always show helpful empty states with icons, never blank screens.
- **Loading states**: Skeleton loaders for cards/tables during data fetch. Use `animate-pulse` with slate-200 backgrounds.

### Layout (`src/app/layout.tsx`)

Responsive shell with:
- **Sidebar** (desktop): 64px collapsed icon rail by default, expands to 240px on hover. Dark navy background. Icons for: Dashboard, Pipeline, Companies, Kanban, Calendar, Settings. Active state with blue-600 left border indicator.
- **Mobile**: Bottom tab bar with 5 key icons (Dashboard, Pipeline, Companies, Kanban, More). No hamburger menus.
- **Top bar**: Minimal — just shows current page title (left), quick-add button (+) for new company (right), and a global search input (center, collapses to icon on mobile).

### Page 1: Dashboard (`/`)

The executive command center. Must load fast, show the full picture at a glance.

**Row 1: KPI Cards** (4 across on desktop, 2x2 on mobile)
1. **Total Targets** — count of all companies. Subtitle: "Potential Acquisitions". Icon: building.
2. **Active Discussions** — count where stage is "Talking" or later (before Closed). Subtitle shows count in "Talking" stage. Icon: message-circle.
3. **Pipeline Value** — sum of estimated revenue mid-points for all active targets (parse the revenue strings — "$5M - $7M" becomes $6M). Show as "$XXM". Subtitle: "Est. Combined Revenue". Icon: dollar-sign.
4. **NDA Coverage** — percentage of "Talking" stage companies with NDA = "Yes". Show as "XX%". Subtitle: "of Active Discussions". Icon: shield.

**Row 2: Pipeline Funnel + Stage Breakdown** (2 columns)
- **Left: Visual Pipeline Funnel** — Horizontal stacked bar or funnel visualization showing count at each stage from Identified → Closed. Use graduated colors (light to dark blue). Each segment clickable to filter pipeline view.
- **Right: Stage Summary Cards** — Grid of small cards, one per active stage, showing count and top company name in each. Color-coded left border by stage.

**Row 3: Analytics Panels** (3 columns on desktop)
- **By Category** — Horizontal bar chart. Categories on Y-axis, count on X-axis. Bars colored by stage. Data from Excel: PMA/STC Mfg (17), OEM/PMA/STC Mfg (3), Distributor (2), Repair Station (2), STC (1).
- **By Region** — Donut chart. Midwest (11), West (6), South (6), Northeast (1), International (1). Show legend with counts.
- **By Revenue Size** — Horizontal bar chart with revenue brackets on Y-axis. Data: <$3M (7), $3M-$10M (12), $10M-$25M (2), $25M-$100M (2), TBD (2).

**Row 4: Action Items & Activity Feed** (2 columns)
- **Left: Needs Attention** — List of:
  - Companies overdue for follow-up (nextFollowUpDate past)
  - Stale deals (no activity in 30+ days while in "Talking")
  - Missing NDA (in "Talking" without NDA signed)
  Each item shows company name, reason, and days since last action. Clicking navigates to company detail.
- **Right: Recent Activity Feed** — Chronological list of latest 10 activities across all companies. Shows: activity icon, company name, title, relative time ("2h ago", "3d ago"). Compact layout.

**Row 5: Key Insights** (full width card)
- Auto-generated insights, similar to Excel dashboard:
  - "68% of targets are PMA/STC manufacturers — core competency alignment"
  - "44% located in Midwest — regional consolidation opportunity"
  - "2 targets over $25M — transformational acquisition potential"
  - These should be dynamically calculated from actual data, not hardcoded.

**Charts**: Use **Recharts** library (`pnpm add recharts`). Clean, minimal chart styling. No gridlines. Subtle axis labels. Tooltips on hover.

### Page 2: Pipeline Table View (`/pipeline`)

A powerful, fast data table — the daily workhorse.

- **Full-width responsive table** with columns: Company Name, Stage (colored badge), Category, Specialty, Location, Est. Revenue, NDA, Priority, Last Contact, Next Follow-Up.
- **Sticky header** on scroll.
- **Column sorting**: Click any column header to sort asc/desc.
- **Filters bar** above table: Dropdown filters for Stage, Category, Region, Revenue Bracket, NDA Status, Priority. Plus a text search input. "Clear all" button. Active filter count badge.
- **Row actions**: Click row to open company detail (slide-over panel or navigate to detail page). Hover shows quick-action icons: edit stage, add note, open website.
- **Inline stage editing**: Click the stage badge to get a dropdown to change stage instantly without leaving the table.
- **Bulk actions**: Checkbox column for multi-select → bulk stage change, bulk delete.
- **Mobile**: Cards layout instead of table. Each card shows: Company name (bold), Stage badge, Category, Location, Revenue. Tap to expand or navigate.
- **Export**: Button to export current filtered view as CSV.

### Page 3: Kanban Board (`/kanban`)

Visual drag-and-drop pipeline management.

- **Columns** = Pipeline Stages (show only stages that have companies, plus one empty column for next logical stage).
- **Cards** in each column show: Company name, category badge, revenue estimate, priority indicator (colored dot), days in current stage.
- **Drag and drop**: Moving a card between columns updates the pipeline stage via tRPC mutation, automatically creates a stage_change activity log.
- **Column headers** show: Stage name, count of companies, total estimated revenue in that stage.
- **Quick-add**: "+" button at bottom of each column to add new company directly to that stage.
- **Mobile**: Horizontal scroll with snap-to-column behavior. Each column is ~85vw wide.
- Use `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd) for drag/drop: `pnpm add @hello-pangea/dnd`

### Page 4: Company Detail (`/company/[id]`)

The deep-dive view for a single acquisition target.

**Header Section**:
- Company name (large), website link (opens new tab), stage badge, priority badge.
- Quick action buttons: Edit, Log Activity, Add Document, Change Stage.
- Breadcrumb: Dashboard > Pipeline > [Company Name].

**Left Column (2/3 width on desktop)**:
- **Overview Card**: Location, Category, Specialty, Region, NDA Status, Est. Revenue, Revenue Bracket, Owner/Assigned To, Source. Editable inline (click to edit, press Enter or click away to save).
- **Contact Card**: Primary contact name, title, email (clickable mailto:), phone (clickable tel:). Editable inline.
- **Deal Details Card**: Asking Price, EBITDA, Employee Count, Year Founded, Ownership Type. Editable inline.
- **Strategic Fit Card**: Expandable text areas for Strategic Fit Notes and Synergy Notes. Rich text not needed — plain textarea with auto-save.

**Right Column (1/3 width)**:
- **Timeline / Activity Log**: Reverse-chronological feed of all activities. Each entry: icon (by type), title, description preview, timestamp, outcome badge. "Add Activity" button at top opens a modal with: Type dropdown (Call, Email, Meeting, Note, Document, Stage Change), Title, Description textarea, Contact Person, Outcome (Positive/Neutral/Negative/Pending).
- **Documents & Links**: List of attached documents/links. Each shows: name, type badge, clickable URL, date added. "Add Document" button opens modal with: Name, Type dropdown, URL, Notes.
- **Key Dates**: Visual timeline showing: Created date, Last contacted, Stage changed, Next follow-up (editable date picker).

**Mobile**: Single column, tabbed sections (Overview, Activity, Documents, Dates).

### Page 5: Add/Edit Company (`/company/new` and edit modal)

Form for adding a new company or editing an existing one.

- **Smart form layout**: Two columns on desktop, single column on mobile.
- **Required fields** marked with subtle red dot: Company Name, Category, Pipeline Stage.
- **Auto-populated suggestions**: Category dropdown, Stage dropdown, Region auto-detected from location text if possible.
- **Sections**: Basic Info → Contact → Deal Details → Strategic Notes.
- **Save behavior**: Save button at bottom, also auto-save on blur for edit mode.
- **After save**: Redirect to company detail page (for new), or close modal and refresh (for edit).

### Global Components

- **`QuickAddModal`**: Floating action button (bottom-right on mobile, top-right on desktop) opens a streamlined modal for rapidly adding a company. Only requires: Name, Category, Stage. Everything else optional. This is for the executive who gets a tip at dinner and wants to capture it in 10 seconds.
- **`GlobalSearch`**: Command-palette style search (Cmd+K to open). Searches company names, specialties, locations. Shows results in a dropdown with stage badges. Click to navigate to company detail.
- **`StageChangeConfirmation`**: When changing stage, show a quick confirmation that also prompts to add an optional note about why the stage changed.
- **`Toast notifications`**: Use `sonner` for toast notifications on CRUD operations: `pnpm add sonner`.

---

## ADDITIONAL REQUIREMENTS

### Performance
- Use tRPC's React Query integration for caching and optimistic updates.
- Debounce search inputs (300ms).
- Paginate activity feeds beyond 50 items.
- Use `React.memo` on table rows and kanban cards.
- Skeleton loaders everywhere data loads async.

### Responsiveness Breakpoints
- `sm`: 640px — Phones
- `md`: 768px — Tablets portrait
- `lg`: 1024px — Tablets landscape / small laptops
- `xl`: 1280px — Desktops
- `2xl`: 1536px — Large monitors

### Data Validation
- Use `zod` for all tRPC input validation.
- Company name: required, max 255 chars.
- Website: optional, validate URL format if provided (prepend https:// if missing).
- Email: optional, validate email format if provided.
- Phone: optional, allow any format.

### Error Handling
- tRPC errors displayed via toast.
- Form validation errors shown inline below fields.
- Network errors show a retry banner at the top of the page.

### Accessibility
- All interactive elements keyboard navigable.
- Proper ARIA labels on icons and badges.
- Color is never the only indicator (always pair with text/icon).
- Focus rings on all interactive elements.

---

## FILE STRUCTURE

```
src/
├── app/
│   ├── layout.tsx          # Root layout with sidebar + bottom nav
│   ├── page.tsx            # Dashboard
│   ├── pipeline/
│   │   └── page.tsx        # Table view
│   ├── kanban/
│   │   └── page.tsx        # Kanban board
│   ├── company/
│   │   ├── [id]/
│   │   │   └── page.tsx    # Company detail
│   │   └── new/
│   │       └── page.tsx    # Add new company form
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── TopBar.tsx
│   │   └── PageHeader.tsx
│   ├── dashboard/
│   │   ├── KpiCards.tsx
│   │   ├── PipelineFunnel.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── RegionChart.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── NeedsAttention.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── KeyInsights.tsx
│   ├── pipeline/
│   │   ├── PipelineTable.tsx
│   │   ├── PipelineFilters.tsx
│   │   ├── PipelineRow.tsx
│   │   └── MobileCompanyCard.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── KanbanCard.tsx
│   ├── company/
│   │   ├── CompanyOverview.tsx
│   │   ├── ContactCard.tsx
│   │   ├── DealDetails.tsx
│   │   ├── StrategicFit.tsx
│   │   ├── ActivityTimeline.tsx
│   │   ├── DocumentList.tsx
│   │   ├── KeyDates.tsx
│   │   └── CompanyForm.tsx
│   ├── shared/
│   │   ├── StageBadge.tsx         # Wraps shadcn Badge with STAGE_COLORS
│   │   ├── PriorityBadge.tsx      # Wraps shadcn Badge with PRIORITY mapping
│   │   ├── NdaBadge.tsx           # Wraps shadcn Badge with NDA_COLORS
│   │   ├── QuickAddModal.tsx      # Uses shadcn Dialog + Form
│   │   ├── GlobalSearch.tsx       # Uses shadcn CommandDialog
│   │   ├── StageChangeModal.tsx   # Uses shadcn Dialog + Select + Textarea
│   │   ├── ConfirmDialog.tsx      # Uses shadcn Dialog for delete confirmations
│   │   ├── EmptyState.tsx         # Empty state with icon + text + action button
│   │   ├── DatePickerPopover.tsx  # Wraps shadcn Popover + Calendar
│   │   └── StatCard.tsx           # Wraps shadcn Card for dashboard KPI display
│   └── ui/                  # AUTO-GENERATED by shadcn — do NOT manually create these
│       ├── badge.tsx        # pnpm dlx shadcn@latest add badge
│       ├── button.tsx       # pnpm dlx shadcn@latest add button
│       ├── calendar.tsx     # pnpm dlx shadcn@latest add calendar
│       ├── card.tsx         # pnpm dlx shadcn@latest add card
│       ├── checkbox.tsx     # pnpm dlx shadcn@latest add checkbox
│       ├── command.tsx      # pnpm dlx shadcn@latest add command
│       ├── dialog.tsx       # pnpm dlx shadcn@latest add dialog
│       ├── dropdown-menu.tsx
│       ├── form.tsx         # pnpm dlx shadcn@latest add form
│       ├── input.tsx        # pnpm dlx shadcn@latest add input
│       ├── label.tsx        # pnpm dlx shadcn@latest add label
│       ├── popover.tsx      # pnpm dlx shadcn@latest add popover
│       ├── progress.tsx     # pnpm dlx shadcn@latest add progress
│       ├── scroll-area.tsx  # pnpm dlx shadcn@latest add scroll-area
│       ├── select.tsx       # pnpm dlx shadcn@latest add select
│       ├── separator.tsx    # pnpm dlx shadcn@latest add separator
│       ├── sheet.tsx        # pnpm dlx shadcn@latest add sheet
│       ├── skeleton.tsx     # pnpm dlx shadcn@latest add skeleton
│       ├── sonner.tsx       # pnpm dlx shadcn@latest add sonner
│       ├── table.tsx        # pnpm dlx shadcn@latest add table
│       ├── tabs.tsx         # pnpm dlx shadcn@latest add tabs
│       ├── textarea.tsx     # pnpm dlx shadcn@latest add textarea
│       └── tooltip.tsx      # pnpm dlx shadcn@latest add tooltip
├── server/
│   ├── db/
│   │   ├── schema.ts       # All Drizzle schema (above)
│   │   ├── index.ts         # DB connection
│   │   └── seed.ts          # Seed script with 25 companies
│   └── api/
│       ├── root.ts          # Root router
│       ├── trpc.ts          # tRPC context
│       └── routers/
│           ├── company.ts
│           ├── activity.ts
│           └── document.ts
├── lib/
│   ├── utils.ts             # Shared utility functions
│   ├── constants.ts         # Stage colors, category colors, etc.
│   └── hooks/
│       ├── useDebounce.ts
│       └── useMediaQuery.ts
└── trpc/                    # tRPC client config (scaffolded)
```

---

## CONSTANTS (`src/lib/constants.ts`)

Define color mappings used across all components:

```typescript
export const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Identified':        { bg: 'bg-slate-100',   text: 'text-slate-700',   border: 'border-slate-300' },
  'On the Horizon':    { bg: 'bg-sky-50',      text: 'text-sky-700',     border: 'border-sky-300' },
  'Initial Outreach':  { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-300' },
  'Talking':           { bg: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-indigo-300' },
  'NDA Signed':        { bg: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-300' },
  'Due Diligence':     { bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-300' },
  'LOI Submitted':     { bg: 'bg-fuchsia-50',  text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
  'Under Negotiation': { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-300' },
  'Closed - Won':      { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-300' },
  'Closed - Lost':     { bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-300' },
  'On Hold':           { bg: 'bg-gray-100',    text: 'text-gray-600',    border: 'border-gray-300' },
};

export const PRIORITY_COLORS: Record<string, string> = {
  'High':   'bg-red-500',
  'Medium': 'bg-amber-500',
  'Low':    'bg-emerald-500',
};

export const NDA_COLORS: Record<string, { bg: string; text: string }> = {
  'Yes':     { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'No':      { bg: 'bg-red-50',     text: 'text-red-700' },
  'Pending': { bg: 'bg-amber-50',   text: 'text-amber-700' },
  'N/A':     { bg: 'bg-slate-50',   text: 'text-slate-500' },
};

export const CATEGORY_COLORS: Record<string, string> = {
  'PMA/STC Mfg.':         '#3b82f6',
  'OEM / PMA/STC Mfg.':   '#6366f1',
  'Distributor':           '#f59e0b',
  'Distributor/PMA Mfg.':  '#f97316',
  'Repair Station':        '#10b981',
  'STC':                   '#8b5cf6',
  'MRO':                   '#ec4899',
  'OEM':                   '#06b6d4',
  'Other':                 '#6b7280',
};

export const ACTIVITY_ICONS: Record<string, string> = {
  'call':          'phone',
  'email':         'mail',
  'meeting':       'users',
  'note':          'file-text',
  'stage_change':  'arrow-right',
  'document':      'paperclip',
};
```

---

## UTILITY FUNCTIONS (`src/lib/utils.ts`)

shadcn/ui will auto-create this file with a `cn()` function (clsx + tailwind-merge). Add these additional utilities to the same file:

```typescript
// cn() is auto-generated by shadcn init — do not remove it

// Parse revenue strings like "$5M - $7M" → { low: 5000000, high: 7000000, mid: 6000000 }
export function parseRevenue(rev: string | null): { low: number; high: number; mid: number } | null

// Format currency for display: 5000000 → "$5M"
export function formatRevenue(amount: number): string

// Relative time: Date → "2h ago", "3d ago", "2mo ago"
export function timeAgo(date: Date): string

// Determine region from location string (pattern match state abbreviations)
export function inferRegion(location: string): string | null

// Determine revenue bracket from estimated revenue string
export function inferRevenueBracket(rev: string): string

// Days between two dates
export function daysBetween(d1: Date, d2: Date): number
```

---

## IMPORTANT IMPLEMENTATION NOTES

1. **Do NOT add authentication**. This is a single-user executive tool. Skip all auth middleware and guards.

2. **Use shadcn/ui as the component foundation**. Initialize shadcn with `pnpm dlx shadcn@latest init` (use New York style, Slate base color, CSS variables YES). Then install ALL components listed in the SHADCN COMPONENTS section below. All custom components should compose on top of shadcn primitives. This gives us accessible, polished, consistent UI with minimal effort.

3. **Use `lucide-react` for all icons** (installed automatically with shadcn). Use consistent icon sizes (16px in badges, 20px in nav, 24px in empty states).

4. **All dates should display in relative format** ("3 days ago") with full date on hover tooltip.

5. **Every mutation should show a success toast** via sonner.

6. **The app should feel fast**. Use optimistic updates for stage changes and inline edits. The table and kanban should never show loading spinners after initial load — use background refetch.

7. **Mobile bottom nav should use fixed positioning** with safe-area-inset-bottom for iOS notch devices.

8. **The dashboard should be the landing page** (`/` route).

9. **Use Tailwind's `@apply` sparingly** — prefer utility classes directly in JSX.

10. **The Kanban drag-and-drop is important** — executives love visual pipeline management. Make sure it works smoothly on both desktop (mouse) and tablet (touch).

11. **Global search** (Cmd+K) should search across company name, specialty, and location simultaneously using a single tRPC query with `ilike` filters combined with `or`.

12. **CSV export** from the pipeline table should export all currently visible (filtered) columns and rows.

13. **Inline editing in company detail**: When an executive clicks a field value, it should transform into an input. On blur or Enter, save via tRPC mutation. Show a subtle green checkmark on successful save.

14. **Stage progression logic**: When changing to "NDA Signed", prompt to update ndaStatus to "Yes". When changing to "Closed - Won" or "Closed - Lost", mark as terminal (exclude from active pipeline counts).

15. **Make everything work without JavaScript initially rendering** — use Next.js Server Components where possible. Use `"use client"` only for interactive components (forms, drag-and-drop, charts, modals).

---

## INSTALL THESE PACKAGES

### Step 1: Initialize shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

When prompted, choose:
- Style: **New York**
- Base color: **Slate**
- CSS variables: **Yes**

### Step 2: Install shadcn components

```bash
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add command
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add tooltip
```

### Step 3: Install additional packages

```bash
pnpm add recharts @hello-pangea/dnd
pnpm add -D @types/react @types/react-dom
```

---

## SHADCN COMPONENTS — WHERE TO USE EACH

Here is the exact mapping of which shadcn/ui component to use for each piece of the CRM. Do NOT build custom versions of these — use the shadcn primitives directly and style with Tailwind on top.

### `Badge` → Used everywhere for status indicators
- **StageBadge**: Wrap shadcn `<Badge variant="outline">` with dynamic className from `STAGE_COLORS` constant. Use in pipeline table rows, kanban cards, company detail header, dashboard cards.
- **NDA Status**: `<Badge>` with `NDA_COLORS` mapping. Variant `default` for "Yes", `destructive` for "No", `outline` for "N/A".
- **Category badges**: `<Badge variant="secondary">` with category text.
- **Priority badges**: `<Badge>` with variant mapped from priority (High = `destructive`, Medium = `outline`, Low = `secondary`).
- **Activity type badges**: `<Badge variant="outline">` in the activity timeline.
- **Document type badges**: `<Badge variant="secondary">` in document list.

### `Button` → All interactive actions
- **Primary actions**: `<Button>` default variant — "Save", "Add Company", "Log Activity", "Add Document".
- **Secondary actions**: `<Button variant="outline">` — "Cancel", "Export CSV", "Clear Filters".
- **Destructive actions**: `<Button variant="destructive">` — "Delete Company", "Remove Document".
- **Ghost/icon buttons**: `<Button variant="ghost" size="icon">` — sidebar nav icons, table row action icons (edit, open website, add note), kanban "+" button.
- **Quick Add FAB**: `<Button size="lg" className="rounded-full fixed bottom-20 right-4 md:bottom-4 shadow-lg">` with Plus icon.
- **Filter chips (active)**: `<Button variant="secondary" size="sm">` with X icon to remove filter.

### `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` → Dashboard & detail views
- **Dashboard KPI cards**: `<Card>` with `<CardHeader>` (icon + title) and `<CardContent>` (big number + subtitle).
- **Dashboard chart panels**: `<Card>` wrapping each Recharts chart (Category, Region, Revenue).
- **Needs Attention panel**: `<Card>` with scrollable `<CardContent>`.
- **Activity Feed panel**: `<Card>` containing the chronological list.
- **Key Insights panel**: `<Card>` full-width with insight bullet points.
- **Company detail cards**: Overview, Contact, Deal Details, Strategic Fit — each a `<Card>` with `<CardHeader>` and `<CardContent>`.
- **Kanban cards**: `<Card className="cursor-grab">` inside drag-and-drop context.
- **Mobile pipeline cards**: `<Card>` replacing table rows on small screens.

### `Dialog` + `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` → All modals
- **Quick Add Company modal**: `<Dialog>` with streamlined form (Name, Category, Stage fields). Triggered by FAB button and top-bar "+" button.
- **Stage Change Confirmation**: `<Dialog>` that appears on stage change, showing from → to stages with optional note textarea.
- **Log Activity modal**: `<Dialog>` with form (Type select, Title input, Description textarea, Contact input, Outcome select).
- **Add Document modal**: `<Dialog>` with form (Name input, Type select, URL input, Notes textarea).
- **Delete Confirmation**: `<Dialog>` with destructive warning text and confirm/cancel buttons.
- **Bulk Stage Change**: `<Dialog>` for changing multiple selected companies' stages at once.

### `Command` + `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` → Global search
- **Global Search (Cmd+K)**: `<CommandDialog>` that opens on Cmd+K keypress. `<CommandInput>` for search text. `<CommandGroup label="Companies">` containing `<CommandItem>` for each result showing company name, stage badge, category, and location. Clicking navigates to `/company/[id]`. `<CommandEmpty>` shows "No companies found." This replaces the custom GlobalSearch component.

### `Select` + `SelectTrigger`, `SelectContent`, `SelectItem` → All dropdowns
- **Pipeline stage filter**: `<Select>` in filter bar above pipeline table.
- **Category filter**: `<Select>` in filter bar.
- **Region filter**: `<Select>` in filter bar.
- **Revenue bracket filter**: `<Select>` in filter bar.
- **NDA status filter**: `<Select>` in filter bar.
- **Priority filter**: `<Select>` in filter bar.
- **Inline stage editing** (pipeline table): `<Select>` that appears when clicking a stage badge in a table row.
- **Activity type** (in log activity modal): `<Select>` with options: Call, Email, Meeting, Note, Document.
- **Activity outcome** (in log activity modal): `<Select>` with: Positive, Neutral, Negative, Pending.
- **Document type** (in add document modal): `<Select>` with: NDA, LOI, Financial, Presentation, Other.
- **Company form selects**: Category, Stage, Region, Revenue Bracket, NDA Status, Priority, Ownership Type.
- **Sort column/direction**: `<Select>` or column header click.

### `Input` → All text inputs
- **Global search input** (top bar): `<Input>` with search icon prefix.
- **Pipeline text search filter**: `<Input>` with search icon.
- **Company form fields**: Company Name, Specialty, Location, Website, Contact Name, Contact Title, Contact Email, Contact Phone, Asking Price, EBITDA, Employee Count, Year Founded, Source, Tags.
- **Inline edit fields** (company detail): `<Input>` that appears when clicking a field value, replaces display text.
- **Quick Add modal**: Company Name input.
- **Activity modal**: Title, Contact Person inputs.
- **Document modal**: Document Name, URL inputs.

### `Textarea` → Multi-line text inputs
- **Strategic Fit Notes** (company detail): `<Textarea>` with auto-save on blur.
- **Synergy Notes** (company detail): `<Textarea>` with auto-save on blur.
- **Activity Description** (log activity modal): `<Textarea>`.
- **Stage Change Note** (stage change confirmation): `<Textarea placeholder="Optional note about this change...">`.
- **Document Notes** (add document modal): `<Textarea>`.

### `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` → Pipeline table
- **Pipeline table** (`/pipeline`): Full shadcn `<Table>` with:
  - `<TableHeader>` with sortable `<TableHead>` cells (click to sort, show arrow icon for active sort).
  - `<TableBody>` with `<TableRow>` per company, hover highlight via `className="hover:bg-muted/50"`.
  - `<TableCell>` containing: company name (link), stage badge, category badge, specialty text, location, revenue, NDA badge, priority dot, last contact (relative time), next follow-up date.
  - Sticky header using `className="sticky top-0 bg-background"`.
  - Checkbox column using shadcn `<Checkbox>` for bulk selection.

### `Checkbox` → Bulk selection
- **Pipeline table row selection**: `<Checkbox>` in first column of each row.
- **Select all**: `<Checkbox>` in table header that toggles all visible rows.
- Bulk action bar appears when 1+ rows selected, showing count and stage change / delete buttons.

### `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` → Company detail mobile layout
- **Company detail on mobile**: `<Tabs>` with `<TabsTrigger>`s for: Overview, Activity, Documents, Dates. Each `<TabsContent>` contains the relevant section cards.
- **Dashboard mobile**: Optional `<Tabs>` to switch between KPIs, Charts, and Activity sections.

### `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle` → Slide-over panels
- **Company quick-view from pipeline table**: Clicking a row on desktop opens a `<Sheet side="right">` with company summary (instead of navigating away). Shows: name, stage, key details, recent activity. "View Full Details" button navigates to full page.
- **Mobile sidebar**: `<Sheet side="left">` triggered by hamburger icon (if needed as fallback).
- **Filter panel on mobile**: `<Sheet side="right">` containing all filter selects stacked vertically (since the desktop filter bar doesn't fit on mobile).

### `Popover` + `PopoverTrigger`, `PopoverContent` → Date pickers and quick actions
- **Date picker for Next Follow-Up**: `<Popover>` containing shadcn `<Calendar>` component. Triggered by clicking the date or a calendar icon.
- **Date picker for Last Contact Date**: Same pattern.
- **Column header sort options**: Optional `<Popover>` on column headers with sort direction choice.

### `Calendar` → Date selection
- **Inside Popover** for date fields: Next Follow-Up, Last Contact, custom date ranges.
- Uses `react-day-picker` under the hood (installed by shadcn).

### `Skeleton` → Loading states everywhere
- **Dashboard KPI cards loading**: 4x `<Skeleton className="h-32 rounded-xl">`.
- **Dashboard charts loading**: `<Skeleton className="h-64 rounded-xl">` inside chart `<Card>`s.
- **Pipeline table loading**: `<Skeleton>` rows mimicking table structure (8-10 rows of varying-width skeletons).
- **Kanban loading**: `<Skeleton>` cards in columns.
- **Company detail loading**: `<Skeleton>` blocks for each card section.
- **Activity feed loading**: `<Skeleton className="h-16">` repeated 5x.

### `Tooltip` + `TooltipTrigger`, `TooltipContent`, `TooltipProvider` → Contextual info
- **Relative dates**: Hover over "3d ago" to see full date/time in `<TooltipContent>`.
- **Truncated text**: Company specialty or notes that are truncated in table show full text on hover.
- **Icon-only buttons**: All `<Button variant="ghost" size="icon">` wrapped in `<Tooltip>` with descriptive label (e.g., "Edit company", "Open website", "Add note").
- **Sidebar nav icons** (collapsed state): `<Tooltip>` showing page name on hover.
- **Chart data points**: Recharts has built-in tooltips, but custom formatters can reference shadcn Tooltip style.

### `Sonner` (toast) → All mutation feedback
- Import `<Toaster>` from shadcn sonner and add to root layout.
- Call `toast.success("Company added")` after successful create.
- Call `toast.success("Stage updated to Due Diligence")` after stage change.
- Call `toast.error("Failed to save changes")` on mutation errors.
- Call `toast.success("Activity logged")` after activity creation.
- Call `toast.success("Document added")` after document creation.
- Call `toast.info("Exported 15 companies to CSV")` after export.

### `Dropdown Menu` → Row actions and overflow menus
- **Pipeline table row actions**: Three-dot icon (`<MoreHorizontal>`) triggers `<DropdownMenu>` with items: "View Details", "Edit", "Change Stage →" (submenu), "Log Activity", "Open Website" (external link), separator, "Delete" (destructive).
- **Company detail overflow menu**: `<DropdownMenu>` on detail page header for secondary actions.
- **Kanban card actions**: Right-click or three-dot on card opens `<DropdownMenu>`.

### `Scroll Area` → Scrollable containers
- **Kanban board horizontal scroll**: `<ScrollArea>` with horizontal orientation wrapping all columns.
- **Activity timeline** (company detail right column): `<ScrollArea className="h-[600px]">` for long activity lists.
- **Needs Attention list** (dashboard): `<ScrollArea className="h-[300px]">`.
- **Sheet content** (company quick-view): `<ScrollArea>` for when content overflows.

### `Separator` → Visual dividers
- Between sections in company detail cards.
- Between items in activity timeline.
- Between filter bar and table content.
- Inside dropdown menus before destructive actions.

### `Label` → Form field labels
- All form fields in Company form, Activity modal, Document modal, Quick Add modal.
- Paired with `<Input>`, `<Select>`, `<Textarea>` in consistent layout.

### `Progress` → Pipeline funnel visualization
- **Dashboard pipeline funnel**: Stack of `<Progress>` bars at different widths to create funnel effect, or use as supplemental indicator showing % of pipeline in each stage.
- **Deal stage progress**: On company detail, horizontal `<Progress>` showing how far along the pipeline this company is (e.g., "Talking" = 36% through the 11 stages).

### `Form` (react-hook-form integration) → Complex forms
- **Add/Edit Company form**: Full `<Form>` with `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>` for validation. Uses `zod` resolver for tRPC-aligned validation.
- **Log Activity form** inside dialog.
- **Add Document form** inside dialog.
- Provides consistent error message display and validation UX.

---

## SUMMARY OF DELIVERABLES

After completing this prompt, the VSA CRM should have:

1. ✅ shadcn/ui initialized with all 23 components listed above installed
2. ✅ PostgreSQL schema with companies, activities, documents tables + enums
3. ✅ Seed script with all 25 companies from Excel
4. ✅ tRPC routers for full CRUD + dashboard stats + filtering
5. ✅ Executive Dashboard with KPI cards (shadcn Card), charts (Recharts), action items, activity feed, key insights
6. ✅ Pipeline table (shadcn Table) with sorting, filtering (shadcn Select), inline stage editing, bulk actions (shadcn Checkbox), CSV export
7. ✅ Kanban board with drag-and-drop stage management (@hello-pangea/dnd + shadcn Card)
8. ✅ Company detail page with inline editing (shadcn Input), activity log (shadcn ScrollArea), documents, key dates (shadcn Calendar + Popover)
9. ✅ Quick-add modal (shadcn Dialog + Form) for rapid company capture
10. ✅ Global search via Cmd+K (shadcn CommandDialog)
11. ✅ Fully responsive (mobile bottom nav, tablet, desktop sidebar) with shadcn Sheet for mobile panels
12. ✅ Toast notifications on all mutations (shadcn Sonner)
13. ✅ Skeleton loading states everywhere (shadcn Skeleton)
14. ✅ Clean, minimal, executive-grade UI built on shadcn/ui primitives

Build everything. Ship it complete. Do not leave TODO comments or placeholder components.
