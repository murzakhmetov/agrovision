#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================================="
echo " AgroVision AI - Бортовой Компьютер Опрыскивателя (ПК)"
echo " Автоматический запуск и проверка зависимостей"
echo "================================================================="

if [ ! -f ".venv/bin/activate" ]; then
    echo "[1/3] Создание виртуального окружения Python..."
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "[2/3] Проверка и установка зависимостей..."
pip install --upgrade pip >/dev/null 2>&1 || true
pip install -r requirements.txt

echo "[3/3] Запуск AgroVision AI на http://localhost:8000 ..."
if command -v xdg-open >/dev/null 2>&1; then
    (sleep 1.5 && xdg-open http://localhost:8000 >/dev/null 2>&1) &
elif command -v open >/dev/null 2>&1; then
    (sleep 1.5 && open http://localhost:8000 >/dev/null 2>&1) &
fi

python3 -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
