---
name: Blood Donation MVP
overview: Build a complete blood donation management system with Next.js 14, Supabase, and interactive Google Maps. Features public blood requests without login, two-level assignment system, real-time tracking, and role-based dashboards for donors, volunteers, and admins.
todos:
  - id: project-setup
    content: Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui, and project structure
    status: completed
  - id: database-schema
    content: Create Supabase migration files for all tables with PostGIS and RLS policies
    status: completed
    dependencies:
      - project-setup
  - id: supabase-client
    content: Set up Supabase client, types, and authentication utilities
    status: completed
    dependencies:
      - database-schema
  - id: ui-components
    content: Create shared UI components, layouts, and navigation
    status: completed
    dependencies:
      - project-setup
  - id: public-request-form
    content: Build public blood request form with location picker and validation
    status: completed
    dependencies:
      - ui-components
      - supabase-client
  - id: tracking-system
    content: Implement request tracking page with real-time status updates
    status: completed
    dependencies:
      - public-request-form
  - id: auth-system
    content: Set up Supabase Auth with role-based access control
    status: completed
    dependencies:
      - supabase-client
  - id: donor-dashboard
    content: Build donor dashboard with profile, availability, and history
    status: completed
    dependencies:
      - auth-system
      - ui-components
  - id: volunteer-dashboard
    content: Build volunteer dashboard with request management and donor assignment
    status: completed
    dependencies:
      - auth-system
      - ui-components
  - id: admin-dashboard
    content: Build admin dashboard with full control and analytics
    status: completed
    dependencies:
      - auth-system
      - ui-components
  - id: map-system
    content: Implement role-based interactive maps with markers and assignment lines
    status: completed
    dependencies:
      - ui-components
  - id: assignment-system
    content: Build two-level assignment system with smart matching
    status: completed
    dependencies:
      - volunteer-dashboard
      - admin-dashboard
  - id: notification-service
    content: Create notification service with SMS/Email mock implementations
    status: completed
    dependencies:
      - supabase-client
  - id: realtime-features
    content: Implement Supabase Realtime subscriptions for live updates
    status: completed
    dependencies:
      - map-system
      - tracking-system
  - id: i18n-setup
    content: Add Bengali/English language support throughout the app
    status: completed
    dependencies:
      - ui-components
---

# Blood Donation Management System - Full Phase 1 MVP

## Architecture Overview

```mermaid
flowchart TB
    subgraph PublicLayer [Public Access]
        RequestForm[Blood Request Form]
        TrackingPage[Request Tracking]
        PublicMap[Live Public Map]
    end

    subgraph AuthLayer [Authenticated Users]
        DonorDash[Donor Dashboard]
        VolunteerDash[Volunteer Dashboard]
        AdminDash[Admin Dashboard]
    end

    subgraph Backend [Supabase Backend]
        DB[(PostgreSQL + PostGIS)]
        Auth[Supabase Auth]
        Realtime[Realtime Subscriptions]
        EdgeFn[Edge Functions]
    end

    subgraph Services [External Services]
        Maps[Google Maps API]
        SMS[SSLWireless SMS]
        Email[Resend Email]
    end

    RequestForm --> DB
    TrackingPage --> DB
    PublicMap --> Maps
    DonorDash --> Auth
    VolunteerDash --> Auth
    AdminDash --> Auth
    DB --> Realtime
    EdgeFn --> SMS
    EdgeFn --> Email
```



## Technology Stack

| Layer | Technology ||-------|------------|| Framework | Next.js 14+ (App Router) || UI | shadcn/ui + Tailwind CSS || Maps | @vis.gl/react-google-maps || Database | Supabase PostgreSQL + PostGIS || Auth | Supabase Auth || State | Zustand + React Context || Forms | React Hook Form + Zod || Data Fetching | TanStack Query || Language | Bengali (primary) + English |---

## Implementation Plan

### Phase 1: Project Foundation

**1.1 Initialize Next.js 14 Project**

- Create Next.js app with TypeScript, Tailwind CSS, and App Router
- Install and configure shadcn/ui components
- Set up project structure following best practices
- Configure environment variables template

**1.2 Database Schema Setup**

- Create Supabase migration files for all 13+ tables
- Enable PostGIS extension for geospatial queries
- Implement Row Level Security (RLS) policies
- Create database types for TypeScript
```mermaid
erDiagram
    USERS ||--o| DONORS : has
    USERS ||--o| VOLUNTEERS : has
    USERS ||--o| ADMINS : has
    BLOOD_REQUESTS ||--o{ ASSIGNMENTS : has
    BLOOD_REQUESTS }o--|| DONORS : fulfilled_by
    VOLUNTEERS ||--o{ ASSIGNMENTS : receives
    DONORS ||--o{ ASSIGNMENTS : receives
    DONORS ||--o{ DONATIONS : makes
    BLOOD_REQUESTS ||--o| DONATIONS : results_in
```


Key tables:

- `users` - Base user table (Supabase Auth)
- `donors` - Donor profiles with eligibility tracking
- `volunteers` - Volunteer profiles with performance metrics
- `admins` - Admin profiles
- `blood_requests` - All blood requests (public + registered)
- `assignments` - Two-level assignment tracking
- `donations` - Completed donation records
- `notifications` - Notification logs

