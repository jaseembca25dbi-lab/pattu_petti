# 📻 Pattupetti (പാട്ടുപെട്ടി)

A modern, responsive Malayalam audio streaming web application built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 GitHub Pages Deployment

This repository is pre-configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated deployment to GitHub Pages.

### Enabling GitHub Pages on Repository:
1. Open your repository on GitHub: `https://github.com/jaseembca25dbi-lab/pattu_petti`
2. Go to **Settings** > **Pages**
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**
4. The deployment workflow will automatically build and publish the application at:
   `https://jaseembca25dbi-lab.github.io/pattu_petti/`

### (Optional) Configure Repository Secrets:
Go to **Settings** > **Secrets and variables** > **Actions** and set:
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Publishable API Key

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

