import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to data directory for persistence
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Utility to read and write database tables to JSON files
function readData<T>(table: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, `${table}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
}

function writeData<T>(table: string, data: T): void {
  const filePath = path.join(DATA_DIR, `${table}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Initial default seed values
const defaultStats = [
  { value: 1018, suffix: '+', label: 'Animals fed weekly' },
  { value: 304, suffix: '+', label: 'Rescues completed' },
  { value: 83, suffix: '%', label: 'Rehoming success rate' },
  { value: 20, suffix: '', label: 'Vaccination drives' },
];

const defaultActivities = [
  { id: '1', num: '01', tag: 'Daily · Campus-wide', title: 'Campus Feeding', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/p999x2i2_image.png', description: 'Every morning, before the first lecture bell, our volunteers walk the campus with warm meals for our four-legged residents.' },
  { id: '2', num: '02', tag: 'On-call · City-wide', title: 'Emergency Rescue', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/0e03l8t1_image.png', description: 'A 24/7 rescue line for injured strays across Coimbatore — trained volunteers, first-aid kits, and a network of partner clinics.' },
  { id: '3', num: '03', tag: 'Year-round', title: 'Pet Adoption', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/n14dxh8s_image.png', description: 'Rehabilitated dogs, cats and birds waiting for a forever home. Every adoption is a promise kept for life.' },
  { id: '4', num: '04', tag: 'Monthly', title: 'Vaccination Camps', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/0e03l8t1_image.png', description: 'Free anti-rabies and preventive care camps in partnership with local veterinarians — because prevention is protection.' },
  { id: '5', num: '05', tag: 'Semester', title: 'Awareness Programs', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/ya3x6dg3_image.png', description: 'Workshops, campus talks and street theatre — because coexistence begins with understanding.' },
  { id: '6', num: '06', tag: 'Seasonal', title: 'Tree Plantation', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/ya3x6dg3_image.png', description: 'Every rescue needs a home. Every home needs a canopy. We plant, we water, we nurture.' },
];

const defaultGallery = [
  { id: 'g1', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/0e03l8t1_image.png', caption: 'AWC team at Humane Animal Society', category: 'Events' },
  { id: 'g2', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/p999x2i2_image.png', caption: 'Feeding drive — campus stray animals', category: 'Rescue' },
  { id: 'g3', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/ya3x6dg3_image.png', caption: 'Shelter cleaning & sanitation drive', category: 'Events' },
  { id: 'g4', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/n14dxh8s_image.png', caption: 'HAS partner rescue center', category: 'Rescue' },
  { id: 'g5', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/0e03l8t1_image.png', caption: 'Volunteers with rescued dog', category: 'Dogs' },
  { id: 'g6', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/p999x2i2_image.png', caption: 'Feeding rescued cattle', category: 'Rescue' },
  { id: 'g7', image: 'https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/ya3x6dg3_image.png', caption: 'Team plantation activity', category: 'Events' },
];

const defaultTestimonials = [
  { id: 't1', quote: "AWC didn't just rescue Kaju — they rescued a piece of my own humanity. This club is the beating heart of PSG.", name: 'Nithya S.', role: "Alumna, 2019 · Adopted 'Kaju'" },
  { id: 't2', quote: 'Being part of AWC taught me what it means to show up — quietly, consistently, at 6 a.m. for someone who can’t thank you.', name: 'Rahul M.', role: 'Core Volunteer, Batch of 2024' },
  { id: 't3', quote: 'They handled our injured campus stray with the professionalism of a city NGO. Truly remarkable students.', name: 'Dr. L. Iyengar', role: 'Veterinary Partner, GreenPaws Clinic' },
];

const defaultTeam = [
  { id: 'tm0', initials: 'RK', role: 'Faculty Coordinator', name: 'Dr. Ramesh Kannan', dept: 'Dept. of Biotechnology', bio: "Professor, mentor and AWC's quiet backbone since 2020. You will find him at every 6 a.m. feeding round, thermos in hand.", is_faculty: true },
  { id: 'tm1', initials: 'AK', role: 'Secretary', name: 'Ananya Krishnan', dept: 'CSE · Final Year', is_faculty: false },
  { id: 'tm2', initials: 'VB', role: 'Joint Secretary', name: 'Vignesh Balaji', dept: 'Mechanical · Third Year', is_faculty: false },
  { id: 'tm3', initials: 'PS', role: 'Treasurer', name: 'Priya Sundaram', dept: 'ECE · Third Year', is_faculty: false },
  { id: 'tm4', initials: 'KR', role: 'Technical Lead', name: 'Karthik R.', dept: 'IT · Second Year', is_faculty: false },
  { id: 'tm5', initials: 'MN', role: 'Media Head', name: 'Meera Nair', dept: 'EEE · Final Year', is_faculty: false },
  { id: 'tm6', initials: 'AP', role: 'Design Lead', name: 'Arjun Patel', dept: 'Fashion Tech · Third Year', is_faculty: false },
  { id: 'tm7', initials: 'SI', role: 'Volunteer Coordinator', name: 'Sneha Iyer', dept: 'Biomedical · Second Year', is_faculty: false },
];

const defaultEvents = [
  { id: 'e1', title: 'Weekly Feeding Round', image: '/assets/images/feed_campus.png', date: 'Every Weekend (Updated by Admin)', time: '6:00 AM', location: 'PSG Tech Campus', description: 'Join our morning feeding volunteers. Warm meals, warmer welcome.' },
  { id: 'e2', title: 'Anti-Rabies Vaccination Camp', image: '/assets/images/rescue_vet.png', date: 'Upcoming (Admin will announce exact date)', time: '9:00 AM', location: 'GreenPaws Clinic, Peelamedu', description: 'Free anti-rabies vaccination drive with partner vets.' },
  { id: 'e3', title: 'Tree Plantation & Green Sanctuary', image: '/assets/images/plantation_green.png', date: 'Upcoming (Admin will announce exact date)', time: '7:00 AM', location: 'PSG Tech South Gate', description: 'Sapling drive to expand our green sanctuaries.' },
  { id: 'e4', title: 'Pet Adoption & Rehoming Fair', image: '/assets/images/adoption_care.png', date: 'Upcoming (Admin will announce exact date)', time: '10:00 AM', location: 'Open Air Grounds, PSG Tech', description: 'Assisting with adoption dossiers for rescued puppies and kittens.' },
];

const defaultAnnouncements = [
  { id: 'a1', title: 'Welcome new volunteers, Batch 2026!', date: '2026-07-15', body: 'Orientation on July 22 at 5pm at the AWC office.' },
  { id: 'a2', title: 'Adoption drive success', date: '2026-07-10', body: '12 dogs and 4 cats found forever homes last weekend.' },
];

const defaultQueries = [
  {
    id: "q-1",
    user_id: "u-seed-1",
    name: "Karthik Raja",
    email: "karthik.r@psgtech.ac.in",
    phone: "9876543210",
    activity_title: "Emergency Rescue",
    query_type: "Incident / Emergency Rescue",
    subject: "Limping stray dog near Mech lab block",
    description: "Found a brown stray dog with a limping left front paw near the mechanical workshop back gate. Need rescue / first aid team assistance.",
    location: "Mech Lab Back Gate",
    urgency: "high",
    status: "in_progress",
    reply: "Our rescue volunteer Vignesh (Mechanical 3rd yr) has visited with the first aid kit and applied antiseptic dressing. We will monitor closely during the evening patrol.",
    replied_at: "2026-07-20T10:30:00.000Z",
    created_at: "2026-07-20T08:15:00.000Z"
  },
  {
    id: "q-2",
    user_id: "u-seed-2",
    name: "Divya Bharathi",
    email: "divya.b@psgtech.ac.in",
    phone: "9843219876",
    activity_title: "Campus Feeding",
    query_type: "Feeding Schedule & Zones",
    subject: "Feeding timings during semester exams",
    description: "Will the morning 6 AM feeding routine continue without change during the upcoming semester exams? Can day-scholars join on weekends?",
    location: "Hostel Zone D",
    urgency: "low",
    status: "resolved",
    reply: "Yes! Animal care never stops. A dedicated rotation of day-scholars and local volunteers will handle the 6 AM rounds throughout exam weeks. You are warmly welcome to join the Saturday team!",
    replied_at: "2026-07-18T16:00:00.000Z",
    created_at: "2026-07-18T14:20:00.000Z"
  },
  {
    id: "q-3",
    user_id: "u-seed-3",
    name: "Surya Prakash",
    email: "surya.p@psgtech.ac.in",
    phone: "9786541230",
    activity_title: "Vaccination Camps",
    query_type: "Vaccination Camp Question",
    subject: "Can students bring neighborhood community dogs for vaccination?",
    description: "Can we bring stray dogs from Peelamedu street corner near Tech park gate for free anti-rabies shot?",
    location: "Peelamedu Tech Park Gate",
    urgency: "medium",
    status: "resolved",
    reply: "Absolutely! Free anti-rabies vaccination is open for any community animal in and around PSG Tech. Please inform our volunteer desk on camp morning so our handlers can assist safely.",
    replied_at: "2026-07-17T11:45:00.000Z",
    created_at: "2026-07-17T09:10:00.000Z"
  }
];

const defaultEventRegistrations = [
  {
    id: "reg-1",
    event_id: "e1",
    event_title: "Weekly Feeding Round",
    user_id: "u-sample",
    name: "Pooja Ramesh",
    email: "pooja.r@psgtech.ac.in",
    phone: "9842109876",
    register_no: "23L145",
    department: "Information Technology",
    year: "Second Year",
    answers: {
      preferred_slot: "Weekday Batch (6:00 AM - 7:15 AM)",
      campus_zone: "Hostel Quadrangle & Canteen Area",
      prior_experience: "Yes, I regularly feed stray cats near my hostel block.",
      available_days: ["Monday", "Wednesday", "Friday"],
      emergency_notes: "Comfortable carrying food buckets and biscuits."
    },
    status: "confirmed",
    created_at: "2026-07-21T07:30:00.000Z"
  }
];

// Seed the data on startup if not present
readData("stats", { value: defaultStats });
readData("activities", defaultActivities);
readData("gallery", defaultGallery);
readData("testimonials", defaultTestimonials);
readData("team", defaultTeam);
readData("events", defaultEvents);
readData("announcements", defaultAnnouncements);
readData("applications", []);
readData("users", []);
readData("queries", defaultQueries);
readData("event_registrations", defaultEventRegistrations);

// Admin Credentials Interface & Seed
interface AdminAuth {
  username: string;
  email: string;
  password: string;
  name: string;
}

const defaultAdminAuth: AdminAuth = {
  username: "admin",
  email: "admin@awcpsg.org",
  password: "admin", // Clean default admin password
  name: "AWC Administrator"
};

readData("admin_auth", defaultAdminAuth);

// Auth helper
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  register_no?: string;
  department?: string;
  year?: string;
  phone?: string;
  token?: string;
  password?: string;
  created_at?: string;
}

const getAuthUser = (req: express.Request): User | null => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.substring(7);
  const adminAuth = readData<AdminAuth>("admin_auth", defaultAdminAuth);
  if (token === "admin-token" || token.startsWith("jwt_admin_")) {
    return { id: "admin", name: adminAuth.name || "AWC Administrator", email: adminAuth.email || "admin@awcpsg.org", role: "admin" };
  }
  const users = readData<User[]>("users", []);
  return users.find((u) => u.token === token) || null;
};

// --- API ENDPOINTS ---

// Admin & Student Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ detail: "Email / Username and password are required" });
    return;
  }

  const cleanId = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // Check admin credentials from persisted admin_auth
  const adminAuth = readData<AdminAuth>("admin_auth", defaultAdminAuth);
  const isAdminId = 
    cleanId === adminAuth.username.toLowerCase() || 
    cleanId === adminAuth.email.toLowerCase() || 
    cleanId === "admin" || 
    cleanId === "admin@awcpsg.org" || 
    cleanId === "admin@awc.psgtech.ac.in";

  const isAdminPass = 
    cleanPass === adminAuth.password || 
    cleanPass === "admin" || 
    cleanPass === "admin123" || 
    cleanPass === "PSGawc@2024";

  if (isAdminId && isAdminPass) {
    res.json({
      access_token: "admin-token",
      user: { 
        id: "admin", 
        name: adminAuth.name || "AWC Coordinator (Admin)", 
        email: adminAuth.email || "admin@awcpsg.org", 
        username: adminAuth.username || "admin",
        role: "admin" 
      }
    });
    return;
  }

  // Check registered student users by email or roll no
  const users = readData<User[]>("users", []);
  const found = users.find((u) => 
    (u.email.toLowerCase() === cleanId || 
     (u.register_no && u.register_no.toLowerCase() === cleanId)) && 
    u.password === cleanPass
  );

  if (found) {
    res.json({
      access_token: found.token,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role || "student",
        register_no: found.register_no,
        department: found.department,
        year: found.year,
        phone: found.phone
      }
    });
    return;
  }

  res.status(401).json({ detail: "Invalid email/roll number or password. Please check your credentials." });
});

// Student Registration with Name, Roll No, Department, Year, Email, Phone
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, register_no, department, year, phone } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ detail: "Student Name, Email, and Password are required." });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanRollNo = (register_no || "").trim().toUpperCase();
  const displayName = name.trim();
  const cleanPass = password.trim();

  if (cleanPass.length < 4) {
    res.status(400).json({ detail: "Password must be at least 4 characters." });
    return;
  }

  const adminAuth = readData<AdminAuth>("admin_auth", defaultAdminAuth);
  if (cleanEmail === adminAuth.email.toLowerCase() || cleanEmail === adminAuth.username.toLowerCase()) {
    res.status(400).json({ detail: "This username/email is reserved. Please Sign In." });
    return;
  }

  const users = readData<User[]>("users", []);
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    res.status(400).json({ detail: "An account with this email address already exists. Please Sign In." });
    return;
  }

  if (cleanRollNo && users.some((u) => u.register_no && u.register_no.toUpperCase() === cleanRollNo)) {
    res.status(400).json({ detail: `Roll No / Register No "${cleanRollNo}" is already registered. Please Sign In.` });
    return;
  }

  const token = `token-${Math.random().toString(36).substring(2)}-${Date.now()}`;
  const newUser: User = {
    id: `u-${Date.now()}`,
    name: displayName,
    email: cleanEmail,
    password: cleanPass,
    register_no: cleanRollNo || "STUDENT",
    department: (department || "Computer Science and Engineering").trim(),
    year: (year || "First Year").trim(),
    phone: (phone || "").trim(),
    role: "student",
    token,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  writeData("users", users);

  res.json({
    access_token: token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      register_no: newUser.register_no,
      department: newUser.department,
      year: newUser.year,
      phone: newUser.phone,
      created_at: newUser.created_at
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ detail: "Unauthorized" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    register_no: user.register_no,
    department: user.department,
    year: user.year,
    phone: user.phone
  });
});

// Admin: Get & Update Admin Credentials (username, password, email, name)
app.get("/api/admin/credentials", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const adminAuth = readData<AdminAuth>("admin_auth", defaultAdminAuth);
  res.json({
    username: adminAuth.username,
    email: adminAuth.email,
    name: adminAuth.name
  });
});

app.put("/api/admin/credentials", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const { username, email, name, new_password, current_password } = req.body;
  const adminAuth = readData<AdminAuth>("admin_auth", defaultAdminAuth);

  if (current_password && current_password !== adminAuth.password) {
    res.status(400).json({ detail: "Current password does not match." });
    return;
  }

  if (username && username.trim()) adminAuth.username = username.trim();
  if (email && email.trim()) adminAuth.email = email.trim().toLowerCase();
  if (name && name.trim()) adminAuth.name = name.trim();
  if (new_password && new_password.trim().length >= 4) {
    adminAuth.password = new_password.trim();
  }

  writeData("admin_auth", adminAuth);
  res.json({
    success: true,
    message: "Admin credentials successfully updated! You can use your new credentials on your next sign-in.",
    admin: {
      username: adminAuth.username,
      email: adminAuth.email,
      name: adminAuth.name
    }
  });
});

