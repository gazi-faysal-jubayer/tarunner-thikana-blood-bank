# Blood Donation Workflow Testing Guide

## Test Accounts

### Admin
- **Email:** gazi.faysal.jubayer@gmail.com
- **Password:** (contact admin for password)

### Volunteers
- **Email:** volunteer1@blooddonation.org
- **Password:** Volunteer@123

### Donors
- **Email:** donor1@blooddonation.org
- **Password:** Donor@123

## Complete Workflow Steps

### Step 1: Submit Blood Request (Public - No Login Required)
1. Go to http://localhost:3000/request-blood
2. Fill in the blood request form
3. Submit the request
4. Note the tracking ID for tracking

### Step 2: Admin Approves Request
1. Login as admin: gazi.faysal.jubayer@gmail.com
2. Go to Dashboard → Requests (http://localhost:3000/dashboard/requests)
3. Find requests with "জমা দেওয়া" (Submitted) status
4. Click "অনুমোদন" (Approve) button

### Step 3: Admin Assigns Volunteer
1. After approval, click "স্বেচ্ছাসেবক" (Volunteer) button
2. You'll be taken to assignment page with volunteer list
3. Select a volunteer and click "অ্যাসাইন করুন" (Assign)

### Step 4: Volunteer Assigns Donor
1. Logout from admin account
2. Login as volunteer: volunteer1@blooddonation.org / Volunteer@123
3. Go to Dashboard → Donors (http://localhost:3000/dashboard/donors)
4. Select the request from dropdown
5. Find a matching donor and click "অ্যাসাইন করুন" (Assign)

### Step 5: Donor Accepts Assignment
1. Logout from volunteer account
2. Login as donor: donor1@blooddonation.org / Donor@123
3. Go to Dashboard (http://localhost:3000/dashboard)
4. Find the pending assignment
5. Click "গ্রহণ করুন" (Accept)

### Step 6: Donor Starts Transit
1. After accepting, click "যাত্রা শুরু" (Start Transit)
2. The system will track donor location

### Step 7: Donor Completes Donation
1. After arriving at hospital and donating
2. Click "সম্পন্ন" (Complete) button
3. Donation record will be created

### Step 8: Volunteer Verifies Donation
1. Logout from donor account
2. Login as volunteer: volunteer1@blooddonation.org / Volunteer@123
3. Go to Dashboard
4. Find "যাচাইকরণ অপেক্ষমাণ" (Pending Verification) section
5. Click "যাচাই করুন" (Verify) button
6. Request status changes to "completed"

## Database Verification

To verify workflow in database, run these queries in Supabase SQL Editor:

```sql
-- Check request status
SELECT id, tracking_id, status, assigned_volunteer_id 
FROM blood_requests 
ORDER BY created_at DESC;

-- Check assignments
SELECT a.id, a.type, a.status, a.is_in_transit, 
       br.tracking_id, p.full_name as assignee
FROM assignments a
JOIN blood_requests br ON a.request_id = br.id
JOIN profiles p ON a.assignee_id = p.id
ORDER BY a.created_at DESC;

-- Check donations
SELECT d.id, d.units_donated, d.verified_by, d.verified_at,
       br.tracking_id
FROM donations d
JOIN blood_requests br ON d.request_id = br.id
ORDER BY d.created_at DESC;
```

## Status Flow

1. `submitted` → Initial request
2. `approved` → Admin approved
3. `volunteer_assigned` → Volunteer assigned
4. `donor_assigned` → Donor assigned
5. `donor_confirmed` → Donor accepted
6. `in_progress` → Donor in transit
7. `completed` → Donation verified

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user info |
| `/api/public/request-blood` | POST | Submit blood request |
| `/api/admin/requests/[id]/approve` | POST | Approve request |
| `/api/admin/requests/[id]/assign` | POST | Assign volunteer/donor |
| `/api/requests/[id]/assign-donor` | POST | Volunteer assigns donor |
| `/api/assignments/[id]/respond` | POST | Accept/reject assignment |
| `/api/assignments/[id]/start-transit` | POST | Start transit |
| `/api/donations/complete` | POST | Complete donation |
| `/api/donations/[id]/verify` | POST | Verify donation |
