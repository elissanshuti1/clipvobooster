# 🚀 ClipVoBooster Admin Panel - Complete Documentation

## 📋 Overview

The Admin Panel provides complete control over your ClipVoBooster platform with:
- **User Management** - View, suspend, delete users
- **Email Broadcasting** - Send emails to all or selected users
- **Analytics Dashboard** - Track visits, page views, user activity
- **AI Insights** - Get AI-powered recommendations
- **Settings** - Manage admin profile and password

---

## 🔐 Access & Authentication

### Admin Login URL
```
https://clipvo.site/secure/admin
```

### Default Admin Credentials
```
Username: nshuti
Password: Nyamata123
Name: Nshuti Elissa
```

**⚠️ IMPORTANT**: Change the password after first login!

---

## 📁 File Structure

```
next/
├── app/
│   ├── secure/admin/              # Admin panel pages
│   │   ├── page.tsx               # Login page
│   │   ├── layout.tsx             # Admin layout with sidebar
│   │   ├── dashboard/page.tsx     # Main dashboard
│   │   ├── users/page.tsx         # User management
│   │   ├── emails/page.tsx        # Email broadcasting
│   │   ├── analytics/page.tsx     # Analytics & stats
│   │   ├── ai-insights/page.tsx   # AI recommendations
│   │   └── settings/page.tsx      # Admin settings
│   │
│   └── api/admin/                 # Admin API routes
│       ├── auth/                  # Authentication endpoints
│       ├── users/                 # User management endpoints
│       ├── stats/                 # Statistics endpoint
│       ├── email-stats/           # Email statistics
│       ├── send-broadcast/        # Send broadcast emails
│       ├── ai-generate-email/     # AI email generation
│       ├── ai-insights/           # AI insights generation
│       ├── insights-data/         # Raw insights data
│       ├── analytics/             # Analytics endpoints
│       └── settings/              # Admin settings endpoints
│
├── scripts/
│   └── init-admin.js              # Initialize admin account
│
└── middleware.ts                   # Route protection
```

---

## 🛠️ Setup Instructions

### Step 1: Initialize Admin Account

Run this command in your terminal:

```bash
cd "/run/media/nshutielissa/New Volume/clipvobooster/next"
node scripts/init-admin.js
```

This creates the admin account in MongoDB with:
- Username: `nshuti`
- Password: `Nyamata123`
- Name: `Nshuti Elissa`

### Step 2: Restart Development Server

```bash
npm run dev
```

### Step 3: Access Admin Panel

1. Go to: `http://localhost:3000/secure/admin`
2. Login with credentials above
3. You'll be redirected to the dashboard

---

## 📊 Features Breakdown

### 1. Dashboard (`/secure/admin/dashboard`)

**Shows:**
- Total Users
- Total Visits
- Emails Sent
- Link Clicks
- Active Users (last 7 days)
- New Users Today
- Recent Sign Ups
- Most Visited Pages

### 2. User Management (`/secure/admin/users`)

**Actions:**
- View all users (active/suspended filter)
- Search users by name or email
- Suspend users (blocks login)
- Activate suspended users
- Delete users (permanent - removes all data)

**User Status:**
- **Active**: Can login and use the app
- **Suspended**: Cannot login, but data is preserved

### 3. Email Campaigns (`/secure/admin/emails`)

**Send Emails To:**
- All users (checkbox)
- Selected users (multi-select)

**Email Types:**
- 📝 Custom Email
- 📢 Advertising/Promotion
- 📖 How It Works
- ⭐ Success Stories
- 🤖 AI Generated

**Daily Limit:** 100 emails/day (configurable)

**AI Email Generation:**
1. Select "AI Generated" type
2. Enter prompt (e.g., "Write a welcome email for new users")
3. Click "Generate with AI"
4. Review and send

### 4. Analytics (`/secure/admin/analytics`)

**Metrics:**
- User overview (total, active, new, suspended)
- Email performance (sent, clicks, click rate)
- Website traffic (visits, unique visitors)
- Most visited pages with percentages

### 5. AI Insights (`/secure/admin/ai-insights`)

**Generates:**
- User engagement analysis
- Most used features
- Retention insights
- AI recommendations (3-5 actionable tips)
- Growth opportunities
- User behavior summary

**Click "Generate New Insights"** to get fresh AI analysis.

### 6. Settings (`/secure/admin/settings`)

**Update:**
- Display Name
- Password

**Cannot Change:**
- Username (permanent)

---

## 🔧 API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/auth/login` | POST | Admin login |
| `/api/admin/auth/logout` | POST | Admin logout |
| `/api/admin/auth/me` | GET | Check auth status |

### Users
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | Get all users |
| `/api/admin/users/recent` | GET | Get recent signups |
| `/api/admin/users/[id]/suspend` | POST | Suspend user |
| `/api/admin/users/[id]/activate` | POST | Activate user |
| `/api/admin/users/[id]` | DELETE | Delete user |

### Email
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/email-stats` | GET | Get daily email stats |
| `/api/admin/send-broadcast` | POST | Send broadcast email |
| `/api/admin/ai-generate-email` | POST | Generate email with AI |

### Analytics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Get platform stats |
| `/api/admin/analytics/visits` | GET | Get visit analytics |
| `/api/admin/analytics/pages` | GET | Get page view stats |
| `/api/admin/insights-data` | GET | Get raw insights data |
| `/api/admin/ai-insights` | POST | Generate AI insights |

### Settings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/settings/name` | PUT | Update admin name |
| `/api/admin/settings/password` | PUT | Update admin password |

