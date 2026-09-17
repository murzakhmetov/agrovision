#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================================="
echo " AgroVision AI - Бортовая Веб-Система Опрыскивания (ПК)"
echo " Режим работы: OFFLINE (Костанайская область, Олжа Агро)"
echo " Скорость опрыскивателя: 18-20 км/ч | Штанга: 24м (8 секций)"
echo " Локальные CV Модели: YOLOv8s CropAndWeed + YOLO11n Broadleaf"
echo "================================================================="

echo "Запуск локального бэкенда на http://localhost:8000 ..."
python3 -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
