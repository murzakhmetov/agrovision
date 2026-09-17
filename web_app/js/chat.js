class AgronomistChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.btnSend = document.getElementById('btn-chat-send');
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (this.btnSend) {
            this.btnSend.addEventListener('click', () => this.sendMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    sendQuickPrompt(text) {
        if (this.chatInput) {
            this.chatInput.value = text;
            this.sendMessage();
        }
    }

    async sendMessage() {
        if (!this.chatInput) return;
        const text = this.chatInput.value.trim();
        if (!text) return;

        this.appendMessage('user', text);
        this.chatInput.value = '';

        const mode = window.appState ? window.appState.mode : 'offline';
        const loadingId = this.appendLoading();

        try {
            const resp = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, mode: mode })
            });

            if (!resp.ok) throw new Error("Ошибка связи с сервисом агронома");

            const data = await resp.json();
            this.removeLoading(loadingId);
            this.appendMessage('ai', data.answer, mode);
        } catch (e) {
            this.removeLoading(loadingId);
            this.appendMessage('ai', "Ошибка получения ответа: " + e.message, mode);
        }
    }

    appendMessage(sender, text, mode) {
        if (!this.chatMessages) return;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;

        const badgeText = (mode === 'online') ? 'ONLINE РЕЖИМ СИНХРОНИЗАЦИИ' : 'OFFLINE РЕГЛАМЕНТ ОЛЖА АГРО';
        const badgeColor = (mode === 'online') ? 'var(--cyan)' : 'var(--accent)';
        const badgeBg = (mode === 'online') ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)';

        if (sender === 'ai') {
            bubble.innerHTML = `
                <div class="chat-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>
                </div>
                <div class="chat-text">
                    <span style="font-size: 0.68rem; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; border-radius: 4px; padding: 2px 6px; margin-bottom: 6px; display: inline-block; font-family: var(--font-mono);">
                        ${badgeText}
                    </span>
                    <div style="white-space: pre-wrap; line-height: 1.5;">${this.formatMarkdown(text)}</div>
                </div>
            `;
        } else {
            bubble.innerHTML = `
                <div class="chat-text" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-light);">
                    <div>${this.escapeHtml(text)}</div>
                </div>
                <div class="chat-avatar" style="background: var(--accent); color: #022C22;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
            `;
        }

        this.chatMessages.appendChild(bubble);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    appendLoading() {
        const id = 'msg-loading-' + Date.now();
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble ai';
        bubble.id = id;
        bubble.innerHTML = `
            <div class="chat-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="chat-text">
                <span class="pulse-dot"></span> Формирование ответа...
            </div>
        `;
        this.chatMessages.appendChild(bubble);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return id;
    }

    removeLoading(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    formatMarkdown(txt) {
        let res = this.escapeHtml(txt);
        res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return res;
    }

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
}

window.agronomistChat = new AgronomistChat();
