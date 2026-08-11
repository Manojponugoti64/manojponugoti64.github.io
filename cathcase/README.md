# CathCase

Interactive cath lab case library for cardiology residents. Textbook-sourced cases with step-by-step decision making and reference atlas.

## Cases

| Case | Topic | Steps |
|------|-------|-------|
| LAD + OM1 Bifurcation PCI | Bifurcation | 5 |
| Complete Heart Block in Inferior STEMI | Bradyarrhythmia | 4 |
| Jailed Side Branch — FFR Decision | FFR | 4 |

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- No backend — progress saved in localStorage
- Textbook images from curated cardiology references

## Run locally

```bash
cd cathcase
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npx vercel
```

Or connect the `cathcase/` directory to Vercel from the dashboard.

## Disclaimer

For educational purposes only. Not intended for clinical decision-making.
