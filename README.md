# GSVConnect - Where Memories Meet Futures

A modern, interactive university yearbook and alumni portal connecting students and alumni through memories, networking, mentorship, and opportunities.

## ✨ Features

### For All Users
- **Beautiful Home Page** with 3D animations, hero carousel, and animated statistics
- **Alumni Directory** - Search and filter alumni by batch, department, company, location
- **Yearbook Memories** - Interactive timeline of college memories organized by year
- **Events & Reunions** - Browse upcoming and past events with RSVP functionality
- **Job Board** - Discover career opportunities shared by alumni
- **Mentorship Program** - Connect with alumni mentors for guidance
- **Alumni Stories** - Read inspiring success stories from the community

### For Authenticated Users
- **Personalized Dashboard** with gamified onboarding checklist
- **Profile Management** - Complete profiles with skills, experience, and social links
- **Dark Mode** - Beautiful dark theme with smooth transitions

### For Administrators
- **Admin Dashboard** - Comprehensive control panel
- **User Approval System** - Review and approve/reject new registrations
- **Activity Logs** - Track all admin actions with audit trail
- **Content Moderation** - Manage events, jobs, stories, and memories
- **Platform Statistics** - Monitor user growth and engagement

## 🚀 Tech Stack

**Frontend:**
- React.js (JavaScript)
- Tailwind CSS for styling
- Lucide React for icons
- Custom animations with CSS keyframes

**Backend & Database:**
- Supabase (PostgreSQL)
- Auto-generated REST APIs
- Real-time subscriptions
- Row Level Security (RLS)

**Authentication:**
- Supabase Auth
- JWT-based authentication
- Email/password login
- Approval workflow for new registrations

## 🛠️ Setup Instructions

1. **Environment Variables** - Already configured in `.env`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 👤 Creating an Admin Account

To create your first admin account:

1. Register a new account through the normal registration flow
2. Access your Supabase dashboard
3. Navigate to the `profiles` table
4. Find your profile record
5. Update: `role` = 'admin' and `approval_status` = 'approved'
6. Save and login

## 📱 Key Pages

- **Home** - Hero section with features, stats, testimonials
- **Directory** - Searchable alumni directory
- **Memories** - Interactive yearbook timeline
- **Events** - Upcoming and past events
- **Jobs** - Job opportunities board
- **Mentorship** - Find and book mentors
- **Stories** - Alumni success stories
- **Dashboard** - Personal dashboard
- **Admin** - Admin control panel (admins only)

 

---

