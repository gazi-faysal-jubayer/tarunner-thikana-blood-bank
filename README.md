# তারুণ্যের ঠিকানা Blood Bank

বাংলাদেশের সবচেয়ে বড় রক্তদান প্ল্যাটফর্ম। জরুরি রক্তের প্রয়োজনে আমরা আপনার পাশে।

---

## 🚀 Quick Start

**New to the project?** Follow these guides in order:

1. **[QUICK_START.md](./QUICK_START.md)** - Get the app running in 12 minutes (100% FREE!)
2. **[API_KEYS_SETUP_GUIDE_FREE.md](./API_KEYS_SETUP_GUIDE_FREE.md)** - Detailed guide for all API keys (NO credit card)
3. **This README** - Full project documentation

**💰 Total Cost: $0/month | ❌ No credit card required!**

### TL;DR

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up .env.local with Supabase + Mapbox + Resend keys
# See QUICK_START.md for instructions (NO credit card needed!)

# 3. Run migrations in Supabase SQL Editor
# Files: supabase/migrations/*.sql

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

**💡 All services are FREE with no credit card required!**

---

## Features

### Public Features (No Login Required)
- **Blood Request Submission**: Submit blood requests without registration
- **Request Tracking**: Track request status with unique tracking ID
- **Live Map**: View active blood requests on an interactive map
- **Statistics**: View platform-wide donation statistics

### Donor Features
- **Dashboard**: View donation history, eligibility status, and stats
- **Availability Toggle**: Set availability for donations
- **Request Notifications**: Receive alerts for matching blood requests
- **Assignment Response**: Accept or decline donation requests

### Volunteer Features
- **Request Management**: Handle assigned blood requests
- **Donor Search**: Find and assign compatible donors
- **Interactive Map**: View requests and donors on map
- **Performance Tracking**: Track success rate and completed requests

### Admin Features
- **Full Dashboard**: Overview of all platform activity
- **Request Approval**: Approve and manage blood requests
- **Volunteer Assignment**: Assign volunteers to requests
- **Analytics**: View detailed platform statistics
- **User Management**: Manage donors, volunteers, and admins

## Tech Stack (100% FREE!)

| Layer | Technology | Cost |
|-------|------------|------|
| Framework | Next.js 16 (App Router) | Free |
| Language | TypeScript | Free |
| UI | shadcn/ui + Tailwind CSS | Free |
| Database | PostgreSQL (Supabase) + PostGIS | Free (500MB/2GB) |
| Auth | Supabase Auth (Email OTP) | Free |
| State | Zustand | Free |
| Forms | React Hook Form + Zod | Free |
| Data Fetching | TanStack Query | Free |
| Maps | Mapbox | Free (50k loads/month) |
| Email | Resend | Free (3k emails/month) |
| **Total Monthly Cost** | **$0** | **✅ No credit card!** |

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public pages (home, request, track, map)
│   ├── (auth)/             # Auth pages (login, register)
│   ├── dashboard/          # Role-based dashboards
│   │   ├── donor/
│   │   ├── volunteer/
│   │   └── admin/
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   ├── maps/               # Map components
│   └── layout/             # Layout components
├── lib/
│   ├── supabase/           # Supabase client & types
│   ├── services/           # Business logic
│   ├── validations/        # Zod schemas
│   └── i18n/               # Translations
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
└── types/                  # TypeScript types
```

## Getting Started

> 📚 **Detailed Guides Available:**
> - **[QUICK_START.md](./QUICK_START.md)** - 15-minute setup guide
> - **[API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md)** - Complete API keys documentation

### Prerequisites
- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ Supabase account (free tier works)
- ✅ Google Cloud account (for Maps API)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tarunner-thikana-blood-bank
```

2. Install dependencies:
```bash
npm install
```

3. Set up API keys:

**Option A: Quick Start (Recommended)**
- Follow **[QUICK_START.md](./QUICK_START.md)** for guided setup

**Option B: Manual Setup**

Create `.env.local` in project root:

```env
# =============================================================================
# 100% FREE STACK - NO CREDIT CARD REQUIRED!
# =============================================================================

# Supabase (Database, Auth, Storage, Realtime) - FREE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Mapbox (Interactive Maps) - FREE (50k loads/month)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# Resend (Email & OTP Login) - FREE (3k emails/month)
RESEND_API_KEY=re_...

# =============================================================================
# OPTIONAL
# =============================================================================

# reCAPTCHA v3 (spam prevention) - FREE forever
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
RECAPTCHA_SECRET_KEY=6Le...

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

📖 **See [API_KEYS_SETUP_GUIDE_FREE.md](./API_KEYS_SETUP_GUIDE_FREE.md) for:**
- How to obtain each API key in ~12 minutes
- All FREE, no credit card required
- Security best practices
- Troubleshooting

💰 **Total Monthly Cost: $0**

4. Set up Database (Supabase):

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Go to SQL Editor in dashboard
# 3. Run migrations in order:
#    - supabase/migrations/00001_initial_schema.sql
#    - supabase/migrations/00002_rls_policies.sql
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) 🎉

## Mock Mode

The application runs in **mock mode** by default when API keys are not configured:
- **Maps**: Uses a simulated map with mock markers
- **SMS/Email**: Logs to console instead of sending
- **Database**: Uses in-memory storage
- **Auth**: Simulated login/register flow

This allows full development and testing without external services.

## Key Workflows

### Public Blood Request Flow
1. User visits `/request-blood`
2. Fills form with patient/hospital details
3. Selects location on map
4. Submits request → Gets tracking ID
5. Tracks status at `/track/{trackingId}`

### Admin Workflow
1. Receives notification of new request
2. Reviews and approves request
3. Assigns volunteer based on location
4. Monitors progress on dashboard

### Volunteer Workflow
1. Receives assigned request notification
2. Views request on map
3. Searches for compatible donors nearby
4. Assigns best matching donor
5. Coordinates donation

### Donor Workflow
1. Receives assignment notification
2. Views request details
3. Accepts or declines
4. Completes donation
5. Updates availability

## API Endpoints

### Public
- `POST /api/public/request-blood` - Submit blood request
- `GET /api/public/track/:trackingId` - Track request
- `GET /api/public/map/markers` - Get map markers
- `GET /api/public/statistics` - Get statistics

### Authenticated (Future)
- `GET /api/profile` - Get user profile
- `PUT /api/donors/availability` - Toggle donor availability
- `POST /api/requests/:id/respond` - Respond to assignment

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Add environment variables
3. Deploy

### Docker
```dockerfile
# Coming soon
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Contact

- Website: [tarunner-thikana.org](https://tarunner-thikana.org)
- Email: info@tarunner-thikana.org

---

**রক্তদান করুন, জীবন বাঁচান** 🩸

