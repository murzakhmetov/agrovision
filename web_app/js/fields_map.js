class FieldsManager {
    constructor() {
        this.fields = [];
        this.mapContainer = document.getElementById('field-map-svg');
        this.fieldsListContainer = document.getElementById('fields-list');
        this.dashFieldsCount = document.getElementById('dash-fields-count');
        this.dashTotalArea = document.getElementById('dash-total-area');
        this.dashSavedChem = document.getElementById('dash-saved-chem');
        this.dashSavedMoney = document.getElementById('dash-saved-money');

        this.modal = document.getElementById('add-field-modal');
        this.btnAddField = document.getElementById('btn-add-field');
        this.btnCloseModal = document.getElementById('btn-close-field-modal');
        this.form = document.getElementById('add-field-form');
    }

    init() {
        this.bindEvents();
        this.loadFields();
    }

    bindEvents() {
        if (this.btnAddField && this.modal) {
            this.btnAddField.addEventListener('click', () => {
                this.modal.classList.add('open');
            });
        }

        if (this.btnCloseModal && this.modal) {
            this.btnCloseModal.addEventListener('click', () => {
                this.modal.classList.remove('open');
            });
        }

        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitNewField();
            });
        }
    }

    async loadFields() {
        try {
            const resp = await fetch('/api/fields');
            if (!resp.ok) return;
            const data = await resp.json();
            this.fields = data.fields || [];
            this.renderMap();
            this.renderList();
            this.updateStats(data);
        } catch (e) {
            console.error(e);
        }
    }

    async submitNewField() {
        const nameInput = document.getElementById('new-fld-name');
        const locInput = document.getElementById('new-fld-loc');
        const areaInput = document.getElementById('new-fld-area');
        const cropInput = document.getElementById('new-fld-crop');

        if (!nameInput || !areaInput) return;

        const payload = {
            name: nameInput.value,
            location: locInput.value || "Костанайская обл.",
            area_ha: parseFloat(areaInput.value) || 50.0,
            crop: cropInput.value || "Яровая пшеница"
        };

        try {
            const resp = await fetch('/api/fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) throw new Error("Ошибка сохранения");

            if (this.modal) this.modal.classList.remove('open');
            this.form.reset();
            this.loadFields();
        } catch (e) {
            alert("Не удалось добавить поле: " + e.message);
        }
    }

    updateStats(data) {
        const total = data.total_area_ha || 0;
        const count = data.total_fields || 0;

        if (this.dashFieldsCount) this.dashFieldsCount.textContent = `${count} участков`;
        if (this.dashTotalArea) this.dashTotalArea.textContent = `${total} га`;

        const savedPct = 74.5;
        const totalMoney = Math.round(total * 4500 * (savedPct / 100));

        if (this.dashSavedChem) this.dashSavedChem.textContent = `${savedPct}%`;
        if (this.dashSavedMoney) this.dashSavedMoney.textContent = `${totalMoney.toLocaleString('ru-RU')} ₸`;
    }

    renderMap() {
        if (!this.mapContainer) return;

        let polygons = '';
        const baseColors = ['#34D399', '#38BDF8', '#FBBF24', '#A855F7', '#10B981'];

        this.fields.forEach((fld, idx) => {
            const color = baseColors[idx % baseColors.length];
            const x = 50 + (idx % 3) * 190 + (idx * 15);
            const y = 60 + Math.floor(idx / 3) * 160 + (idx * 10);
            const w = 150;
            const h = 110;

            polygons += `
                <g class="field-polygon-group" style="cursor: pointer;" onclick="fieldsManager.selectField('${fld.id}')">
                    <polygon points="${x},${y} ${x + w + 20},${y + 10} ${x + w - 10},${y + h} ${x + 10},${y + h - 15}"
                             fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="2" />
                    <text x="${x + w/2}" y="${y + h/2}" fill="#F5F5F5" font-size="12" font-weight="600" text-anchor="middle" font-family="var(--font-sans)">
                        ${fld.name}
                    </text>
                    <text x="${x + w/2}" y="${y + h/2 + 16}" fill="${color}" font-size="10" font-family="var(--font-mono)" text-anchor="middle">
                        ${fld.area_ha} га | NDVI ${fld.ndvi}
                    </text>
                </g>
            `;
        });

        const svg = `
            <svg viewBox="0 0 700 440" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background: #080A0C; border-radius: 12px;">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <text x="20" y="30" fill="var(--text-tertiary)" font-size="11" font-family="var(--font-mono)">КАРТОГРАФИЯ ПОЛЕЙ: КОСТАНАЙСКАЯ ОБЛАСТЬ (NDVI)</text>
                ${polygons}
            </svg>
        `;

        this.mapContainer.innerHTML = svg;
    }

    renderList() {
        if (!this.fieldsListContainer) return;

        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        this.fields.forEach(fld => {
            html += `
                <div class="glass-card" style="padding: 14px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${fld.name}</h4>
                        <span class="breakdown-badge" style="background: rgba(52, 211, 153, 0.15); color: var(--accent); border: 1px solid var(--border-accent);">
                            NDVI ${fld.ndvi}
                        </span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
                        Культура: <strong style="color: var(--text-primary);">${fld.crop}</strong><br/>
                        Площадь: ${fld.area_ha} га | Локация: ${fld.location}<br/>
                        Засоренность: <span style="color: #FBBF24;">${fld.weed_status} (${fld.weeds_count_m2} шт/м2)</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.fieldsListContainer.innerHTML = html;
    }

    selectField(id) {
        const found = this.fields.find(f => f.id === id);
        if (found) {
            alert(`Выбран участок: ${found.name} (${found.area_ha} га, ${found.crop})`);
        }
    }
}

window.fieldsManager = new FieldsManager();
