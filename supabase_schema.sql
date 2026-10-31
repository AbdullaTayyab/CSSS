-- ==============================================================================
-- Campus Pulse - Supabase PostgreSQL Database Schema
-- ==============================================================================

-- 1. Create enum types for Category and Priority
CREATE TYPE notice_category AS ENUM (
  'Academic',
  'Examination',
  'Events',
  'Placement',
  'Sports',
  'Cultural',
  'General'
);

CREATE TYPE notice_priority AS ENUM (
  'Urgent',
  'Upcoming',
  'Normal',
  'Expired'
);

CREATE TYPE notice_source AS ENUM (
  'WhatsApp',
  'Email',
  'Notice Board',
  'Manual'
);

-- 2. Create Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  original_text TEXT,
  category notice_category NOT NULL DEFAULT 'General',
  priority notice_priority NOT NULL DEFAULT 'Normal',
  event_date VARCHAR(100) DEFAULT 'Not specified',
  event_time VARCHAR(100) DEFAULT 'Not specified',
  venue VARCHAR(255) DEFAULT 'Not specified',
  source notice_source NOT NULL DEFAULT 'Manual',
  is_deadline BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common filters
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- 3. Create Student Profile Table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name VARCHAR(150) NOT NULL DEFAULT 'Student',
  college_name VARCHAR(255) NOT NULL DEFAULT 'Apex Institute of Technology',
  department VARCHAR(100) NOT NULL DEFAULT 'Computer Science & Engineering',
  academic_year VARCHAR(50) NOT NULL DEFAULT '3rd Year (Semester 5)',
  email VARCHAR(255) NOT NULL DEFAULT 'student@campus.edu',
  roll_number VARCHAR(50) DEFAULT 'CS2024-042',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for local development & demonstration
CREATE POLICY "Public read/write access for notices" 
ON notices FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for student profile" 
ON student_profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Realistic Sample Data
INSERT INTO notices (title, description, original_text, category, priority, event_date, event_time, venue, source, is_deadline) VALUES
(
  'Internal Examination Schedule',
  'Internal Examination for all B.Tech students will commence on 5 November 2026. Hall tickets available on the college portal.',
  'All B.Tech students are informed that the internal examination will start on 5 November 2026 at 10 AM in Block A. Attendance is strictly compulsory.',
  'Examination',
  'Urgent',
  '2026-11-05',
  '10:00 AM',
  'Block A, Examination Hall',
  'WhatsApp',
  false
),
(
  'HackPulse 2026 - Annual Technical Fest',
  'Annual National Level 36-hour Hackathon and Tech Expo. Cash prizes worth $5,000. Team registrations now open.',
  'Greetings Innovators! Register your teams for HackPulse 2026 happening on 12 November 2026 at Central Auditorium. Domain: Web3, AI, Robotics.',
  'Events',
  'Upcoming',
  '2026-11-12',
  '09:00 AM',
  'Central Auditorium & Innovation Lab',
  'Email',
  false
),
(
  'Google & Microsoft Campus Placement Drive',
  'Final call for B.Tech CSE/IT students to submit resumes and register for Google & Microsoft initial screening rounds.',
  'URGENT: Placement Registration portal closes on 3 November 2026 at 11:59 PM. Incomplete profiles will not be shortlisted.',
  'Placement',
  'Urgent',
  '2026-11-03',
  '11:59 PM',
  'Placement Cell Portal (Online)',
  'Email',
  true
),
(
  'Inter-College Sports Championship',
  'Selections for Football, Cricket and Badminton university tournament squads. Bring sports kit and valid college ID.',
  'Sports trials will be held on 18 November 2026 at 07:30 AM at the College Sports Complex. Open for all semesters.',
  'Sports',
  'Upcoming',
  '2026-11-18',
  '07:30 AM',
  'College Sports Complex & Main Ground',
  'Notice Board',
  false
),
(
  'Diwali & Mid-Semester Campus Holiday',
  'College will remain closed from 8 November to 10 November 2026 on account of Diwali holidays. Hostel mess timings updated.',
  'Notice: The college administrative offices and academic departments will observe holiday on 8-10 Nov 2026.',
  'General',
  'Normal',
  '2026-11-08',
  'All Day',
  'Campus Wide',
  'Notice Board',
  false
),
(
  'DBMS Mini-Project Final Submission',
  'Submit project documentation, source code GitHub repository link and working demo video to the course instructor.',
  'CS301 DBMS project submission deadline is 4 November 2026 at 5:00 PM in CS Lab 3 and LMS upload.',
  'Academic',
  'Urgent',
  '2026-11-04',
  '05:00 PM',
  'CS Lab 3 & LMS Portal',
  'WhatsApp',
  true
);
