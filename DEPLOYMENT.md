# Cloudflare Pages Deployment Guide

This guide will help you deploy your Tower Defense Typing Game to Cloudflare Pages for preview.

## 🚀 Quick Deployment

### Option 1: Using Wrangler CLI (Recommended)

1. **Install Wrangler CLI** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy to Cloudflare Pages**:
   ```bash
   npm run deploy
   ```

### Option 2: Using Cloudflare Dashboard

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Go to Cloudflare Dashboard**:
   - Visit [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Choose "Upload assets"
   - Upload the entire `dist/` folder

## 📁 Files Included in Deployment

These files will be deployed:

- `dist/index.html` - Main game file
- `dist/words.txt` - Word list for typing game
- `dist/assets/` - All game assets (images, sprites, fonts)
- `dist/README.md` - Documentation

## ⚙️ Configuration Details

The deployment uses:

- **Configuration file**: `wrangler.jsonc` specifies the assets directory
- **Build output**: `dist/` folder (configured in `vite.config.ts`)
- **Project name**: `tower-defense-typing-game`
- **Static hosting**: No server-side code needed
- **Asset optimization**: Vite handles bundling and optimization

### wrangler.jsonc Configuration:
```json
{
  "name": "tower-defense-typing-game",
  "compatibility_date": "2024-01-01",
  "assets": {
    "directory": "./dist"
  }
}
```

## 🔧 Custom Domain (Optional)

After deployment, you can:

1. **Add a custom domain** in Cloudflare Pages dashboard
2. **Configure DNS** to point to your Cloudflare Pages URL
3. **Enable HTTPS** (automatic with Cloudflare)

## 📊 Monitoring

Once deployed, you can monitor:

- **Analytics**: Page views and performance
- **Functions**: Server-side functionality (if added later)
- **Security**: DDoS protection and security events

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails**: Check that all assets are in `public/` folder
2. **Assets not loading**: Verify paths in code use `/assets/` not `./assets/`
3. **CORS errors**: Cloudflare Pages handles this automatically

### Debug Commands:

```bash
# Test build locally
npm run build
npm run preview

# Check wrangler configuration
wrangler pages project list

# View deployment logs
wrangler pages deployment list --project-name=tower-defense-typing-game
```

## 🌐 Live Preview

After successful deployment, your game will be available at:
`https://tower-defense-typing-game.pages.dev`

The URL will be provided after deployment completes.
