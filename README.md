# 🍺 Guinness Bet Tracker

A web app for tracking beer-wagered bets between Dylan and Poppet.

**🌐 Live Prototype:** https://guiness-bets.netlify.app

**🚀 Deploy Updates:**
```bash
cd /Users/poppet/code/guiness-tracker
netlify deploy --prod --dir .
```

See [DEPLOY.md](DEPLOY.md) for full deployment guide.

---

## 🎯 Current Status: ✅ Production Ready with Landlord Mode + Calendar Integration

**MILESTONES ACHIEVED:**
- ✅ Supabase backend connected (cloud database, multi-device sync)
- ✅ Landlord Mode auth (read-only for friends, write access for Dylan/Poppet)
- ✅ Calendar integration (iOS Calendar, Google Calendar, Outlook, Apple Calendar)

**What works:**
- ✅ **For everyone:** View all active bets and history, add bets to calendar
- ✅ **For landlords:** Add bets, resolve bets, record payments (password: "schengen")
- ✅ **Calendar reminders:** Never forget a bet due date
- ✅ Session persists 30 days
- ✅ Multi-device access with real-time sync

**Ready to share with friends!** 🍺

---

## 🚀 How to Use the Prototype

### Option 1: Open Directly in Browser
1. Navigate to the `guiness-tracker/` folder
2. Double-click `index.html` to open in your browser
3. Start tracking bets!

### Option 2: Use a Local Server (Recommended for iPhone testing)
```bash
cd guiness-tracker
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
# Or open on iPhone using your computer's local IP address
```

---

## 📱 Features

### ✅ Active Bets (`index.html`)
- View all active bets
- See days until due date
- Resolve bets with modal interface (TRUE/FALSE buttons with preview of winners)
- Cancel option to back out of resolution
- Automatically calculates winner based on outcome

### ✅ Add New Bet (`add.html`)
- Create new bets with condition, due date, and stakes
- Optional notes field for clarifications and edge cases
- Dylan and Poppet take opposite sides
- Variable pint amounts (supports halves: 0.5, 1.0, 2.0, etc.)
- Live example preview

### ✅ History (`history.html`)
- View all resolved bets
- See payment status (unpaid / partially paid / fully paid)
- Record incremental payments via modal with half-pint buttons (+0.5, +1.0, +2.0)
- Outstanding pints summary (Dylan owes / Poppet owes)

---

## 🎨 Design System

**Color Palette (from authentic Guinness Toucan ads):**
- Guinness Brown: `#2e211b` (background)
- Cream/Foam: `#f5f5f5` (navigation - like the head on a pint)
- Cream Text: `#f4f1de` (text)
- Toucan Red: `#C82A2C` (primary buttons)
- Toucan Yellow: `#EEBD4C` (highlights)
- Toucan Blue: `#365876` (success badges)
- Toucan Olive: `#808C45` (available for future use)

**Typography:**
- Display: Bowlby One (headers - bold vintage poster style)
- Body: Archivo (all other text - clean, readable sans-serif)

**Style:** "Pub Chalkboard Meets Modern UI" - rounded corners, soft shadows, Guinness theming

---

## 📊 Mock Data

The prototype includes 3 sample bets:
1. **Liz Truss bet** (resolved) - the legendary first bet
2. **Arsenal top 4** (active)
3. **Next James Bond** (active)

**To customize the mock data:**
1. Open `app.js`
2. Edit the `mockBets` array (starts at line 10)
3. Refresh the page

**Data structure:**
```javascript
{
    id: 1,
    condition: "Arsenal will finish in the top 4",
    notes: "Premier League only - cups don't count", // Optional clarifications
    due_date: "2025-05-25",
    dylan_side: true,        // Dylan says TRUE
    poppet_side: false,      // Poppet says FALSE
    dylan_pints: 2.0,        // Dylan wins 2 pints if correct
    poppet_pints: 1.0,       // Poppet wins 1 pint if correct
    created_date: "2024-08-15",
    status: "active"         // or "resolved"
}
```

