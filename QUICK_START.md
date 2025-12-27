# Quick Start Guide

## Login Credentials

### Admin
- **Email**: `gazi.faysal.jubayer@gmail.com`
- **Password**: `Admin@123456`
- **Access**: Full system access

### Volunteer
- **Email**: `volunteer1@blooddonation.org`
- **Password**: `Volunteer@123`
- **Access**: Can view assigned requests, manage donors, create assignments

### Donor
- **Email**: `donor1@blooddonation.org`
- **Password**: `Donor@123`
- **Access**: Can view assigned requests, update availability, view history

## Testing Checklist

### 1. Login Flow
- [ ] Login as admin → Should redirect to `/dashboard` with admin content
- [ ] Login as volunteer → Should redirect to `/dashboard` with volunteer content
- [ ] Login as donor → Should redirect to `/dashboard` with donor content

### 2. Dashboard Features
- [ ] Admin sees all menu items (Dashboard, Requests, Donors, Volunteers, Assignments, Map, Statistics, Settings)
- [ ] Volunteer sees limited menu items (Dashboard, Requests, Donors, Assignments, Map, Statistics)
- [ ] Donor sees basic menu items (Dashboard, Requests, Map, Statistics, Profile)

### 3. Route Protection
- [ ] Admin can access `/dashboard/volunteers`
- [ ] Volunteer cannot access `/dashboard/volunteers` (redirects to `/dashboard`)
- [ ] Donor cannot access `/dashboard/volunteers` (redirects to `/dashboard`)
- [ ] Admin and Volunteer can access `/dashboard/donors`
- [ ] Donor cannot access `/dashboard/donors` (redirects to `/dashboard`)

### 4. Public Features
- [ ] Visit `/request-blood` → Can submit request without login
- [ ] Visit `/track/[trackingId]` → Can view request status without login
- [ ] Visit `/live-map` → Can view active requests on map without login

### 5. Data Display
- [ ] Admin dashboard shows 10 blood requests
- [ ] Admin dashboard shows 20+ donors
- [ ] Admin dashboard shows 4 volunteers
- [ ] Volunteer sees assigned requests (if any)
- [ ] Donor sees assigned requests (if any)

## Key URLs

- **Home**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login`
- **Dashboard**: `http://localhost:3000/dashboard` (requires login)
- **Request Blood**: `http://localhost:3000/request-blood` (public)
- **Live Map**: `http://localhost:3000/live-map` (public)

## Troubleshooting

### Login Not Working
1. Check `.env.local` has correct Supabase credentials
2. Verify user exists in `auth.users` table
3. Verify profile exists in `profiles` table with correct role
4. Check browser console for errors

### Dashboard Not Loading
1. Check user is authenticated (cookies set)
2. Verify `/api/auth/me` returns correct role
3. Check middleware is not blocking access

### No Data Showing
1. Verify test accounts were created successfully
2. Check Supabase RLS policies allow access
3. Verify database queries are correct

## Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`
