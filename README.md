# 🎓 Campus Pulse

> **AI-Powered College Information Management Platform**  
> Aggregating scattered WhatsApp announcements, departmental emails, exam schedules, and deadlines into a single intelligent SaaS dashboard.

---

## 🌟 Overview

Students typically receive essential college information across fragmented WhatsApp groups, Telegram channels, notice boards, and departmental emails. **Campus Pulse** solves this problem by using **Google Gemini AI** to extract structured, actionable data from unstructured messages and organizing them into an interactive, multi-view dashboard.

---

## 🚀 Key Features

### 1. 🤖 AI Smart Notice Input (Key Innovation)
- **Paste Any Announcement:** Paste raw WhatsApp messages, emails, or circulars directly into the dashboard.
- **Structured Extraction:** Gemini AI extracts **Title**, **Description**, **Category**, **Priority**, **Date**, **Time**, and **Venue**.
- **No Hallucinations Rule:** Strictly returns `"Not specified"` for missing venues, dates, or times, and alerts the user to verify ambiguous dates.
- **Instant Editable Verification Form:** Review, adjust priority or categories, and save directly to the student dashboard.
- **One-Click Test Presets:** Built-in test buttons with the prompt's exact examination example and other campus announcements for immediate testing.

### 2. 📊 Executive Student Dashboard
- **Welcome & Profile Header:** Dynamic greeting with student department, semester, and college.
- **Live Metric Cards:**
  - Total Active Notices
  - Upcoming Events (Fests, Sports, Cultural)
  - Urgent Notices (Requires immediate attention)
  - Pending Deadlines
- **24-Hour Urgent Alert Banner:** Highlights assignments and exams due within the next 24 hours.
- **Recent Updates:** Responsive cards with priority color badges, countdown badges, and quick status controls.

### 3. 🔍 Searchable Notice Board (All Notices)
- Search across title, description, and venue in real time.
- Filter by Category (*Academic, Examination, Events, Placement, Sports, Cultural, General*).
- Filter by Priority (*Urgent (Red), Upcoming (Blue), Normal, Expired (Grey)*).
- Sort by Newest, Oldest, or Event Date.
- **Dual View Mode:** Toggle between responsive Grid Cards and high-density Table View.
- Export filtered notices as JSON backup.

### 4. 📅 Functional Academic & Event Calendar
- Powered by **FullCalendar** with Month and Week views.
- Color-coded by category (Examination in Rose, Events in Purple, Placement in Amber, Sports in Emerald, etc.).
- Click any event on the calendar to open a detailed modal with venue, timing, and direct edit actions.
- Automatically synchronizes with all saved notices.

### 5. 🧠 AI Weekly Summary & Briefing
- One-click **"Generate My Weekly Summary"** button.
- Analyzes all verified notices and generates a clean structured brief:
  - Important Announcements
  - Upcoming Examinations
  - Events Happening This Week
  - Approaching Deadlines
  - Urgent Notices
  - **Student Action Checklist**
- Copy or export the briefing with a single click.

### 6. 🔔 Priority & Reminder System
- **Urgent notices:** Red badge and animated alert indicators.
- **Upcoming notices:** Blue badge.
- **Expired notices:** Grey badge.
- **Deadlines within 24h:** Live countdown badges (`X hours left`).
- **Browser Push Notifications API:** Local desktop notifications for urgent notices and 24-hour deadline reminders.

### 7. 👤 Student Profile & Settings
- Editable student profile: Name, College, Department, Year, Email, and Roll Number.
- Appearance: Light Mode, Dark Mode, and System Theme.
- Custom Gemini API Key input with a live connection tester.
- Supabase PostgreSQL integration status.
- One-click sample data reset and JSON export.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 with Vite |
| **Styling** | Tailwind CSS (Dark Mode, Custom Design System) |
| **Icons** | Lucide React |
| **Calendar Engine** | FullCalendar (`@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`) |
| **AI Extraction & Briefings** | Google Gemini 1.5 Flash API + Intelligent Offline Fallback Parser |
| **Persistence** | LocalStorage + Supabase PostgreSQL Client (`@supabase/supabase-js`) |
| **Interactive UX** | Canvas Confetti, Date-fns, Browser Notification API |

---

## 🏃 Local Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Installation
In the project root folder:
```bash
npm install
```

### 2. Environment Variables Configuration (Optional)
Create or edit `.env` in the root folder:
```env
# 1. Google Gemini API Key (Server-side)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# 2. Supabase Integration (Optional - Falls back seamlessly to LocalStorage)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
> **Note on Demo Mode:** If `GEMINI_API_KEY` is not provided, Campus Pulse automatically runs in **Intelligent Demo Mode**. It uses deterministic natural language pattern extractors with zero errors, clearly labelled with an "AI Demo Mode" badge.

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🗄️ Database Setup (Supabase)

If you wish to use Supabase for remote multi-device persistence:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open and run the included `supabase_schema.sql` file.
4. Copy your **Project URL** and **Anon Key** from Project Settings > API into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📋 Sample Demonstration Data

Campus Pulse comes pre-seeded with 6 realistic college notices:
1. **Internal Examination Schedule** (*Examination, Urgent, Nov 5 2026, Block A*)
2. **HackPulse 2026 National Hackathon** (*Events, Upcoming, Nov 12 2026, Central Auditorium*)
3. **Google & Microsoft Campus Placement Drive** (*Placement, Urgent, Nov 3 2026, T&P Portal*)
4. **Inter-College Sports Championship Trials** (*Sports, Upcoming, Nov 18 2026, Sports Complex*)
5. **Diwali & Mid-Semester Campus Holiday** (*General, Normal, Nov 8-10 2026, Campus Wide*)
6. **DBMS Mini-Project Final Submission** (*Academic, Urgent, Nov 4 2026, CS Lab 3*)

You can reset to this demonstration data at any time from the **Settings** page.
