# Webseries Promo Landing Page

A stylish, responsive landing page for a web series promo with a poster background, YouTube embed, launch countdown, and calendar link.

## Quick start
1. Put your poster image at `assets/poster.jpg` (create the `assets` folder if needed).
2. Open `index.html` and update the `window.__CONFIG__` block near the bottom:
   - `youtubeVideoId`: your YouTube video ID (e.g. `dQw4w9WgXcQ`).
   - `launchISO`: the launch date/time in ISO 8601 (UTC recommended), e.g. `2025-12-31T12:00:00Z`.
   - `title`, `description`, and `siteUrl`.
3. Open `index.html` in your browser.

## Optional
- Replace `assets/favicon.png` with your favicon.
- Update meta tags (Open Graph/Twitter) for better sharing previews.
- Deploy to any static host (GitHub Pages, Netlify, Vercel, etc.).

## Notes
- If the countdown reaches zero, the UI switches to "Now streaming".
- The Google Calendar button creates a 1-hour event starting at your launch time.
