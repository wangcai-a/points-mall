param(
    [string]$mode = "all"
)

$env:PATH = "C:\Program Files\nodejs;D:\miniconda3;D:\miniconda3\Scripts;" + $env:PATH
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$backendDir = "D:\code\积分商城\backend"
$frontendDir = "D:\code\积分商城\frontend"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Student Points Mall - Startup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$processes = @()
$modeLower = $mode.ToLower()

if ($modeLower -eq "all" -or $modeLower -eq "backend") {
    Write-Host "[1/2] Starting backend..." -ForegroundColor Yellow
    $backendBat = "@echo off`nD:\miniconda3\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    $backendBatPath = Join-Path $env:TEMP "start_backend.bat"
    Set-Content -Path $backendBatPath -Value $backendBat -Encoding ASCII
    $processes += Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $backendBatPath -PassThru -WindowStyle Hidden
}

if ($modeLower -eq "all" -or $modeLower -eq "frontend") {
    Write-Host "[2/2] Starting frontend..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    $frontendBat = "@echo off`ncd /d $frontendDir`nnpm.cmd run dev"
    $frontendBatPath = Join-Path $env:TEMP "start_frontend.bat"
    Set-Content -Path $frontendBatPath -Value $frontendBat -Encoding ASCII
    $processes += Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $frontendBatPath -PassThru -WindowStyle Hidden
}

if ($modeLower -eq "all") {
    Write-Host "All services started!" -ForegroundColor Green
}
elseif ($modeLower -eq "backend") {
    Write-Host "Backend started!" -ForegroundColor Green
}
elseif ($modeLower -eq "frontend") {
    Write-Host "Frontend started!" -ForegroundColor Green
}
else {
    Write-Host "Usage: .\start_all.ps1 [-mode <all|backend|frontend>]" -ForegroundColor Yellow
    Write-Host "  all      - Start all services (default)" -ForegroundColor Gray
    Write-Host "  backend  - Start backend only" -ForegroundColor Gray
    Write-Host "  frontend - Start frontend only" -ForegroundColor Gray
    exit 1
}

Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "Press any key to stop services..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "Stopping services..." -ForegroundColor Yellow
foreach ($proc in $processes) {
    if ($proc -and $proc.Id) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "Services stopped." -ForegroundColor Green
