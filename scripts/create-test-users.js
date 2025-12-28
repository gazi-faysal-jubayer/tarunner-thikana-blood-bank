const https = require('https');

const SUPABASE_URL = 'https://finciztvoylpdpjroutr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbmNpenR2b3lscGRwanJvdXRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc0MzMzNSwiZXhwIjoyMDgyMzE5MzM1fQ.Hg-YF1ypXqA6LbsUKW2kKeLYnXcA6XSPn6NZ7HPw_Mg';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];

// Test users to create
const usersToCreate = [
  // Volunteers (4)
  { email: 'volunteer1@blooddonation.org', password: 'Volunteer@123', role: 'volunteer', name: 'Volunteer One', district: 'Dhaka' },
  { email: 'volunteer2@blooddonation.org', password: 'Volunteer@123', role: 'volunteer', name: 'Volunteer Two', district: 'Chittagong' },
  { email: 'volunteer3@blooddonation.org', password: 'Volunteer@123', role: 'volunteer', name: 'Volunteer Three', district: 'Sylhet' },
  { email: 'volunteer4@blooddonation.org', password: 'Volunteer@123', role: 'volunteer', name: 'Volunteer Four', district: 'Rajshahi' },
  // Donors (20)
  { email: 'donor1@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor One', blood_group: 'A+', district: 'Dhaka' },
  { email: 'donor2@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Two', blood_group: 'A+', district: 'Dhaka' },
  { email: 'donor3@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Three', blood_group: 'A+', district: 'Dhaka' },
  { email: 'donor4@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Four', blood_group: 'B+', district: 'Dhaka' },
  { email: 'donor5@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Five', blood_group: 'B+', district: 'Dhaka' },
  { email: 'donor6@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Six', blood_group: 'B+', district: 'Chittagong' },
  { email: 'donor7@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Seven', blood_group: 'O+', district: 'Chittagong' },
  { email: 'donor8@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Eight', blood_group: 'O+', district: 'Chittagong' },
  { email: 'donor9@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Nine', blood_group: 'O+', district: 'Sylhet' },
  { email: 'donor10@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Ten', blood_group: 'AB+', district: 'Sylhet' },
  { email: 'donor11@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Eleven', blood_group: 'AB+', district: 'Sylhet' },
  { email: 'donor12@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Twelve', blood_group: 'A-', district: 'Rajshahi' },
  { email: 'donor13@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Thirteen', blood_group: 'B-', district: 'Rajshahi' },
  { email: 'donor14@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Fourteen', blood_group: 'O-', district: 'Rajshahi' },
  { email: 'donor15@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Fifteen', blood_group: 'AB-', district: 'Khulna' },
  { email: 'donor16@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Sixteen', blood_group: 'A+', district: 'Khulna' },
  { email: 'donor17@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Seventeen', blood_group: 'B+', district: 'Dhaka' },
  { email: 'donor18@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Eighteen', blood_group: 'A+', district: 'Dhaka' },
  { email: 'donor19@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Nineteen', blood_group: 'B+', district: 'Dhaka' },
  { email: 'donor20@blooddonation.org', password: 'Donor@123', role: 'donor', name: 'Donor Twenty', blood_group: 'O+', district: 'Dhaka' },
];

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'finciztvoylpdpjroutr.supabase.co',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    };
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function createUser(user) {
  // Create auth user
  const authResult = await makeRequest('/auth/v1/admin/users', 'POST', {
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.name }
  });

  if (authResult.status !== 200 && authResult.status !== 201) {
    if (authResult.data?.msg?.includes('already been registered') || authResult.data?.error?.includes('exists')) {
      console.log(`  User ${user.email} already exists, skipping auth creation`);
      // Get existing user
      const existingResult = await makeRequest(`/rest/v1/profiles?email=eq.${encodeURIComponent(user.email)}&select=id`, 'GET');
      if (existingResult.data?.[0]?.id) {
        return { id: existingResult.data[0].id };
      }
      return null;
    }
    console.error(`  Failed to create auth user ${user.email}:`, authResult.data);
    return null;
  }

  const userId = authResult.data.id;
  console.log(`  Created auth user: ${user.email} (${userId})`);

  // Create profile
  await makeRequest('/rest/v1/profiles', 'POST', {
    id: userId,
    email: user.email,
    full_name: user.name,
    phone: '+880170000' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    role: user.role,
  });

  // Create role-specific record
  if (user.role === 'donor') {
    const lat = 23.8 + (Math.random() * 0.2 - 0.1);
    const lng = 90.4 + (Math.random() * 0.2 - 0.1);
    await makeRequest('/rest/v1/donors', 'POST', {
      user_id: userId,
      blood_group: user.blood_group,
      date_of_birth: '1990-01-01',
      gender: 'male',
      latitude: lat,
      longitude: lng,
      address: `${user.district}, Bangladesh`,
      district: user.district,
      division: user.district,
      is_available: true,
      total_donations: Math.floor(Math.random() * 5),
    });
  } else if (user.role === 'volunteer') {
    const lat = 23.8 + (Math.random() * 0.2 - 0.1);
    const lng = 90.4 + (Math.random() * 0.2 - 0.1);
    await makeRequest('/rest/v1/volunteers', 'POST', {
      user_id: userId,
      employee_id: 'VOL-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      latitude: lat,
      longitude: lng,
      address: `${user.district}, Bangladesh`,
      district: user.district,
      division: user.district,
      coverage_radius_km: 10,
      is_active: true,
    });
  }

  return { id: userId };
}

async function main() {
  console.log('Creating test users...\n');
  
  let created = 0;
  let failed = 0;

  for (const user of usersToCreate) {
    console.log(`Creating ${user.role}: ${user.email}`);
    const result = await createUser(user);
    if (result) {
      created++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone! Created: ${created}, Failed: ${failed}`);
  console.log('\nTest Credentials:');
  console.log('=================');
  console.log('Admin: gazi.faysal.jubayer@gmail.com / Admin@123456');
  console.log('Volunteers: volunteer1@blooddonation.org / Volunteer@123');
  console.log('Donors: donor1@blooddonation.org / Donor@123');
}

main().catch(console.error);



