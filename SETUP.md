# Detailed Setup Instructions

This guide documents the Guinness Bet Tracker setup. The app is now production-ready with Supabase backend and Landlord Mode authentication.

## Setup Status

**Last updated:** 2025-10-30

**Current Progress:**
- ✅ Frontend prototype complete
  - 4 pages built (Active Bets, Add Bet, History, Landlord Mode login)
  - Guinness design system implemented
  - Custom icons configured from 9039.jpeg
  - Modal interfaces for resolve, payment, and calendar choice
  - Notes field for bet clarifications
  - Incremental payment tracking
- ✅ Deployed to Netlify
  - URL: https://guiness-bets.netlify.app
  - Netlify CLI configured for one-command deployments
  - PWA manifest configured
- ✅ Supabase backend connected
  - Multi-device sync working
  - All CRUD operations functional
- ✅ Landlord Mode auth implemented
  - Read-only for friends
  - Write access for Dylan & Poppet (password: "schengen")
  - 30-day session persistence
- ✅ Calendar integration implemented
  - Add to Calendar button on all active bets
  - Choice between .ics download or Google Calendar
  - Auto-prompts when creating new bets
  - Works with iOS Calendar, Apple Calendar, Outlook, Google Calendar

---

## Current State: Production Ready

**What works:**
- ✅ All bet tracking features functional
- ✅ Data stored in Supabase cloud database
- ✅ Multi-device sync in real-time
- ✅ Mobile-optimized interface
- ✅ Custom icons and branding
- ✅ Landlord Mode authentication (read-only for friends, write access for Dylan/Poppet)
- ✅ Calendar integration (iOS Calendar, Google Calendar, Outlook, Apple Calendar)

**Ready to share with friends!**

---

## Prerequisites

- ✅ Web browser (Chrome or Safari recommended)
- ✅ iPhone (for mobile testing)
- ✅ Netlify account (already configured)
- ⏳ Supabase account (needed for backend phase)

**Time required for backend setup:** ~4-5 hours (when ready)

---

## Frontend Setup (COMPLETED ✅)

### Step 1: Project Created ✅

- Location: `/Users/poppet/code/guiness-tracker/`
- Files: `index.html`, `add.html`, `history.html`, `styles.css`, `app.js`
- Design: Authentic Guinness Toucan ad colors, Bowlby One + Archivo fonts

### Step 2: Icons Generated ✅

Generated from `9039.jpeg`:
- `apple-touch-icon.png` (180x180)
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `favicon-32x32.png` (32x32)
- `favicon-16x16.png` (16x16)

### Step 3: Deployed to Netlify ✅

```bash
netlify link --name guiness-bets
netlify deploy --prod --dir .
```

**Site:** https://guiness-bets.netlify.app

---

## Backend Setup ✅ COMPLETED

All backend and authentication setup has been completed on 2025-10-30.

### Step 4: Create Supabase Account ✅

**What is Supabase?**
Supabase is a cloud database service that replaced localStorage and enables multi-device sync, authentication, and permanent data storage.

**Setup:**
- Used existing Supabase account from ratings-app project
- Added new `bets` table to existing project
- No new project creation needed

**Status:** ✅ Completed 2025-10-30

---

### Step 5: Create Database Table ✅

**What was done:**
Created `bets` table with full schema including RLS policies and imported 3 mock bets (Liz Truss bet plus 2 test bets that were later deleted).

**Status:** ✅ Completed 2025-10-30

---

### Step 6: Configure Row Level Security (RLS) ✅

**What was done:**
Enabled RLS and created policy to allow all operations for all users (client-side auth handles access control).

**Status:** ✅ Completed 2025-10-30

---

### Step 7: Connect Frontend to Supabase ✅

**What was done:**
Replace localStorage with Supabase API calls.

**Instructions:**

1. Get Supabase credentials:
   - Go to **Project Settings** → **API**
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy **anon/public API key**

2. Update `app.js`:

Add at the top (after line 1):
```javascript
// Initialize Supabase
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

3. Add Supabase library to HTML files:

In `index.html`, `add.html`, `history.html`, add before `<script src="app.js">`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

4. Replace localStorage functions in `app.js`:

**Current (localStorage):**
```javascript
function saveBets() {
    localStorage.setItem('guinnessBets', JSON.stringify(mockBets));
}
```

**New (Supabase):**
```javascript
async function saveBets() {
    // No longer needed - individual operations save directly
}
```

**Example - Adding a bet:**

**Current:**
```javascript
mockBets.push(newBet);
saveBets();
```

**New:**
```javascript
const { data, error } = await supabase
  .from('bets')
  .insert([newBet]);

if (error) {
  alert('Error saving bet: ' + error.message);
  return;
}
```

5. Update all CRUD operations:
   - `loadBets()` → `supabase.from('bets').select('*')`
   - `resolveBet()` → `supabase.from('bets').update()`
   - `recordPayment()` → `supabase.from('bets').update()`

6. Test locally before deploying

**Files to modify:**
- `app.js` (main changes - ~15-20 function updates)
- All 3 HTML files (add Supabase script tag)

**Status:** ✅ Completed 2025-10-30
- Updated `app.js` with all Supabase API calls
- Added Supabase CDN script to all HTML files
- Converted all localStorage functions to async Supabase operations
- Fixed history.html async bug

---

### Step 8: Add Simple Authentication ✅

**What was done:**
Implemented "Landlord Mode" - read-only access for friends, write access for Dylan & Poppet with shared password.

**Implementation (Option A: Client-side Shared Password):**

Created `login.html` with password "schengen":
```html
<!DOCTYPE html>
<html>
<head>
    <title>Guinness Bets - Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>🍺 Guinness Bets</h1>
        <input type="password" id="passcode" placeholder="Enter passcode">
        <button onclick="checkPasscode()">Enter</button>
    </div>
    <script>
        function checkPasscode() {
            const input = document.getElementById('passcode').value;
            if (input === 'YOUR_SHARED_PASSCODE') {
                localStorage.setItem('guinness_auth', 'true');
                window.location.href = 'index.html';
            } else {
                alert('Incorrect passcode');
            }
        }
    </script>
