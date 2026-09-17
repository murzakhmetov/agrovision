class AppState {
    constructor() {
        this.currentTab = 'dashboard';
        this.mode = localStorage.getItem('agrovision_mode') || 'offline';
        this.weather = null;
    }

    init() {
        this.bindNavigation();
        this.bindModeToggle();
        this.bindModals();
        this.loadAiSettings();
        this.fetchWeather();
        this.initLanguage();
        this.applyMode(this.mode);

        if (window.cvPlayer) window.cvPlayer.init();
        if (window.analysisStudio) window.analysisStudio.init();
        if (window.fieldsManager) window.fieldsManager.init();
        if (window.agronomistChat) window.agronomistChat.init();

        this.switchTab('dashboard');
    }

    bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        const btnGoMon = document.getElementById('btn-go-monitoring');
        const btnGoAna = document.getElementById('btn-go-analysis');
        if (btnGoMon) btnGoMon.addEventListener('click', () => this.switchTab('monitoring'));
        if (btnGoAna) btnGoAna.addEventListener('click', () => this.switchTab('analysis'));
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.content-viewport').forEach(el => {
            el.classList.toggle('active', el.id === `view-${tabName}`);
        });
    }

    bindModeToggle() {
        const modeBtn = document.getElementById('mode-toggle-btn');
        if (modeBtn) {
            modeBtn.addEventListener('click', () => {
                const nextMode = (this.mode === 'offline') ? 'online' : 'offline';
                this.setMode(nextMode);
            });
        }
    }

    async setMode(newMode) {
        this.mode = newMode;
        localStorage.setItem('agrovision_mode', newMode);
        this.applyMode(newMode);

        try {
            const formData = new FormData();
            formData.append('mode', newMode);
            await fetch('/api/mode', { method: 'POST', body: formData });
        } catch (e) {
            console.error(e);
        }
    }

    applyMode(mode) {
        const modeBtn = document.getElementById('mode-toggle-btn');
        const modeText = document.getElementById('mode-toggle-text');
        const statusPill = document.getElementById('sys-status-text');

        if (modeBtn) {
            modeBtn.className = `mode-toggle-btn ${mode}`;
        }

        if (modeText) {
            modeText.textContent = (mode === 'online') ? 'ONLINE (ОБЛАКО)' : 'OFFLINE (БОРТ)';
        }

        if (statusPill) {
            if (mode === 'online') {
                statusPill.textContent = 'ONLINE ОБЛАЧНЫЙ РЕЖИМ (СИНХРОНИЗАЦИЯ)';
                statusPill.style.color = 'var(--cyan)';
            } else {
                statusPill.textContent = 'OFFLINE БОРТОВОЙ РЕЖИМ (КОСТАНАЙСКАЯ ОБЛ.)';
                statusPill.style.color = 'var(--accent)';
            }
        }
    }

    bindModals() {
        const settingsForm = document.getElementById('sprayer-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Параметры опрыскивателя сохранены в бортовой компьютер!');
            });
        }

        const geminiForm = document.getElementById('gemini-settings-form');
        if (geminiForm) {
            geminiForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const keyInput = document.getElementById('gemini-api-key-input');
                const modelInput = document.getElementById('gemini-model-input');
                try {
                    const resp = await fetch('/api/settings/ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            api_key: keyInput ? keyInput.value.trim() : '',
                            model: modelInput ? modelInput.value.trim() : ''
                        })
                    });
                    if (resp.ok) {
                        alert('Конфигурация Gemini AI успешно сохранена!');
                    }
                } catch (err) {
                    alert('Ошибка при сохранении параметров Gemini AI');
                }
            });
        }
    }

    async loadAiSettings() {
        try {
            const resp = await fetch('/api/settings/ai');
            if (!resp.ok) return;
            const data = await resp.json();
            const keyInput = document.getElementById('gemini-api-key-input');
            const modelInput = document.getElementById('gemini-model-input');
            if (keyInput && data.api_key) keyInput.value = data.api_key;
            if (modelInput && data.model) modelInput.value = data.model;
        } catch (e) {
            console.error(e);
        }
    }

    async fetchWeather() {
        try {
            const resp = await fetch('/api/weather');
            if (!resp.ok) return;
            this.weather = await resp.json();
            this.renderWeather();
        } catch (e) {
            console.error(e);
        }
    }

    renderWeather() {
        if (!this.weather) return;
        const w = this.weather;

        const tempEl = document.getElementById('db-temp');
        const windEl = document.getElementById('db-wind');
        const humEl = document.getElementById('db-humidity');
        const precEl = document.getElementById('db-precip');
        const suitEl = document.getElementById('db-spray-suit');

        if (tempEl) tempEl.textContent = `${w.temperature_c} C`;
        if (windEl) windEl.textContent = `${w.wind_speed_ms} м/с`;
        if (humEl) humEl.textContent = `${w.humidity_pct}%`;
        if (precEl) precEl.textContent = `${w.precipitation_mm} мм`;

        if (suitEl && w.spray_window) {
            suitEl.textContent = w.spray_window.status_badge;
            suitEl.style.color = w.spray_window.is_favorable ? 'var(--accent)' : '#EF4444';
        }
    }

    initLanguage() {
        const savedLang = localStorage.getItem('agrovision_lang') || 'ru';
        setLanguage(savedLang);

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                if (lang) setLanguage(lang);
            });
        });
    }
}

window.appState = new AppState();

document.addEventListener('DOMContentLoaded', () => {
    window.appState.init();
});
