
const translations = {
    ru: {
        app_title: "AgroVision AI - Бортовая Веб-Система Опрыскивания",
        sys_status: "OFFLINE БОРТОВОЙ РЕЖИМ",
        sys_region: "КОСТАНАЙСКАЯ ОБЛ. (БЕЗ СЕТИ)",
        speed_label: "СКОРОСТЬ",
        boom_label: "ШТАНГА 24М",
        saved_label: "СЭКОНОМЛЕНО",

        nav_monitoring: "Бортовой Компьютер (18-20 км/ч)",
        nav_analysis: "Инспекция Фото (Агро-расчет)",
        nav_guidelines: "Регламент ТЗ («Олжа Агро»)",

        mon_title: "Бортовой Компьютер Опрыскивателя (18-20 км/ч)",
        mon_subtitle: "Мгновенный локальный CV-инференс и точечное управление 8 секциями штанги (100% OFFLINE)",
        mon_upload_video: "Загрузить видео опрыскивателя",
        mon_source_cam: "Веб-камера ПК",
        mon_clear_video: "Очистить видео",
        mon_sections_title: "Секции распыла штанги (24 метра / 8 клапанов)",

        an_title: "Инспекция Фотографий и Расчет Дозировок по ТЗ",
        an_subtitle: "Локальный инференс YOLO + агро-логика ментора «Олжа Агро» (Класс А/В, фазы, экономический порог)",
        an_drop_title: "Перетащите снимок поля или выберите файл",
        an_drop_hint: "Поддерживаются форматы JPG, PNG, WebP (кадры с дрона или камеры опрыскивателя)",
        an_analyze_btn: "Запустить Локальный CV-Анализ (OFFLINE)",

        guide_title: "Регламент Технического Задания («Олжа Агро»)",
        guide_subtitle: "Официальные критерии агрономической службы и логика принятия решений бортового компьютера"
    },

    en: {
        app_title: "AgroVision AI - On-Board Sprayer Desktop System",
        sys_status: "OFFLINE ON-BOARD MODE",
        sys_region: "KOSTANAY REGION (NO INTERNET)",
        speed_label: "SPEED",
        boom_label: "BOOM 24M",
        saved_label: "SAVED",

        nav_monitoring: "On-Board Terminal (18-20 km/h)",
        nav_analysis: "Photo Inspection (TOR Logic)",
        nav_guidelines: "Mentor TOR Specifications",

        mon_title: "On-Board Sprayer Terminal (18-20 km/h)",
        mon_subtitle: "Real-time local edge CV inference and targeted 8-section boom control (100% OFFLINE)",
        mon_upload_video: "Upload Sprayer Video",
        mon_source_cam: "PC Webcam",
        mon_clear_video: "Clear Video",
        mon_sections_title: "Boom Spray Sections (24 meters / 8 valves)",

        an_title: "Photo Inspection & Agronomic Dosage Studio",
        an_subtitle: "Local YOLO inference + Olzha Agro Mentor algorithm (Class A/B, phases, economic threshold)",
        an_drop_title: "Drag & drop field photo or browse file",
        an_drop_hint: "Supports JPG, PNG, WebP (sprayer camera or drone aerial captures)",
        an_analyze_btn: "Run Local CV Analysis (OFFLINE)",

        guide_title: "Mentor Technical Specification («Olzha Agro»)",
        guide_subtitle: "Official agronomic criteria and decision-making logic of the on-board sprayer computer"
    },

    kk: {
        app_title: "AgroVision AI - Борттық Веб Бүрку Жүйесі",
        sys_status: "ДЕРБЕС OFFLINE РЕЖИМІ",
        sys_region: "ҚОСТАНАЙ ОБЛЫСЫ (ЖЕЛІСІЗ)",
        speed_label: "ЖЫЛДАМДЫҚ",
        boom_label: "ҚАРМАҚ 24М",
        saved_label: "ҮНЕМДЕЛДІ",

        nav_monitoring: "Борттық Компьютер (18-20 км/сағ)",
        nav_analysis: "Фото Инспекция (ТЗ бойынша)",
        nav_guidelines: "ТЗ Регламенті («Олжа Агро»)",

        mon_title: "Борттық Компьютер Терминалы (18-20 км/сағ)",
        mon_subtitle: "Нақты уақыттағы компьютерлік көру және 8 секцияны нүктелік басқару (100% ДЕРБЕС)",
        mon_upload_video: "Бүріккіш бейнесін жүктеу",
        mon_source_cam: "ДК веб-камерасы",
        mon_clear_video: "Бейнені өшіру",
        mon_sections_title: "Бүрку секциялары (24 метр / 8 клапан)",

        an_title: "Суреттерді Инспекциялау және Мөлшерді Есептеу",
        an_subtitle: "Жергілікті YOLO моделі + Ментордың агро-логикасы (А/В класы, кезеңдер, зияндылық шегі)",
        an_drop_title: "Суретті осында сүйреңіз немесе файлды таңдаңыз",
        an_drop_hint: "JPG, PNG, WebP форматтары (дрон немесе бүріккіш камерасы түсірілімдері)",
        an_analyze_btn: "Жергілікті CV Талдауды Қосу (OFFLINE)",

        guide_title: "Техникалық Тапсырма Регламенті («Олжа Агро»)",
        guide_subtitle: "Агрономия қызметінің ресми критерийлері және борттық компьютердің шешім қабылдау логикасы"
    }
};

let currentLang = 'ru';

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations['ru'][key] || key;
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('agrovision_lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        el.textContent = t(k);
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const k = el.getAttribute('data-i18n-ph');
        el.placeholder = t(k);
    });
}
