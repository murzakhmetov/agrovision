import logging
import os
import time
import math
import random
from typing import List, Dict, Any, Optional, Tuple
import cv2
import numpy as np

from backend.text_render import get_text_size, put_text

logger = logging.getLogger(__name__)

TAXONOMY = {
    "class_a": {
        "name": "Класс A: Двудольные (Широколистные)",
        "name_en": "Class A: Dicot (Broadleaf)",
        "subclasses": {
            "annual": {
                "name": "Малолетние двудольные",
                "species": [
                    {"name": "Щирица запрокинутая", "lat": "Amaranthus retroflexus", "danger": "medium"},
                    {"name": "Марь белая", "lat": "Chenopodium album", "danger": "medium"},
                    {"name": "Горец вьюнковый", "lat": "Fallopia convolvulus", "danger": "medium"}
                ]
            },
            "perennial": {
                "name": "Многолетние двудольные (КРИТИЧЕСКИ ОПАСНЫЙ СЕКТОР)",
                "species": [
                    {"name": "Бодяк полевой (Осот розовый)", "lat": "Cirsium arvense", "danger": "critical"},
                    {"name": "Осот желтый полевой", "lat": "Sonchus arvensis", "danger": "critical"},
                    {"name": "Вьюнок полевой (Березка)", "lat": "Convolvulus arvensis", "danger": "critical"}
                ]
            }
        },
        "herbicide_types": [
            "Противодвудольные системные гербициды (Ауксиноподобные): 2,4-Д (сложный 2-этилгексиловый эфир), Дикамба",
            "Сульфонилмочевины: Флорасулам, Трибенурон-метил (для зерновых колосовых)",
            "Для многолетников: Баковая смесь Дикамба + 2,4-Д эфир в фазе розетки"
        ]
    },
    "class_b": {
        "name": "Класс B: Злаковые (Узколистные)",
        "name_en": "Class B: Monocot (Grasses)",
        "subclasses": {
            "annual": {
                "name": "Малолетние злаковые",
                "species": [
                    {"name": "Овсюг обыкновенный", "lat": "Avena fatua", "danger": "high"},
                    {"name": "Куриное просо (Ежовник)", "lat": "Echinochloa crus-galli", "danger": "medium"},
                    {"name": "Щетинник сизый / зеленый", "lat": "Setaria", "danger": "medium"}
                ]
            },
            "perennial": {
                "name": "Многолетние злаковые",
                "species": [
                    {"name": "Пырей ползучий", "lat": "Elytrigia repens", "danger": "critical"}
                ]
            }
        },
        "herbicide_types": [
            "Противозлаковые гербициды (Граминициды): Клетодим, Галоксифоп-Р-метил (по широколистным культурам)",
            "Селективные противозлаковые по пшенице: Пиноксаден (Аксиал), Тралкоксидим, Клодинафоп-пропаргил",
            "По пырею ползучему: Системные граминициды в фазе 10-15 см или Глифосат по стерне"
        ]
    }
}

# Crop classes of ml_models/weedblaster-cropandweed-yolov8s.pt, taken from the
# model's embedded `names`: Maize, Sugar beet, Soy, Sunflower, Potato, Pea,
# Bean, Pumpkin, Weed (the broadleaf model has a single "weed" class). "Crop" is
# kept for models with a generic crop class. Override with a comma-separated
# AGROVISION_CROP_CLASSES when swapping in a model with different classes.
DEFAULT_CROP_CLASSES = ("Maize", "Sugar beet", "Soy", "Sunflower", "Potato", "Pea", "Bean", "Pumpkin", "Crop")

def load_crop_classes() -> frozenset:
    raw = os.environ.get("AGROVISION_CROP_CLASSES")
    names = raw.split(",") if raw else DEFAULT_CROP_CLASSES
    return frozenset(n.strip().lower() for n in names if n.strip())

CROP_CLASSES = load_crop_classes()

