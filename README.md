# MealBook (Next.js + MongoDB + NextAuth + Cloudinary)

- Dashboard with **hero search**
- **Recipe cards** showing image + title + **time (minutes)**
- **Recipe detail** page with requirements, ingredients, nutrition, instructions
- **Profile** page (shows your recipes)
- **Login required** to add recipes
- **MongoDB** (Mongoose), **Cloudinary** uploads

## Run locally
```bash
npm i
cp .env.example .env.local
# Fill env values
npm run dev
```
Open http://localhost:3000

## Deployment
### Recommended: Vercel
1. Push to GitHub.
2. Import on Vercel.
3. Add env vars from `.env.local`.
4. Deploy.

### About GitHub Pages
Pages is **static only**. This app needs **server functions** (NextAuth + API + DB). Options:
- Use GH Pages for **frontend** only, and deploy the **API** (the `src/app/api/*` routes) to Render/Railway/Fly/etc. Then set `NEXT_PUBLIC_API_BASE=https://your-backend.example.com` and refactor pages that query MongoDB directly to call your API instead.
- Or, the easy path: deploy the whole app to **Vercel** (recommended).

## New features
- Light UI with hero + USP section
- Profile page with **name** edit
- **Tags** on recipes (searchable) + tag chips on cards
- **Edit your own recipes**
- **Wishlist** with heart button and `/wishlist` page

- Owner-only **delete**
- **Pagination & sorting** on dashboard
- **Tailwind CSS** makeover for a cleaner look
