# 🔑 API Keys Setup Guide - 100% FREE Stack
## Blood Donation Management System

This guide will walk you through obtaining and configuring all required API keys for the application. **All services are completely free with no credit card required!**

---

## 📋 Required API Keys Summary (100% FREE!)

| Service | Required? | Purpose | Cost | Credit Card? |
|---------|-----------|---------|------|--------------|
| **Supabase** | ✅ Essential | Database, Auth, Storage, Realtime | FREE | ❌ No |
| **Mapbox** | ✅ Essential | Interactive maps, geocoding | FREE (50k/month) | ❌ No |
| **Resend** | ⚠️ Recommended | Email notifications & OTP | FREE (3k/month) | ❌ No |
| **reCAPTCHA v3** | ⭕ Optional | Spam prevention | FREE | ❌ No |

---

## 🚀 Step-by-Step Setup Guide

### 1. SUPABASE (Essential - Database & Authentication)

**What you'll get:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Steps:

1. **Go to Supabase Website**
   ```
   https://supabase.com
   ```

2. **Create Account & Project**
   - Click "Start your project"
   - Sign up with GitHub, Google, or Email
   - Click "New Project"
   - Fill in:
     - **Name**: `tarunner-thikana-blood-bank`
     - **Database Password**: (Save this - you'll need it!)
     - **Region**: Choose closest to Bangladesh (e.g., `Southeast Asia (Singapore)`)
   - Click "Create new project" (takes 2-3 minutes)

3. **Get API Keys**
   - In your project dashboard, click on ⚙️ **Settings** (bottom left)
   - Click **API** in the sidebar
   - Copy these values:
     ```
     Project URL          → NEXT_PUBLIC_SUPABASE_URL
     anon public          → NEXT_PUBLIC_SUPABASE_ANON_KEY
     service_role secret  → SUPABASE_SERVICE_ROLE_KEY
     ```

4. **Run Database Migrations**
   - In Supabase dashboard, click 🗄️ **SQL Editor** (left sidebar)
   - Click "+ New query"
   - Copy the contents from `supabase/migrations/00001_initial_schema.sql`
   - Paste and click "RUN"
   - Repeat for `supabase/migrations/00002_rls_policies.sql`

5. **Enable PostGIS Extension**
   - In SQL Editor, run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     ```

---

### 2. GOOGLE MAPS PLATFORM (Essential - Maps)

**What you'll get:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

#### Steps:

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com
   ```

2. **Create New Project**
   - Click project dropdown (top left)
   - Click "NEW PROJECT"
   - **Project name**: `Blood-Bank-App`
   - Click "CREATE"

3. **Enable Billing** (Required but free tier available)
   - Click ☰ Menu → "Billing"
   - Link a payment method (you get $200 free credit monthly)
   - Don't worry: You won't be charged unless you exceed free tier

4. **Enable Required APIs**
   - Click ☰ Menu → "APIs & Services" → "Library"
   - Search and enable these APIs:
     - ✅ **Maps JavaScript API**
     - ✅ **Geocoding API**
     - ✅ **Places API**
     - ✅ **Geolocation API**

5. **Create API Key**
   - Click ☰ Menu → "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "API key"
   - Copy the API key
   - Click "Edit API key" (restrict it for security)

6. **Restrict API Key** (Important for security!)
   - **Application restrictions**: 
     - Select "HTTP referrers (web sites)"
     - Add: `http://localhost:3000/*`
     - Add: `https://your-production-domain.com/*`
   - **API restrictions**:
     - Select "Restrict key"
     - Check: Maps JavaScript API, Geocoding API, Places API, Geolocation API
   - Click "SAVE"

---

### 3. SMS SERVICE (Recommended - OTP & Notifications)

Choose **ONE** option based on your location:

#### Option A: SSLWireless (Recommended for Bangladesh) 🇧🇩

**What you'll get:**
- `SSLWIRELESS_API_KEY`
- `SSLWIRELESS_SID`
- `SSLWIRELESS_SENDER_ID`

**Steps:**

1. **Visit SSLWireless**
   ```
   https://sslwireless.com
   ```

2. **Contact Sales**
   - Call: +880 2 58813271-2
   - Email: info@sslwireless.com
   - Request: **SMS API for OTP service**

3. **Submit Documents**
   - Trade License (if business)
   - NID/Passport
   - Organization details

4. **Get Credentials**
   - After approval (1-3 business days), you'll receive:
     - API Key
     - SID (Sender ID)
     - API documentation

5. **Pricing** (Approximate)
   - Setup: ৳5,000 - ৳10,000
   - Per SMS: ৳0.25 - ৳0.40
   - Bulk discounts available

#### Option B: Twilio (International - Easier setup)

**What you'll get:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Steps:**

1. **Sign Up**
   ```
   https://www.twilio.com/try-twilio
   ```

2. **Verify Your Email & Phone**

3. **Get Free Trial Credits** ($15 USD)

4. **Get Credentials**
   - Dashboard → Account Info (right side):
     - Copy **Account SID**
     - Copy **Auth Token** (click to reveal)

5. **Get Phone Number**
   - Dashboard → Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capability
   - For Bangladesh, select +880 numbers (if available)

6. **Pricing**
   - Bangladesh SMS: ~$0.0475/SMS
   - Trial: $15 credit (can send ~300 SMS)
   - Production: Pay-as-you-go

---

### 4. EMAIL SERVICE (Recommended - Notifications)

Choose **ONE** option:

#### Option A: Resend (Recommended - Easiest)

**What you'll get:**
- `RESEND_API_KEY`

**Steps:**

1. **Sign Up**
   ```
   https://resend.com
   ```

2. **Verify Your Email**

3. **Add Domain** (Or use their test domain for development)
   - Dashboard → "Domains" → "Add Domain"
   - Enter: `your-domain.com`
   - Add DNS records (they'll guide you)
   - Or skip for now and use `onboarding@resend.dev` for testing

4. **Create API Key**
   - Dashboard → "API Keys" → "Create API Key"
   - Name: `Blood Bank Production`
   - Permissions: "Sending access"
   - Copy the key (shown only once!)

5. **Pricing**
   - Free tier: 3,000 emails/month
   - After: $20/month for 50,000 emails

#### Option B: SendGrid

**What you'll get:**
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

**Steps:**

1. **Sign Up**
   ```
   https://sendgrid.com
   ```

2. **Verify Email**

3. **Create Single Sender** (for free tier)
   - Settings → Sender Authentication → Single Sender Verification
   - Fill in your email details
   - Verify the email

4. **Create API Key**
   - Settings → API Keys → Create API Key
   - Name: `Blood Bank App`
   - Permissions: Full Access (or Restricted - Mail Send)
   - Copy the key

5. **Pricing**
   - Free: 100 emails/day
   - After: Pay-as-you-go

---

### 5. reCAPTCHA v3 (Optional - Spam Prevention)

**What you'll get:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`

#### Steps:

1. **Go to reCAPTCHA Admin**
   ```
   https://www.google.com/recaptcha/admin
   ```

2. **Register New Site**
   - **Label**: `Blood Bank`
   - **reCAPTCHA type**: Select "reCAPTCHA v3"
   - **Domains**: 
     - Add: `localhost` (for development)
     - Add: `your-production-domain.com`
   - Accept terms
   - Click "SUBMIT"

3. **Get Keys**
   - Copy **Site Key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - Copy **Secret Key** → `RECAPTCHA_SECRET_KEY`

4. **Pricing**
   - Completely FREE
   - No limits for legitimate use

---

## 📝 Configuration Steps

### Step 1: Create Environment File

In your project root, create a file named `.env.local`:

```bash
# Windows
notepad .env.local

# Mac/Linux
nano .env.local
```

### Step 2: Add Your API Keys

Copy and paste this template, replacing with your actual keys:

```env
# =============================================================================
# SUPABASE (Required)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# GOOGLE MAPS (Required)
# =============================================================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# =============================================================================
# SMS SERVICE (Choose ONE)
# =============================================================================
# SSLWireless (Bangladesh)
SSLWIRELESS_API_KEY=your_key_here
SSLWIRELESS_SID=your_sid_here
SSLWIRELESS_SENDER_ID=your_sender_id

# OR Twilio (International)
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# =============================================================================
# EMAIL SERVICE (Choose ONE)
# =============================================================================
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx

# OR SendGrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# =============================================================================
# RECAPTCHA (Optional)
# =============================================================================
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LeXXXXXXXXXXXXXXXXXXXXXXXX

# =============================================================================
# APP SETTINGS
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Verify Configuration

Run this command to check if environment variables are loaded:

```bash
npm run dev
```

Look for any errors in the console. If you see "Missing environment variable" errors, double-check your `.env.local` file.

---

## 🧪 Testing Without Real API Keys (Development Mode)

If you want to test the app before getting all API keys, you can use mock implementations:

### Create `.env.local` with minimal setup:

```env
# Minimal setup for testing
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mock Google Maps (the app will use static mock)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=DEVELOPMENT_MODE

# The app will skip SMS/Email in development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

The application will:
- ✅ Use mock map (no Google Maps charges)
- ✅ Log SMS to console instead of sending
- ✅ Log emails to console instead of sending
- ✅ Skip reCAPTCHA validation

---

## 💰 Cost Estimation (Monthly)

### Minimum (Free Tier):
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Google Maps**: Free ($200 credit = ~28,000 map loads)
- **Resend**: Free (3,000 emails)
- **Twilio Trial**: $15 credit (~300 SMS)
- **reCAPTCHA**: Free
- **Total**: $0 for first few months

### Small Scale (100 users/month):
- **Supabase**: Free tier sufficient
- **Google Maps**: Free tier sufficient
- **SMS**: ~$20 (500 SMS)
- **Email**: Free tier sufficient
- **Total**: ~$20/month

### Medium Scale (1,000 users/month):
- **Supabase**: $25/month (Pro tier)
- **Google Maps**: Still within free tier
- **SMS**: ~$150 (3,000 SMS for OTP + notifications)
- **Email**: $20/month (Resend)
- **Total**: ~$195/month

---

## 🔒 Security Best Practices

### 1. Never Commit `.env.local` to Git
```bash
# It's already in .gitignore, but double-check:
git status
# Should NOT show .env.local
```

### 2. Use Different Keys for Development & Production

Create two files:
- `.env.local` (development)
- `.env.production.local` (production - on server only)

### 3. Rotate Keys Regularly

Change your API keys every 3-6 months, especially if:
- Team members leave
- Keys might have been exposed
- Security audit recommends it

### 4. Restrict API Keys

- ✅ Google Maps: Restrict to your domain
- ✅ Supabase: Use RLS policies (already implemented)
- ✅ Never expose service role keys in client code

### 5. Monitor Usage

Set up billing alerts:
- Google Cloud: Console → Billing → Budgets & alerts
- Twilio: Console → Usage → Usage Triggers
- Supabase: Dashboard → Settings → Billing

---

## 🆘 Troubleshooting

### Issue: "Missing environment variable"
**Solution**: 
- Restart dev server after adding keys
- Ensure `.env.local` is in project root
- Check spelling of variable names

### Issue: "Supabase connection failed"
**Solution**:
- Verify URL ends with `.supabase.co`
- Check if anon key is copied completely
- Ensure migrations have been run

### Issue: "Google Maps not loading"
**Solution**:
- Check if billing is enabled
- Verify API key restrictions
- Ensure all required APIs are enabled

### Issue: "SMS not sending"
**Solution**:
- In development, check console logs
- Verify phone numbers include country code
- For Twilio: Ensure trial account is verified

---

## 📞 Support & Resources

### Supabase
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Google Maps
- Docs: https://developers.google.com/maps
- Support: https://developers.google.com/maps/support

### Twilio
- Docs: https://www.twilio.com/docs
- Support: https://support.twilio.com

### SSLWireless
- Website: https://sslwireless.com
- Phone: +880 2 58813271-2

### Resend
- Docs: https://resend.com/docs
- Email: support@resend.com

---

## ✅ Checklist

Before deploying to production, ensure:

- [ ] All required API keys are obtained
- [ ] Supabase migrations have been run
- [ ] Google Maps APIs are enabled and restricted
- [ ] SMS service is configured and tested
- [ ] Email service is configured and verified
- [ ] reCAPTCHA is set up (optional)
- [ ] `.env.local` is NOT in git
- [ ] Production keys are separate from development
- [ ] Billing alerts are configured
- [ ] API key restrictions are in place

---

## 🎉 Next Steps

Once all keys are configured:

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Test key features**:
   - Submit blood request
   - View live map
   - Register as donor
   - Login with OTP

3. **Deploy to production** (when ready):
   - Vercel: https://vercel.com
   - Netlify: https://netlify.com
   - Or your preferred hosting

---

**Need help?** Open an issue in the repository or contact the development team.

**Last updated**: December 2024

