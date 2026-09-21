# Spend report / รายงานค่าใช้จ่าย

Client-side Claude spend analytics for the **UX/UI Designer** group, designed against the AXIO enterprise dashboard kit. Switch **TH / EN** from the top navbar.

Four pages, not one long scroll. No csv upload. Search the whole report from the navbar (`⌘K` / `Ctrl K`): pages, people, products, models, and months.

The overview ranks people by net spend (ยอดสุทธิ), requests, tokens, cache, web search, cost per request, July→August change, and zero spend. Click a person, product, or model in a chart to open an interactive detail modal.

Charts are the default: donuts for mix/share, horizontal bars for rankings, month bars, and a requests-against-spend scatter with median quadrants. Spend is net only (`total_net_spend_usd`).

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:4317`.

## Pages

| Path | Feature | What it is for |
|------|---------|----------------|
| `/` | Overview | Spend hero, requests-against-spend scatter, month bars + share donut, ranking bars |
| `/people` | People | Requests-against-spend scatter, spend share donut, distribution, top-spender bars |
| `/products` | Products | Product/model donuts and bars, stacked spend by month |
| `/months` | Months | Net spend bars with request line, token mix, top csv-row bars |

Month chips stay at the top of every page. September is a 15-day file on purpose.

## Source files

Bundled from `public/data/`:

| Month | Date range | File |
|-------|------------|------|
| July 2026 | 01/07/2026 – 31/07/2026 | `spend-report-…-2026-07-01-to-2026-07-31.csv` |
| August 2026 | 01/08/2026 – 31/08/2026 | `spend-report-…-2026-08-01-to-2026-08-31.csv` |
| September 2026 | 01/09/2026 – 15/09/2026 (15 days) | `spend-report-…-2026-09-01-to-2026-09-15.csv` |

Each csv row is one `user_email` × `product` × `model` in that month. Only the UX/UI Designer roster is included.

## Tech

Vite + React + TypeScript · React Router · Recharts · PapaParse · lucide-react · AXIO local UI kit

## Production

```bash
npm run build
npm run preview
```

`npm run build` writes `dist/`. Deploy that folder to Netlify (`netlify.toml` plus `public/_redirects` keep client routes working). For a one-off share without a Netlify login:

```bash
npx netlify-cli deploy --dir=dist --no-build --prod --allow-anonymous
```

Claim the site within one hour so it stays online.
