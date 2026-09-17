const translations = {
    ru: {
        app_title: "AgroVision AI - Бортовая Веб-Система Опрыскивания",
        sys_status_offline: "OFFLINE БОРТОВОЙ РЕЖИМ",
        sys_status_online: "ONLINE ОБЛАЧНЫЙ РЕЖИМ",
        sys_region: "КОСТАНАЙСКАЯ ОБЛ.",
        speed_label: "СКОРОСТЬ",
        boom_label: "ШТАНГА 24М",
        saved_label: "СЭКОНОМЛЕНО",
        mode_btn_offline: "РЕЖИМ: OFFLINE",
        mode_btn_online: "РЕЖИМ: ONLINE",
        
        nav_dashboard: "Обзор и Дашборд",
        nav_monitoring: "Бортовой Мониторинг (18-20 км/ч)",
        nav_analysis: "AI Анализ Сорняков",
        nav_fields: "Поля и Картография (GIS)",
        nav_chat: "Агроном-Ассистент",
        nav_settings: "Настройки Оборудования",
        nav_guidelines: "Регламент ТЗ (Олжа Агро)",

        db_title: "Панель Управления Хозяйством",
        db_subtitle: "Интеллектуальный мониторинг и дифференцированное внесение СЗР",
        db_weather_title: "Метеоусловия (Костанайская обл.)",
        db_weather_suit: "ОКНО ОПРЫСКИВАНИЯ ОТКРЫТО",
        db_sprayer_ready: "Опрыскиватель готов к работе на скорости 18-20 км/ч",
        stat_fields: "Активных полей",
        stat_area: "Общая площадь",
        stat_saved_chem: "Сэкономлено гербицида",
        stat_saved_money: "Экономический эффект",

        mon_title: "Бортовой Компьютер Опрыскивателя (18-20 км/ч)",
        mon_subtitle: "Мгновенный локальный CV-инференс и точечное управление 8 секциями штанги (100% OFFLINE)",
        mon_upload_video: "Загрузить видео опрыскивателя",
        mon_source_cam: "Веб-камера ПК",
        mon_clear_video: "Очистить видео",
        mon_sections_title: "Секции распыла штанги (24 метра / 8 клапанов)",

        an_title: "Инспекция Фотографий и Расчет Дозировок по ТЗ",
        an_subtitle: "Локальный инференс YOLO + агро-логика ментора Олжа Агро (Класс А/В, фазы, экономический порог)",
        an_drop_title: "Перетащите снимок поля или выберите файл",
        an_drop_hint: "Поддерживаются форматы JPG, PNG, WebP (кадры с дрона или камеры опрыскивателя)",
        an_analyze_btn: "Запустить Локальный CV-Анализ",

        fld_title: "Картография и Состояние Полей",
        fld_subtitle: "Спутниковый NDVI-мониторинг и очаги засоренности (Костанай)",
        fld_add_btn: "+ Добавить поле",

        chat_title: "Агроном-Эксперт Олжа Агро",
        chat_subtitle: "Экспертная база знаний регламентов защиты растений",
        chat_placeholder: "Задайте вопрос по сорнякам, фазам, дозировкам или регламентам...",
        chat_send: "Отправить",

        set_title: "Конфигурация Оборудования и Системы",
        set_sprayer_title: "Параметры штангового опрыскивателя",
        set_speed_target: "Рабочая скорость",
        set_boom_width: "Ширина штанги",
        set_region_title: "Регион возделывания",

        guide_title: "Регламент Технического Задания (Олжа Агро)",
        guide_subtitle: "Официальные критерии агрономической службы и логика принятия решений бортового компьютера"
    },

    en: {
        app_title: "AgroVision AI - Desktop Sprayer System",
        sys_status_offline: "OFFLINE ON-BOARD MODE",
        sys_status_online: "ONLINE CLOUD MODE",
        sys_region: "KOSTANAY REGION",
        speed_label: "SPEED",
        boom_label: "BOOM 24M",
        saved_label: "SAVED",
        mode_btn_offline: "MODE: OFFLINE",
        mode_btn_online: "MODE: ONLINE",

        nav_dashboard: "Dashboard Overview",
        nav_monitoring: "On-Board Terminal (18-20 km/h)",
        nav_analysis: "AI Weed Analysis",
        nav_fields: "Fields & GIS Map",
        nav_chat: "AI Agronomist",
        nav_settings: "Hardware Settings",
        nav_guidelines: "Mentor Specifications",

        db_title: "Farm Management Dashboard",
        db_subtitle: "Precision spraying telemetry and intelligent weed management",
        db_weather_title: "Weather Telemetry (Kostanay Region)",
        db_weather_suit: "SPRAYING WINDOW OPEN",
        db_sprayer_ready: "Sprayer is ready for operation at 18-20 km/h",
        stat_fields: "Active Fields",
        stat_area: "Total Area",
        stat_saved_chem: "Herbicide Saved",
        stat_saved_money: "Economic Impact",

        mon_title: "On-Board Sprayer Terminal (18-20 km/h)",
        mon_subtitle: "Real-time edge CV inference and targeted 8-section boom control (100% OFFLINE)",
        mon_upload_video: "Upload Sprayer Video",
        mon_source_cam: "PC Webcam",
        mon_clear_video: "Clear Video",
        mon_sections_title: "Boom Spray Sections (24 meters / 8 valves)",

        an_title: "Photo Inspection & Agronomic Dosage Studio",
        an_subtitle: "Local YOLO inference + Olzha Agro Mentor algorithm (Class A/B, phases, economic threshold)",
        an_drop_title: "Drag & drop field photo or browse file",
        an_drop_hint: "Supports JPG, PNG, WebP (sprayer camera or drone aerial captures)",
        an_analyze_btn: "Run Local CV Analysis",

        fld_title: "Field Cartography & Health",
        fld_subtitle: "Satellite NDVI vegetation & weed patch mapping (Kostanay)",
        fld_add_btn: "+ Add Field",

        chat_title: "Olzha Agro Expert Agronomist",
        chat_subtitle: "Plant protection agronomic expert system",
        chat_placeholder: "Ask about weed species, phases, dosages, or Kostanay rules...",
        chat_send: "Send",

        set_title: "Hardware & System Configuration",
        set_sprayer_title: "Field Sprayer Parameters",
        set_speed_target: "Working Speed",
        set_boom_width: "Boom Width",
        set_region_title: "Agricultural Region",

        guide_title: "Mentor Technical Specification (Olzha Agro)",
        guide_subtitle: "Official agronomic criteria and decision-making logic of the on-board sprayer computer"
    },

    kk: {
        app_title: "AgroVision AI - Борттық Веб Бүрку Жүйесі",
        sys_status_offline: "ДЕРБЕС OFFLINE РЕЖИМІ",
        sys_status_online: "БҰЛТТЫ ONLINE РЕЖИМІ",
        sys_region: "ҚОСТАНАЙ ОБЛЫСЫ",
        speed_label: "ЖЫЛДАМДЫҚ",
        boom_label: "ҚАРМАҚ 24М",
        saved_label: "ҮНЕМДЕЛДІ",
        mode_btn_offline: "РЕЖИМ: OFFLINE",
        mode_btn_online: "РЕЖИМ: ONLINE",

        nav_dashboard: "Бақылау Тақтасы",
        nav_monitoring: "Борттық Компьютер (18-20 км/сағ)",
        nav_analysis: "AI Арамшөп Талдауы",
        nav_fields: "Егістік Картасы (GIS)",
        nav_chat: "Агроном Кеңесші",
        nav_settings: "Жүйе Баптаулары",
        nav_guidelines: "ТЗ Регламенті (Олжа Агро)",

        db_title: "Шаруашылықты Басқару Панелі",
        db_subtitle: "Нақты егіншілік және гербицидтерді нүктелік шашу",
        db_weather_title: "Ауа-райы деректері (Қостанай облысы)",
        db_weather_suit: "БҮРКУГЕ ҚОЛАЙЛЫ УАҚЫТ",
        db_sprayer_ready: "Бүріккіш 18-20 км/сағ жылдамдықта жұмысқа дайын",
        stat_fields: "Белсенді алқап",
        stat_area: "Жалпы көлемі",
        stat_saved_chem: "Үнемделген гербицид",
        stat_saved_money: "Экономикалық тиімділік",

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
        an_analyze_btn: "Жергілікті CV Талдауды Қосу",

        fld_title: "Егістік Картасы және Жағдайы",
        fld_subtitle: "Спутниктік NDVI бақылау және ластану ошақтары (Қостанай)",
        fld_add_btn: "+ Жаңа алқап қосу",

        chat_title: "Олжа Агро Сарапшы Агрономы",
        chat_subtitle: "Өсімдіктерді қорғау регламенттерінің білім қоры",
        chat_placeholder: "Арамшөптер, нормалар немесе өңдеу туралы сұраңыз...",
        chat_send: "Жіберу",

        set_title: "Жабдық пен Жүйені Баптау",
        set_sprayer_title: "Бүріккіш агрегатының параметрлері",
        set_speed_target: "Жұмыс жылдамдығы",
        set_boom_width: "Қармақ ені",
        set_region_title: "Егіншілік аймағы",

        guide_title: "Техникалық Тапсырма Регламенті (Олжа Агро)",
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
