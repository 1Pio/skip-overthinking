# User Setup: Convex Backend

This guide walks you through setting up the Convex backend for authenticated decision sync.

## Status: Incomplete

---

## 1. Create Convex Project

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Click "Create new project"
3. Name it `skip-overthinking` (or your preferred name)
4. **Important:** Set deployment location to **Europe** (or your preferred region)
   - Go to Settings → Deployment location
   - Select Europe for GDPR compliance

## 2. Environment Variables

Add these to your local `.env` file:

| Variable | Source | Required |
|----------|--------|----------|
| `CONVEX_DEPLOYMENT` | Convex Dashboard → Settings → Deployment name | Yes |
| `CONVEX_DEPLOY_KEY` | Convex Dashboard → Settings → Deployment Keys | Yes |

### How to get them:

```bash
# After creating project, run:
npx convex dev

# This will prompt you to link your project and create .env.local
# Or manually copy from Dashboard
```

## 3. Configure Auth Providers

Go to **Convex Dashboard → Auth** for each provider:

### GitHub OAuth

1. Create OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
   - Application name: `Skip Overthinking`
   - Homepage URL: `http://localhost:5173` (dev) / your production URL
   - Authorization callback URL: `https://<your-deployment>.convex.site/api/auth/callback/github`
2. Copy Client ID and Client Secret
3. In Convex Dashboard → Auth → GitHub:
   - Enable GitHub provider
   - Paste Client ID and Client Secret

### Google OAuth

1. Create OAuth 2.0 credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Authorized JavaScript origins: `http://localhost:5173` (dev) / your production URL
   - Authorized redirect URIs: `https://<your-deployment>.convex.site/api/auth/callback/google`
2. Copy Client ID and Client Secret
3. In Convex Dashboard → Auth → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret

### Email (Resend)

1. Create account at [Resend](https://resend.com)
2. Get API key from Dashboard
3. Set environment variable:
   ```bash
   npx convex env set RESEND_API_KEY re_...
   ```
4. In Convex Dashboard → Auth → Resend:
   - Enable Resend provider

## 4. Deploy Schema

Once environment is configured:

```bash
# Generate types and deploy schema
npx convex dev

# Or for production deployment
npx convex deploy
```

## 5. Verify Setup

```bash
# Check deployment
npx convex env list

# Should show your auth keys if configured
```

## Troubleshooting

### "Cannot find module './_generated/server'"
Run `npx convex dev` to generate types.

### Auth not working
- Verify callback URLs match your Convex deployment URL exactly
- Check that providers are enabled in Convex Dashboard
- Ensure environment variables are set

### "Not authenticated" errors
- Frontend needs ConvexProvider with AuthProvider wrapping the app
- Check browser console for auth state

---

## Next Steps

After completing setup:
1. Run `npx convex dev` to generate types
2. Integrate ConvexProvider in frontend (Plan 05-02)
3. Test auth flow locally
