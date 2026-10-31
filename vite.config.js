import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to provide server-side Gemini API endpoints without exposing keys to frontend
function geminiServerPlugin() {
  return {
    name: 'gemini-server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini')) {
          return next();
        }

        // Helper to parse JSON body
        const parseBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (e) {
              resolve({});
            }
          });
        });

        const env = loadEnv('', process.cwd(), '');
        const serverApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

        res.setHeader('Content-Type', 'application/json');

        // Check Status
        if (req.url === '/api/gemini/status' && req.method === 'GET') {
          res.end(JSON.stringify({
            hasKey: !!serverApiKey,
            mode: serverApiKey ? 'live' : 'demo'
          }));
          return;
        }

        // Extract Notice Information
        if (req.url === '/api/gemini/extract' && req.method === 'POST') {
          const body = await parseBody();
          const rawText = body.text || '';
          const apiKey = body.apiKey || serverApiKey;

          if (!rawText.trim()) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Text content is required' }));
            return;
          }

          if (apiKey) {
            try {
              // Real Gemini API call
              const prompt = `You are the AI information extraction engine for Campus Pulse, a college information management system.
Extract structured information from the following unstructured college announcement, email, or WhatsApp message.

CRITICAL RULES:
1. Never invent missing dates, times, or venues. If information is not mentioned or cannot be determined, you MUST set it to "Not specified".
2. Category MUST strictly be one of: "Academic", "Examination", "Events", "Placement", "Sports", "Cultural", "General".
3. Priority MUST strictly be one of: "Urgent", "Upcoming", "Normal", "Expired".
4. If a date is ambiguous (e.g. "next Friday" without an explicit date/year), extract what is written and set "is_ambiguous_date": true. Otherwise false.
5. Provide a concise summary description in 1-3 sentences.

Input text:
"""
${rawText}
"""

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "title": "Clear concise notice title",
  "description": "Short clean description summarizing the key message",
  "category": "Academic" | "Examination" | "Events" | "Placement" | "Sports" | "Cultural" | "General",
  "priority": "Urgent" | "Upcoming" | "Normal" | "Expired",
  "event_date": "YYYY-MM-DD or readable date string (or 'Not specified')",
  "event_time": "Time string e.g. '10:00 AM' (or 'Not specified')",
  "venue": "Location e.g. 'Block A, Room 302' (or 'Not specified')",
  "is_ambiguous_date": boolean,
  "confidence_score": 0.95
}`;

              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                  }
                })
              });

              if (response.ok) {
                const data = await response.json();
                const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (candidate) {
                  res.end(JSON.stringify({
                    success: true,
                    data: JSON.parse(candidate),
                    source: 'gemini-live'
                  }));
                  return;
                }
              }
            } catch (err) {
              console.error('Gemini extraction error:', err.message);
            }
          }

          // Accurate Demo Parser
          let category = 'General';
          let priority = 'Normal';

          if (/exam|test|midterm|internal|assessment|viva|quiz/i.test(rawText)) {
            category = 'Examination';
            priority = 'Urgent';
          } else if (/placement|interview|drive|internship|hiring|ctc|package|resume|shortlist/i.test(rawText)) {
            category = 'Placement';
            priority = 'Urgent';
          } else if (/fest|hackathon|workshop|seminar|conference|webinar|symposium/i.test(rawText)) {
            category = 'Events';
            priority = 'Upcoming';
          } else if (/sports|cricket|football|basketball|badminton|athletics|tournament/i.test(rawText)) {
            category = 'Sports';
            priority = 'Upcoming';
          } else if (/cultural|dance|music|drama|singing|annual day|celebration/i.test(rawText)) {
            category = 'Cultural';
            priority = 'Upcoming';
          } else if (/assignment|lecture|syllabus|course|submission|lab report|attendance/i.test(rawText)) {
            category = 'Academic';
            priority = /submission|due|deadline/i.test(rawText) ? 'Urgent' : 'Normal';
          }

          if (/urgent|immediately|mandatory|strict|last date|deadline today|attention/i.test(rawText)) {
            priority = 'Urgent';
          }

          // Title
          let title = '';
          const titlePatterns = [
            { regex: /internal\s+examination/i, title: 'Internal Examination' },
            { regex: /campus\s+placement(?:\s+drive)?/i, title: 'Campus Placement Drive' },
            { regex: /hackpulse|hackathon/i, title: 'HackPulse 2026 Hackathon' },
            { regex: /technical\s+fest/i, title: 'Technical Fest 2026' },
            { regex: /sports\s+(?:tournament|meet|trials|championship)/i, title: 'Inter-College Sports Championship' },
            { regex: /holiday(?:\s+notice)?/i, title: 'Campus Holiday Announcement' },
            { regex: /project\s+submission|mini-project/i, title: 'Mini-Project Final Submission' }
          ];

          for (const item of titlePatterns) {
            if (item.regex.test(rawText)) {
              title = item.title;
              break;
            }
          }

          if (!title) {
            const lines = rawText.split('\n').filter(l => l.trim().length > 0);
            const firstLine = (lines[0] || '').replace(/^(urgent|notice|announcement|attention):?\s*/i, '').trim();
            if (firstLine.length >= 6 && firstLine.length <= 60 && !firstLine.toLowerCase().startsWith('all b.tech') && !firstLine.toLowerCase().startsWith('all students')) {
              title = firstLine;
            } else if (category === 'Examination') {
              title = 'Internal Examination';
            } else if (category === 'Placement') {
              title = 'Campus Placement Drive';
            } else if (category === 'Events') {
              title = 'College Event Announcement';
            } else {
              title = 'Campus Announcement';
            }
          }

          // Date extraction regex
          let date = 'Not specified';
          const dateMatch = rawText.match(/(\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/i);
          if (dateMatch) {
            date = dateMatch[1];
          }

          // Time extraction regex
          let time = 'Not specified';
          const timeMatch = rawText.match(/\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)\b/);
          if (timeMatch) {
            const hour = timeMatch[1];
            const minute = timeMatch[2] || '00';
            const ampm = timeMatch[3].toUpperCase();
            time = `${hour}:${minute} ${ampm}`;
          } else {
            const timeMatch2 = rawText.match(/\b\d{1,2}:\d{2}\s*(?:hrs|hours)?\b/);
            if (timeMatch2) time = timeMatch2[0];
          }

          // Venue extraction regex
          let venue = 'Not specified';
          const specificVenue = rawText.match(/\b(Block\s+[A-Za-z0-9]+|Room\s+[A-Za-z0-9]+|Lab\s+[A-Za-z0-9]+|Central Auditorium|Auditorium|Exam Center|Seminar Hall|Sports Complex|Main Ground|LMS Portal|Placement Cell(?: Portal)?)\b/i);
          if (specificVenue) {
            venue = specificVenue[1];
          } else {
            const genMatch = rawText.match(/(?:\bin\s+|\bat\s+|\bvenue:?\s+)([A-Z][A-Za-z0-9\s\-]{2,25})(?=[,\.]|\s+(?:on|at|starting|from|till)|\n|$)/);
            if (genMatch) {
              const cand = genMatch[1].trim();
              if (!/^(the|a|all|students|morning|evening|am|pm|\d+|due|strict|order|view)$/i.test(cand)) {
                venue = cand;
              }
            }
          }

          res.end(JSON.stringify({
            success: true,
            data: {
              title,
              description: rawText.length > 180 ? rawText.slice(0, 177) + '...' : rawText,
              category,
              priority,
              event_date: date,
              event_time: time,
              venue: venue,
              is_ambiguous_date: date.toLowerCase().includes('friday') || date === 'Not specified',
              confidence_score: 0.92
            },
            source: 'demo-mode'
          }));
          return;
        }

        // Weekly Summary Generation
        if (req.url === '/api/gemini/summary' && req.method === 'POST') {
          const body = await parseBody();
          const notices = body.notices || [];
          const apiKey = body.apiKey || serverApiKey;

          if (apiKey) {
            try {
              const noticeListStr = JSON.stringify(notices.map(n => ({
                title: n.title,
                category: n.category,
                priority: n.priority,
                date: n.event_date,
                time: n.event_time,
                venue: n.venue,
                description: n.description
              })));

              const prompt = `You are Campus Pulse's AI Academic Advisor. Analyze the following verified college notices and synthesize a clear, crisp, and actionable Weekly Briefing for the student.

Notices:
${noticeListStr}

Rules:
1. Base your summary ONLY on the provided notices. Do NOT hallucinate dates, deadlines, or exams.
2. Structure your briefing into structured categories:
   - "headline": One punchy summarizing sentence of this week's focus.
   - "important_announcements": Array of strings (top 2-3 essential notices).
   - "upcoming_examinations": Array of strings (exams with dates & venues, or empty array if none).
   - "events_this_week": Array of strings (fests, workshops, sports).
   - "approaching_deadlines": Array of strings (submissions, registrations with specific dates).
   - "urgent_notices": Array of strings (high priority items requiring immediate attention).
   - "recommended_actions": Array of strings (student action checklist for the week).

Return ONLY valid JSON matching this schema.`;

              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                  }
                })
              });

              if (response.ok) {
                const data = await response.json();
                const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (candidate) {
                  res.end(JSON.stringify({
                    success: true,
                    data: JSON.parse(candidate),
                    source: 'gemini-live'
                  }));
                  return;
                }
              }
            } catch (err) {
              console.error('Summary API error:', err.message);
            }
          }

          // Deterministic summary synthesis from actual notices
          const urgentNotices = notices.filter(n => n.priority === 'Urgent');
          const exams = notices.filter(n => n.category === 'Examination');
          const events = notices.filter(n => n.category === 'Events' || n.category === 'Sports' || n.category === 'Cultural');
          const deadlines = notices.filter(n => n.is_deadline || /submission|deadline|last date|due/i.test(n.title + ' ' + n.description) || n.priority === 'Urgent');

          const summary = {
            headline: urgentNotices.length > 0 
              ? `You have ${urgentNotices.length} urgent notices requiring your immediate attention this week.`
              : `You are up to date! There are ${notices.length} active announcements on campus.`,
            important_announcements: notices.slice(0, 3).map(n => `${n.title}: ${n.description.slice(0, 100)}`),
            upcoming_examinations: exams.map(e => `${e.title} scheduled for ${e.event_date} at ${e.event_time} (Venue: ${e.venue})`),
            events_this_week: events.map(ev => `${ev.title} on ${ev.event_date} (${ev.category})`),
            approaching_deadlines: deadlines.map(d => `${d.title} - due ${d.event_date}`),
            urgent_notices: urgentNotices.map(u => `[URGENT] ${u.title}: ${u.description.slice(0, 100)}`),
            recommended_actions: [
              ...(exams.length > 0 ? [`Review study material for upcoming ${exams[0].title}`] : []),
              ...(deadlines.length > 0 ? [`Complete pending submission: ${deadlines[0].title}`] : []),
              'Check your calendar for clash-free scheduling',
              'Keep notification alerts active for last-minute campus broadcasts'
            ]
          };

          res.end(JSON.stringify({
            success: true,
            data: summary,
            source: 'demo-mode'
          }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), geminiServerPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
