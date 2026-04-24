// Scroll Reveal Logic for the Editorial Theme
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once revealed to keep performance high
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // --- THEME SWITCHER LOGIC ---
    const settingsToggle = document.getElementById('settingsToggle');
    const themeMenu = document.getElementById('themeMenu');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Load saved theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    applyTheme(savedTheme);

    // Toggle menu
    if (settingsToggle && themeMenu) {
        settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsToggle.contains(e.target) && !themeMenu.contains(e.target)) {
                themeMenu.classList.remove('active');
            }
        });
    }

    // Handle theme selection
    themeOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            themeMenu.classList.remove('active');
        });
    });

    function applyTheme(theme) {
        // Remove old theme classes
        document.body.classList.remove('theme-light', 'theme-transparent');
        
        // Add new theme class if not dark (dark is default)
        if (theme !== 'dark') {
            document.body.classList.add(`theme-${theme}`);
        }

        // Update active state in menu
        themeOptions.forEach(btn => {
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Save preference
        localStorage.setItem('portfolio-theme', theme);
    }

    // --- SCROLLSPY LOGIC ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Subtracting to trigger earlier (accounting for navbar)
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// =====================================================
// BACKGROUND: IT Network Particle System (theme-aware)
// =====================================================
(function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    // Detect current theme colors
    function getThemeColors() {
        const isLight = document.body.classList.contains('theme-light');
        return {
            bg:          isLight ? null : '#07080f',       // null = transparent in light
            particle:    isLight ? '30, 40, 80'   : '80, 130, 255',
            line:        isLight ? '30, 40, 80'   : '60, 110, 255',
            dotAlpha:    isLight ? 0.55            : 0.75,
            lineAlpha:   isLight ? 0.12            : 0.25,
            connectDist: 150,
        };
    }

    // Build particles
    const PARTICLE_COUNT = 70;
    const particles = [];

    function makeParticle() {
        return {
            x:   Math.random() * W,
            y:   Math.random() * H,
            vx:  (Math.random() - 0.5) * 0.4,
            vy:  (Math.random() - 0.5) * 0.4,
            r:   Math.random() * 1.5 + 1,
        };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

    // Mouse position for interactivity
    const mouse = { x: -999, y: -999 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    function draw() {
        const c = getThemeColors();

        // Background — clear for light mode, dark fill for dark mode
        if (c.bg) {
            ctx.fillStyle = c.bg;
            ctx.fillRect(0, 0, W, H);
        } else {
            ctx.clearRect(0, 0, W, H);
        }

        // Update + draw particles
        particles.forEach(p => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            // Mouse attraction — nearby particles gently drift toward cursor
            const mdx = mouse.x - p.x;
            const mdy = mouse.y - p.y;
            const md  = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < 120) {
                p.vx += mdx * 0.00015;
                p.vy += mdy * 0.00015;
            }

            // Speed cap
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (spd > 1.2) { p.vx *= 0.98; p.vy *= 0.98; }

            // Draw dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c.particle}, ${c.dotAlpha})`;
            ctx.fill();
        });

        // Draw connecting lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < c.connectDist) {
                    const alpha = c.lineAlpha * (1 - dist / c.connectDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${c.line}, ${alpha})`;
                    ctx.lineWidth   = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Mouse-to-particle lines
        particles.forEach(p => {
            const dx   = mouse.x - p.x;
            const dy   = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
                const alpha = c.lineAlpha * 1.8 * (1 - dist / 160);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${c.particle}, ${alpha})`;
                ctx.lineWidth   = 0.8;
                ctx.stroke();
            }
        });

        requestAnimationFrame(draw);
    }

    draw();
})();


