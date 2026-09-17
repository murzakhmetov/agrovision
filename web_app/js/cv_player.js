

class CvPlayer {
    constructor() {
        this.streamImg = document.getElementById('stream-img');
        this.hudSpeed = document.getElementById('hud-speed');
        this.hudDecisionBox = document.getElementById('hud-decision-box');
        this.hudDecisionTitle = document.getElementById('hud-decision-title');
        this.hudDecisionAction = document.getElementById('hud-decision-action');
        this.hudDecisionNorm = document.getElementById('hud-decision-norm');
        this.nozzlesTrack = document.getElementById('nozzles-track');
        this.telemSpeedHeader = document.getElementById('header-speed');
        this.telemSavedHeader = document.getElementById('header-saved');

        this.hudFps = document.getElementById('hud-fps');
        this.hudLatency = document.getElementById('hud-latency');
        this.hudClassA = document.getElementById('hud-class-a');
        this.hudClassB = document.getElementById('hud-class-b');
        this.hudAnnual = document.getElementById('hud-annual');
        this.hudPerennial = document.getElementById('hud-perennial');

        this.btnUpload = document.getElementById('btn-upload-video');
        this.fileInput = document.getElementById('video-file-input');
        this.btnCam = document.getElementById('btn-source-cam');
        this.btnClear = document.getElementById('btn-clear-video');
        this.videoNameSpan = document.getElementById('active-video-name');

        this.telemetryTimer = null;
        this.currentSource = 'none';
    }

    init() {
        this.bindEvents();
        this.startStream();
        this.startTelemetryPolling();
    }

