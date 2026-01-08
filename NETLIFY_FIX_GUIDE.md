# Netlify Deployment Fix - Complete Guide

## What Was Fixed

### ✅ Critical Fix: API Authentication
**Problem**: Anthropic client was initialized at build time with empty API key
**Solution**: Changed to lazy initialization at runtime

The API key is now read when the student submits work (at runtime), not when the app is built. This means Netlify environment variables will work correctly.

### ✅ Fixed: Missing CSS File
**Problem**: index.css referenced but didn't exist (404 error)
**Solution**: Removed the non-existent reference

### ✅ Improved: Tailwind CDN Warning
**Problem**: Tailwind CDN shows production warning in console
**Solution**: Added comment noting it's for demo purposes

**Note**: Tailwind CDN still being used. This is intentional - removing it would break all styling. For a production app, you'd want to install Tailwind properly, but for a demo this is acceptable.

### ✅ Added: Environment Variable Validation
**New file**: `lib/env.ts`
**Purpose**: Better error messages if API key is missing

### ✅ Cleaned: Vite Config
**Removed**: Legacy Gemini API key definitions that weren't being used

## Next Steps for Netlify Deployment

### Step 1: Verify Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Click **Site settings** → **Build & deploy** → **Environment variables**
3. Ensure you have these variables set:

   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   VITE_CLAUDE_MODEL=claude-sonnet-4-5-20250929
   VITE_BASE_URL=https://your-site-name.netlify.app
   ```

4. **Important**: Make sure there are no extra spaces or quotes around the values

### Step 2: Redeploy Your Site

Option A - Trigger Rebuild from Netlify:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

Option B - Push to Git:
```bash
git add .
git commit -m "Fix Netlify deployment - lazy initialize API client"
git push
```

Netlify will automatically rebuild and deploy.

### Step 3: Verify the Fix

After deployment completes:

1. Open your Netlify site URL
2. Open browser DevTools (F12) → Console tab
3. You should see:
   - ✅ NO "Could not resolve authentication method" errors
   - ✅ NO "index.css 404" errors
   - ⚠️ Still see Tailwind CDN warning (this is okay for demo)

4. Test student submission:
   - Go to Student View
   - Enter a name and submit work
   - It should successfully generate feedback without errors

## Understanding the Fix

### Before (Build-time initialization):
```typescript
// This ran when Vite built the JavaScript
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "", // Empty string on Netlify!
});
```

When Netlify builds your app, `import.meta.env.VITE_ANTHROPIC_API_KEY` is replaced with the actual value **at build time**. If the env var isn't available during the build (which it isn't in Netlify's build process by default), it gets compiled as an empty string.

### After (Runtime initialization):
```typescript
// This runs when a student submits work
function getAnthropicClient() {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing API key...');
  return new Anthropic({ apiKey });
}
```

Now the API key is read when the function is called, not when the build happens. Environment variables in Netlify are available at runtime in the browser.

## Troubleshooting

### If you still get API authentication errors:

1. **Check the exact error message** in browser console
2. **Verify API key is correct**:
   - Go to https://console.anthropic.com/settings/keys
   - Generate a new key if needed
   - Update in Netlify environment variables
3. **Check for typos** in the variable name: `VITE_ANTHROPIC_API_KEY` (exact spelling)
4. **Clear Netlify build cache**:
   - Site settings → Build & deploy → Build settings
   - Click "Clear build cache"
   - Trigger a new deploy

### If styling looks broken:

The Tailwind CDN should still be working. If not:
1. Check browser console for script loading errors
2. Verify index.html has: `<script src="https://cdn.tailwindcss.com"></script>`

### If you see "Missing required environment variable" error:

This means the API key isn't being read. Check:
1. Environment variable is set in Netlify (exact name)
2. You've redeployed after setting the variable
3. The value doesn't have extra spaces or quotes

## Production Considerations

For a real production deployment (beyond demo):

1. **Move API calls to backend**: Don't expose API keys in the browser
2. **Install Tailwind properly**: Remove CDN, use PostCSS + Tailwind CLI
3. **Add proper database**: Replace localStorage with PostgreSQL/MongoDB
4. **Add authentication**: Real user accounts, not just localStorage
5. **Set up monitoring**: Track API usage and errors

## Summary

✅ **Ready to deploy!** The critical fixes are complete.
✅ **Build succeeds** locally without errors
✅ **API key will work** on Netlify after redeployment

Just make sure your environment variables are set in Netlify and redeploy!
