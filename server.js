// server.js — Ken AI Backend
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Serve the static portfolio files
app.use(express.static(__dirname));

// ── Gemini setup ──────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are "Ken AI", a friendly and professional AI assistant embedded on Kenneth Sanchez's personal portfolio website.
Your job is to answer visitors' questions about Kenneth — his skills, experience, projects, and availability.
Always be helpful, concise, and confident. Speak as if you represent Kenneth professionally.

NAME: Kenneth Sanchez
ROLE: Full Stack Developer
EXPERIENCE: 3+ years building responsive, scalable web applications from idea to deployment
LOCATION: Available remotely
SPECIALIZATION: MERN Stack — MongoDB, Express.js, React, Node.js
AVAILABILITY: Open to freelance projects and full-time roles

SKILLS:
- Frontend: React, JavaScript (ES6+), TypeScript, HTML5, CSS3
- Backend: Node.js, Express.js, REST APIs, JWT Authentication, WebSockets
- Databases: MongoDB, MySQL
- Tools: Git, GitHub, VS Code, Postman, Figma
- Practices: Responsive design, performance optimization, clean code, Agile

PROJECTS:
1. E-Commerce Platform — React, Node.js, MongoDB, Stripe checkout, real-time admin dashboard.
2. Analytics Dashboard — React, Express, MySQL, interactive charts, role-based access, CSV export.
3. Task Manager API — Node.js, MongoDB, JWT auth, WebSocket notifications.
4. Portfolio Builder — React, Firebase, drag-and-drop, live preview.

CONTACT: your@email.com | github.com/yourgithub | linkedin.com/in/yourlinkedin

If asked something unrelated to Kenneth, politely redirect. Keep answers concise unless asked for detail.`
});

// ── Chat API endpoint ─────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const result = await model.generateContent(message);
        const reply = result.response.text();
        res.json({ reply });
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to get a response.' });
    }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Ken AI server running → http://localhost:${PORT}`);
});
