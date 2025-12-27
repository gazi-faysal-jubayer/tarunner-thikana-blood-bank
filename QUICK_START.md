# ⚡ Quick Start Guide - 100% FREE
## Get the Blood Bank App Running in 12 Minutes

**🎉 NO credit card required! All services are completely FREE!**

This is a fast-track guide to get the app running locally. For detailed explanations, see `API_KEYS_SETUP_GUIDE_FREE.md`.

---

## 📦 Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ An email address (for creating accounts)
- ❌ NO credit card needed!

---

## 🚀 4-Step Setup

### Step 1: Install Dependencies (2 minutes)

```bash
cd tarunner-thikana-blood-bank
npm install --legacy-peer-deps
```

---

### Step 2: Set Up Supabase (5 minutes)

1. Go to https://supabase.com and sign up (FREE, no credit card)
2. Create a new project named `blood-bank`
3. Wait for project setup to complete
4. Go to Settings → API and copy:
   - Project URL
   - anon public key
   - service_role key

5. Go to SQL Editor and run these files in order:
   - Copy/paste contents of `supabase/migrations/00001_initial_schema.sql` → Run
   - Copy/paste contents of `supabase/migrations/00002_rls_policies.sql` → Run

---

### Step 3: Set Up Mapbox (3 minutes)

1. Go to https://mapbox.com and sign up (FREE, no credit card)
2. After sign-up, you'll see your default public token
3. Copy the token (starts with `pk.`)

---

### Step 4: Set Up Resend (2 minutes)

1. Go to https://resend.com and sign up (FREE, no credit card)
2. Verify your email
3. Create API Key → Copy it

---

### Step 5: Create Environment File (1 minute)

Create a file named `.env.local` in the project root:

```env
# Supabase (Database, Auth, Realtime)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Mapbox (Maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Resend (Email & OTP)
RESEND_API_KEY=your_resend_api_key_here

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Replace the placeholder values with your actual keys.

---

### Step 6: Run the App (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## ✅ What Works Right Now

With the 100% free stack:

- ✅ Submit blood requests (anonymous)
- ✅ Track requests by ID
- ✅ View live interactive map with Mapbox
- ✅ Register as donor/volunteer
- ✅ Email OTP login (passwordless)
- ✅ Email notifications
- ✅ Donor/Volunteer/Admin dashboards
- ✅ Realtime updates
- ✅ All features - NO limitations!

**Total Cost: $0/month** 🎉

---

## 🧪 Test the App

### 1. Submit a Blood Request
- Go to http://localhost:3000/request-blood
- Fill out the form
- Submit and note the tracking ID

### 2. Track Your Request
- Go to http://localhost:3000/track
- Enter the tracking ID
- View the status

### 3. View Live Map
- Go to http://localhost:3000/live-map
- See your request on the map

### 4. Register as Donor
- Go to http://localhost:3000/register
- Fill out the form
- Submit

### 5. Access Dashboard
- Go to http://localhost:3000/dashboard/donor
- View donor dashboard (mock data shown)

---

## ❌ Troubleshooting

### "Cannot connect to Supabase"
- Check if your Supabase URL is correct
- Ensure migrations have been run
- Restart the dev server

### "Mapbox map not loading"
- Verify token starts with `pk.`
- Check if token is copied completely
- Ensure you're using public token, not secret token
- Check browser console for errors

### "Port 3000 already in use"
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Environment variables not loading
- Ensure file is named `.env.local` (not `.env.txt`)
- Restart the dev server after adding keys
- File should be in project root, not in a subdirectory

---

## 📚 Next Steps

1. ✅ App is running → Read `API_KEYS_SETUP_GUIDE.md` for SMS/Email setup
2. ✅ Want to customize → Check `README.md` for project structure
3. ✅ Ready to deploy → See deployment section in `README.md`

---

## 💡 Development Tips

### View Database
- Supabase Dashboard → Table Editor
- See all tables and data in realtime

### View Logs
- Console logs appear in terminal
- Browser console (F12) for client-side logs

### Hot Reload
- Changes to code automatically refresh the browser
- Changes to `.env.local` require server restart

### Test Different Roles
The app has 4 user types:
1. **Public** - No login required (submit & track requests)
2. **Donor** - Register to donate blood
3. **Volunteer** - Help coordinate donations
4. **Admin** - Manage the system

---

## 🆘 Need Help?

1. Check `API_KEYS_SETUP_GUIDE.md` for detailed instructions
2. Check `README.md` for project documentation
3. Check terminal/console for error messages
4. Open an issue in the repository

---

**Happy Coding! 🩸❤️**

