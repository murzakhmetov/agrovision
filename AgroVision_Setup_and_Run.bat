@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

title AgroVision AI - Бортовой Компьютер Опрыскивателя

echo ================================================================
echo  AgroVision AI - Автоматическая Установка и Запуск
echo  Режим: OFFLINE / ONLINE ^| Скорость: 18-20 км/ч
echo ================================================================
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ВНИМАНИЕ] Python не обнаружен в системе.
        echo Открывается страница загрузки официального установщика Python...
        start "" "https://www.python.org/downloads/"
        echo.
        echo Пожалуйста, установите Python 3.10 или новее.
        echo При установке обязательно включите галочку: Add Python to PATH!
        echo После завершения установки снова запустите этот файл.
        echo.
        pause
        exit /b 1
    ) else (
        set PY_EXEC=py -3
    )
) else (
    set PY_EXEC=python
)

if not exist ".venv\Scripts\activate.bat" (
    echo [1/3] Создание виртуального окружения Python...
    %PY_EXEC% -m venv .venv
    if %errorlevel% neq 0 (
        echo [ОШИБКА] Не удалось создать виртуальное окружение.
        pause
        exit /b 1
    )
)

call .venv\Scripts\activate.bat

echo [2/3] Проверка и установка библиотек...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ОШИБКА] Ошибка при установке библиотек.
    pause
    exit /b 1
)

echo [3/3] Запуск AgroVision AI и открытие браузера...
start "" "http://localhost:8000"

python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000

if %errorlevel% neq 0 (
    echo.
    echo Сервер остановлен.
    pause
)
