# KADOKKO AI Guide Demo

Smartphone-first MVP for a KADOKKO AI案内所 demo.

Repository: https://github.com/takasaito-dev/codex-web-demos

Preview: https://takasaito-dev.github.io/codex-web-demos/

## MVP Scope

- おみやげ診断: static product data and rule-based scoring
- 商品を知る: Japanese and English product cards
- 金木町を歩く: fixed route suggestions with ordinary Google Maps links
- 津軽弁くじ: curated phrase data, no free generation

No paid APIs, AI APIs, map APIs, translation APIs, databases, or API keys are used.

## Data Files

- `src/data/products.ts`
- `src/data/diagnosisRules.ts`
- `src/data/routes.ts`
- `src/data/dialects.ts`
- `src/lib/diagnosis.ts`

Product prices, stock, walking times, and availability are demo placeholders and should be replaced with verified KADOKKO data before real use.

## Commands

```sh
npm install
npm run dev
npm run build
git add .
git commit -m "Update demo"
git push
```

Pushing to `main` publishes the latest build with GitHub Pages.
