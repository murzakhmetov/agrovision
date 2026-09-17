const translations = {
    ru: {
        nav_process: "Архитектура ТЗ",
        nav_demo: "Видеодемо",
        nav_hardware: "Оборудование",
        nav_software: "Интерфейс ПК",
        nav_guide: "Регламент",
        nav_launch: "Открыть систему",

        hero_badge: "100% OFFLINE НА БОРТУ | 18-20 КМ/Ч",
        hero_title1: "Точное опрыскивание.",
        hero_title2: "Экономия 60-80% СЗР.",
        hero_desc: "Бортовой компьютер для самоходных опрыскивателей по регламенту Олжа Агро. Локальный инференс YOLO на скорости 18-20 км/ч, детекция сорняков Классов A и B, экономический порог вредоносности на 1 м2 и быстродействующее PWM-управление 8 секциями штанги 24 метра.",
        hero_btn_app: "Запустить терминал",
        hero_btn_arch: "Регламент ТЗ",

        stat1_num: "18-20 км/ч",
        stat1_label: "Рабочая скорость в поле",
        stat2_num: "11-13 мс",
        stat2_label: "Время отклика YOLO (50-60 FPS)",
        stat3_num: "60-80%",
        stat3_label: "Экономия гербицидов",
        stat4_num: "100% OFFLINE",
        stat4_label: "Автономность без интернета",

        proc_badge: "Регламент ТЗ Олжа Агро",
        proc_title: "Логика принятия решений бортового компьютера",
        proc_desc: "Строгое соответствие 4 блокам агрономического регламента Северного Казахстана.",
        
        proc_step1_title: "Локальный инференс YOLO",
        proc_step1_desc: "Модели YOLOv8s CropAndWeed и YOLO11n Broadleaf работают прямо на бортовом ПК без интернета с временем отклика 11-13 мс на скорости 18-20 км/ч.",
        
        proc_step2_title: "Классификация Класс A vs B",
        proc_step2_desc: "Разделение сорняков на двудольные (Класс A: щирица, марь, бодяк, осот, вьюнок) и злаковые (Класс B: овсюг, просо, пырей) для раздельного подбора действующих веществ.",
        
        proc_step3_title: "Порог вредоносности на 1 м2",
        proc_step3_desc: "До 5 малолетних сорняков на 1 м2 - форсунки выключены (100% экономия). 6-15 шт/м2 - норма. Более 15 шт/м2 - максимум (+25%). От 2 многолетников - критическая опасность и срочная обработка.",

        proc_step4_title: "Точечный PWM распыл",
        proc_step4_desc: "Быстродействующие клапаны независимо управляют 8 секциями штанги 24м, исключая сплошной перерасход и химические ожоги культуры.",

        demo_badge: "Бортовой мониторинг в поле",
        demo_title: "Система AgroVision AI в реальной работе",
        demo_desc: "Видеодемонстрация работы терминала опрыскивателя на скорости 18-20 км/ч с визуализацией 8 секций штанги.",

        hw_badge: "Аппаратный комплекс",
        hw_title: "Оборудование для полевых условий",
        hw_desc: "Надежная инженерия для работы в условиях степей Костанайской области.",

        hw1_badge: "Метеостанция и штанга 24м",
        hw1_card_num: "Модуль 01",
        hw1_title: "Метеостанция и бортовой блок",
        hw1_desc: "Полевая метеостанция для фиксации благоприятного окна опрыскивания (ветер до 5 м/с, температура +12...+22 C) и вычислительный блок с инжекторными форсунками IDTA 120-03 для защиты от ветрового сноса.",
        hw1_tag1: "Окно опрыскивания",
        hw1_tag2: "IDTA 120-03",
        hw1_tag3: "Штанга 24м (8 секций)",

        hw2_badge: "Агро-дрон Sentinel",
        hw2_card_num: "Модуль 02",
        hw2_title: "Аэроразведка полей и БПЛА",
        hw2_desc: "Мультиспектральные агро-дроны для предварительного картирования полей, построения карт вегетационного индекса NDVI и выявления очагов многолетников перед выездом опрыскивателя.",
        hw2_tag1: "Мультиспектральная камера",
        hw2_tag2: "Картирование NDVI",
        hw2_tag3: "Поиск очагов сорняков",
        hw2_tag4: "Автономные полеты",

        sw_badge: "Интерфейс ПК",
        sw_title: "Полнофункциональный софт агронома",
        sw_desc: "Весь функционал бортового компьютера опрыскивателя в едином веб-терминале.",

        sw1_title: "Бортовой монитор (18-20 км/ч)",
        sw1_desc: "Видеопоток штанги в реальном времени, прицел детекции, визуализатор 8 секций распыла (S1-S8), счетчики Класса A/B и расчет экономии СЗР.",

        sw2_title: "Инспекция фото и расчет по ТЗ",
        sw2_desc: "Локальный инференс по фотоснимкам поля, порог вредоносности на 1 м2, определение фазы развития и автоматическая корректировка дозировки.",

        sw3_title: "Выбор гербицидов по классам",
        sw3_desc: "Официальные рекомендации препаратов: ауксиноподобные 2,4-Д и дикамба для Класса A, селективные граминициды для Класса B, глифосат по стерне при пырее.",

        sw4_title: "Агроном-Эксперт (Офлайн + Gemini 3.1 Flash Lite)",
        sw4_desc: "Автономная база знаний для работы без связи и облачная модель Google Gemini 3.1 Flash Lite с предустановленным API-ключом при наличии сети.",

        sw5_title: "Официальный регламент ТЗ ментора",
        sw5_desc: "Интерактивный экран со всеми 4 блоками регламента агрономической службы Олжа Агро.",

        sw6_title: "Конфигурация опрыскивателя",
        sw6_desc: "Калибровка рабочей скорости (18-20 км/ч), ширины захвата штанги (24 метра), распылителей и региона возделывания.",

        cta_title: "Запустите AgroVision AI прямо сейчас",
        cta_desc: "Запуск в 1 клик через AgroVision.exe для Windows или start_pc_system.sh для Linux/macOS. 100% бесплатно и автономно.",
        cta_btn_get: "Открыть систему (localhost:8000)",
        cta_btn_sales: "GitHub Репозиторий",

        footer_tagline: "Бортовой компьютер опрыскивателя по регламенту агрономической службы Олжа Агро.",
        footer_status: "Система готова к работе в поле | 18-20 км/ч | 100% OFFLINE",
        footer_copy: "2026 AgroVision AI. Все права защищены.",
        footer_legal1: "Регламент ТЗ",
        footer_legal2: "Олжа Агро",
        footer_legal3: "Оффлайн борт",

        footer_col1_title: "Платформа",
        footer_col1_1: "Бортовой ПК",
        footer_col1_2: "Оборудование",
        footer_col1_3: "Интерфейс",

        footer_col2_title: "Оборудование",
        footer_col2_1: "Агро-дрон БПЛА",
        footer_col2_2: "Метеостанция",
        footer_col2_3: "Штанга 24 метра",

        footer_col3_title: "Ресурсы",
        footer_col3_1: "GitHub Репозиторий",
        footer_col3_2: "Документация README",
        footer_col3_3: "Запуск в 1 клик"
    },

    kk: {
        nav_process: "Сәулеті",
        nav_demo: "Бейнедемо",
        nav_hardware: "Жабдықтар",
        nav_software: "Интерфейс",
        nav_guide: "Регламент",
        nav_launch: "Жүйені ашу",

        hero_badge: "100% OFFLINE БОРТТА | 18-20 КМ/САҒ",
        hero_title1: "Дәл бүрку жүйесі.",
        hero_title2: "60-80% химия үнемі.",
        hero_desc: "Олжа Агро талаптары бойынша өздігінен жүретін бүріккіштерге арналған борттық компьютер. 18-20 км/сағ жылдамдықта YOLO локалды талдауы, А және В кластарын анықтау, 1 м2 жердегі зияндылық шегі және 24 метрлік қарнақтың 8 секциясын басқару.",
        hero_btn_app: "Терминалды ашу",
        hero_btn_arch: "Регламентті көру",

        stat1_num: "18-20 км/сағ",
        stat1_label: "Даладағы жұмыс жылдамдығы",
        stat2_num: "11-13 мс",
        stat2_label: "YOLO жауап беру уақыты",
        stat3_num: "60-80%",
        stat3_label: "Гербицидтерді үнемдеу",
        stat4_num: "100% OFFLINE",
        stat4_label: "Интернетсіз автономия",

        proc_badge: "Олжа Агро регламенті",
        proc_title: "Борттық компьютердің шешім қабылдау логикасы",
        proc_desc: "Солтүстік Қазақстанның 4 агрономиялық талабына толық сәйкестік.",
        
        proc_step1_title: "Локалды YOLO талдауы",
        proc_step1_desc: "YOLOv8s CropAndWeed және YOLO11n Broadleaf кабиналық компьютерде интернетсіз жұмыс істейді, 20 км/сағ жылдамдықта 11-13 мс ішінде өңдейді.",
        
        proc_step2_title: "А және В кластарын жіктеу",
        proc_step2_desc: "Арамшөптерді қосжарнақты (А класы: ақбас, алабұта, қалуен, шырмауық) және астық тұқымдас (В класы: қара сұлы, тары, бидайық) деп бөлу.",
        
        proc_step3_title: "1 м2 жердегі зияндылық шегі",
        proc_step3_desc: "5 данаға дейін - бүріккіштер жабық (100% үнем). 6-15 дана - стандартты норма. 15-тен көп - максимум (+25%). 2 көпжылдықтан бастап - қауіпті және дереу бүрку.",

        proc_step4_title: "Дәл PWM бүрку",
        proc_step4_desc: "Жылдам клапандар 24м қарнақтың 8 секциясын дербес басқарып, дақылды химиялық күйіктен сақтайды.",

        demo_badge: "Даладағы мониторинг",
        demo_title: "AgroVision AI жүйесінің жұмысы",
        demo_desc: "18-20 км/сағ жылдамдықта 8 секцияның нақты уақыттағы жұмысы.",

        hw_badge: "Аппараттық кешен",
        hw_title: "Далалық жабдықтар",
        hw_desc: "Қостанай облысының далаларына арналған сенімді бөлшектер.",

        hw1_badge: "Метеостанция және қарнақ 24м",
        hw1_card_num: "Модуль 01",
        hw1_title: "Метеостанция және борттық блок",
        hw1_desc: "Бүрку үшін қолайлы ауа-райы терезесін анықтайтын метеостанция және желден қорғайтын IDTA 120-03 қос факелді инжекторлы бүріккіштері бар қарнақ.",
        hw1_tag1: "Бүрку терезесі",
        hw1_tag2: "IDTA 120-03",
        hw1_tag3: "Қарнақ 24м (8 секция)",

        hw2_badge: "Агро-дрон Sentinel",
        hw2_card_num: "Модуль 02",
        hw2_title: "Аэробарлау және дрондар",
        hw2_desc: "NDVI карталарын жасауға және көпжылдық арамшөп ошақтарын анықтауға арналған мультиспектрлі ұшқышсыз аппараттар.",
        hw2_tag1: "Мультиспектрлі камера",
        hw2_tag2: "NDVI талдауы",
        hw2_tag3: "Арамшөп ошақтары",
        hw2_tag4: "Автономды ұшу",

        sw_badge: "ДК Бағдарламасы",
        sw_title: "Агрономға арналған софт",
        sw_desc: "Бүріккіш борттық компьютерінің барлық құралдары бірыңғай интерфейсте.",

        sw1_title: "Борттық монитор (18-20 км/сағ)",
        sw1_desc: "Қарнақтан тікелей бейнеағын, 8 секцияның визуализаторы (S1-S8), жылдамдық және үнем есептегіші.",

        sw2_title: "Суреттерді талдау және норма есептеу",
        sw2_desc: "Фотоларды жүктеу, лезде YOLO талдауы, даму кезеңін анықтау және гербицид мөлшерін есептеу.",

        sw3_title: "Гербицидтерді таңдау",
        sw3_desc: "А класы үшін 2,4-Д күрделі эфирі мен дикамба, В класы үшін граминицидтер (Аксиал), бидайыққа глифосат.",

        sw4_title: "Агроном-Кеңесші (Офлайн + Gemini 3.1 Flash Lite)",
        sw4_desc: "Байланыс жоқ кезде автономды білім қоры, ал желі бар кезде Google Gemini 3.1 Flash Lite нейрожелісі.",

        sw5_title: "Олжа Агро менторының регламенті",
        sw5_desc: "Жюри мен мамандарға арналған барлық 4 агрономиялық талап блоктары.",

        sw6_title: "Бүріккішті баптау",
        sw6_desc: "Жұмыс жылдамдығын (18-20 км/сағ), қарнақ енін (24м) және бүріккіш түрлерін баптау.",

        cta_title: "AgroVision AI жүйесін қазір іске қосыңыз",
        cta_desc: "Windows үшін AgroVision.exe немесе Linux/macOS үшін start_pc_system.sh арқылы 1 басумен іске қосу. 100% тегін әрі автономды.",
        cta_btn_get: "Жүйені ашу (localhost:8000)",
        cta_btn_sales: "GitHub Репозиторийі",

        footer_tagline: "Олжа Агро агрономиялық қызметінің талаптарына сәйкес жасалған бүріккіш компьютері.",
        footer_status: "Жүйе дайын | 18-20 км/сағ | 100% OFFLINE",
        footer_copy: "2026 AgroVision AI. Барлық құқықтар қорғалған.",
        footer_legal1: "Регламент",
        footer_legal2: "Олжа Агро",
        footer_legal3: "Оффлайн борт",

        footer_col1_title: "Платформа",
        footer_col1_1: "Борттық ДК",
        footer_col1_2: "Жабдықтар",
        footer_col1_3: "Интерфейс",

        footer_col2_title: "Жабдықтар",
        footer_col2_1: "Агро-дрон БПЛА",
        footer_col2_2: "Метеостанция",
        footer_col2_3: "Қарнақ 24м",

        footer_col3_title: "Ресурстар",
        footer_col3_1: "GitHub Репозиторийі",
        footer_col3_2: "README Құжаты",
        footer_col3_3: "1 басумен қосу"
    },

    en: {
        nav_process: "Architecture",
        nav_demo: "Demo",
        nav_hardware: "Hardware",
        nav_software: "PC Software",
        nav_guide: "Regulations",
        nav_launch: "Launch System",

        hero_badge: "100% OFFLINE ON-BOARD | 18-20 KM/H",
        hero_title1: "Precision Spraying.",
        hero_title2: "60-80% Chemical Savings.",
        hero_desc: "On-board computer for self-propelled sprayers compliant with Olzha Agro specifications. Edge YOLO inference at 18-20 km/h, Class A and B weed detection, economic damage threshold per 1 m2, and rapid PWM control of 8 boom sections across 24 meters.",
        hero_btn_app: "Launch Terminal",
        hero_btn_arch: "View Regulations",

        stat1_num: "18-20 km/h",
        stat1_label: "Field working speed",
        stat2_num: "11-13 ms",
        stat2_label: "YOLO latency (50-60 FPS)",
        stat3_num: "60-80%",
        stat3_label: "Herbicide savings",
        stat4_num: "100% OFFLINE",
        stat4_label: "Autonomous in fields",

        proc_badge: "Olzha Agro Regulations",
        proc_title: "On-Board Computer Decision Logic",
        proc_desc: "Strict adherence to the 4 core blocks of Northern Kazakhstan agronomy regulations.",
        
        proc_step1_title: "Edge YOLO Inference",
        proc_step1_desc: "YOLOv8s CropAndWeed and YOLO11n Broadleaf run directly on the cabin PC without internet, achieving 11-13 ms response at speeds up to 20 km/h.",
        
        proc_step2_title: "Classification: Class A vs B",
        proc_step2_desc: "Separation into broadleaf dicots (Class A: amaranth, lambsquarter, thistle, sow-thistle, bindweed) and grassy monocots (Class B: wild oats, barnyard grass, couch grass).",
        
        proc_step3_title: "Damage Threshold per 1 m2",
        proc_step3_desc: "Under 5 annuals/m2 - nozzles OFF (100% savings). 6-15 plants/m2 - standard dose. Over 15 plants/m2 - maximum (+25%). 2+ perennials - critical hazard and immediate spray.",

        proc_step4_title: "Spot PWM Spraying",
        proc_step4_desc: "Independent fast-acting PWM valves spot-spray only over weed clusters, avoiding blanket spraying of clean soil and protecting crops from chemical burn.",

        demo_badge: "Field Monitoring Demo",
        demo_title: "AgroVision AI System in Action",
        demo_desc: "Live demonstration of the cabin terminal operating at 18-20 km/h with 8-section boom actuation.",

        hw_badge: "Hardware Complex",
        hw_title: "Rugged Equipment for Steppe Fields",
        hw_desc: "Engineered components built for continuous operation in Kostanay region.",

        hw1_badge: "Weather Station & 24m Boom",
        hw1_card_num: "Module 01",
        hw1_title: "Weather Station & Sprayer Unit",
        hw1_desc: "Field weather station monitoring the spraying window (wind < 5 m/s, temp +12...+22 C) paired with IDTA 120-03 coarse-droplet injector nozzles to prevent wind drift.",
        hw1_tag1: "Spraying Window",
        hw1_tag2: "IDTA 120-03",
        hw1_tag3: "24m Boom (8 Sections)",

        hw2_badge: "Sentinel Agro Drone",
        hw2_card_num: "Module 02",
        hw2_title: "Aerial Scouting & Multispectral UAVs",
        hw2_desc: "Autonomous drones for aerial NDVI mapping and spotting perennial weed infestations prior to sprayer departure.",
        hw2_tag1: "Multispectral Camera",
        hw2_tag2: "NDVI Mapping",
        hw2_tag3: "Weed Spotting",
        hw2_tag4: "Autonomous Flights",

        sw_badge: "PC Software Suite",
        sw_title: "Comprehensive Agronomy Software",
        sw_desc: "The entire precision agriculture toolkit unified inside the on-board web interface.",

        sw1_title: "Cabin Monitor (18-20 km/h)",
        sw1_desc: "Live boom video feed, target reticle, 8-section spray visualizer (S1-S8), weed telemetry, and instant chemical savings.",

        sw2_title: "Photo Inspection & Rates",
        sw2_desc: "Upload field photos, instant YOLO inference, growth stage identification, and herbicide dosage adjustment.",

        sw3_title: "Herbicide Selection",
        sw3_desc: "Prescribed chemical pairings: 2,4-D ester and dicamba for Class A, graminicides for Class B, glyphosate on stubble for couch grass.",

        sw4_title: "Agronomist Assistant (Offline + Gemini 3.1 Flash Lite)",
        sw4_desc: "Offline knowledge base for remote fields, combined with Google Gemini 3.1 Flash Lite integration when network is available.",

        sw5_title: "Olzha Agro Mentor Regulations",
        sw5_desc: "Interactive view of all 4 regulatory blocks for presentation to juries, agronomists, and operators.",

        sw6_title: "Sprayer Configuration",
        sw6_desc: "Calibration of working speed (18-20 km/h), boom width (24 meters), nozzle models, and cultivation region.",

        cta_title: "Run AgroVision AI on Your Computer",
        cta_desc: "One-click start with AgroVision.exe on Windows or start_pc_system.sh on Linux/macOS. 100% free and autonomous.",
        cta_btn_get: "Open System (localhost:8000)",
        cta_btn_sales: "GitHub Repository",

        footer_tagline: "On-board sprayer computer compliant with Olzha Agro agronomic service specifications.",
        footer_status: "System ready for fields | 18-20 km/h | 100% OFFLINE",
        footer_copy: "2026 AgroVision AI. All rights reserved.",
        footer_legal1: "Regulations",
        footer_legal2: "Olzha Agro",
        footer_legal3: "Offline Board",

        footer_col1_title: "Platform",
        footer_col1_1: "On-Board PC",
        footer_col1_2: "Hardware",
        footer_col1_3: "Software",

        footer_col2_title: "Hardware",
        footer_col2_1: "Agro Drone UAV",
        footer_col2_2: "Weather Station",
        footer_col2_3: "24m Boom",

        footer_col3_title: "Resources",
        footer_col3_1: "GitHub Repository",
        footer_col3_2: "README Documentation",
        footer_col3_3: "1-Click Launch"
    }
};
