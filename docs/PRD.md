# Guinness Bet Tracker - PRD

**⚠️ IMPORTANT FOR CLAUDE: PROACTIVE DOCUMENTATION REQUIRED**
- Document ALL setup changes, workflow improvements, and bug fixes immediately
- Update both setup docs and this PRD whenever making technical changes
- Don't wait for user to ask - documentation is part of the task
- Update "Last updated" dates when making changes
- Keep deployment instructions current

---

## Product Overview

A shared web app for tracking beer-wagered bets between Dylan and Poppet. Bets are settled with pints of Guinness, with variable odds (e.g., 3 pints to 1 pint). The system tracks active bets, allows resolution, and maintains a history of past wagers.

**Origin Story:** Started with a bet about Liz Truss remaining PM by Christmas. Poppet won 3 Guinnesses vs Dylan's half pint.

---

## Problem Statement

### Current Situation

Dylan and Poppet make multiple small bets with each other throughout the year. Currently, there's no systematic way to:
- Track active bets and their terms
- Remember who owes whom how many pints
- Review past bets and outcomes
- Verify bet conditions and due dates

### User Context

- **Users:** Dylan and Poppet (may share with friends)
- **Access pattern:** Both users need read/write access
- **Technical skills:** HTML/CSS proficient, comfortable with vanilla JS (from ratings-app experience)
- **Preferred stack:** Same as ratings-app (familiar and maintainable)
- **Auth requirements:** Very simple (single password/passcode)

---

## Data Structure

### Bet Schema

Each bet contains:

**Core Fields (required):**
- `id` - Unique identifier
- `condition` - String describing the verifiable bet (e.g., "Liz Truss will still be PM by Christmas")
- `notes` - Text (optional) - Additional conditions, clarifications, or edge cases
- `due_date` - Date by which the bet must resolve
- `dylan_side` - Boolean (true/false) - Which side Dylan took
- `poppet_side` - Boolean (true/false) - Which side Poppet took
- `dylan_pints` - Float - Guinnesses Dylan stands to win/lose
- `poppet_pints` - Float - Guinnesses Poppet stands to win/lose
- `created_date` - Timestamp of bet creation
- `status` - Enum: "active", "resolved"

**Resolution Fields (populated when resolved):**
- `resolution_date` - Date the bet was settled
- `outcome` - Boolean - true/false outcome of the condition
- `winner` - String - "Dylan" or "Poppet"
- `pints_paid` - Float - Number of pints paid so far (default 0, increments over time)
- `pints_owed` - Float - Calculated field: total pints the winner won
- `fully_paid` - Calculated field: `pints_paid >= pints_owed`

**Example Bet:**
```json
{
  "id": 1,
  "condition": "Liz Truss will still be PM by Christmas 2022",
  "notes": "Being PM in name only - ceremonial role doesn't count",
  "due_date": "2022-12-25",
  "dylan_side": true,
  "poppet_side": false,
  "dylan_pints": 0.5,
  "poppet_pints": 3.0,
  "created_date": "2022-09-15",
  "status": "resolved",
  "resolution_date": "2022-10-25",
  "outcome": false,
  "winner": "Poppet",
  "pints_owed": 3.0,
  "pints_paid": 2.5,
  "fully_paid": false
}
```

**Payment Timeline Example:**
- Oct 25: Bet resolved, Dylan owes 3 pints
- Nov 3: Dylan buys 1 pint (`pints_paid = 1.0`)
- Nov 17: Dylan buys another pint (`pints_paid = 2.0`)
- Dec 8: Dylan buys a half (`pints_paid = 2.5`)
- Still owed: 0.5 pints

---

## Feature Requirements

### Phase 1: View Current Bets ⭐ **START HERE**

**What it shows:**
- List of all active bets (status = "active")
- For each bet:
  - Condition text
  - Due date
  - Dylan's side and pints
  - Poppet's side and pints
  - Days until due date

**Design:**
- Card-based layout
- Mobile-responsive
- Guinness color scheme (see Design System below)

---

### Phase 2: Resolve Bets

**Functionality:**
- Button/action on each active bet to "Resolve"
- Resolution form:
  - Outcome selector (true/false radio buttons)
  - Automatically calculates winner and pints owed
  - Resolution date (auto-filled to today)
  - Optional: Record initial payment (defaults to 0)
