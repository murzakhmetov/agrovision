

class AppState {
    constructor() {
        this.currentTab = 'monitoring';
    }

    init() {
        this.bindNavigation();
        this.initLanguage();

        if (window.cvPlayer) window.cvPlayer.init();
        if (window.analysisStudio) window.analysisStudio.init();

        this.switchTab('monitoring');
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