def is_crop_class(raw_class: str) -> bool:
    return raw_class.strip().lower() in CROP_CLASSES

class AgroDecisionEngine:
    
    @staticmethod
    def evaluate_threshold(annual_count_per_m2: float, perennial_count_per_m2: float) -> Dict[str, Any]:
        is_perennial_alert = (perennial_count_per_m2 >= 2.0) or (perennial_count_per_m2 >= 1.0 and annual_count_per_m2 >= 1.0)
        
        if is_perennial_alert:
            status = "critical"
            status_title = "КРИТИЧЕСКАЯ УГРОЗА (МНОГОЛЕТНИКИ)"
            action = "СРОЧНО ОБРАБОТАТЬ! Приоритетный сектор."
            spray_intensity = 1.0
            spray_action = "SPRAY_MAX_TARGETED"
            herbicide_norm = "Максимально допустимая норма системного гербицида"
            color = "#EF4444"
        elif annual_count_per_m2 > 15.0:
            status = "heavy"
            status_title = "Сильная засоренность"
            action = "ВКЛЮЧАТЬ ОПРЫСКИВАНИЕ НА МАКСИМУМ"
            spray_intensity = 1.0
            spray_action = "SPRAY_MAX"
            herbicide_norm = "Повышенная норма расхода (+25% к базовой)"
            color = "#F97316"
        elif annual_count_per_m2 >= 6.0:
            status = "medium"
            status_title = "Средняя засоренность"
            action = "Стандартная норма гербицида"
            spray_intensity = 0.65
            spray_action = "SPRAY_STANDARD"
            herbicide_norm = "Регламентная норма (150-200 л/га рабочего раствора)"
            color = "#FBBF24"
        else:
            status = "low"
            status_title = "Слабая засоренность"
            action = "НЕ ОПРЫСКИВАТЬ (Экономически невыгодно)"
            spray_intensity = 0.0
            spray_action = "NO_SPRAY"
            herbicide_norm = "Опрыскиватель выключен. Экономия 100% препарата."
            color = "#34D399"

        return {
            "status": status,
            "status_title": status_title,
            "action": action,
            "spray_intensity": spray_intensity,
            "spray_action": spray_action,
            "herbicide_norm": herbicide_norm,
            "color": color,
            "annual_count_per_m2": round(annual_count_per_m2, 1),
            "perennial_count_per_m2": round(perennial_count_per_m2, 1),
            "is_perennial_alert": is_perennial_alert
        }

    @staticmethod
    def model_failure_decision(model_status: str) -> Dict[str, Any]:
        """Safe no-spray decision used when no detection model produced output.

        Keeps status "low" (nozzles off, existing UI styling) but tells the
        operator that the result is a model failure, not a clean field."""
        title = "Модель CV недоступна" if model_status == "unavailable" else "Ошибка модели CV"
        return {
            "status": "low",
            "status_title": title,
            "action": "НЕ ОПРЫСКИВАТЬ (нет данных детекции)",
            "spray_intensity": 0.0,
            "spray_action": "NO_SPRAY",
            "herbicide_norm": "Опрыскиватель выключен: нейросеть не дала результата. Проверьте модели в ml_models/ и журнал сервера.",
            "color": "#71717A",
            "annual_count_per_m2": 0.0,
            "perennial_count_per_m2": 0.0,
            "is_perennial_alert": False,
            "model_error": True
        }

    @staticmethod
    def evaluate_phase(box_relative_area: float, aspect_ratio: float) -> Dict[str, Any]:
        if box_relative_area < 0.015:
            phase = "seedling_2leaves"
            title = "Семядоли - 2 листа"
            window_status = "ИДЕАЛЬНОЕ ОКНО"
            dose_adjustment = "+0% (Минимальная / базовая дозировка)"
            dose_multiplier = 1.0
            warning = None
            badge_color = "#34D399"
        elif box_relative_area < 0.055:
            phase = "4_6_leaves"
            title = "4-6 листьев"
            window_status = "Сорняк грубеет"
            dose_adjustment = "+15-20% к базовой норме препарата"
            dose_multiplier = 1.18
            warning = "Требуется повышенная норма для пробития воскового налета"
            badge_color = "#FBBF24"
        else:
            phase = "mature_bloom"
            title = "Более 6 листьев / Цветение"
            window_status = "УПУЩЕННОЕ ОКНО"
            dose_adjustment = "Не рекомендуется сплошная химобработка"
            dose_multiplier = 1.35
            warning = "ВНИМАНИЕ АГРОНОМУ: Сорняк устойчив! Высокий риск угнетения или фитотоксичности культуры. Рекомендована десикация или локальная мехобработка."
            badge_color = "#EF4444"

        return {
            "phase": phase,
            "title": title,
            "window_status": window_status,
            "dose_adjustment": dose_adjustment,
            "dose_multiplier": dose_multiplier,
            "warning": warning,
            "badge_color": badge_color
        }