- Updates bet status to "resolved"
- Initializes `pints_paid = 0` (can be incremented later)
- Moves bet from active to historical

**Access control:**
- Both Dylan and Poppet can resolve bets (trust-based)
- No dispute mechanism (for now)

---

### Phase 3: Add New Bets

**Form fields:**
- Condition (textarea)
- Due date (date picker)
- Dylan's side: True or False (radio buttons)
- Dylan's pints (number input)
- Poppet's pints (number input)

**Validation:**
- All fields required
- Due date must be in future
- Pints must be > 0
- Sides must be opposite (enforced by UI - if Dylan picks True, Poppet gets False)

**UX considerations:**
- Mobile-optimized (primary device)
- Quick entry (<2 minutes to add a bet)
- Clear labeling of "who gets what if condition is true/false"

---

### Phase 4: View Past Bets

**What it shows:**
- List of all resolved bets
- Sort by resolution date (most recent first)
- For each bet:
  - Condition
  - Original due date
  - Resolution date
  - Winner
  - Pints owed
  - Pints paid so far
  - Pints remaining
  - Payment status badge (fully paid / partially paid / unpaid)

**Additional features:**
- Filter by winner
- Filter by payment status (fully paid / partially paid / unpaid)
- "Record payment" button to add incremental payments
  - Input field for pints amount (e.g., 0.5, 1.0, 2.0)
  - Adds to existing `pints_paid` total
  - Shows updated balance
- Payment history timeline (optional enhancement)

**Statistics (nice-to-have):**
- Net pints outstanding (Dylan → Poppet vs Poppet → Dylan)
- Total pints paid vs owed (across all bets)
- Running tally of wins
- Success rate by bettor
- Average pints per bet

---

### Phase 5: Simple Auth

**Requirements:**
- Single shared password/passcode
- Blocks access to entire site if not authenticated
- Session persistence (don't ask for password every visit)
- No individual user accounts needed

**Implementation options:**
- Simple passcode (4-6 digits)
- Or shared password
- Stored as environment variable in Netlify
- Client-side check initially (can be bypassed, but users are trusted)
- Optional: Supabase Row Level Security for backend protection

---

## Design System

### Color Palette (Guinness Theme)

**Primary Colors:**
- **Guinness Brown:** `#2e211b` (rich, warm brown - the actual Guinness color)
- **Guinness Dark:** `#3d2e26` (secondary brown for cards/depth)
- **Cream/Foam:** `#f5f5f5` (navigation - looks like the head on a pint)
- **Cream Text:** `#f4f1de` and `#fffef7` (off-white text colors)
- **Pure White:** `#ffffff` (for high-contrast text)

**Toucan Accent Colors:**
(From actual Guinness toucan advertisements)
- **Toucan Yellow:** `#EEBD4C` (highlights, payment amounts)
- **Toucan Red:** `#C82A2C` (primary buttons, active states)
- **Toucan Blue:** `#365876` (success/paid badges)
- **Toucan Olive:** `#808C45` (available for future use)

**Usage:**
- Background: Guinness Brown
- Cards: Guinness Dark
- Navigation: Cream/Foam (pint head effect)
- Text: Cream shades
- Primary Buttons: Toucan Red
- Highlights/Payment Amounts: Toucan Yellow
- Success/Paid badges: Toucan Blue
- Stakes/Borders: Toucan Red with subtle opacity

### Typography

**Display Font (Headers):**
- **Bowlby One** - Bold, vintage poster feel perfect for pub signage

**Body Font:**
- **Archivo** - Clean, highly readable sans-serif with variable weights

**Styling:**
- Headers: All-caps or Title Case
- Buttons: All-caps
- Body text: Regular case

### Visual Style

**Approach:** "Pub Chalkboard Meets Modern UI"
- Not brutalist like ratings-app
- Softer, rounder corners (think beer glass curves)
- Subtle textures (optional: slight noise/grain on dark background)
- Shadow use: Soft glows for highlights, not harsh shadows

**Components:**
- **Cards:** Dark background with cream borders, rounded corners
- **Buttons:** Toucan orange primary, cream outline secondary
- **Forms:** High contrast inputs with cream text on dark fields
- **Status badges:**
  - Active: Toucan yellow
  - Resolved: Cream
  - Paid: Toucan blue-green
  - Unpaid: Toucan orange

---

## Tech Stack

### Core Stack (Same as Ratings-App)

- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework)
- **Backend:** Supabase (Postgres database)
- **Hosting:** Netlify (free tier, auto-deploy)
- **Database:** Postgres via Supabase (free tier sufficient)

