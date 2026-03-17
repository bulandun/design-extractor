# Design System Extractor

Upload a design screenshot or PDF → get structured JSON covering layout, design tokens, and component mapping. Powered by Claude claude-opus-4-5.

## Deploy to Vercel (2 minutes)

1. Unzip this folder
2. Push to a GitHub repo (or drag-drop to vercel.com)
3. In Vercel dashboard → Settings → Environment Variables:
   - Add `ANTHROPIC_API_KEY` = your key (starts with `sk-ant-`)
4. Deploy — done

## Deploy to Netlify (2 minutes)

1. Unzip this folder
2. Run `npm run build` locally (or let Netlify build it)
3. Drag the `dist/` folder to netlify.com/drop  
   OR connect your GitHub repo
4. In Netlify dashboard → Site settings → Environment variables:
   - Add `ANTHROPIC_API_KEY` = your key
5. Redeploy

## Run locally

```bash
npm install
# Create .env.local:
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local
npm run dev
```

Then open http://localhost:5173

## How it works

- `/api/extract` — Vercel serverless function (or Netlify function) that holds your API key server-side and proxies requests to Anthropic. Your key never touches the browser.
- The React frontend sends image data + phase name to your own `/api/extract` endpoint
- 4 phases run sequentially: Layout → Tokens → Components → Combined

## Output

Each phase produces a JSON file:
- `layout.json` — page structure, sections, grid system
- `tokens.json` — colors, typography scale, spacing, borders
- `components.json` — navigation, hero, cards, buttons, forms
- `combined.json` — all three merged into one file