// =====================================================
// AI ASSISTANT — Gemini-powered portfolio chatbot
// =====================================================
(function initAIChat() {
    const GEMINI_KEY = 'AIzaSyBdZqWkv2cbc3FckUbgmTw1RgmiSYMKFUE';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_KEY}`;

    // ── Kenneth's personal context — injected as first exchange ───────────────
    const SYSTEM_CONTEXT = `You are "Ken AI", a friendly and professional AI assistant embedded on Kenneth Sanchez's personal portfolio website.
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

If asked something unrelated to Kenneth, politely redirect. Keep answers concise unless asked for detail.`;

    // Seed the history with system context as a user/model exchange
    // This is the most compatible way to inject context into Gemini v1beta
    const conversationHistory = [
        { role: 'user',  parts: [{ text: `[Context for this assistant — not a real user message]\n${SYSTEM_CONTEXT}` }] },
        { role: 'model', parts: [{ text: `Understood! I'm Ken AI, ready to answer questions about Kenneth Sanchez's skills, projects, and availability. How can I help you?` }] }
    ];

    // ── Build DOM ─────────────────────────────────────────────────────────────
    const chatBtn = document.createElement('button');
    chatBtn.id = 'ai-chat-btn';
    chatBtn.innerHTML = `<i class="fa-solid fa-robot"></i>`;
    chatBtn.title = 'Ask Ken AI';

    const chatBox = document.createElement('div');
    chatBox.id = 'ai-chat-box';
    chatBox.innerHTML = `
        <div class="ai-chat-header">
            <div class="ai-header-info">
                <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
                <div>
                    <div class="ai-name">Ken AI</div>
                    <div class="ai-status"><span class="status-dot"></span> Online</div>
                </div>
            </div>
            <button class="ai-close-btn" id="ai-close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="ai-messages" id="ai-messages">
            <div class="ai-msg bot">
                <div class="ai-bubble">Hey! I'm Ken AI 👋 Ask me anything about Kenneth — his skills, projects, or availability!</div>
            </div>
        </div>
        <div class="ai-input-row">
            <input type="text" id="ai-input" placeholder="Ask about Kenneth..." autocomplete="off" />
            <button id="ai-send-btn"><i class="fa-solid fa-paper-plane"></i></button>
        </div>`;

    document.body.appendChild(chatBtn);
    document.body.appendChild(chatBox);

    // ── Toggle open/close ─────────────────────────────────────────────────────
    chatBtn.addEventListener('click', () => {
        chatBox.classList.toggle('open');
        chatBtn.classList.toggle('active');
        if (chatBox.classList.contains('open')) {
            document.getElementById('ai-input').focus();
        }
    });
    document.getElementById('ai-close-btn').addEventListener('click', () => {
        chatBox.classList.remove('open');
        chatBtn.classList.remove('active');
    });

    // ── Send message ──────────────────────────────────────────────────────────
    const inputEl  = document.getElementById('ai-input');
    const sendBtn  = document.getElementById('ai-send-btn');
    const messagesEl = document.getElementById('ai-messages');

    function addMessage(text, role) {
        const wrapper = document.createElement('div');
        wrapper.className = `ai-msg ${role}`;
        const bubble = document.createElement('div');
        bubble.className = 'ai-bubble';
        bubble.textContent = text;
        wrapper.appendChild(bubble);
        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return bubble;
    }

    function addTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-msg bot';
        wrapper.id = 'typing-indicator';
        wrapper.innerHTML = `<div class="ai-bubble ai-typing"><span></span><span></span><span></span></div>`;
        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    async function sendMessage() {
        const userText = inputEl.value.trim();
        if (!userText) return;

        inputEl.value = '';
        sendBtn.disabled = true;
        addMessage(userText, 'user');
        addTypingIndicator();

        try {
            // gemini-1.0-pro: inject context as prefix in the single message
            const prompt = `${SYSTEM_CONTEXT}\n\nVisitor question: ${userText}`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await res.json();
            removeTypingIndicator();

            if (!res.ok) {
                const errMsg = data?.error?.message || `API error ${res.status}`;
                addMessage(`⚠️ ${errMsg}`, 'bot');
                sendBtn.disabled = false;
                inputEl.focus();
                return;
            }

            if (data.candidates && data.candidates[0]) {
                const reply = data.candidates[0].content.parts[0].text;
                addMessage(reply, 'bot');
            } else {
                console.warn('Gemini unexpected response:', data);
                addMessage("I got an unexpected response. Please try again!", 'bot');
            }
        } catch (err) {
            removeTypingIndicator();
            console.error('Ken AI fetch error:', err);
            addMessage(`⚠️ Network error: ${err.message}`, 'bot');
        }

        sendBtn.disabled = false;
        inputEl.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
})();

// =====================================================
// SCROLL PROGRESS BAR
// =====================================================
(function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    }, { passive: true });
})();

// =====================================================
// BACK TO TOP BUTTON
// =====================================================
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// =====================================================
// SKILL BARS — animate on scroll into view
// =====================================================
(function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-item');
    if (!bars.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const pct  = item.getAttribute('data-pct') || 0;
                const fill = item.querySelector('.skill-bar-fill');
                if (fill) {
                    // Slight delay so the section fade-in plays first
                    setTimeout(() => { fill.style.width = pct + '%'; }, 200);
                }
                observer.unobserve(item);
            }
        });
    }, { threshold: 0.3 });
    bars.forEach(b => observer.observe(b));
})();

// =====================================================
// COPY EMAIL BUTTON
// =====================================================
(function initCopyEmail() {
    const btn = document.getElementById('copy-email-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText('your@email.com').then(() => {
            const icon = btn.querySelector('i');
            icon.className = 'fa-solid fa-check';
            btn.style.color = '#22c55e';
            setTimeout(() => {
                icon.className = 'fa-regular fa-copy';
                btn.style.color = '';
            }, 2000);
        });
    });
})();

// =====================================================
// CONTACT FORM — Formspree AJAX submission
// =====================================================
(function initContactForm() {
    const form    = document.getElementById('contact-form');
    const status  = document.getElementById('form-status');
    const submitBtn = document.getElementById('form-submit-btn');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        status.style.display = 'none';
        status.className = '';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                status.textContent = '✓ Message sent! I\'ll be in touch soon.';
                status.style.display = 'inline';
                form.reset();
            } else {
                status.textContent = '⚠ Something went wrong. Please email me directly.';
                status.style.display = 'inline';
                status.className = 'error';
            }
        } catch (err) {
            status.textContent = '⚠ Network error. Please try again.';
            status.style.display = 'inline';
            status.className = 'error';
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
    });
})();