### Why Vanilla JS (Not ShadCN)

**Decision rationale:**
- ShadCN requires React/Next.js (significantly more complex)
- Vanilla JS is maintainable with current skill level
- Can build custom components with Guinness theme
- Consistent with ratings-app (same patterns, easier maintenance)
- No build tools or npm complexity on frontend

### Key Differences from Ratings-App

**Database:**
- New Supabase project (or separate table in existing project)
- Simpler schema (just bets table)
- Multi-user access (both Dylan and Poppet write to same DB)

**Auth:**
- Ratings-app has no auth
- Guinness tracker needs simple shared password

**UI Patterns:**
- Ratings-app: Single form for data entry
- Guinness tracker: Multiple views (active, add, history) + resolve actions

---

## Implementation Plan

### Phase 1: Setup & View Active Bets (Week 1)

**Tasks:**
1. Create new Supabase project or table
2. Define `bets` table schema
3. Build `index.html` (active bets view)
4. Write CSS with Guinness design system
5. Write JS to fetch and display active bets
6. Deploy to Netlify
7. Add seed data (Liz Truss bet as example)

**Success Criteria:**
- Can view all active bets on mobile
- Design looks Guinness-themed
- Data loads from Supabase

---

### Phase 2: Resolve Functionality (Week 2)

**Tasks:**
1. Add "Resolve" button to each bet card
2. Create resolution modal/form
3. Write JS to update bet status in Supabase
4. Add success messaging
5. Test resolution flow end-to-end

**Success Criteria:**
- Can resolve a bet from mobile
- Winner is calculated correctly
- Bet moves from active to resolved
- Payment status can be toggled

---

### Phase 3: Add New Bets (Week 3)

**Tasks:**
1. Create `add.html` page or modal
2. Build form with all required fields
3. Add validation (client-side)
4. Write JS to insert new bet into Supabase
5. Add navigation between views (active → add)

**Success Criteria:**
- Can add a new bet in <2 minutes
- Form validates properly
- New bet appears in active bets immediately

---

### Phase 4: Historical View (Week 4)

**Tasks:**
1. Create `history.html` page
2. Fetch resolved bets from Supabase
3. Display in reverse chronological order
4. Add filters (winner, payment status)
5. Add "mark as paid" toggle for unpaid bets
6. Build statistics section (optional)

**Success Criteria:**
- Can view all past bets
- Filters work correctly
- Can mark bets as paid from history view

---

### Phase 5: Simple Auth (Week 5)

**Tasks:**
1. Create `login.html` page
2. Add passcode input
3. Store session in localStorage
4. Add environment variable in Netlify
5. Protect all pages with auth check
6. Optional: Add Supabase RLS

**Success Criteria:**
- Site requires passcode on first visit
- Session persists across visits
- Easy to share passcode with Dylan and friends

---

## Design Decisions

1. **Navigation:** Simple links/buttons between views (no hamburger menus)
2. **Bet editing:** Bets are immutable once created (manual edits in Supabase if absolutely needed)
3. **Notifications:** No automated notifications (future: calendar integration for due dates)
4. **Export:** No CSV export needed
5. **Bet categories:** No categories - free-form condition text only
6. **Dispute resolution:** Resolve in person (no system support for disputes)

---

## Future Enhancements (Post-MVP)

**Payment History Tracking:**
- Separate `payments` table to track each individual payment
- Record date, amount, and location of each pint paid
- Timeline view showing payment history
- "Last paid on..." timestamps

**Friend Leaderboard:**
- Track bets with other friends
- Multi-user support (not just Dylan and Poppet)
- Individual win/loss records

**Push Notifications:**
- Reminder when bet is due soon
- Notification when opponent resolves a bet
- "Dylan just bought you a pint!" payment notifications

**Bet Comments/Discussion:**
- Add notes or trash talk to each bet
- Photo evidence for resolution

**Advanced Stats:**
- Win rate over time
- Category-based success rates
- Pints owed visualization
- Average time to full payment
- "Most generous loser" badge

**Social Features:**
- Share individual bets publicly
- "Gallery of shame" for worst predictions

---

## Success Metrics