class LocalCvPipeline:

    # Minimum seconds between repeated error logs for the same model, so a
    # broken model does not flood the log at stream frame rate.
    ERROR_LOG_INTERVAL_S = 10.0

    def __init__(self, model_cropandweed: str = "ml_models/weedblaster-cropandweed-yolov8s.pt",
                 model_broadleaf: str = "ml_models/broadleaf-yolo11n.pt"):
        self.yolo_cropandweed = None
        self.yolo_broadleaf = None
        self.load_error: Optional[str] = None
        self._last_error_log: Dict[str, float] = {}
        
        try:
            from ultralytics import YOLO
            if os.path.exists(model_cropandweed):
                self.yolo_cropandweed = YOLO(model_cropandweed)
                print(f"[CV Engine] Loaded CropAndWeed model: {model_cropandweed}")
                unknown = [n for n in self.yolo_cropandweed.names.values()
                           if not is_crop_class(n) and "weed" not in n.lower()]
                if unknown:
                    logger.warning("[CV Engine] Classes not in AGROVISION_CROP_CLASSES "
                                   "will be treated as weeds: %s", unknown)
            else:
                logger.warning("[CV Engine] CropAndWeed model not found: %s", model_cropandweed)
            if os.path.exists(model_broadleaf):
                self.yolo_broadleaf = YOLO(model_broadleaf)
                print(f"[CV Engine] Loaded Broadleaf model: {model_broadleaf}")
            else:
                logger.warning("[CV Engine] Broadleaf model not found: %s", model_broadleaf)
        except Exception as e:
            self.load_error = f"{type(e).__name__}: {e}"
            logger.error("[CV Engine] Model initialization failed: %s", self.load_error)
        self.is_ready = self.yolo_cropandweed is not None or self.yolo_broadleaf is not None
        if not self.is_ready:
            logger.error("[CV Engine] No detection model loaded; detections will be empty")

    def _log_model_error(self, model_name: str, exc: Exception) -> None:
        now = time.time()
        if now - self._last_error_log.get(model_name, 0.0) >= self.ERROR_LOG_INTERVAL_S:
            self._last_error_log[model_name] = now
            logger.error("[CV Engine] %s inference failed", model_name, exc_info=exc)

    def _predict(self, model, frame_bgr: np.ndarray, conf_threshold: float,
                 class_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Run one YOLO model. Boxes are labelled with the model's own class
        names, or with `class_name` for single-purpose models."""
        boxes = []
        for r in model.predict(frame_bgr, conf=conf_threshold, imgsz=640, verbose=False):
            for b in r.boxes:
                boxes.append({
                    "bbox": b.xyxy[0].cpu().numpy().tolist(),
                    "conf": float(b.conf[0].item()),
                    "raw_class": class_name or model.names.get(int(b.cls[0].item()), "Weed")
                })
        return boxes

    def _run_models(self, frame_bgr: np.ndarray, conf_threshold: float) -> Tuple[List[Dict[str, Any]], str, List[str]]:
        """Return (raw_boxes, model_status, model_errors).

        No fabricated detections: if the models find nothing (or fail), the
        boxes are empty and model_status tells the caller why."""
        raw_boxes: List[Dict[str, Any]] = []
        model_errors: List[str] = []
        models_ok = 0
        runs = [
            (self.yolo_cropandweed, "CropAndWeed", None),
            (self.yolo_broadleaf, "Broadleaf", "Weed_Broadleaf"),
        ]
        for model, model_name, class_name in runs:
            if model is None:
                continue
            try:
                raw_boxes.extend(self._predict(model, frame_bgr, conf_threshold, class_name))
                models_ok += 1
            except Exception as e:
                self._log_model_error(model_name, e)
                model_errors.append(f"{model_name}: {type(e).__name__}: {e}")

        if not self.is_ready:
            model_status = "unavailable"
            if self.load_error:
                model_errors.append(self.load_error)
        elif models_ok == 0:
            model_status = "error"
        elif model_errors:
            model_status = "degraded"
        else:
            model_status = "ok"
        return raw_boxes, model_status, model_errors

    def process_frame(self, frame_bgr: np.ndarray, conf_threshold: float = 0.25, 
                      boom_sections_count: int = 8, is_stream: bool = False) -> Dict[str, Any]:
        t0 = time.time()
        h, w = frame_bgr.shape[:2]

        raw_boxes, model_status, model_errors = self._run_models(frame_bgr, conf_threshold)

        detections = []
        annual_count = 0
        perennial_count = 0
        section_weed_counts = [0] * boom_sections_count

        for item in raw_boxes:
            if is_crop_class(item["raw_class"]):
                detections.append(_crop_detection(item))
                continue

            det = _weed_detection(item, w, h, boom_sections_count)
            if det["is_perennial"]:
                perennial_count += 1
            else:
                annual_count += 1
            section_weed_counts[det["section_index"]] += 1
            detections.append(det)

        camera_coverage_m2 = 1.0 if not is_stream else 2.5
        annual_per_m2 = annual_count / camera_coverage_m2
        perennial_per_m2 = perennial_count / camera_coverage_m2

        decision = AgroDecisionEngine.evaluate_threshold(annual_per_m2, perennial_per_m2)
        if model_status in ("error", "unavailable"):
            decision = AgroDecisionEngine.model_failure_decision(model_status)

        boom_nozzles = _boom_nozzles(section_weed_counts, decision["status"])
        active_nozzle_count = sum(1 for n in boom_nozzles if n["active"])
        herbicide_saved_pct = round((1.0 - (active_nozzle_count / boom_sections_count)) * 100.0, 1)

        dt = (time.time() - t0) * 1000.0
        fps = round(1000.0 / max(1.0, dt), 1)

        return {
            "latency_ms": round(dt, 1),
            "fps": fps,
            "image_size": [w, h],
            "total_detections": len(detections),
            "weeds_count": annual_count + perennial_count,
            "annual_count": annual_count,
            "perennial_count": perennial_count,
            "class_a_count": sum(1 for d in detections if d.get("weed_class") == "A"),
            "class_b_count": sum(1 for d in detections if d.get("weed_class") == "B"),
            "crops_count": sum(1 for d in detections if d.get("is_crop")),
            "decision": decision,
            "boom_nozzles": boom_nozzles,
            "active_nozzles_count": active_nozzle_count,
            "herbicide_saved_pct": herbicide_saved_pct,
            "detections": detections,
            "model_status": model_status,
            "model_errors": model_errors,
            "sprayer_speed_kmh": round(random.uniform(18.8, 19.6), 1),
            "timestamp": time.time()
        }

# Display attributes per (weed class, is_perennial). Class A = broadleaf,
# class B = grasses; the species is a representative example for the UI.
WEED_PROFILES = {
    ("A", True): {
        "subclass": "Многолетние (бодяк, осот, вьюнок)",
        "species_name": "Бодяк полевой (Cirsium arvense)",
        "color": "#EF4444",
    },
    ("A", False): {
        "subclass": "Малолетние (щирица, марь)",
        "species_name": "Щирица запрокинутая (Amaranthus)",
        "color": "#F97316",
    },
    ("B", True): {
        "subclass": "Многолетние (пырей ползучий)",
        "species_name": "Пырей ползучий (Elytrigia repens)",
        "color": "#EC4899",
    },
    ("B", False): {
        "subclass": "Малолетние (овсюг, просо)",
        "species_name": "Овсюг обыкновенный (Avena fatua)",
        "color": "#38BDF8",
    },
}

WEED_CLASS_TITLES = {
    "A": "Класс A (Двудольные / Широколистные)",
    "B": "Класс B (Злаковые / Узколистные)",
}

def _rounded_bbox(bbox: List[float]) -> List[float]:
    return [round(v, 1) for v in bbox]

def _crop_detection(item: Dict[str, Any]) -> Dict[str, Any]:
    raw_c = item["raw_class"]
    return {
        "is_crop": True,
        "crop_name": raw_c,
        "bbox": _rounded_bbox(item["bbox"]),
        "conf": round(item["conf"], 2),
        "label": f"Культура: {raw_c}",
        "color": "#10B981"
    }

def _weed_detection(item: Dict[str, Any], w: int, h: int, boom_sections_count: int) -> Dict[str, Any]:
    """Classify a weed box by its shape (broadleaf vs grass, annual vs
    perennial), estimate its growth phase and map it to a boom section."""
    x1, y1, x2, y2 = item["bbox"]
    bw = max(1.0, x2 - x1)
    bh = max(1.0, y2 - y1)
    rel_area = (bw * bh) / (w * h)
    aspect = bh / bw

    weed_class = "A" if aspect < 1.45 else "B"
    is_perennial = rel_area > 0.025 and (aspect < 1.2 or aspect > 1.8)
    profile = WEED_PROFILES[(weed_class, is_perennial)]
    phase_info = AgroDecisionEngine.evaluate_phase(rel_area, aspect)

    cx = (x1 + x2) / 2.0
    sec_idx = int(math.floor((cx / max(1.0, w)) * boom_sections_count))
    sec_idx = max(0, min(boom_sections_count - 1, sec_idx))

    species = profile["species_name"]
    return {
        "is_crop": False,
        "weed_class": weed_class,
        "class_title": WEED_CLASS_TITLES[weed_class],
        "subclass": profile["subclass"],
        "species_name": species,
        "is_perennial": is_perennial,
        "is_critical": is_perennial,
        "phase": phase_info,
        "section_index": sec_idx,
        "bbox": _rounded_bbox(item["bbox"]),
        "conf": round(item["conf"], 2),
        "color": profile["color"],
        "label": f"[{weed_class}] {species.split()[0]} ({phase_info['title']})"
    }

def _boom_nozzles(section_weed_counts: List[int], decision_status: str) -> List[Dict[str, Any]]:
    """Open a section's nozzle when it has weeds, unless spraying is not
    economically justified (status "low")."""
    nozzles = []
    for i, weed_count in enumerate(section_weed_counts):
        active = weed_count > 0 and decision_status != "low"
        if not active:
            flow = 0
        elif decision_status in ("critical", "heavy"):
            flow = 100
        else:
            flow = 70
        nozzles.append({
            "section_id": i + 1,
            "active": active,
            "weed_count": weed_count,
            "flow_rate_percent": flow
        })
    return nozzles

# BGR colours for detection overlays.
CROP_BOX_COLOR = (16, 185, 129)
PERENNIAL_BOX_COLOR = (68, 68, 239)
CLASS_A_BOX_COLOR = (22, 115, 249)
CLASS_B_BOX_COLOR = (248, 189, 56)
WHITE = (255, 255, 255)
HUD_BG = (11, 13, 15)
HUD_ACCENT = (52, 211, 153)

def _detection_style(det: Dict[str, Any]) -> Tuple[Tuple[int, int, int], str]:
    """Return (BGR colour, label text) for a detection."""
    if det.get("is_crop", False):
        return CROP_BOX_COLOR, det["label"]

    w_class = det.get("weed_class", "A")
    if det.get("is_perennial", False):
        color = PERENNIAL_BOX_COLOR
    elif w_class == "A":
        color = CLASS_A_BOX_COLOR
    else:
        color = CLASS_B_BOX_COLOR
    species = det.get("species_name", "Сорняк").split()[0]
    phase_t = det.get("phase", {}).get("title", "")
    return color, f"[{w_class}] {species} | {phase_t}"

def _draw_section_grid(img: np.ndarray, num_sections: int) -> None:
    h, w = img.shape[:2]
    for i in range(1, num_sections):
        x = int(w * (i / num_sections))
        cv2.line(img, (x, 0), (x, h), (40, 50, 60), 1, cv2.LINE_AA)
        cv2.putText(img, f"S{i}", (x - 28, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100, 116, 139), 1)
    cv2.putText(img, f"S{num_sections}", (w - 30, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100, 116, 139), 1)

def _draw_detection(img: np.ndarray, det: Dict[str, Any]) -> None:
    x1, y1, x2, y2 = [int(v) for v in det["bbox"]]
    color, title = _detection_style(det)

    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
    corner_len = min(15, (x2 - x1) // 3, (y2 - y1) // 3)
    cv2.line(img, (x1, y1), (x1 + corner_len, y1), WHITE, 3)
    cv2.line(img, (x1, y1), (x1, y1 + corner_len), WHITE, 3)
    cv2.line(img, (x2, y2), (x2 - corner_len, y2), WHITE, 3)
    cv2.line(img, (x2, y2), (x2, y2 - corner_len), WHITE, 3)

    (tw, th), _ = get_text_size(title, 0.45, 1)
    cv2.rectangle(img, (x1, max(0, y1 - th - 8)), (x1 + tw + 8, max(th + 8, y1)), color, -1)
    put_text(img, title, (x1 + 4, max(th + 2, y1 - 4)), 0.45, (0, 0, 0), 1)

def _draw_panel(img: np.ndarray, top_left: Tuple[int, int], bottom_right: Tuple[int, int]) -> None:
    cv2.rectangle(img, top_left, bottom_right, HUD_BG, -1)
    cv2.rectangle(img, top_left, bottom_right, HUD_ACCENT, 1)

def _draw_hud(img: np.ndarray, result: Dict[str, Any]) -> None:
    h, w = img.shape[:2]
    speed_text = f"19.2 km/h  |  FPS: {result.get('fps', 30.0)}  |  {result.get('latency_ms', 10.0)}ms"
    _draw_panel(img, (w - 320, 10), (w - 10, 42))
    cv2.putText(img, speed_text, (w - 310, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.48, HUD_ACCENT, 1, cv2.LINE_AA)

    dec = result.get("decision", {})
    _draw_panel(img, (10, h - 45), (w - 10, h - 10))
    put_text(img, f"РЕШЕНИЕ: {dec.get('action', '')}", (20, h - 22), 0.55, WHITE, 1)

def draw_detections_on_image(image_bgr: np.ndarray, result: Dict[str, Any]) -> np.ndarray:
    img = image_bgr.copy()
    _draw_section_grid(img, len(result.get("boom_nozzles", [])))
    for det in result.get("detections", []):
        _draw_detection(img, det)
    _draw_hud(img, result)
    return img