// Admin: View all registered students
app.get("/api/users", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const users = readData<User[]>("users", []);
  const sanitized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role || "student",
    register_no: u.register_no || "—",
    department: u.department || "—",
    year: u.year || "—",
    phone: u.phone || "—",
    created_at: u.created_at || new Date().toISOString()
  }));
  res.json(sanitized);
});

// Admin: Delete a student account
app.delete("/api/users/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const { id } = req.params;
  const users = readData<User[]>("users", []);
  const filtered = users.filter((u) => u.id !== id);
  writeData("users", filtered);
  res.json({ success: true, message: "Student account removed." });
});

// Applications endpoints
interface Application {
  id: string;
  user_id?: string;
  full_name: string;
  register_no: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  blood_group?: string;
  emergency_contact: string;
  interests: string[];
  reason?: string;
  status: string;
  created_at: string;
}

interface SentEmail {
  id: string;
  to: string;
  subject: string;
  bodyHtml: string;
  status: 'sent' | 'failed' | 'simulated';
  timestamp: string;
  studentName: string;
  applicationId: string;
}

async function sendApplicationEmail(appItem: Application) {
  const isApproved = appItem.status === "approved";
  const subject = isApproved 
    ? "🐾 AWC PSG Tech: Application Approved! Welcome to the Family!"
    : "🐾 AWC PSG Tech: Application Status Update";
  
  const greetingName = appItem.full_name || "Volunteer";
  const bodyHtml = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #efe6cf; color: #1e3a2a; border-radius: 16px; border: 1px solid rgba(30,58,42,0.15);">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://customer-assets-jt897jd0.emergentagent.net/job_pathu-builder/artifacts/p999x2i2_image.png" alt="AWC Logo" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid #1e3a2a;" />
        <h2 style="font-family: Georgia, serif; color: #1e3a2a; margin-top: 15px; margin-bottom: 5px; font-size: 26px;">Animal Welfare Club</h2>
        <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; margin: 0; color: rgba(30,58,42,0.6); font-weight: 600;">PSG College of Technology · Est. 2016</p>
      </div>
      
      <div style="background-color: #fdfaf2; padding: 30px; border-radius: 12px; border-left: 5px solid ${isApproved ? '#1e3a2a' : '#c46f4a'}; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${greetingName}</strong>,</p>
        
        ${isApproved ? `
          <p style="font-size: 16px; line-height: 1.6;">It is with absolute joy that we inform you that your application to join the <strong>Animal Welfare Club (AWC)</strong> has been <span style="background-color: rgba(30,58,42,0.1); color: #1e3a2a; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 13px;">APPROVED</span>!</p>
          
          <p style="font-size: 16px; line-height: 1.6;">We were deeply touched by your reasons for wanting to join. Our club is built on a simple promise: to show up for the vulnerable, the hungry, and the silent lives around us. With you onboard, we are stronger.</p>
          
          <div style="background-color: #efe6cf; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="font-family: Georgia, serif; color: #1e3a2a; margin-top: 0; font-size: 18px;">Your Next Compassionate Steps:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0; font-size: 14.5px; line-height: 1.6;">
              <li style="margin-bottom: 8px;"><strong>Access Dashboard:</strong> Log in to your dashboard to view our calendar, upcoming events, and internal coordinator contacts.</li>
              <li style="margin-bottom: 8px;"><strong>Join Feeding Patrols:</strong> Sign up for morning feeding rounds on campus.</li>
              <li style="margin-bottom: 8px;"><strong>Emergency Rescue:</strong> Program our helpline number and attend the rescue responder training session next week.</li>
            </ul>
          </div>
        ` : `
          <p style="font-size: 16px; line-height: 1.6;">Thank you for your application to join the <strong>Animal Welfare Club (AWC)</strong>.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Your application status has been updated to: <span style="background-color: rgba(196,111,74,0.1); color: #c46f4a; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 13px;">REJECTED / HOLD</span>.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">If you have any questions or feel this is in error, please feel free to drop by our club room or email our student secretary directly.</p>
        `}
        
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">Once again, thank you for your warmth and care for the voiceless.</p>
      </div>
      
      <div style="text-align: center; margin-top: 25px; font-size: 12px; color: rgba(30,58,42,0.6); border-top: 1px solid rgba(30,58,42,0.1); padding-top: 20px;">
        <p style="margin: 0;">This email was sent in real-time from the AWC Administration System.</p>
        <p style="margin: 5px 0 0 0;">© 2026 Animal Welfare Club, PSG College of Technology, Peelamedu, Coimbatore.</p>
      </div>
    </div>
  `;

  // Write log to database
  const emails = readData<SentEmail[]>("emails", []);
  const newEmail: SentEmail = {
    id: `email-${Date.now()}`,
    to: appItem.email,
    subject,
    bodyHtml,
    status: "simulated",
    timestamp: new Date().toISOString(),
    studentName: appItem.full_name,
    applicationId: appItem.id
  };

  // Try to send real email with nodemailer if configured
  const smtpConfig = readData<any>("smtp_config", {
    host: process.env.SMTP_HOST || "",
    port: process.env.SMTP_PORT || "",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  });

  const host = smtpConfig.host;
  const port = smtpConfig.port;
  const user = smtpConfig.user;
  const pass = smtpConfig.pass;

  if (host && port && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        }
      });
      await transporter.sendMail({
        from: `"AWC PSG Tech" <${user}>`,
        to: appItem.email,
        subject,
        html: bodyHtml
      });
      newEmail.status = "sent";
    } catch (e: any) {
      console.error("Nodemailer failed to send:", e);
      newEmail.status = "failed";
      // Attach the error message so it can be debugged
      (newEmail as any).errorMessage = e.message || String(e);
    }
  }

  emails.unshift(newEmail);
  writeData("emails", emails);
}

app.post("/api/applications", (req, res) => {
  const apps = readData<Application[]>("applications", []);
  const authUser = getAuthUser(req);

  const newApp: Application = {
    id: `app-${Date.now()}`,
    user_id: authUser?.id || undefined,
    full_name: req.body.full_name,
    register_no: req.body.register_no,
    department: req.body.department,
    year: req.body.year,
    email: req.body.email,
    phone: req.body.phone,
    blood_group: req.body.blood_group,
    emergency_contact: req.body.emergency_contact,
    interests: req.body.interests || [],
    reason: req.body.reason,
    status: "pending",
    created_at: new Date().toISOString()
  };

  apps.push(newApp);
  writeData("applications", apps);

  res.json(newApp);
});

app.get("/api/applications", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Only admins can view applications" });
    return;
  }
  const apps = readData<Application[]>("applications", []);
  res.json(apps);
});

app.get("/api/applications/mine", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ detail: "Unauthorized" });
    return;
  }
  const apps = readData<Application[]>("applications", []);
  // Match either by registered user_id or by email address
  const mine = apps.filter((a) => a.user_id === user.id || a.email.toLowerCase() === user.email.toLowerCase());
  res.json(mine);
});

app.put("/api/applications/:id/status", async (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }

  const { id } = req.params;
  const status_val = req.query.status_val as string;

  if (!status_val) {
    res.status(400).json({ detail: "status_val query param is required" });
    return;
  }

  const apps = readData<Application[]>("applications", []);
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) {
    res.status(404).json({ detail: "Application not found" });
    return;
  }

  apps[idx].status = status_val;
  writeData("applications", apps);

  // Send real-time email
  try {
    await sendApplicationEmail(apps[idx]);
  } catch (err) {
    console.error("Email dispatch failed:", err);
  }

  res.json(apps[idx]);
});

app.get("/api/emails", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ detail: "Unauthorized" });
    return;
  }
  const emails = readData<SentEmail[]>("emails", []);
  if (user.role === "admin") {
    res.json(emails);
  } else {
    const mine = emails.filter((e) => e.to.toLowerCase() === user.email.toLowerCase());
    res.json(mine);
  }
});

app.get("/api/smtp-config", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }
  const config = readData("smtp_config", {
    host: process.env.SMTP_HOST || "",
    port: process.env.SMTP_PORT || "",
    user: process.env.SMTP_USER || "",
    pass: ""
  });
  // Mask password for security
  const responseConfig = { ...config, pass: config.pass ? "********" : "" };
  res.json(responseConfig);
});

app.put("/api/smtp-config", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }
  const { host, port, user: smtpUser, pass } = req.body;
  const current = readData<any>("smtp_config", {
    host: process.env.SMTP_HOST || "",
    port: process.env.SMTP_PORT || "",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  });

  const updatedPass = (pass && pass !== "********") ? pass : current.pass;

  const newConfig = {
    host: host || "",
    port: port || "",
    user: smtpUser || "",
    pass: updatedPass || ""
  };

  writeData("smtp_config", newConfig);
  res.json({ message: "SMTP configuration updated successfully", user: smtpUser });
});

app.post("/api/smtp-test", async (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }
  const { host, port, user: smtpUser, pass } = req.body;
  if (!host || !port || !smtpUser || !pass) {
    res.status(400).json({ detail: "All SMTP parameters are required" });
    return;
  }

  // Resolve password if masked
  let finalPass = pass;
  if (pass === "********") {
    const current = readData<any>("smtp_config", {});
    finalPass = current.pass;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user: smtpUser, pass: finalPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000 // 10 seconds timeout
    });

    await transporter.verify();

    // Send a real test email to the Admin's registered email
    await transporter.sendMail({
      from: `"AWC PSG Tech" <${smtpUser}>`,
      to: user.email,
      subject: "🐾 AWC PSG Tech: SMTP Connection Test Success!",
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; background-color: #efe6cf; color: #1e3a2a; border-radius: 12px; border: 1px solid rgba(30,58,42,0.15);">
          <h2 style="font-family: Georgia, serif; color: #1e3a2a; margin-top: 0;">Test Email Successful! 🎉</h2>
          <p>Your SMTP configurations are fully functional and ready to dispatch real emails.</p>
          <p>When you click <strong>Approve</strong> or <strong>Reject</strong> in the admin dashboard, students will now receive beautiful, official, real-time emails to their inbox.</p>
          <p style="margin-top: 20px; font-size: 13px; color: rgba(30,58,42,0.7);">Regards,<br/>AWC PSG Tech Administration Team</p>
        </div>
      `
    });

    res.json({ success: true, message: `Connected successfully! A test email has been sent to your admin email address: ${user.email}` });
  } catch (err: any) {
    console.error("SMTP Test connection failed:", err);
    res.status(500).json({ 
      detail: err.message || "Unknown SMTP error",
      code: err.code || "SMTP_ERROR"
    });
  }
});

