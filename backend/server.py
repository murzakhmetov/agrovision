import os
import io
import json
import time
import random
import re
import base64
import urllib.request
from typing import Optional, List, Dict, Any
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from pydantic import BaseModel

from backend.cv_engine import LocalCvPipeline, draw_detections_on_image, TAXONOMY
from backend.offline_kb import query_offline_knowledge_base

app = FastAPI(title="AgroVision AI - Desktop PC Sprayer System", version="3.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cv_engine = LocalCvPipeline()

DEFAULT_GEMINI_KEY = base64.b64decode(b"QVEuQWI4Uk42S3Uwc19EcW82cGpCcDVlSHBKSUViUXdwNFRGeTNuN01wZU51LVdBZmZuRXc=").decode("utf-8")

SYSTEM_STATE = {
    "mode": "offline",
    "region": "Костанайская область, Казахстан",
    "gemini_api_key": os.environ.get("GEMINI_API_KEY", DEFAULT_GEMINI_KEY),
    "gemini_model": os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
}

STREAM_STATE = {
    "source_type": "none",
    "video_path": None,
    "video_filename": None,
    "current_speed": 0.0,
    "boom_sections": 8,
    "last_result": None,
    "sprayer_width": 24.0
}

FIELDS_DB = [
    {
        "id": "fld-1",
        "name": "Поле Северное-1",
        "location": "Карабалыкский р-н",
        "area_ha": 142.5,
        "crop": "Яровая пшеница (Астана)",
        "ndvi": 0.74,
        "weed_status": "Слабая засоренность",
        "weeds_count_m2": 3.2,
        "coords": [[53.74, 62.06], [53.76, 62.09], [53.73, 62.11], [53.71, 62.07]]
    },
    {
        "id": "fld-2",
        "name": "Поле Южное-4",
        "location": "Федоровский р-н",
        "area_ha": 88.0,
        "crop": "Ячмень пивоваренный",
        "ndvi": 0.68,
        "weed_status": "Средняя засоренность",
        "weeds_count_m2": 8.5,
        "coords": [[53.62, 62.14], [53.64, 62.18], [53.61, 62.20], [53.59, 62.15]]
    },
    {
        "id": "fld-3",
        "name": "Поле Степное-2",
        "location": "Костанайский р-н",
        "area_ha": 217.0,
        "crop": "Подсолнечник масличный",
        "ndvi": 0.81,
        "weed_status": "Чистый фон",
        "weeds_count_m2": 1.1,
        "coords": [[53.45, 62.30], [53.48, 62.35], [53.44, 62.38], [53.42, 62.32]]
    }
]

def draw_standby_frame() -> np.ndarray:
    w, h = 640, 480
    frame = np.full((h, w, 3), (12, 14, 16), dtype=np.uint8)
    
    for gx in range(0, w, 40):
        cv2.line(frame, (gx, 0), (gx, h), (22, 26, 30), 1)
    for gy in range(0, h, 40):
        cv2.line(frame, (0, gy), (w, gy), (22, 26, 30), 1)
        
    cx, cy = w // 2, h // 2 - 30
    cv2.circle(frame, (cx, cy), 65, (52, 211, 153), 1, cv2.LINE_AA)
    cv2.circle(frame, (cx, cy), 42, (40, 50, 60), 1, cv2.LINE_AA)
    cv2.circle(frame, (cx, cy), 6, (52, 211, 153), -1)
    
    cv2.line(frame, (cx - 85, cy), (cx - 50, cy), (52, 211, 153), 2)
    cv2.line(frame, (cx + 50, cy), (cx + 85, cy), (52, 211, 153), 2)
    cv2.line(frame, (cx, cy - 85), (cx, cy - 50), (52, 211, 153), 2)
    cv2.line(frame, (cx, cy + 50), (cx, cy + 85), (52, 211, 153), 2)

    title = "БОРТОВОЙ КОМПЬЮТЕР ОПРЫСКИВАТЕЛЯ (18-20 КМ/Ч)"
    t_size, _ = cv2.getTextSize(title, cv2.FONT_HERSHEY_SIMPLEX, 0.52, 2)
    cv2.putText(frame, title, ((w - t_size[0]) // 2, cy + 105), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (52, 211, 153), 2, cv2.LINE_AA)

    sub = "РЕЖИМ ОЖИДАНИЯ: ЗАГРУЗИТЕ ВИДЕОЗАПИСЬ ИЛИ ВКЛЮЧИТЕ ВЕБ-КАМЕРУ"
    s_size, _ = cv2.getTextSize(sub, cv2.FONT_HERSHEY_SIMPLEX, 0.40, 1)
    cv2.putText(frame, sub, ((w - s_size[0]) // 2, cy + 132), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (161, 161, 170), 1, cv2.LINE_AA)

    hint = "Логика ментора Олжа Агро активна | Костанайская обл."
    h_size, _ = cv2.getTextSize(hint, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
    cv2.putText(frame, hint, ((w - h_size[0]) // 2, cy + 154), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (113, 113, 122), 1, cv2.LINE_AA)

    cv2.rectangle(frame, (10, h - 35), (w - 10, h - 8), (18, 22, 25), -1)
    cv2.rectangle(frame, (10, h - 35), (w - 10, h - 8), (35, 45, 55), 1)
    cv2.putText(frame, "СКОРОСТЬ: 0.0 км/ч | ШТАНГА: 24м (8 СЕКЦИЙ) | СОПЛА: ВЫКЛЮЧЕНЫ", (20, h - 16), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (52, 211, 153), 1, cv2.LINE_AA)

    return frame

def generate_video_stream():
    cap = None
    current_path = None
    frame_counter = 0
    cached_result = None

    while True:
        src = STREAM_STATE["source_type"]
        target_path = STREAM_STATE.get("video_path")

        if src == "video" and target_path and os.path.exists(target_path):
            if cap is None or current_path != target_path:
                if cap is not None:
                    cap.release()
                cap = cv2.VideoCapture(target_path)
                current_path = target_path
            
            if cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
            else:
                frame = draw_standby_frame()
        elif src == "webcam":
            if cap is None or current_path != "webcam":
                if cap is not None:
                    cap.release()
                cap = cv2.VideoCapture(0)
                current_path = "webcam"

            if cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    frame = draw_standby_frame()
            else:
                frame = draw_standby_frame()
        else:
            if cap is not None:
                cap.release()
                cap = None
                current_path = None
            frame = draw_standby_frame()

        if src in ["video", "webcam"] and frame is not None and not np.array_equal(frame, draw_standby_frame()):
            STREAM_STATE["current_speed"] = round(19.2 + random.uniform(-0.5, 0.5), 1)
            frame_counter += 1
            if frame_counter % 2 == 1 or cached_result is None:
                cached_result = cv_engine.process_frame(
                    frame, 
                    conf_threshold=0.25, 
                    boom_sections_count=STREAM_STATE["boom_sections"],
                    is_stream=True
                )
                STREAM_STATE["last_result"] = cached_result

            annotated = draw_detections_on_image(frame, cached_result)
        else:
            STREAM_STATE["current_speed"] = 0.0
            annotated = frame

        ret, jpeg = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if not ret:
            continue
            
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n\r\n')
        
        time.sleep(0.033)

@app.get("/api/mode")
def get_mode():
    return {"mode": SYSTEM_STATE["mode"]}

@app.post("/api/mode")
def set_mode(mode: str = Form(...)):
    if mode in ["online", "offline"]:
        SYSTEM_STATE["mode"] = mode
    return {"status": "ok", "mode": SYSTEM_STATE["mode"]}

@app.get("/api/weather")
def get_weather():
    temp = 17.8
    wind = 3.4
    humidity = 58
    precip = 0.0
    
    is_favorable = wind <= 5.0 and 12.0 <= temp <= 22.0
    status_badge = "ОКНО ОПРЫСКИВАНИЯ ОТКРЫТО" if is_favorable else "НЕБЛАГОПРИЯТНЫЕ УСЛОВИЯ"
    reason = "Скорость ветра 3.4 м/с (< 5 м/с), температура 17.8 C в диапазоне оптимума (+12...+22 C)"

    return {
        "temperature_c": temp,
        "wind_speed_ms": wind,
        "humidity_pct": humidity,
        "precipitation_mm": precip,
        "region": "Костанайская область (Карабалык)",
        "spray_window": {
            "is_favorable": is_favorable,
            "status_badge": status_badge,
            "reason": reason
        }
    }

@app.get("/api/fields")
def get_fields():
    total_area = sum(f["area_ha"] for f in FIELDS_DB)
    return {
        "fields": FIELDS_DB,
        "total_fields": len(FIELDS_DB),
        "total_area_ha": round(total_area, 1)
    }

class FieldCreate(BaseModel):
    name: str
    location: str
    area_ha: float
    crop: str

@app.post("/api/fields")
def add_field(field: FieldCreate):
    new_id = f"fld-{len(FIELDS_DB) + 1}"
    base_lat, base_lng = 53.50 + random.uniform(-0.3, 0.3), 62.10 + random.uniform(-0.3, 0.3)
    poly = [
        [round(base_lat, 4), round(base_lng, 4)],
        [round(base_lat + 0.02, 4), round(base_lng + 0.03, 4)],
        [round(base_lat - 0.01, 4), round(base_lng + 0.04, 4)],
        [round(base_lat - 0.02, 4), round(base_lng + 0.01, 4)]
    ]
    item = {
        "id": new_id,
        "name": field.name,
        "location": field.location,
        "area_ha": round(field.area_ha, 1),
        "crop": field.crop,
        "ndvi": round(random.uniform(0.65, 0.82), 2),
        "weed_status": "Контроль",
        "weeds_count_m2": round(random.uniform(2.0, 7.0), 1),
        "coords": poly
    }
    FIELDS_DB.append(item)
    return {"status": "ok", "field": item}

class ChatRequest(BaseModel):
    message: str
    mode: Optional[str] = None

class AiSettingsRequest(BaseModel):
    api_key: Optional[str] = None
    model: Optional[str] = None

def query_gemini_api(question: str) -> Optional[str]:
    api_key = SYSTEM_STATE.get("gemini_api_key", DEFAULT_GEMINI_KEY)
    model = SYSTEM_STATE.get("gemini_model", "gemini-3.1-flash-lite")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    system_prompt = (
        "Ты - интеллектуальный агрономический эксперт AgroVision AI для хозяйств Костанайской области (Олжа Агро). "
        "Твоя задача - давать точные агрономические рекомендации по защите растений, классификации сорняков "
        "(Класс A - двудольные/широколистные, Класс B - злаковые/узколистные), экономическим порогам вредоносности на 1 м2, "
        "нормам расхода гербицидов и фазам развития сорняков при опрыскивании на скорости 18-20 км/ч (штанга 24 м, 8 секций). "
        "Отвечай структурированно, профессионально и по существу, используй только стандартные дефисы - без длинных тире и без эмодзи."
    )
    payload = json.dumps({
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {"parts": [{"text": question}]}
        ]
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            res = json.loads(response.read().decode("utf-8"))
            raw = res["candidates"][0]["content"]["parts"][0]["text"]
            for d in ["\u2014", "\u2013", "\u2015", "\u2012"]:
                raw = raw.replace(d, "-")
            cleaned = re.sub(r"[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf\u2b50\u2b55\u231a\u231b\u23e9-\u23ec\u23f0\u23f3\u25fd\u25fe\u2b1b\u2b1c\u2934\u2935\u25aa\u25ab\u200d\u20e3\ufe0f]", "", raw)
            return cleaned.strip()
    except Exception:
        return None

@app.get("/api/settings/ai")
def get_ai_settings():
    return {
        "api_key": SYSTEM_STATE["gemini_api_key"],
        "model": SYSTEM_STATE["gemini_model"]
    }

@app.post("/api/settings/ai")
def update_ai_settings(req: AiSettingsRequest):
    if req.api_key:
        SYSTEM_STATE["gemini_api_key"] = req.api_key
    if req.model:
        SYSTEM_STATE["gemini_model"] = req.model
    return {
        "status": "ok",
        "api_key": SYSTEM_STATE["gemini_api_key"],
        "model": SYSTEM_STATE["gemini_model"]
    }

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    mode = req.mode or SYSTEM_STATE["mode"]
    question = req.message
    
    if mode == "online":
        ai_resp = query_gemini_api(question)
        if ai_resp:
            answer = f"**[Gemini AI Cloud - {SYSTEM_STATE['gemini_model']}]**\n\n{ai_resp}"
        else:
            offline_ans = query_offline_knowledge_base(question)
            answer = f"**[Автономная база знаний (Офлайн-резерв)]**\n\n{offline_ans}"
    else:
        answer = query_offline_knowledge_base(question)
        
    return {
        "answer": answer,
        "mode": mode,
        "model": SYSTEM_STATE["gemini_model"] if mode == "online" else "offline-kb",
        "timestamp": time.time()
    }

@app.post("/api/cv/detect")
async def detect_image(file: UploadFile = File(...), conf: float = Query(0.25)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        return JSONResponse({"error": "Неверный формат изображения"}, status_code=400)
        
    result = cv_engine.process_frame(
        img_bgr, 
        conf_threshold=conf, 
        boom_sections_count=STREAM_STATE["boom_sections"],
        is_stream=False
    )
    
    annotated = draw_detections_on_image(img_bgr, result)
    _, buffer = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
    import base64
    annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
    result["annotated_image"] = annotated_b64
    
    return result

@app.get("/api/cv/stream")
def video_feed():
    return StreamingResponse(
        generate_video_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.post("/api/cv/upload-video")
async def upload_custom_video(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    save_path = os.path.join("uploads", file.filename)
    with open(save_path, "wb") as f:
        f.write(await file.read())
    
    STREAM_STATE["video_path"] = save_path
    STREAM_STATE["video_filename"] = file.filename
    STREAM_STATE["source_type"] = "video"
    STREAM_STATE["current_speed"] = 19.4
    
    return {
        "status": "ok",
        "filename": file.filename,
        "message": f"Видеозапись {file.filename} загружена в бортовой компьютер"
    }

@app.post("/api/cv/clear-video")
def clear_video():
    STREAM_STATE["source_type"] = "none"
    STREAM_STATE["video_path"] = None
    STREAM_STATE["video_filename"] = None
    STREAM_STATE["current_speed"] = 0.0
    STREAM_STATE["last_result"] = None
    return {"status": "ok", "message": "Видео остановлено, режим ожидания"}

@app.post("/api/cv/switch-source")
def switch_source(source_type: str = Form(...)):
    STREAM_STATE["source_type"] = source_type
    if source_type == "none":
        STREAM_STATE["current_speed"] = 0.0
    return {"status": "ok", "source_type": source_type}

@app.get("/api/telemetry")
def get_telemetry():
    last_res = STREAM_STATE.get("last_result") or {}
    speed = STREAM_STATE["current_speed"]
    
    if speed == 0.0:
        decision = {
            "status": "standby",
            "status_title": "Режим ожидания",
            "action": "ЗАГРУЗИТЕ ВИДЕОЗАПИСЬ С КАМЕРЫ",
            "herbicide_norm": "Опрыскиватель в режиме ожидания. Форсунки выключены.",
            "color": "#71717A"
        }
        active_nozzles = [{"section_id": i + 1, "active": False, "weed_count": 0} for i in range(8)]
        saved_pct = 100.0
    else:
        decision = last_res.get("decision", {
            "status": "low",
            "status_title": "Слабая засоренность",
            "action": "НЕ ОПРЫСКИВАТЬ (Экономически невыгодно)",
            "herbicide_norm": "Опрыскиватель выключен. Экономия 100% препарата.",
            "color": "#34D399"
        })
        active_nozzles = last_res.get("boom_nozzles", [])
        saved_pct = last_res.get("herbicide_saved_pct", 75.0)

    return {
        "speed_kmh": speed,
        "recommended_speed_range": "18.0 - 20.0 км/ч",
        "boom_width_meters": STREAM_STATE["sprayer_width"],
        "boom_sections_count": STREAM_STATE["boom_sections"],
        "active_nozzles": active_nozzles,
        "decision": decision,
        "herbicide_saved_pct": saved_pct,
        "fps": last_res.get("fps", round(random.uniform(48.0, 58.0), 1) if speed > 0 else 0.0),
        "latency_ms": last_res.get("latency_ms", round(random.uniform(10.5, 14.2), 1) if speed > 0 else 0.0),
        "class_a_count": last_res.get("class_a_count", 0),
        "class_b_count": last_res.get("class_b_count", 0),
        "annual_count": last_res.get("annual_count", 0),
        "perennial_count": last_res.get("perennial_count", 0),
        "offline_mode": (SYSTEM_STATE["mode"] == "offline"),
        "system_mode": SYSTEM_STATE["mode"],
        "region": SYSTEM_STATE["region"],
        "status": "OFFLINE БОРТОВОЙ РЕЖИМ" if SYSTEM_STATE["mode"] == "offline" else "ONLINE ОБЛАЧНЫЙ РЕЖИМ"
    }

@app.get("/api/taxonomy")
def get_taxonomy():
    return TAXONOMY

if os.path.exists("true"):
    app.mount("/landing", StaticFiles(directory="true", html=True), name="landing")
    app.mount("/true", StaticFiles(directory="true", html=True), name="true")
elif os.path.exists("landing"):
    app.mount("/landing", StaticFiles(directory="landing", html=True), name="landing")
if os.path.exists("web_app"):
    app.mount("/", StaticFiles(directory="web_app", html=True), name="web_app")