### Phase 2: Core Public Features

**2.1 Public Blood Request Form** (`/request-blood`)

- Location picker with interactive map
- Auto-detect current location option
- Blood group selection with compatibility info
- Patient details form with validation
- Emergency detection (needed within 6 hours)
- reCAPTCHA integration (mock for now)
- Tracking ID generation (BLD-YYYYMMDD-XXXX)

**2.2 Public Request Tracking** (`/track/[trackingId]`)

- Real-time status updates via Supabase Realtime
- Progress timeline visualization
- SMS/Email confirmation (mock implementation)
- Status stages: Submitted -> Approved -> Volunteer Assigned -> Donor Assigned -> Donor Confirmed -> Completed

**2.3 Public Live Map** (`/live-map`)

- Display active blood requests (color-coded by urgency)
- Filter by blood group
- Blood demand heatmap
- Sanitized info only (no personal data)

### Phase 3: Authentication and Dashboards

**3.1 Authentication System**

- Supabase Auth integration
- Role-based access (donor, volunteer, admin)
- Phone/Email login
- Protected route middleware

**3.2 Donor Dashboard** (`/dashboard/donor`)

- Profile management
- Availability toggle
- Assigned requests view
- Donation history
- Eligibility status (next donation date)
- Interactive map showing assigned requests

**3.3 Volunteer Dashboard** (`/dashboard/volunteer`)

- Assigned requests list
- Donor search with map
- One-click donor assignment
- Performance metrics
- Request management interface

**3.4 Admin Dashboard** (`/dashboard/admin`)

- All requests overview
- Request approval workflow
- Volunteer assignment interface
- Analytics and statistics
- User management
- Complete map with all data

### Phase 4: Map System

**4.1 Map Components Architecture**

- Shared map component with role-based rendering
- Real-time marker updates
- Assignment line visualization (blue for volunteer, green for donor)
- Clustering for dense areas

**4.2 Role-Specific Map Views**| Role | Features ||------|----------|| Public | Active requests, urgency colors, heatmap || Donor | Own location, assigned requests, route/ETA || Volunteer | Assigned requests, available donors, assignment UI || Admin | All entities, both assignment types, analytics |

### Phase 5: Assignment System

**5.1 Two-Level Assignment Workflow**

```mermaid
sequenceDiagram
    participant R as Request
    participant A as Admin
    participant V as Volunteer
    participant D as Donor

    R->>A: New request submitted
    A->>V: Assign volunteer (blue line)
    V->>D: Find and assign donor (green line)
    D->>R: Confirm and donate
    R->>R: Mark completed
```

**5.2 Smart Matching Algorithm**

- Distance calculation using PostGIS
- Blood group compatibility checking
- Eligibility verification
- Scoring system with weighted factors

### Phase 6: Notification System

**6.1 Notification Service** (Mock Implementation)

- SMS gateway abstraction (SSLWireless ready)
- Email service abstraction (Resend ready)
- In-app notification system
- Notification templates in Bengali/English

**6.2 Notification Triggers**

- New request confirmation
- Assignment notifications
- Status updates
- Emergency alerts
- Donation reminders

### Phase 7: Real-time Features

**7.1 Supabase Realtime Channels**

- `public:blood_requests` - New request broadcasts
- `map:markers` - Real-time marker updates
- `assignments:volunteer:{id}` - Volunteer tasks
- `assignments:donor:{id}` - Donor tasks
- `requests:tracking:{tracking_id}` - Public tracking

---

## Project Structure

```javascript
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing page
│   │   ├── request-blood/page.tsx      # Public request form
│   │   ├── track/[trackingId]/page.tsx # Public tracking
│   │   └── live-map/page.tsx           # Public map
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── donor/page.tsx
│   │   ├── volunteer/page.tsx
│   │   └── admin/page.tsx
│   ├── api/
│   │   ├── public/
│   │   ├── donor/
│   │   ├── volunteer/
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn components
│   ├── maps/                # Map components
│   ├── forms/               # Form components
│   └── dashboard/           # Dashboard components
├── lib/
│   ├── supabase/           # Supabase client + types
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── hooks/                   # Custom hooks
├── stores/                  # Zustand stores
└── types/                   # TypeScript types
```

---

## Key Implementation Files

1. **Database Migrations**: `supabase/migrations/` - Complete schema with PostGIS
2. **Supabase Client**: `src/lib/supabase/client.ts` - Browser/server clients
3. **Map Components**: `src/components/maps/BloodMap.tsx` - Role-based map
4. **Request Form**: `src/components/forms/BloodRequestForm.tsx`
5. **Assignment Service**: `src/lib/services/assignment.ts`
6. **Notification Service**: `src/lib/services/notifications.ts` (mock)

---

## Mock Services Note

Since no API keys are available yet, these services will have mock implementations:

- **Google Maps**: Will use placeholder map with simulated markers
- **SMS (SSLWireless)**: Will log to console and store in database
- **Email (Resend)**: Will log to console and store in database
- **reCAPTCHA**: Will bypass in development mode

All mocks are designed for easy replacement with real implementations when API keys are available.---

## Estimated Deliverables

- 50+ React components
- 15+ API routes
- 13+ database tables
- 4 role-based dashboards
- Real-time map system