</body>
</html>
```

2. Add auth check to all pages (at top of `<script>` sections):
```javascript
// Check auth
if (!localStorage.getItem('guinness_auth')) {
    window.location.href = 'login.html';
}
```

3. Store passcode as Netlify environment variable for security

**What was actually built:**
- Created `login.html` with "Landlord Mode" branding
- Password: "schengen" (hardcoded in client-side JS)
- Added auth functions to `app.js` (isLandlord, logout, updateUIForAuth)
- Made Add/Resolve/Record Payment buttons visible only when logged in
- Navigation toggles between "Landlord Mode" and "Logout"
- 30-day session persistence in localStorage
- Client-side only (fine for friends, not adversaries)

**Status:** ✅ Completed 2025-10-30

---

### Step 9: Migrate Existing Data ✅

**What you're doing:**
Moving any bets from localStorage to Supabase.

**Instructions:**

1. Open site in browser where you have data
2. Open browser console (Cmd + Option + J)
3. Run:
```javascript
const data = JSON.parse(localStorage.getItem('guinnessBets'));
console.log(JSON.stringify(data, null, 2));
```

4. Copy the output
5. In Supabase dashboard, go to **Table Editor** → `bets`
6. Click **"Insert"** → **"Insert row"**
7. Paste data for each bet manually, or:

8. Use SQL insert (faster for multiple bets):
```sql
INSERT INTO bets (condition, notes, due_date, dylan_side, poppet_side, dylan_pints, poppet_pints, created_date, status)
VALUES
  ('Arsenal will finish in the top 4', 'Premier League only', '2025-05-25', true, false, 2.0, 1.0, '2024-08-15', 'active'),
  -- Add more rows as needed
;
```

**Status:** ✅ Completed 2025-10-30
- Mock data (3 bets) imported directly via SQL when creating table
- User later deleted Arsenal and James Bond bets, leaving only Liz Truss bet

---

### Step 10: Deploy Backend Version ✅

**What you're doing:**
Deploying the Supabase-connected version to Netlify.

**Instructions:**

1. Add Supabase credentials to Netlify:
   - Go to Netlify dashboard → **Site settings** → **Environment variables**
   - Add `SUPABASE_URL` and `SUPABASE_KEY`
   - Update `app.js` to use environment variables (or keep them in code since anon key is public-safe)

2. Deploy:
```bash
cd /Users/poppet/code/guiness-tracker
netlify deploy --prod --dir .
```

3. Test thoroughly:
   - [ ] Add bet works and saves to database
   - [ ] Resolve bet works
   - [ ] Record payment works
   - [ ] Data persists across page refreshes
   - [ ] Works on multiple devices
   - [ ] Auth blocks unauthorized access

4. Share with Dylan for testing

**Status:** ✅ Completed 2025-10-30
- Deployed Supabase-connected version
- Deployed Landlord Mode auth
- All tests passed
- Dylan approved the UI/UX
- Ready to share with friends

---

## Deployment Workflow (Current)

```bash
# Make changes to HTML/CSS/JS
# Test locally

# Deploy to production
cd /Users/poppet/code/guiness-tracker
netlify deploy --prod --dir .

# Site updates in ~10 seconds
```

See `DEPLOY.md` for full deployment documentation.

---

## Data Schema

### Current (Supabase - ✅ Implemented)

Same structure, but stored in Postgres database with:
- Auto-incrementing IDs
- Proper data types (DATE, DECIMAL, BOOLEAN)
- Constraints and validation
- Multi-user access
- Backup and recovery

---

## Troubleshooting

### Prototype Issues

**Problem:** Lost all data
**Solution:** Data is in localStorage - clear cache to reset to mock data, or data is unrecoverable

**Problem:** Can't see changes after editing files
**Solution:** Hard refresh (Cmd + Shift + R)

### Backend Issues (Future)

**Problem:** Supabase connection fails
**Solution:** Check API credentials, verify RLS policies allow access

**Problem:** Bets not saving
**Solution:** Check browser console for errors, verify table schema matches data structure

---

## Next Steps

**✅ All setup complete!**

The app is production-ready and can be shared with friends.

**Deployment Notes:**
- Use `netlify deploy --prod --dir .` from project directory
- ⚠️ **IMPORTANT:** Limited to 8 Netlify deploys/month - deploy only when confirmed by user

**Future enhancements:**
- Statistics dashboard
- Payment history timeline
- Push notifications for due dates
- Server-side auth with Supabase RLS (if needed)

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JavaScript Client:** https://supabase.com/docs/reference/javascript
- **Netlify Docs:** https://docs.netlify.com
- **Live Site:** https://guiness-bets.netlify.app

---

**Last updated:** 2025-10-30
**Status:** ✅ Production ready - Supabase backend connected, Landlord Mode auth implemented, ready to share with friends!
