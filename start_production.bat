@echo off
chcp 65001 > nul
setlocal

echo ==========================================
echo   学生积分商城 - 生产环境启动脚本
echo ==========================================

REM 设置路径
set FRONTEND_DIR=%~dp0frontend
set BACKEND_DIR=%~dp0backend

REM 检查前端构建
if not exist "%FRONTEND_DIR%\dist" (
    echo [WARNING] 前端未构建，正在构建...
    cd /d "%FRONTEND_DIR%"
    call npm run build
    if errorlevel 1 (
        echo [ERROR] 前端构建失败！
        pause
        exit /b 1
    )
    cd /d %~dp0
)

echo.
echo [1/2] 启动后端服务...
start "PointsMall-Backend" cmd /k "cd /d %BACKEND_DIR% && D:\miniconda3\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/2] 启动前端服务...
start "PointsMall-Frontend" cmd /k "cd /d %~dp0 && D:\miniconda3\python.exe serve_production.py --port 80"

timeout /t 2 /nobreak > nul

echo.
echo ==========================================
echo   服务已启动！
echo ==========================================
echo.
echo 访问地址：
echo   - 前端页面: http://localhost
echo   - API 文档: http://localhost:8000/docs
echo.
echo 默认管理员账号: admin / admin123
echo.
echo 注意：如果使用 80 端口，需要管理员权限
echo       可以使用 --port 8080 参数改为 8080 端口
echo.
pause