**Immediate (Phase 1-2):**
- Both users can view and resolve bets
- No more forgotten wagers
- Clear record of who owes whom

**Long-term (Phase 3-5):**
- 100% of bets tracked in system (not just memory)
- Easy to add new bets (encourages more betting)
- Historical record provides entertainment value
- Friends enjoy browsing bet history

---

## Technical Constraints

- Must work on mobile (primary device for both users)
- Must be maintainable with vanilla JS skills
- Free hosting required (Netlify + Supabase free tiers)
- Simple auth sufficient (not enterprise-grade security)
- Fast load times (Guinness waits for no one)

---

## Project Structure

```
guiness-tracker/
├── index.html          # Active bets view
├── add.html           # Add new bet form
├── history.html       # Past bets view
├── login.html         # Auth page (Phase 5)
├── styles.css         # Guinness design system
├── app.js             # Main application logic
├── auth.js            # Authentication logic (Phase 5)
├── manifest.json      # PWA config
├── icons/             # App icons
│   ├── icon-192.png
│   └── icon-512.png
├── README.md          # Quick start guide
├── SETUP.md           # Detailed setup instructions
└── package.json       # Dev dependencies (if needed)
```

---

## Learning Goals

As you build this:
- Practice vanilla JS patterns from ratings-app
- Learn multi-view SPA navigation
- Build custom components (cards, modals, forms)
- Implement simple authentication
- Create cohesive design system from scratch

---

**Status:** ✅ **FULLY FUNCTIONAL WITH LANDLORD MODE AUTH + CALENDAR INTEGRATION**

**Live URL:** https://guiness-bets.netlify.app

**Last Updated:** 2025-10-30
**Next Steps:**
1. ✅ Supabase backend - COMPLETED
2. ✅ Lightweight auth (Landlord Mode) - COMPLETED
3. ✅ Calendar integration - COMPLETED
4. ✅ Ready to share with friends!

**Recent Changes:**
- 2025-10-30: **📅 Calendar Integration implemented**
  - "Add to Calendar" button on all active bets
  - Modal choice between .ics download or Google Calendar
  - Works with iOS Calendar, Apple Calendar, Outlook, Google Calendar
  - Auto-prompts when creating new bets
  - Includes bet details, stakes, and notes in calendar event
  - Day-of reminder notification included
- 2025-10-30: **🎉 MILESTONE: Landlord Mode auth implemented**
  - Friends can VIEW all bets (read-only)
  - Dylan & Poppet can ADD/RESOLVE/PAY bets after logging in
  - Password: "schengen" (hardcoded, client-side only)
  - Session persists 30 days in localStorage
  - Navigation toggles between "Landlord Mode" and "Logout" based on auth state
  - Clean 4-item navigation (no longer shows 5 items when logged in)
- 2025-10-30: **🎉 MILESTONE: Supabase backend connected** - Multi-device sync now working
  - All bets now stored in cloud database
  - Add, resolve, and payment tracking all working with Supabase
  - Fixed async function bug in history.html
  - Dylan approved the UI/UX
- 2025-10-27: **Netlify CLI configured** - One-command deployments with `netlify deploy --prod --dir .`
- 2025-10-27: **Improved resolve bet UX** - Modal interface with TRUE/FALSE buttons and Cancel option (replaces browser confirm prompt)
- 2025-10-27: **Deployed to Netlify** - Live at https://guiness-bets.netlify.app for feedback from Dylan
- 2025-10-27: **Updated typography** - Bowlby One (display) and Archivo (body) for vintage poster feel
- 2025-10-27: **Updated to authentic Guinness Toucan ad colors** - Red, yellow, blue, olive from actual vintage ads
- 2025-10-27: **Prototype built** - Full frontend with mock data (notes field, improved payment UI)
- 2025-10-27: Added optional notes field for bet clarifications and edge cases
- 2025-10-27: Improved payment UI with half-pint buttons and modal interface (replaces browser prompts)
- 2025-10-27: Updated payment tracking from boolean to incremental float field (pints can be paid over multiple occasions)
- 2025-10-27: Design decisions finalized - simple navigation links, immutable bets, no categories, calendar integration as future enhancement

---

**Notes:**
- Keep code heavily commented (like ratings-app)
- Maintain beginner-friendly patterns
- Prioritize mobile experience
- Have fun with the Guinness theme! 🍺
- **UX preference:** User dislikes hamburger menus - always use visible navigation
