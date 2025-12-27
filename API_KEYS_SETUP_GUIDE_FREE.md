# 🔑 API Keys Setup Guide - 100% FREE Stack
## Blood Donation Management System

**🎉 All services are completely FREE with NO credit card required!**

---

## 📋 Services Overview

| # | Service | Purpose | Free Tier | Credit Card? | Setup Time |
|---|---------|---------|-----------|--------------|------------|
| 1 | **Supabase** | Database, Auth, Realtime | 500MB DB, 2GB bandwidth | ❌ No | 5 min |
| 2 | **Mapbox** | Interactive maps | 50,000 map loads/month | ❌ No | 3 min |
| 3 | **Resend** | Email & OTP | 3,000 emails/month | ❌ No | 2 min |
| 4 | **reCAPTCHA** | Spam prevention | Unlimited | ❌ No | 2 min |

**Total Cost: $0/month | Total Setup Time: ~12 minutes**

---

## 🚀 Step 1: Supabase (5 minutes)

### What You'll Get
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Setup Instructions

1. **Create Account**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub, Google, or Email (FREE, no credit card)

2. **Create Project**
   - Click "New Project"
   - Name: `tarunner-thikana-blood-bank`
   - Database Password: (create a strong password and save it)
   - Region: `Southeast Asia (Singapore)` (closest to Bangladesh)
   - Free Plan: ✅ Selected by default
   - Click "Create new project" (takes 2-3 minutes)

3. **Get API Keys**
   - In project dashboard, click ⚙️ **Settings** (bottom left)
   - Click **API** in sidebar
   - Copy these three values:
     ```
     Project URL          → NEXT_PUBLIC_SUPABASE_URL
     anon public          → NEXT_PUBLIC_SUPABASE_ANON_KEY
     service_role secret  → SUPABASE_SERVICE_ROLE_KEY
     ```

4. **Run Database Migrations**
   - Click 🗄️ **SQL Editor** (left sidebar)
   - Click "+ New query"
   - Open `supabase/migrations/00001_initial_schema.sql` from project
   - Copy entire file content
   - Paste in SQL Editor
   - Click "RUN" button
   - Repeat for `supabase/migrations/00002_rls_policies.sql`

5. **Enable PostGIS** (for location features)
   - In SQL Editor, create a new query
   - Paste: `CREATE EXTENSION IF NOT EXISTS postgis;`
   - Click "RUN"

✅ **Done!** Supabase is ready.

---

## 🗺️ Step 2: Mapbox (3 minutes)

### What You'll Get
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

### Setup Instructions

1. **Create Account**
   - Go to https://mapbox.com
   - Click "Sign up" or "Start building for free"
   - Sign up with Email or GitHub (FREE, no credit card!)

2. **Get Access Token**
   - After sign-up, you'll see your default public token
   - Or go to https://account.mapbox.com/access-tokens/
   - Copy the **Default public token**
   - This is your `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

3. **Optional: Create Named Token** (recommended for organization)
   - Click "+ Create a token"
   - Name: `Blood Bank Production`
   - Scopes: Keep defaults (all public scopes checked)
   - URL restrictions: Add `http://localhost:3000/*` and `https://your-domain.com/*`
   - Click "Create token"
   - Copy the new token

4. **Check Your Usage Limits**
   - Free tier: 50,000 map loads per month
   - That's approximately:
     - ~1,600 users per month (assuming 30 views each)
     - ~200 daily active users
   - Plenty for starting out!

✅ **Done!** Mapbox is ready.

---

## 📧 Step 3: Resend (2 minutes)

### What You'll Get
```
RESEND_API_KEY
```

### Setup Instructions

1. **Create Account**
   - Go to https://resend.com
   - Click "Start building"
   - Sign up with Email or GitHub (FREE, no credit card!)

2. **Verify Email**
   - Check your email for verification link
   - Click to verify

3. **Create API Key**
   - After login, you'll be on the dashboard
   - Click "API Keys" in the left menu
   - Click "+ Create API Key"
   - Name: `Blood Bank Production`
   - Permission: "Sending access" (default)
   - Click "Add"
   - **Copy the API key immediately!** (shown only once)
   - This is your `RESEND_API_KEY`

4. **Set Up Domain (Optional - For Production)**
   - For development: Use `onboarding@resend.dev` as sender (works immediately)
   - For production:
     - Click "Domains" → "Add Domain"
     - Enter your domain: `tarunner-thikana.org`
     - Add the DNS records shown (TXT, MX, CNAME)
     - Wait for verification (usually 5-15 minutes)

5. **Check Your Usage Limits**
   - Free tier: 3,000 emails per month
   - That's approximately:
     - 100 OTP emails (login)
     - 2,900 notifications
   - Or ~100 daily emails total

✅ **Done!** Resend is ready.

---

## 🛡️ Step 4: reCAPTCHA v3 (Optional - 2 minutes)

### What You'll Get
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

### Setup Instructions

1. **Go to reCAPTCHA Admin**
   - Visit https://www.google.com/recaptcha/admin
   - Sign in with Google account

2. **Register New Site**
   - Click "+ Register a new site" or just fill the form:
     - **Label**: `Blood Bank`
     - **reCAPTCHA type**: ✅ reCAPTCHA v3
     - **Domains**: 
       - Add: `localhost`
       - Add: `your-production-domain.com`
     - Accept terms
     - Click "SUBMIT"

