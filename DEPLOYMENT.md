# Wardrobe Catalog Deployment

## 1. Supabase setup

1. Open your Supabase project dashboard.
2. Go to `SQL Editor` and run the SQL in `supabase/schema.sql`.
3. Go to `Authentication -> Sign In / Providers` and enable `Email`.
4. Go to `Authentication -> URL Configuration` and add these redirect URLs:
   - `http://localhost:5173/`
   - `https://nanj1089.github.io/wardrobe-catalog/`

## 2. GitHub Pages setup

1. Push this project to the `main` branch of:
   - `https://github.com/Nanj1089/wardrobe-catalog`
2. In GitHub, open:
   - `Settings -> Pages`
3. Set `Source` to `GitHub Actions`.
4. The workflow in `.github/workflows/deploy.yml` will publish the site automatically after every push.

## 3. Local development

```powershell
npm install
npm run dev
```

## 4. Login and sync

- Open the site.
- Enter your email in the login panel.
- Click the magic link from your email inbox.
- After login, your wardrobe data will sync to Supabase and remain available on both desktop and mobile.
