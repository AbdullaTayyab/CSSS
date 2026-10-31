// Gemini AI Integration Service for Campus Pulse

export const geminiService = {
  // Check backend Gemini status or local key
  getStatus: async (customApiKey) => {
    try {
      const res = await fetch('/api/gemini/status');
      if (res.ok) {
        const data = await res.json();
        return {
          hasKey: data.hasKey || !!customApiKey,
          mode: (data.hasKey || !!customApiKey) ? 'live' : 'demo'
        };
      }
    } catch (e) {
      // Fallback
    }
    return {
      hasKey: !!customApiKey,
      mode: customApiKey ? 'live' : 'demo'
    };
  },

  // Extract structured information from unstructured text
  extractNotice: async (text, customApiKey = '') => {
    if (!text || !text.trim()) {
      throw new Error('Please paste or enter some announcement text first.');
    }

    // Try server endpoint first
    try {
      const res = await fetch('/api/gemini/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          apiKey: customApiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Backend API unreachable, using client-side engine:', err);
    }

    // Direct client-side Gemini fallback if customApiKey is provided
    if (customApiKey && customApiKey.trim()) {
      try {
        const prompt = `You are the AI information extraction engine for Campus Pulse, a college information management system.
Extract structured information from the following unstructured college announcement, email, or WhatsApp message.

CRITICAL RULES:
1. Never invent missing dates, times, or venues. If information is not mentioned or cannot be determined, you MUST set it to "Not specified".
2. Category MUST strictly be one of: "Academic", "Examination", "Events", "Placement", "Sports", "Cultural", "General".
3. Priority MUST strictly be one of: "Urgent", "Upcoming", "Normal", "Expired".
4. If a date is ambiguous (e.g. "next Friday" without an explicit date/year), extract what is written and set "is_ambiguous_date": true. Otherwise false.
5. Provide a clean, concise summary description in 1-3 sentences.

Input text:
"""
${text}
"""

Return ONLY a valid JSON object matching this structure:
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

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${customApiKey.trim()}`, {
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

        if (geminiRes.ok) {
          const apiData = await geminiRes.json();
          const textResponse = apiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            return {
              success: true,
              data: JSON.parse(textResponse),
              source: 'gemini-live'
            };
          }
        }
      } catch (clientErr) {
        console.error('Client Gemini call failed, using intelligent demo parser:', clientErr);
      }
    }

    // Client-side deterministic natural language extractor (Demo Mode)
    return {
      success: true,
      data: clientSideDemoExtractor(text),
      source: 'demo-mode'
    };
  },

  // Generate Weekly AI Summary from saved notices
  generateWeeklySummary: async (notices, customApiKey = '') => {
    try {
      const res = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notices,
          apiKey: customApiKey
        })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend summary endpoint unreachable:', err);
    }

    // Demo Mode intelligent synthesis from actual notices
    return {
      success: true,
      data: clientSideDemoSummarizer(notices),
      source: 'demo-mode'
    };
  }
};