    bindEvents() {
        if (this.btnUpload && this.fileInput) {
            this.btnUpload.addEventListener('click', () => this.fileInput.click());
            this.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.uploadVideo(e.target.files[0]);
                }
            });
        }

        if (this.btnCam) {
            this.btnCam.addEventListener('click', () => this.activateWebcam());
        }

        if (this.btnClear) {
            this.btnClear.addEventListener('click', () => this.clearVideo());
        }
    }

    async uploadVideo(file) {
        if (!file) return;

        const originalText = this.btnUpload.innerHTML;
        this.btnUpload.innerHTML = `<span class="pulse-dot"></span> Загрузка видео...`;
        this.btnUpload.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch('/api/cv/upload-video', {
                method: 'POST',
                body: formData
            });

            if (!resp.ok) throw new Error('Ошибка загрузки видеофайла');

            const data = await resp.json();
            this.currentSource = 'video';

            if (this.videoNameSpan) {
                this.videoNameSpan.textContent = file.name;
                this.videoNameSpan.style.color = 'var(--accent)';
            }
            if (this.btnClear) this.btnClear.style.display = 'inline-block';
            if (this.btnUpload) this.btnUpload.classList.add('active');
            if (this.btnCam) this.btnCam.classList.remove('active');

            this.startStream();

        } catch (e) {
            alert('Не удалось загрузить видео: ' + e.message);
        } finally {
            this.btnUpload.innerHTML = originalText;
            this.btnUpload.disabled = false;
        }
    }

    async activateWebcam() {
        const formData = new FormData();
        formData.append('source_type', 'webcam');

        try {
            await fetch('/api/cv/switch-source', {
                method: 'POST',
                body: formData
            });

            this.currentSource = 'webcam';
            if (this.videoNameSpan) {
                this.videoNameSpan.textContent = 'Веб-камера ПК (Активна)';
                this.videoNameSpan.style.color = 'var(--cyan)';
            }
            if (this.btnCam) this.btnCam.classList.add('active');
            if (this.btnUpload) this.btnUpload.classList.remove('active');
            if (this.btnClear) this.btnClear.style.display = 'inline-block';

            this.startStream();
        } catch (e) {
            console.error('Webcam switch error:', e);
        }
    }

    async clearVideo() {
        try {
            await fetch('/api/cv/clear-video', { method: 'POST' });
            this.currentSource = 'none';

            if (this.videoNameSpan) {
                this.videoNameSpan.textContent = 'Видео не загружено';
                this.videoNameSpan.style.color = 'var(--text-tertiary)';
            }
            if (this.btnClear) this.btnClear.style.display = 'none';
            if (this.btnUpload) this.btnUpload.classList.remove('active');
            if (this.btnCam) this.btnCam.classList.remove('active');

            this.startStream();
        } catch (e) {
            console.error('Clear video error:', e);
        }
    }

    startStream() {
        if (this.streamImg) {
            this.streamImg.src = `/api/cv/stream?t=${Date.now()}`;
            this.streamImg.onerror = () => {
                setTimeout(() => {
                    if (this.streamImg) this.streamImg.src = `/api/cv/stream?t=${Date.now()}`;
                }, 2000);
            };
        }
    }

    startTelemetryPolling() {
        this.pollTelemetry();
        this.telemetryTimer = setInterval(() => this.pollTelemetry(), 500);
    }

    async pollTelemetry() {
        try {
            const resp = await fetch('/api/telemetry');
            if (!resp.ok) return;
            const data = await resp.json();
            this.updateHud(data);
        } catch (e) {
            
        }
    }

    updateHud(data) {
        const speed = data.speed_kmh || 0.0;
        const savedPct = data.herbicide_saved_pct || 100.0;

        if (this.hudSpeed) this.hudSpeed.textContent = `${speed} км/ч`;
        if (this.telemSpeedHeader) this.telemSpeedHeader.textContent = `${speed} км/ч`;
        if (this.telemSavedHeader) this.telemSavedHeader.textContent = `${savedPct}%`;

        if (this.hudFps) this.hudFps.textContent = `${data.fps || 0} FPS`;
        if (this.hudLatency) this.hudLatency.textContent = `${data.latency_ms || 0} ms`;
        if (this.hudClassA) this.hudClassA.textContent = `${data.class_a_count || 0} шт`;
        if (this.hudClassB) this.hudClassB.textContent = `${data.class_b_count || 0} шт`;
        if (this.hudAnnual) this.hudAnnual.textContent = `${data.annual_count || 0} шт`;
        if (this.hudPerennial) this.hudPerennial.textContent = `${data.perennial_count || 0} шт`;

        const dec = data.decision || {};
        if (this.hudDecisionBox) {
            if (speed === 0.0) {
                this.hudDecisionBox.className = 'hud-decision-box low';
                if (this.hudDecisionTitle) this.hudDecisionTitle.textContent = 'Режим ожидания';
                if (this.hudDecisionAction) this.hudDecisionAction.textContent = 'ЗАГРУЗИТЕ ВИДЕОЗАПИСЬ С КАМЕРЫ';
                if (this.hudDecisionNorm) this.hudDecisionNorm.textContent = 'Опрыскиватель в режиме ожидания. Форсунки выключены.';
            } else {
                this.hudDecisionBox.className = `hud-decision-box ${dec.status || 'low'}`;
                if (this.hudDecisionTitle) this.hudDecisionTitle.textContent = dec.status_title || 'Слабая засоренность';
                if (this.hudDecisionAction) this.hudDecisionAction.textContent = dec.action || 'НЕ ОПРЫСКИВАТЬ';
                if (this.hudDecisionNorm) this.hudDecisionNorm.textContent = `Норма: ${dec.herbicide_norm || 'Выключено'}`;
            }
        }

        this.renderNozzles(data.active_nozzles || [], speed > 0);
    }

    renderNozzles(nozzles, isMoving) {
        if (!this.nozzlesTrack) return;
        
        let html = '';
        for (let i = 0; i < 8; i++) {
            const n = nozzles[i] || { section_id: i + 1, active: false, weed_count: 0 };
            const isActive = isMoving && n.active;
            const isCritical = n.weed_count >= 2;

            html += `
                <div class="nozzle-card ${isActive ? 'active' : ''} ${isCritical ? 'critical' : ''}">
                    <span class="nozzle-num">S${i + 1}</span>
                    <div class="valve-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="9"/>
                            ${isActive ? '<circle cx="12" cy="12" r="3" fill="currentColor"/>' : ''}
                        </svg>
                    </div>
                    <div class="spray-cone"></div>
                    <span class="nozzle-status-text">${isActive ? 'ON' : 'OFF'}</span>
                </div>
            `;
        }

        this.nozzlesTrack.innerHTML = html;
    }
}

window.cvPlayer = new CvPlayer();
