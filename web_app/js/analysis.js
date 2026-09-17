

class AnalysisStudio {
    constructor() {
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.previewContainer = document.getElementById('preview-container');
        this.previewImg = document.getElementById('analysis-preview-img');
        this.btnAnalyze = document.getElementById('btn-run-analysis');
        this.resultsContainer = document.getElementById('analysis-results');

        this.selectedFile = null;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (!this.dropZone) return;

        this.dropZone.addEventListener('click', () => {
            if (this.fileInput) this.fileInput.click();
        });

        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        if (this.btnAnalyze) {
            this.btnAnalyze.addEventListener('click', () => this.runAnalysis());
        }
    }

    handleFileSelect(file) {
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.previewImg) {
                this.previewImg.src = e.target.result;
                this.previewContainer.style.display = 'block';
                this.dropZone.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    resetSelection() {
        this.selectedFile = null;
        if (this.fileInput) this.fileInput.value = '';
        if (this.previewContainer) this.previewContainer.style.display = 'none';
        if (this.dropZone) this.dropZone.style.display = 'block';
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 48px 24px; color: var(--text-tertiary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: var(--text-muted);"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <h4 style="font-size: 1.05rem; color: var(--text-secondary); margin-bottom: 6px;">Снимок не выбран</h4>
                    <p style="font-size: 0.85rem;">Загрузите снимок поля или листьев выше для запуска локальной модели и классификации сорняков по регламенту «Олжа Агро».</p>
                </div>
            `;
        }
    }

    async runAnalysis() {
        if (!this.selectedFile) {
            alert("Пожалуйста, загрузите снимок поля через форму слева");
            return;
        }

        const btn = this.btnAnalyze;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="pulse-dot"></span> Локальный CV-Инференс YOLO...`;
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile, this.selectedFile.name);

            const res = await fetch('/api/cv/detect', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Ошибка обработки снимка");

            const data = await res.json();

            this.renderResults(data);

            if (data.annotated_image && this.previewImg) {
                this.previewImg.src = data.annotated_image;
            }

        } catch (e) {
            alert(`Ошибка анализа: ${e.message}`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    renderResults(data) {
        if (!this.resultsContainer) return;

        const dec = data.decision || {};
        const isCritical = dec.status === 'critical';

        const firstWeed = data.detections && data.detections.find(d => !d.is_crop);
        const phaseInfo = firstWeed ? firstWeed.phase : {
            title: "Семядоли - 2 листа",
            window_status: "ИДЕАЛЬНОЕ ОКНО",
            dose_adjustment: "+0% (Базовая норма)",
            badge_color: "#34D399",
            description: "Сорняк в начальной фазе. Оптимальное время внесения СЗР минимальной/базовой нормой."
        };

        const weeds = (data.detections || []).filter(d => !d.is_crop);
        const classAWeeds = weeds.filter(d => d.weed_class === 'A');
        const classBWeeds = weeds.filter(d => d.weed_class === 'B');

        const html = `
            <!-- 1. Decision & Economic Threshold (Point 2 of TOR) -->
            <div class="glass-card" style="margin-bottom: 18px; border-left: 5px solid ${dec.color || '#34D399'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <div style="font-size: 0.72rem; color: var(--text-tertiary); font-family: var(--font-mono); letter-spacing: 0.5px; margin-bottom: 4px;">
                            2. ЭКОНОМИЧЕСКИЙ ПОРОГ ВРЕДОНОСНОСТИ НА 1 М²
                        </div>
                        <span class="breakdown-badge" style="background: ${dec.color}22; color: ${dec.color}; border: 1px solid ${dec.color};">
                            ${dec.status_title || 'Анализ завершен'}
                        </span>
                        <h3 style="font-size: 1.3rem; font-weight: 800; margin-top: 6px; color: ${dec.color};">${dec.action || 'РЕШЕНИЕ ПРИНЯТО'}</h3>
                    </div>
                    <div style="text-align: right; font-family: var(--font-mono);">
                        <div style="font-size: 0.72rem; color: var(--text-tertiary);">CV ЗАДЕРЖКА / FPS</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--accent);">${data.latency_ms || 12} ms / ${data.fps || 60} FPS</div>
                    </div>
                </div>

                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.45;">
                    ${dec.herbicide_norm || ''}
                </p>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: var(--bg-surface-elevated); padding: 12px; border-radius: 10px; border: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 0.85rem;">
                    <div>
                        <span style="color: var(--text-tertiary); font-size: 0.72rem;">МАЛОЛЕТНИЕ:</span>
                        <div style="font-weight: 700; color: #F97316;">${data.annual_count || 0} шт (${dec.annual_count_per_m2 || 0} шт/м²)</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">Порог: $\le 5$ откл / $6-15$ норма / $>15$ макс</div>
                    </div>
                    <div>
                        <span style="color: var(--text-tertiary); font-size: 0.72rem;">МНОГОЛЕТНИКИ:</span>
                        <div style="font-weight: 700; color: ${dec.perennial_count_per_m2 >= 2 ? '#EF4444' : 'var(--text-primary)'};">${data.perennial_count || 0} шт (${dec.perennial_count_per_m2 || 0} шт/м²)</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">Порог: $\ge 2$ шт/м² СРОЧНО!</div>
                    </div>
                    <div>
                        <span style="color: var(--text-tertiary); font-size: 0.72rem;">ЭКОНОМИЯ ГЕРБИЦИДА:</span>
                        <div style="font-weight: 700; color: var(--accent); font-size: 1.15rem;">${data.herbicide_saved_pct || 0}%</div>
                        <div style="font-size: 0.7rem; color: var(--accent);">Отключение форсунок</div>
                    </div>
                </div>
            </div>

            <!-- 2. Classification Breakdown (Point 1 of TOR) -->
            <div class="glass-card" style="margin-bottom: 18px;">
                <div class="card-title">
                    <span>1. Классификация сорняков по регламенту «Олжа Агро»</span>
                    <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-tertiary);">Всего найдено: ${weeds.length} сорняков</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                    <!-- Class A (Dicot) -->
                    <div style="background: var(--bg-surface-elevated); padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(249, 115, 22, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #F97316; font-size: 0.88rem;">КЛАСС A: Двудольные (Широколистные)</strong>
                            <span style="font-family: var(--font-mono); font-size: 0.8rem; background: rgba(249, 115, 22, 0.15); color: #F97316; padding: 2px 6px; border-radius: 4px;">${classAWeeds.length} шт</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
                            • <strong>Малолетние:</strong> щирица запрокинутая, марь белая<br/>
                            • <strong>Многолетние:</strong> <span style="color: #EF4444; font-weight: 600;">бодяк полевой, осот, вьюнок</span> (самый опасный сектор!)
                        </div>
                    </div>

                    <!-- Class B (Monocot) -->
                    <div style="background: var(--bg-surface-elevated); padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #38BDF8; font-size: 0.88rem;">КЛАСС B: Злаковые (Узколистные)</strong>
                            <span style="font-family: var(--font-mono); font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38BDF8; padding: 2px 6px; border-radius: 4px;">${classBWeeds.length} шт</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
                            • <strong>Малолетние:</strong> овсюг обыкновенный, куриное просо<br/>
                            • <strong>Многолетние:</strong> пырей ползучий
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Vegetative Phase Analysis (Point 3 of TOR) -->
            <div class="glass-card" style="margin-bottom: 18px;">
                <div class="card-title">
                    <span>3. Анализ фаз развития сорняка (Агро-логика Ментора)</span>
                    <span class="breakdown-badge" style="background: ${phaseInfo.badge_color}22; color: ${phaseInfo.badge_color}; border: 1px solid ${phaseInfo.badge_color};">
                        ${phaseInfo.window_status}
                    </span>
                </div>
                <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 10px;">
                    <div style="font-size: 1.05rem; font-weight: 600;">Определенная фаза: <span style="color: ${phaseInfo.badge_color};">${phaseInfo.title}</span></div>
                </div>
                <div style="background: var(--bg-surface-elevated); border-radius: 8px; padding: 12px 14px; font-size: 0.85rem; color: var(--text-secondary); border: 1px solid var(--border-subtle); line-height: 1.5;">
                    <div><strong>Корректировка дозировки ИИ:</strong> <span style="color: var(--text-primary); font-weight: 700;">${phaseInfo.dose_adjustment}</span></div>
                    <div style="color: var(--text-tertiary); margin-top: 4px;">${phaseInfo.description || ''}</div>
                    ${phaseInfo.warning ? `<div style="color: #EF4444; font-weight: 600; margin-top: 6px;"> ${phaseInfo.warning}</div>` : ''}
                </div>
            </div>

            <!-- 4. Herbicide Recommendation (Point 1 + 2 of TOR) -->
            <div class="glass-card">
                <div class="card-title">
                    <span>Выбор типа гербицида в зависимости от класса (Северный Казахстан)</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                    <div style="background: var(--bg-surface-elevated); padding: 10px 12px; border-radius: 8px; border-left: 3px solid #F97316;">
                        <strong style="color: #F97316;">Для Класса A (Двудольные):</strong>
                        Ауксиноподобные препараты (2,4-Д эфир 0.6-0.8 л/га, Дикамба 0.15-0.2 л/га) или сульфонилмочевины (Флорасулам).
                    </div>
                    <div style="background: var(--bg-surface-elevated); padding: 10px 12px; border-radius: 8px; border-left: 3px solid #38BDF8;">
                        <strong style="color: #38BDF8;">Для Класса B (Злаковые):</strong>
                        Селективные граминициды по вегетирующей культуре (Пиноксаден / Аксиал 0.7-1.0 л/га, Клодинафоп-пропаргил). При пырее ползучем - глифосат по стерне.
                    </div>
                    ${isCritical ? `
                    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--red); padding: 10px 12px; border-radius: 8px; color: #FCA5A5;">
                        <strong>КРИТИЧЕСКИЙ ОЧАГ МНОГОЛЕТНИКОВ:</strong> Плотность $\ge 2$ шт/м²! Срочно внести баковую смесь системных гербицидов повышенной дозировки в фазе розетки до стеблевания.
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.resultsContainer.innerHTML = html;
    }
}

window.analysisStudio = new AnalysisStudio();
