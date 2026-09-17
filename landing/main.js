
(function () {
    'use strict';

    let currentLang = localStorage.getItem('agri_lang') || 'ru';

    function applyLanguage(lang) {
        if (!window.translations || !window.translations[lang]) return;
        currentLang = lang;
        localStorage.setItem('agri_lang', lang);

        document.documentElement.lang = lang;

        const i18nElements = document.querySelectorAll('[data-i18n]');
        i18nElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.translations[lang][key]) {
                el.textContent = window.translations[lang][key];
            }
        });

        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedLang = e.target.getAttribute('data-lang');
                if (selectedLang) {
                    applyLanguage(selectedLang);
                }
            });
        });

        applyLanguage(currentLang);

        const mobileToggle = document.getElementById('mobile-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta-btn');

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
            });

            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                });
            });
        }
    });


    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
            let animationFrameId;
            let width = 0;
            let height = 0;

            const mouse = {
                x: -1000,
                y: -1000,
                prevX: -1000,
                prevY: -1000,
                vx: 0,
                vy: 0,
                radius: 220,
            };

            let nodes = [];

            const handleResize = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const parent = canvas.parentElement;
                width = parent.clientWidth || window.innerWidth;
                height = parent.clientHeight || window.innerHeight;
                
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                ctx.scale(dpr, dpr);
                initNodes();
            };

            const handleMouseMove = (e) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            };

            const handleMouseLeave = () => {
                mouse.x = -1000;
                mouse.y = -1000;
            };

            const initNodes = () => {
                nodes = [];
                const spacing = window.innerWidth < 640 ? 70 : 55; 
                const cols = Math.ceil(width / spacing) + 1;
                const rows = Math.ceil(height / spacing) + 1;

                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        const x = i * spacing;
                        const y = j * spacing;
                        nodes.push({
                            x,
                            y,
                            vx: 0,
                            vy: 0,
                            baseX: x,
                            baseY: y,
                            radius: Math.random() * 1.2 + 1.2,
                            label: `${(i * 7).toString(16).toUpperCase()}:${(j * 11).toString(16).toUpperCase()}`,
                            pulse: Math.random() * Math.PI * 2,
                        });
                    }
                }

                const hudNodesEl = document.getElementById('hud-nodes');
                if (hudNodesEl) {
                    hudNodesEl.textContent = nodes.length.toLocaleString();
                }
            };

            handleResize();
            window.addEventListener('resize', handleResize);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseleave', handleMouseLeave);

            let lastTime = performance.now();

            const render = (now) => {
                const dt = Math.min((now - lastTime) / 1000, 0.05);
                lastTime = now;

                mouse.vx = (mouse.x - mouse.prevX) / (dt * 1000 || 1);
                mouse.vy = (mouse.y - mouse.prevY) / (dt * 1000 || 1);
                mouse.prevX = mouse.x;
                mouse.prevY = mouse.y;

                const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

                const bgColor = '#030407';
                const nodeColor = '255, 255, 255';
                const accentColor = '56, 189, 248'; 

                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, width, height);

                const SPRING_K = 18; 
                const DAMPING = 0.82; 

                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    n.pulse += dt * 3;

                    const dx = mouse.x - n.x;
                    const dy = mouse.y - n.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius && dist > 0) {
                        const power = (1 - dist / mouse.radius);
                        const force = power * (1500 + speed * 150);
                        const angle = Math.atan2(dy, dx);

                        n.vx -= Math.cos(angle) * force * dt;
                        n.vy -= Math.sin(angle) * force * dt;
                    }

                    const homeDx = n.baseX - n.x;
                    const homeDy = n.baseY - n.y;

                    n.vx += homeDx * SPRING_K * dt;
                    n.vy += homeDy * SPRING_K * dt;

                    n.vx *= DAMPING;
                    n.vy *= DAMPING;

                    n.x += n.vx * dt * 60;
                    n.y += n.vy * dt * 60;
                }

                const MAX_CONN_DIST = 75;
                const MAX_CONN_DIST_SQ = MAX_CONN_DIST * MAX_CONN_DIST;

                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];

                    for (let j = i + 1; j < nodes.length; j++) {
                        const n2 = nodes[j];
                        const ndx = n.x - n2.x;
                        const ndy = n.y - n2.y;
                        const distSq = ndx * ndx + ndy * ndy;

                        if (distSq < MAX_CONN_DIST_SQ) {
                            const nDist = Math.sqrt(distSq);
                            const alpha = (1 - nDist / MAX_CONN_DIST) * 0.18;

                            ctx.strokeStyle = `rgba(${nodeColor}, ${alpha})`;
                            ctx.lineWidth = 0.7;
                            ctx.beginPath();
                            ctx.moveTo(n.x, n.y);
                            ctx.lineTo(n2.x, n2.y);
                            ctx.stroke();
                        }
                    }
                }

                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    const dx = mouse.x - n.x;
                    const dy = mouse.y - n.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const isNear = dist < mouse.radius;

                    const baseAlpha = isNear ? 0.95 : 0.25 + Math.sin(n.pulse) * 0.1;

                    ctx.fillStyle = isNear
                        ? `rgba(${accentColor}, ${baseAlpha})`
                        : `rgba(${nodeColor}, ${baseAlpha})`;

                    const currentRadius = isNear
                        ? n.radius * 2.2
                        : n.radius + Math.sin(n.pulse) * 0.3;

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
                    ctx.fill();

                    if (dist < 90) {
                        const pulseRing = ((n.pulse * 20) % 30) + 4;
                        const ringAlpha = (1 - pulseRing / 34) * 0.4;

                        ctx.strokeStyle = `rgba(${accentColor}, ${ringAlpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(n.x, n.y, pulseRing, 0, Math.PI * 2);
                        ctx.stroke();

                        ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
                        ctx.fillStyle = `rgba(${accentColor}, 0.85)`;
                        ctx.fillText(n.label, n.x + 10, n.y - 10);
                    }
                }

                animationFrameId = requestAnimationFrame(render);
            };

            animationFrameId = requestAnimationFrame(render);
        }
    }

    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing && window.innerWidth > 1024) {
        let mouseX = -100, mouseY = -100;
        let ringX = -100, ringY = -100;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        const renderCursor = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        };
        renderCursor();

        const interactiveEls = document.querySelectorAll('a, button, .glass-card, .stat-card');
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
        });
    }

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to('#scroll-progress', {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });

        const nav = document.getElementById('nav');
        ScrollTrigger.create({
            start: 'top -50',
            onUpdate: (self) => {
                if (self.direction === 1 || window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }
        });

        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

        heroTl.from('.tech-badge', { opacity: 0, y: -20, delay: 0.2 })
              .from('.hero-title', { opacity: 0, y: 30 }, '-=0.6')
              .from('.hero-description', { opacity: 0, y: 20 }, '-=0.6')
              .from('.hero-btns .btn', { opacity: 0, y: 20, stagger: 0.15 }, '-=0.6')
              .from('.hero-hud-row', { opacity: 0, y: 20 }, '-=0.4')
              .from('.device-frame-container', { opacity: 0, scale: 0.95, y: 30, duration: 1.2 }, '-=0.8');

        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header.children, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power2.out',
                clearProps: 'all'
            });
        });

        gsap.from('.stat-card', {
            scrollTrigger: {
                trigger: '#stats',
                start: 'top 85%',
            },
            opacity: 0,
            y: 30,
            stagger: 0.12,
            duration: 0.7,
            ease: 'back.out(1.4)',
            clearProps: 'all'
        });

        gsap.from('#how .glass-card', {
            scrollTrigger: {
                trigger: '#how',
                start: 'top 80%',
            },
            opacity: 0,
            y: 40,
            stagger: 0.2,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'all'
        });

        gsap.from('.video-frame-container', {
            scrollTrigger: {
                trigger: '#demo',
                start: 'top 80%',
            },
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'all'
        });

        gsap.utils.toArray('.hw-card').forEach(hwCard => {
            gsap.from(hwCard, {
                scrollTrigger: {
                    trigger: hwCard,
                    start: 'top 80%',
                },
                opacity: 0,
                y: 40,
                duration: 0.9,
                ease: 'power3.out',
                clearProps: 'all'
            });
        });

        gsap.utils.toArray('.showcase-item').forEach(item => {
            gsap.from(item.querySelector('.showcase-info'), {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out',
                clearProps: 'all'
            });

            gsap.from(item.querySelector('.showcase-device-wrapper'), {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out',
                clearProps: 'all'
            });
        });

        gsap.to('.floating-phone', {
            y: -10,
            repeat: -1,
            yoyo: true,
            duration: 3,
            ease: 'sine.inOut',
            stagger: 0.4
        });

        gsap.from('.cta-box', {
            scrollTrigger: {
                trigger: '#cta',
                start: 'top 85%',
            },
            opacity: 0,
            scale: 0.96,
            y: 20,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'all'
        });

        if (window.innerWidth > 1024) {
            const magneticBtns = document.querySelectorAll('.magnetic-btn');
            magneticBtns.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    gsap.to(btn, {
                        x: x * 0.25,
                        y: y * 0.25,
                        duration: 0.3,
                        ease: 'power1.out'
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'elastic.out(1, 0.4)'
                    });
                });
            });
        }

        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });
    }

})();
