

(function () {
    'use strict';

    let currentLang = localStorage.getItem('agri_lang') || 'ru';

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        localStorage.setItem('agri_lang', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    setLanguage(currentLang);

    const nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.card, .hw-item, .showcase, .video-wrapper').forEach((el, i) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                },
                opacity: 0,
                y: 35,
                duration: 0.9,
                ease: 'power3.out',
                delay: (i % 2) * 0.1
            });
        });

        gsap.from('.device-frame', {
            opacity: 0,
            y: 20,
            scale: 0.96,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.3
        });
    }
})();