3. **Get Keys**
   - After creation, you'll see two keys:
     ```
     Site Key    → NEXT_PUBLIC_RECAPTCHA_SITE_KEY
     Secret Key  → RECAPTCHA_SECRET_KEY
     ```
   - Copy both

4. **Usage Limits**
   - Completely FREE
   - No limits for legitimate traffic
   - Protects against bots and abuse

✅ **Done!** reCAPTCHA is ready.

---

## 📝 Environment Variables Setup

### Create `.env.local` File

In your project root, create a file named `.env.local`:

```bash
# Windows
notepad .env.local

# Mac/Linux
nano .env.local
```

### Paste This Template

```env
# =============================================================================
# SUPABASE (Required - Database, Auth, Storage, Realtime)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# =============================================================================
# MAPBOX (Required - Interactive Maps)
# =============================================================================
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# =============================================================================
# RESEND (Required - Email Notifications & OTP Login)
# =============================================================================
RESEND_API_KEY=re_...

# =============================================================================
# RECAPTCHA V3 (Optional - Spam Prevention)
# =============================================================================
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeXXX...
RECAPTCHA_SECRET_KEY=6LeXXX...

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Replace Placeholder Values

Replace all the `xxx...` values with your actual API keys from the steps above.

---

## 🎉 Final Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Application

Open http://localhost:3000 and verify:

- ✅ Homepage loads
- ✅ Map displays correctly (Mapbox)
- ✅ Submit blood request form works
- ✅ Email login works (check console for mock emails in dev)
- ✅ Tracking page loads

---

## 💰 Cost Breakdown

### Development Phase
```
✅ Supabase Free Tier       = $0
✅ Mapbox Free Tier         = $0 (50k map loads)
✅ Resend Free Tier         = $0 (3k emails)
✅ reCAPTCHA                = $0 (unlimited)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $0/month
```

### Small Scale (100 active users/month)
```
✅ Supabase Free Tier       = $0
✅ Mapbox (3k map loads)    = $0 (within free tier)
✅ Resend (500 emails)      = $0 (within free tier)
✅ reCAPTCHA                = $0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $0/month
```

### Medium Scale (500 active users/month)
```
✅ Supabase Free Tier       = $0 (within 500MB/2GB limits)
✅ Mapbox (15k map loads)   = $0 (within free tier)
✅ Resend (2.5k emails)     = $0 (within free tier)
✅ reCAPTCHA                = $0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $0/month
```

### When You'll Need to Upgrade

**Supabase Pro ($25/month) when:**
- Database exceeds 500MB
- Bandwidth exceeds 2GB/month
- Need 100GB file storage (vs 1GB free)

**Mapbox Pay-as-you-go when:**
- Exceeds 50,000 map loads/month
- That's ~1,600 monthly active users
- After free tier: $5 per 1,000 additional loads

**Resend Paid ($20/month) when:**
- Exceeds 3,000 emails/month
- That's ~100 emails/day

**Typical path:** Stay free for 3-6 months, then scale as needed!

---

## 🔒 Security Checklist

Before going live:

- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] Never commit API keys to Git
- [ ] Use different API keys for development and production
- [ ] Restrict Mapbox token to your domain
- [ ] Enable Supabase RLS policies (already in migrations)
- [ ] Set up reCAPTCHA on public forms
- [ ] Set up billing alerts if upgraded to paid tiers

---

## ❌ Troubleshooting

### "Supabase connection failed"
- Check that URL ends with `.supabase.co`
- Verify anon key starts with `eyJ`
- Ensure migrations have been run in SQL Editor
- Restart dev server after adding keys

### "Mapbox map won't load"
- Check that token starts with `pk.`
- Verify token is public, not secret
- Check browser console for errors
- Ensure `mapbox-gl` CSS is imported

### "Email not sending"
- In development, emails log to console (check terminal)
- In production with Resend, check Resend dashboard for logs
- Verify `RESEND_API_KEY` starts with `re_`
- Check email address is valid

### "Environment variables not loading"
- File must be named `.env.local` (not `.env.txt`)
- Must be in project root directory
- Restart `npm run dev` after adding/changing variables
- Check for typos in variable names

---

## 🆘 Getting Help

### Official Documentation
- **Supabase**: https://supabase.com/docs
- **Mapbox**: https://docs.mapbox.com
- **Resend**: https://resend.com/docs
- **reCAPTCHA**: https://developers.google.com/recaptcha/docs/v3

### Support Channels
- **Supabase**: Discord - https://discord.supabase.com
- **Mapbox**: Support - https://support.mapbox.com
- **Resend**: Email - support@resend.com
- **reCAPTCHA**: Forum - https://groups.google.com/forum/#!forum/recaptcha

---

## ✅ Success Checklist

You're ready to launch when:

- [ ] All API keys are obtained and added to `.env.local`
- [ ] Supabase migrations have been run successfully
- [ ] Mapbox map loads on homepage and live-map page
- [ ] Email OTP login works (check console in dev)
- [ ] Blood request form submits successfully
- [ ] Request tracking page works with tracking ID
- [ ] All features tested locally
- [ ] `.env.local` is NOT committed to Git
- [ ] Production environment variables are separate

---

**🎉 Congratulations! You now have a fully functional blood donation platform running on 100% free services with NO credit card required!**

**Total Monthly Cost: $0** 🚀

---

*Last updated: December 2024*