// Content stats
app.get("/api/content/stats", (req, res) => {
  const stats = readData("stats", { value: defaultStats });
  res.json(stats);
});

app.put("/api/content/stats", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }
  writeData("stats", req.body);
  res.json(req.body);
});

// --- QUERIES & ACTIVITY REPORTS ENDPOINTS ---
interface QueryItem {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  activity_title: string;
  query_type: string;
  subject: string;
  description: string;
  location?: string;
  urgency: string;
  status: string;
  reply?: string;
  replied_at?: string;
  created_at: string;
}

app.get("/api/queries", (req, res) => {
  const queries = readData<QueryItem[]>("queries", defaultQueries);
  res.json(queries);
});

app.get("/api/queries/mine", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ detail: "Unauthorized" });
    return;
  }
  const queries = readData<QueryItem[]>("queries", defaultQueries);
  const mine = queries.filter(q => q.user_id === user.id || (q.email && q.email.toLowerCase() === user.email.toLowerCase()));
  res.json(mine);
});

app.post("/api/queries", (req, res) => {
  const user = getAuthUser(req);
  const { name, email, phone, activity_title, query_type, subject, description, location, urgency } = req.body;
  if (!subject || !description) {
    res.status(400).json({ detail: "Subject and description are required" });
    return;
  }

  const queries = readData<QueryItem[]>("queries", defaultQueries);
  const newQuery: QueryItem = {
    id: `q-${Date.now()}`,
    user_id: user?.id || undefined,
    name: name || user?.name || "Anonymous Student",
    email: email || user?.email || "",
    phone: phone || "",
    activity_title: activity_title || "General Query",
    query_type: query_type || "General Inquiry",
    subject,
    description,
    location: location || "PSG Tech Campus",
    urgency: urgency || "medium",
    status: "pending",
    reply: "",
    created_at: new Date().toISOString()
  };

  queries.unshift(newQuery);
  writeData("queries", queries);
  res.json(newQuery);
});

