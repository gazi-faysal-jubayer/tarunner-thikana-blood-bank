# 🔑 API Keys Quick Reference

## Required API Keys Summary

### ✅ ESSENTIAL (Must have to run the app)

| Service | What it does | Free Tier | Get it from |
|---------|--------------|-----------|-------------|
| **Supabase** | Database, Auth, Storage, Realtime | ✅ Yes - 500MB DB, 2GB bandwidth | [supabase.com](https://supabase.com) |
| **Google Maps** | Interactive maps, geocoding | ✅ Yes - $200/month credit | [console.cloud.google.com](https://console.cloud.google.com) |

---

### ⚠️ RECOMMENDED (For production features)

| Service | What it does | Free Tier | Get it from |
|---------|--------------|-----------|-------------|
| **SMS Service** | OTP login, notifications | Limited trial | See options below |
| **Email Service** | Email notifications | ✅ Yes | See options below |

#### SMS Options (Choose ONE):

| Provider | Best For | Free Tier | Setup Difficulty |
|----------|----------|-----------|------------------|
| **SSLWireless** | Bangladesh 🇧🇩 | ❌ Paid only | Hard (requires business docs) |
| **Twilio** | International | $15 trial credit | Easy (instant) |

#### Email Options (Choose ONE):

| Provider | Best For | Free Tier | Setup Difficulty |
|----------|----------|-----------|------------------|
| **Resend** | Developers | 3,000 emails/month | Very Easy |
| **SendGrid** | Enterprise | 100 emails/day | Easy |

---

### ⭕ OPTIONAL (Nice to have)

| Service | What it does | Free Tier | Get it from |
|---------|--------------|-----------|-------------|
| **reCAPTCHA v3** | Spam/bot prevention | ✅ Free forever | [google.com/recaptcha](https://www.google.com/recaptcha/admin) |

---

## 📊 Cost Estimates

### Development Phase (FREE)
```
✅ Supabase Free Tier       = $0
✅ Google Maps Free Tier    = $0 ($200 credit)
✅ Email (Resend)           = $0 (3,000/month free)
⚠️  SMS (Twilio Trial)      = $15 one-time credit
✅ reCAPTCHA                = $0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $0 (+ $15 SMS credit)
```

### Small Scale (100 active users/month)
```
✅ Supabase Free Tier       = $0
✅ Google Maps              = $0 (within free tier)
💰 SMS (~500 SMS)           = $20
✅ Email                    = $0 (within free tier)
✅ reCAPTCHA                = $0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~$20/month
```

### Medium Scale (1,000 active users/month)
```
💰 Supabase Pro             = $25
✅ Google Maps              = $0 (within free tier)
💰 SMS (~3,000 SMS)         = $150
💰 Email                    = $20
✅ reCAPTCHA                = $0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~$195/month
```

---

## 🎯 Setup Priority

### Phase 1: Minimum Viable (15 minutes)
```bash
1. ✅ Supabase              - MUST HAVE
2. ✅ Google Maps           - MUST HAVE
```
**Result:** Core app works (requests, tracking, map, dashboards)

### Phase 2: Authentication (5 minutes)
```bash
3. ⚠️ Email Service        - Add Resend
```
**Result:** Email-based OTP login works

### Phase 3: Full Features (10 minutes)
```bash
4. ⚠️ SMS Service          - Add Twilio/SSLWireless
5. ⭕ reCAPTCHA            - Add spam protection
```
**Result:** SMS OTP + spam prevention

---

## 📝 Environment Variables Needed

Create `.env.local` with these variables:

### Minimum Setup (Phase 1)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### + Email (Phase 2)
```env
# Add to above:
RESEND_API_KEY=
```

### + SMS & reCAPTCHA (Phase 3)
```env
# Add to above:
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

---

## ⏱️ Time to Get Each API Key

| Service | Time Required | Difficulty |
|---------|---------------|------------|
| Supabase | 5 minutes | ⭐ Easy |
| Google Maps | 8 minutes | ⭐⭐ Medium (billing setup) |
| Resend | 2 minutes | ⭐ Very Easy |
| Twilio | 5 minutes | ⭐ Easy |
| reCAPTCHA | 2 minutes | ⭐ Very Easy |
| SSLWireless | 1-3 days | ⭐⭐⭐⭐ Hard (approval needed) |

---

## 🔒 Security Checklist

Before going to production:

- [ ] All API keys are in `.env.local` (NOT committed to git)
- [ ] Google Maps API key is restricted to your domain
- [ ] Supabase RLS policies are enabled
- [ ] Different API keys for dev/staging/production
- [ ] Billing alerts are set up
- [ ] Service role keys are never exposed in client code
- [ ] CORS is properly configured in Supabase
- [ ] reCAPTCHA is enabled on public forms

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'process'"
```bash
npm install process
```

### Issue: "Supabase connection failed"
- Check URL format: `https://xxxxx.supabase.co`
- Ensure anon key is complete (starts with `eyJ`)
- Run migrations in SQL Editor

### Issue: "Google Maps blank screen"
- Enable billing in Google Cloud
- Check API key restrictions
- Enable all required APIs

### Issue: "SMS not sending"
- Check console logs (mock mode logs to console)
- Verify phone number format includes country code
- Check Twilio trial account verification

---

## 📚 Detailed Documentation

For complete setup instructions, see:
- **[API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md)** - Full guide with screenshots
- **[QUICK_START.md](./QUICK_START.md)** - Fast setup tutorial

---

## 💡 Pro Tips

1. **Start with minimum keys** - Get Supabase + Google Maps first
2. **Use free tiers** - You can run 100+ users/month for free
3. **Test locally** - App runs in mock mode without SMS/Email
4. **Set billing alerts** - Avoid surprise charges
5. **Rotate keys** - Change keys every 3-6 months

---

## 🆘 Need Help?

1. Check [API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md) for detailed steps
2. Look at console/terminal for error messages
3. Verify `.env.local` is in project root
4. Restart dev server after adding keys
5. Check [Troubleshooting section](#-common-issues--solutions) above

---

**Last Updated:** December 2024