---

## 🧪 Testing on iPhone

1. Start local server on your Mac:
   ```bash
   cd guiness-tracker
   python3 -m http.server 8000
   ```

2. Find your Mac's local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. On iPhone, open Safari and navigate to:
   ```
   http://[YOUR_MAC_IP]:8000
   ```
   Example: `http://192.168.1.100:8000`

4. Add to home screen:
   - Tap Share button
   - "Add to Home Screen"
   - Choose icon name
   - Tap "Add"

---

## 🔄 Data Persistence

**✅ NOW LIVE - Supabase Backend:**
- Data stored in cloud Postgres database
- Accessible from any device
- Shared between Dylan and Poppet
- Permanent storage with automatic backups
- Real-time sync across devices

---

## 📅 Calendar Integration

**Never forget a bet due date!**

All users (friends and landlords) can add active bets to their calendar:

1. **On Active Bets page:** Click "📅 Add to Calendar" button on any bet
2. **When adding a new bet:** Get prompted after creating the bet
3. **Choose your calendar:**
   - **Download .ics** - Works with iOS Calendar, Apple Calendar, Outlook, etc.
   - **Google Calendar** - Opens directly in browser

**What's included in the calendar event:**
- Title: "Bet Due: [condition]"
- Date: Due date (all-day event)
- Description: Stakes for Dylan and Poppet, plus any notes
- Reminder: Day-of notification

---

## 🔐 Landlord Mode (Authentication)

**For Friends (Default View):**
- Visit the site and see all bets
- Read-only access - no ability to modify data
- Perfect for spectating and following along
- Can add bets to their own calendar

**For Dylan & Poppet:**
1. Click "Landlord Mode" in navigation
2. Enter password (hint: *All lowercase ... kinda sounds like a guitar riff. What a word*)
3. Session saved for 30 days
4. Now can:
   - Add new bets
   - Resolve active bets
   - Record pint payments
5. Click "Logout" to exit landlord mode

**Password:** `schengen`

---

## 🎯 Future Enhancements

Possible future additions (not planned yet):
- **Statistics dashboard** - Win rates, pints owed visualizations, success rates
- **Payment history timeline** - Track each individual pint payment with dates/locations
- Server-side auth with Supabase RLS (if client-side bypass becomes an issue)
- Bet editing/deletion (currently immutable by design)
- Push notifications for due dates
- Multi-user support for betting with other friends

---

## 🐛 Known Limitations

- ✅ ~~No real database~~ - FIXED: Supabase connected
- ✅ ~~No multi-device sync~~ - FIXED: Real-time cloud sync
- ✅ ~~No auth~~ - FIXED: Landlord Mode implemented
- ⚠️ **Client-side auth only** - Technical users could bypass (fine for friends)
- ✅ No delete/edit functionality (bets are immutable by design - intentional)
- ✅ No offline support beyond cached files (not needed for this use case)

---

## 📁 File Structure

```
guiness-tracker/
├── index.html       # Active bets view (with resolve modal)
├── add.html         # Add new bet form (with notes field)
├── history.html     # Past bets and payments (with payment modal)
├── styles.css       # Guinness design system (Toucan colors + Bowlby One)
├── app.js           # Mock data and logic
├── README.md        # This file
├── DEPLOY.md        # Netlify deployment guide
└── .netlify/        # Netlify CLI configuration (gitignored)
```

---

## 💡 Tips

**Reset all data:**
```javascript
// Open browser console and run:
localStorage.clear();
location.reload();
```

**Inspect mock data:**
```javascript
// Open browser console and run:
console.log(JSON.parse(localStorage.getItem('guinnessBets')));
```

**Manually edit a bet:**
1. Open browser console
2. Run: `console.log(mockBets)`
3. Edit in Supabase later (when connected)

---

**Have fun tracking those pints! 🍺**