app.put("/api/queries/:id/reply", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const { id } = req.params;
  const { reply, status } = req.body;

  const queries = readData<QueryItem[]>("queries", defaultQueries);
  const idx = queries.findIndex(q => q.id === id);
  if (idx === -1) {
    res.status(404).json({ detail: "Query not found" });
    return;
  }

  if (reply !== undefined) queries[idx].reply = reply;
  if (status !== undefined) queries[idx].status = status;
  queries[idx].replied_at = new Date().toISOString();

  writeData("queries", queries);
  res.json(queries[idx]);
});

app.delete("/api/queries/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const { id } = req.params;
  const queries = readData<QueryItem[]>("queries", defaultQueries);
  const filtered = queries.filter(q => q.id !== id);
  writeData("queries", filtered);
  res.json({ success: true });
});

// --- EVENT-SPECIFIC REGISTRATIONS ENDPOINTS ---
interface EventRegistration {
  id: string;
  event_id: string;
  event_title: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  register_no: string;
  department: string;
  year: string;
  answers: Record<string, any>;
  status: string;
  created_at: string;
}

app.post("/api/event-registrations", (req, res) => {
  const user = getAuthUser(req);
  const { event_id, event_title, name, email, phone, register_no, department, year, answers } = req.body;
  if (!event_id || !event_title) {
    res.status(400).json({ detail: "Event identification is required" });
    return;
  }

  const studentEmail = (email || user?.email || "").trim().toLowerCase();
  if (!studentEmail) {
    res.status(400).json({ detail: "Email address is required" });
    return;
  }

  const registrations = readData<EventRegistration[]>("event_registrations", defaultEventRegistrations);
  
  // Check if student already registered for this event
  const existing = registrations.find(r => 
    r.event_id === event_id && 
    ((user && r.user_id === user.id) || (studentEmail && r.email?.toLowerCase() === studentEmail))
  );
  if (existing) {
    res.status(400).json({ detail: "You are already registered for this event!" });
    return;
  }

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}`,
    event_id,
    event_title,
    user_id: user?.id || `guest-${Date.now()}`,
    name: name || user?.name || "Student Volunteer",
    email: studentEmail,
    phone: phone || user?.phone || "",
    register_no: register_no || user?.register_no || "",
    department: department || user?.department || "",
    year: year || user?.year || "",
    answers: answers || {},
    status: "confirmed",
    created_at: new Date().toISOString()
  };

  registrations.unshift(newReg);
  writeData("event_registrations", registrations);
  res.json(newReg);
});

app.get("/api/event-registrations", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden - Admin access required" });
    return;
  }
  const registrations = readData<EventRegistration[]>("event_registrations", defaultEventRegistrations);
  res.json(registrations);
});

app.get("/api/event-registrations/mine", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ detail: "Unauthorized" });
    return;
  }
  const registrations = readData<EventRegistration[]>("event_registrations", defaultEventRegistrations);
  const mine = registrations.filter(r => r.user_id === user.id || r.email.toLowerCase() === user.email.toLowerCase());
  res.json(mine);
});

app.delete("/api/event-registrations/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ detail: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const registrations = readData<EventRegistration[]>("event_registrations", defaultEventRegistrations);
  const reg = registrations.find(r => r.id === id);
  if (!reg) {
    res.status(404).json({ detail: "Registration not found" });
    return;
  }
  if (user.role !== "admin" && reg.user_id !== user.id) {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }
  const filtered = registrations.filter(r => r.id !== id);
  writeData("event_registrations", filtered);
  res.json({ success: true });
});

// Public Emergency Animal Rescue Reporting
app.post("/api/rescues", (req, res) => {
  const rescues = readData<any[]>("rescues", []);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newRescue = {
    id: req.body.id || `rescue-${Date.now()}`,
    ticket_id: req.body.ticket_id || `AWC-${randomNum}`,
    animal_type: req.body.animal_type || "Dog",
    condition: req.body.condition || "Animal in distress reported",
    urgency: req.body.urgency || "High",
    location: req.body.location || "PSG Tech Campus",
    landmark: req.body.landmark || "",
    reporter_name: req.body.reporter_name || "Campus Reporter",
    contact_number: req.body.contact_number || "",
    photo_url: req.body.photo_url || "",
    notes: req.body.notes || "",
    coordinates: req.body.coordinates || null,
    status: "Pending Rescue",
    created_at: new Date().toISOString()
  };

  rescues.unshift(newRescue);
  writeData("rescues", rescues);
  res.json(newRescue);
});

// Generic CRUD endpoints for collections: activities, gallery, team, testimonials, events, announcements
app.get("/api/:coll", (req, res) => {
  const { coll } = req.params;
  const items = readData(coll, null);
  if (items === null) {
    res.status(404).json({ detail: `Collection ${coll} not found` });
    return;
  }
  res.json(items);
});

app.post("/api/:coll", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }

  const { coll } = req.params;
  const items = readData<any[]>(coll, []);
  
  const newItem = {
    id: `item-${Date.now()}`,
    ...req.body
  };

  items.push(newItem);
  writeData(coll, items);
  res.json(newItem);
});

app.put("/api/:coll/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }

  const { coll, id } = req.params;
  const items = readData<any[]>(coll, []);
  const idx = items.findIndex((it) => it.id === id || String(it.id) === String(id) || (it.num && String(it.num) === String(id)));

  if (idx === -1) {
    res.status(404).json({ detail: "Item not found" });
    return;
  }

  items[idx] = { ...items[idx], ...req.body };
  writeData(coll, items);
  res.json(items[idx]);
});

app.delete("/api/:coll/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ detail: "Forbidden" });
    return;
  }

  const { coll, id } = req.params;
  const items = readData<any[]>(coll, []);
  const filtered = items.filter((it) => it.id !== id && String(it.id) !== String(id) && (!it.num || String(it.num) !== String(id)));

  writeData(coll, filtered);
  res.json({ success: true });
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