---

## 📊 Database Collections

### New Collections Created:

```javascript
// Admins
{
  _id: ObjectId,
  username: "nshuti",
  name: "Nshuti Elissa",
  password: "$2a$10$...", // Hashed
  role: "superadmin",
  isActive: true,
  createdAt: Date,
  lastLogin: Date
}

// Visits
{
  _id: ObjectId,
  path: "/dashboard",
  userId: null, // or user ID if logged in
  timestamp: Date,
  userAgent: "...",
  ip: "192.168.1.1"
}

// Page Views
{
  _id: ObjectId,
  path: "/dashboard",
  userId: null,
  timestamp: Date
}

// Admin Email Stats
{
  _id: ObjectId,
  date: Date,
  count: 45 // Emails sent today
}

// Admin Email Log
{
  _id: ObjectId,
  adminId: ObjectId,
  subject: "Welcome to ClipVoBooster",
  type: "custom",
  recipientCount: 100,
  sentCount: 98,
  sendToAll: true,
  timestamp: Date
}
```

---

## 🔒 Security Features

### Middleware Protection
- All `/secure/admin/*` routes protected
- Redirects to login if not authenticated
- Admin token stored in HTTP-only cookie (7 days)

### User Suspension
- Suspended users cannot login
- Existing sessions remain valid until expiry
- Admin receives email notification on suspension

### Email Limits
- Default: 100 emails/day
- Prevents abuse and spam complaints
- Tracks sent count in database

---

## 🎨 Design System

**Colors:**
- Background: `#08090d`
- Cards: `#0e1018`
- Borders: `rgba(255,255,255,0.07)`
- Primary: `#6366f1` (gradient to `#8b5cf6`)
- Text: `#dde1e9`
- Muted: `#5a6373`

**Matches your existing ClipVoBooster design!**

---

## 🧪 Testing Checklist

### Admin Login
- [ ] Can access login page
- [ ] Login with correct credentials works
- [ ] Login with wrong credentials shows error
- [ ] Redirects to dashboard after login

### Dashboard
- [ ] Shows correct user count
- [ ] Shows visit count
- [ ] Shows email stats
- [ ] Recent users list populated
- [ ] Most visited pages shown

### User Management
- [ ] Can view all users
- [ ] Filter by active/suspended works
- [ ] Search functionality works
- [ ] Suspend user works
- [ ] Activate user works
- [ ] Delete user works
- [ ] Confirmation dialogs appear

### Email Campaigns
- [ ] Can select individual users
- [ ] Can select "send to all"
- [ ] AI email generation works
- [ ] Email sending works
- [ ] Daily limit enforced
- [ ] Sent count updates

### Analytics
- [ ] All metrics display correctly
- [ ] Page views table populated
- [ ] Visit stats accurate

### AI Insights
- [ ] Can generate insights
- [ ] Recommendations shown
- [ ] User behavior summary shown

### Settings
- [ ] Can update name
- [ ] Can update password
- [ ] Old password verification works
- [ ] Username cannot be changed

---

## 🚨 Troubleshooting

### "Admin not found"
Run the init script:
```bash
node scripts/init-admin.js
```

### "Unauthorized" on admin pages
- Clear browser cookies
- Re-login
- Check middleware is working

### Email sending fails
- Check Brevo SMTP credentials in `.env.local`
- Verify daily limit not exceeded
- Check server logs for errors

### AI generation fails
- Check OpenRouter API key in `.env.local`
- Verify API has credits remaining

### Visit tracking not working
- Check `/api/track-visit` endpoint is accessible
- Verify MongoDB connection
- Check browser console for errors

---

## 📈 Future Enhancements

Potential additions:
- [ ] Export user data to CSV
- [ ] Advanced email templates
- [ ] Scheduled email campaigns
- [ ] A/B testing for emails
- [ ] User segmentation
- [ ] Custom date range analytics
- [ ] Real-time visitor count
- [ ] Email performance charts
- [ ] Multi-admin support with roles
- [ ] Activity audit log

---

## 🎯 Quick Commands

### Initialize Admin
```bash
node scripts/init-admin.js
```

### Check Admin in DB
```javascript
// MongoDB
db.admins.findOne({ username: "nshuti" })
```

### Reset Admin Password
```javascript
// MongoDB (replace hash with new bcrypt hash)
db.admins.updateOne(
  { username: "nshuti" },
  { $set: { password: "$2a$10$..." } }
)
```

### View Email Stats
```javascript
// MongoDB
db.admin_email_stats.find().sort({ date: -1 }).limit(7)
```

---

## ✅ Summary

**What You Have:**
- ✅ Full admin panel with 6 pages
- ✅ User management (view, suspend, delete)
- ✅ Email broadcasting with AI generation
- ✅ Analytics dashboard with visit tracking
- ✅ AI-powered insights
- ✅ Admin settings (name, password)
- ✅ Daily email limits
- ✅ Secure authentication
- ✅ Beautiful design matching your app

**Next Steps:**
1. Run `node scripts/init-admin.js`
2. Restart dev server
3. Login at `/secure/admin`
4. Change default password!

---

**Admin Panel Ready! 🎉**

Access: `http://localhost:3000/secure/admin`
