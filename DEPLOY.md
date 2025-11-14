# 🚀 Deployment Guide

## Quick Deploy to Production

From the `guiness-tracker/` directory:

```bash
netlify deploy --prod --dir .
```

That's it! Updates will be live at **https://guiness-bets.netlify.app** in ~10 seconds.

---

## What This Does

- Builds and uploads all files from the current directory
- Deploys to production immediately
- Updates the live site (no draft/preview)

---

## Typical Workflow

1. Make changes to HTML/CSS/JS locally
2. Test by opening `index.html` in browser (or use local server)
3. When ready to deploy:
   ```bash
   cd /Users/poppet/code/guiness-tracker
   netlify deploy --prod --dir .
   ```
4. Share updated URL with Dylan

---

## Other Useful Commands

**Deploy to preview/draft first (test before prod):**
```bash
netlify deploy --dir .
# This gives you a preview URL to test before going live
```

**Check site status:**
```bash
netlify status
```

**Open site in browser:**
```bash
netlify open:site
```

**Open Netlify dashboard:**
```bash
netlify open
```

---

## Site Details

- **Site Name:** guiness-bets
- **URL:** https://guiness-bets.netlify.app
- **Deploy Directory:** `.` (root of guiness-tracker folder)
- **Linked:** ✅ (via `.netlify/state.json`)

---

## Troubleshooting

**If deploy fails with "not linked" error:**
```bash
netlify link --name guiness-bets
```

**If you need to re-authenticate:**
```bash
netlify login
```

**To see recent deployments:**
```bash
netlify deploy:list
```

---

**Last Updated:** 2025-10-27