// Client-side rule-based fallback extractor adhering to strict rules
function clientSideDemoExtractor(rawText) {
  let category = 'General';
  let priority = 'Normal';

  // Category determination
  if (/exam|test|midterm|internal|assessment|viva|quiz|marks|hall ticket/i.test(rawText)) {
    category = 'Examination';
    priority = 'Urgent';
  } else if (/placement|interview|drive|internship|hiring|ctc|package|resume|shortlist/i.test(rawText)) {
    category = 'Placement';
    priority = 'Urgent';
  } else if (/fest|hackathon|workshop|seminar|conference|webinar|symposium/i.test(rawText)) {
    category = 'Events';
    priority = 'Upcoming';
  } else if (/sports|cricket|football|basketball|badminton|athletics|tournament|match/i.test(rawText)) {
    category = 'Sports';
    priority = 'Upcoming';
  } else if (/cultural|dance|music|drama|singing|annual day|celebration|fest/i.test(rawText)) {
    category = 'Cultural';
    priority = 'Upcoming';
  } else if (/assignment|lecture|syllabus|course|submission|lab report|attendance|project/i.test(rawText)) {
    category = 'Academic';
    priority = /submission|due|deadline|strictly/i.test(rawText) ? 'Urgent' : 'Normal';
  }

  if (/urgent|immediately|mandatory|strict|last date|deadline|attention/i.test(rawText)) {
    priority = 'Urgent';
  }

  // Title Extraction
  let title = '';
  const titlePatterns = [
    { regex: /internal\s+examination/i, title: 'Internal Examination' },
    { regex: /campus\s+placement(?:\s+drive)?/i, title: 'Campus Placement Drive' },
    { regex: /hackpulse|hackathon/i, title: 'HackPulse 2026 Hackathon' },
    { regex: /technical\s+fest/i, title: 'Technical Fest 2026' },
    { regex: /sports\s+(?:tournament|meet|trials|championship)/i, title: 'Inter-College Sports Championship' },
    { regex: /holiday(?:\s+notice)?/i, title: 'Campus Holiday Announcement' },
    { regex: /project\s+submission|mini-project/i, title: 'Mini-Project Final Submission' },
    { regex: /guest\s+lecture/i, title: 'Guest Lecture Announcement' }
  ];

  for (const item of titlePatterns) {
    if (item.regex.test(rawText)) {
      title = item.title;
      break;
    }
  }

  if (!title) {
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const firstLine = (lines[0] || '').replace(/^(urgent|notice|announcement|attention|circular):?\s*/i, '').trim();
    if (firstLine.length >= 6 && firstLine.length <= 60 && !firstLine.toLowerCase().startsWith('all b.tech') && !firstLine.toLowerCase().startsWith('all students')) {
      title = firstLine;
    } else if (category === 'Examination') {
      title = 'Internal Examination';
    } else if (category === 'Placement') {
      title = 'Campus Placement Notice';
    } else if (category === 'Events') {
      title = 'College Event Announcement';
    } else if (category === 'Academic') {
      title = 'Academic Course Notice';
    } else {
      title = 'College Campus Notice';
    }
  }

  // Date Extraction
  let date = 'Not specified';
  const dateMatch = rawText.match(/(\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/i);
  if (dateMatch) {
    date = dateMatch[1];
  }

  // Time Extraction
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

  // Venue Extraction
  let venue = 'Not specified';
  const specificVenueMatch = rawText.match(/\b(Block\s+[A-Za-z0-9]+|Room\s+[A-Za-z0-9]+|Lab\s+[A-Za-z0-9]+|Central Auditorium|Auditorium|Exam Center|Seminar Hall|Sports Complex|Main Ground|LMS Portal|Placement Cell(?: Portal)?)\b/i);
  if (specificVenueMatch) {
    venue = specificVenueMatch[1];
  } else {
    const genMatch = rawText.match(/(?:\bin\s+|\bat\s+|\bvenue:?\s+)([A-Z][A-Za-z0-9\s\-]{2,25})(?=[,\.]|\s+(?:on|at|starting|from|till)|\n|$)/);
    if (genMatch) {
      const cand = genMatch[1].trim();
      if (!/^(the|a|all|students|morning|evening|am|pm|\d+|due|strict|order|view)$/i.test(cand)) {
        venue = cand;
      }
    }
  }

  const isAmbiguous = date === 'Not specified' || /monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week/i.test(rawText);

  return {
    title,
    description: rawText.length > 200 ? rawText.slice(0, 197) + '...' : rawText,
    category,
    priority,
    event_date: date,
    event_time: time,
    venue,
    is_ambiguous_date: isAmbiguous,
    confidence_score: 0.92
  };
}

// Client-side demo summarizer
function clientSideDemoSummarizer(notices) {
  const urgent = notices.filter(n => n.priority === 'Urgent');
  const exams = notices.filter(n => n.category === 'Examination');
  const events = notices.filter(n => n.category === 'Events' || n.category === 'Sports' || n.category === 'Cultural');
  const deadlines = notices.filter(n => n.is_deadline || /submission|deadline|last date|due/i.test(n.title + ' ' + n.description) || n.priority === 'Urgent');

  return {
    headline: urgent.length > 0 
      ? `High Alert Week: You have ${urgent.length} urgent notices requiring immediate preparation.`
      : `Weekly Outlook: ${notices.length} active announcements with steady academic schedules.`,
    important_announcements: notices.slice(0, 3).map(n => `${n.title} (${n.category}) - ${n.description.slice(0, 100)}`),
    upcoming_examinations: exams.map(e => `${e.title} scheduled for ${e.event_date} at ${e.event_time} (Venue: ${e.venue})`),
    events_this_week: events.map(ev => `${ev.title} on ${ev.event_date} (Venue: ${ev.venue})`),
    approaching_deadlines: deadlines.map(d => `${d.title} [Due: ${d.event_date} ${d.event_time !== 'Not specified' ? d.event_time : ''}]`),
    urgent_notices: urgent.map(u => `${u.title}: ${u.description.slice(0, 110)}`),
    recommended_actions: [
      ...(exams.length > 0 ? [`Prioritize revision for: ${exams[0].title}`] : []),
      ...(deadlines.length > 0 ? [`Finalize submission documents for: ${deadlines[0].title}`] : []),
      'Verify event venues and hall tickets on your student ERP portal',
      'Set calendar reminders 24 hours before key submission deadlines',
      'Keep notification badges enabled for urgent department circulars'
    ]
  };
}
