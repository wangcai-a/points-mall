#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import signal
import time
import threading
import argparse
from queue import Queue, Empty

BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
BACKEND_PORT = 8000
FRONTEND_PORT = 5173

IS_WINDOWS = platform.system() == "Windows"
IS_LINUX = platform.system() == "Linux"
PLATFORM_NAME = "Windows" if IS_WINDOWS else ("Linux" if IS_LINUX else platform.system())

processes = []
backend_proc = None

def get_python_path():
    if platform.system() == "Windows":
        candidates = [
            r"D:\miniconda3\python.exe",
            r"C:\miniconda3\python.exe",
            r"C:\ProgramData\Anaconda3\python.exe",
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
    for cmd in ["python3", "python"]:
        try:
            result = subprocess.run([cmd, "--version"], capture_output=True)
            if result.returncode == 0:
                return cmd
        except:
            continue
    return "python"

def get_npm_path():
    if platform.system() == "Windows":
        candidates = [
            r"C:\Program Files\nodejs\npm.cmd",
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
    return "npm"

def stream_output(pipe, label, queue):
    try:
        for line in iter(pipe.readline, ''):
            if line:
                print(f"[{label}] {line.rstrip()}", flush=True)
    except:
        pass

def start_backend_windows():
    """Windows 平台启动后端"""
    global backend_proc
    print("\n[Backend] Starting backend (Windows)...")
    python = get_python_path()
    cmd = [python, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(BACKEND_PORT), "--reload"]
    env = os.environ.copy()
    env["PATH"] = r"D:\miniconda3;D:\miniconda3\Scripts;" + env.get("PATH", "")
    # Windows 下使用 CREATE_NEW_PROCESS_GROUP，使 Ctrl+C 事件可正确传递
    creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    backend_proc = subprocess.Popen(
        cmd, cwd=BACKEND_DIR, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        creationflags=creationflags,
    )
    processes.append(backend_proc)
    t = threading.Thread(target=stream_output, args=(backend_proc.stdout, "Backend", None), daemon=True)
    t.start()
    return backend_proc


def start_backend_linux():
    """Linux 平台启动后端"""
    global backend_proc
    print("\n[Backend] Starting backend (Linux)...")
    python = get_python_path()
    cmd = [python, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(BACKEND_PORT), "--reload"]
    # Linux 下使用 setsid 创建新进程组，便于向整组进程发信号
    backend_proc = subprocess.Popen(
        cmd, cwd=BACKEND_DIR,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        preexec_fn=os.setsid,
    )
    processes.append(backend_proc)
    t = threading.Thread(target=stream_output, args=(backend_proc.stdout, "Backend", None), daemon=True)
    t.start()
    return backend_proc


def start_frontend_windows():
    """Windows 平台启动前端"""
    print("[Frontend] Starting frontend (Windows)...")
    npm = get_npm_path()
    cmd = [npm, "run", "dev"]
    env = os.environ.copy()
    env["PATH"] = r"C:\Program Files\nodejs;" + env.get("PATH", "")
    creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    proc = subprocess.Popen(
        cmd, cwd=FRONTEND_DIR, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        creationflags=creationflags,
    )
    processes.append(proc)
    t = threading.Thread(target=stream_output, args=(proc.stdout, "Frontend", None), daemon=True)
    t.start()
    return proc


def start_frontend_linux():
    """Linux 平台启动前端"""
    print("[Frontend] Starting frontend (Linux)...")
    npm = get_npm_path()
    cmd = [npm, "run", "dev"]
    proc = subprocess.Popen(
        cmd, cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        preexec_fn=os.setsid,
    )
    processes.append(proc)
    t = threading.Thread(target=stream_output, args=(proc.stdout, "Frontend", None), daemon=True)
    t.start()
    return proc


def start_backend():
    """根据平台选择对应的后端启动方法"""
    if IS_WINDOWS:
        return start_backend_windows()
    elif IS_LINUX:
        return start_backend_linux()
    else:
        raise OSError(f"Unsupported platform: {platform.system()}")


def start_frontend():
    """根据平台选择对应的前端启动方法"""
    if IS_WINDOWS:
        return start_frontend_windows()
    elif IS_LINUX:
        return start_frontend_linux()
    else:
        raise OSError(f"Unsupported platform: {platform.system()}")


def stop_services_windows(signum=None, frame=None):
    """Windows 平台停止服务：terminate() 内部调用 TerminateProcess"""
    print("\n\nStopping services (Windows)...")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
    print("Services stopped.")
    sys.exit(0)


def stop_services_linux(signum=None, frame=None):
    """Linux 平台停止服务：向整个进程组发送信号"""
    print("\n\nStopping services (Linux)...")
    for proc in processes:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            proc.wait(timeout=3)
        except Exception:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
            except Exception:
                pass
    print("Services stopped.")
    sys.exit(0)


def stop_services(signum=None, frame=None):
    """根据平台选择对应的停止服务方法"""
    if IS_WINDOWS:
        stop_services_windows(signum, frame)
    elif IS_LINUX:
        stop_services_linux(signum, frame)
    else:
        # 兜底逻辑
        for proc in processes:
            try:
                proc.terminate()
                proc.wait(timeout=3)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
        sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="Student Points Mall Startup Script")
    parser.add_argument("--mode", choices=["all", "backend", "frontend"], default="all", help="Startup mode")
    args = parser.parse_args()

    print("=" * 50)
    print("  Student Points Mall - Startup Script")
    print(f"  Platform: {PLATFORM_NAME}")
    print(f"  Mode: {args.mode}")
    print("=" * 50)

    # Windows 不支持 SIGTERM，仅注册 SIGINT（Ctrl+C）
    if IS_WINDOWS:
        signal.signal(signal.SIGINT, stop_services)
    else:
        signal.signal(signal.SIGINT, stop_services)
        signal.signal(signal.SIGTERM, stop_services)

    if args.mode in ["all", "backend"]:
        start_backend()
        time.sleep(2)
        
    if args.mode in ["all", "frontend"]:
        start_frontend()

    print("\n" + "=" * 50)
    print("  Services started!")
    print("=" * 50)
    if args.mode in ["all", "backend"]:
        print(f"  Backend: http://localhost:{BACKEND_PORT}")
        print(f"  API Docs: http://localhost:{BACKEND_PORT}/docs")
    if args.mode in ["all", "frontend"]:
        print(f"  Frontend: http://localhost:{FRONTEND_PORT}")
    print("=" * 50)
    print("\nPress Ctrl+C to stop services...\n")

    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()
