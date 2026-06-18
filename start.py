#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import signal
import time
import threading
import argparse

BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
BACKEND_PORT = 8000
FRONTEND_PORT = 5173

IS_WINDOWS = platform.system() == "Windows"
IS_LINUX = platform.system() == "Linux"
IS_MACOS = platform.system() == "Darwin"
PLATFORM_NAME = "Windows" if IS_WINDOWS else ("Linux" if IS_LINUX else ("macOS" if IS_MACOS else platform.system()))

processes = []
backend_proc = None


def get_python_path():
    system = platform.system()
    if system == "Windows":
        candidates = [
            r"D:\miniconda3\python.exe",
            r"C:\miniconda3\python.exe",
            r"C:\ProgramData\Anaconda3\python.exe",
            r"C:\Python311\python.exe",
            r"C:\Python310\python.exe",
            r"C:\Python39\python.exe",
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
    elif system == "Darwin":
        candidates = [
            "/opt/homebrew/bin/python3",
            "/usr/local/bin/python3",
            "/usr/bin/python3",
            "python3",
        ]
        for cmd in candidates:
            try:
                result = subprocess.run([cmd, "--version"], capture_output=True)
                if result.returncode == 0:
                    return cmd
            except:
                continue
    for cmd in ["python3", "python"]:
        try:
            result = subprocess.run([cmd, "--version"], capture_output=True)
            if result.returncode == 0:
                return cmd
        except:
            continue
    return "python"


def get_npm_path():
    system = platform.system()
    if system == "Windows":
        candidates = [
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files\nodejs\npm",
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
    elif system == "Darwin":
        candidates = [
            "/opt/homebrew/bin/npm",
            "/usr/local/bin/npm",
            "/usr/bin/npm",
            "npm",
        ]
        for cmd in candidates:
            try:
                result = subprocess.run([cmd, "--version"], capture_output=True)
                if result.returncode == 0:
                    return cmd
            except:
                continue
    return "npm"


def stream_output(pipe, label):
    try:
        for line in iter(pipe.readline, ''):
            if line:
                print(f"[{label}] {line.rstrip()}", flush=True)
    except:
        pass


def start_backend_windows():
    global backend_proc
    print("\n[Backend] Starting backend (Windows)...")
    python = get_python_path()
    cmd = [python, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(BACKEND_PORT), "--reload"]
    env = os.environ.copy()
    env["PATH"] = r"D:\miniconda3;D:\miniconda3\Scripts;" + env.get("PATH", "")
    creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    backend_proc = subprocess.Popen(
        cmd, cwd=BACKEND_DIR, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        creationflags=creationflags,
    )
    processes.append(backend_proc)
    t = threading.Thread(target=stream_output, args=(backend_proc.stdout, "Backend"), daemon=True)
    t.start()
    return backend_proc


def start_backend_posix():
    global backend_proc
    print(f"\n[Backend] Starting backend ({PLATFORM_NAME})...")
    python = get_python_path()
    cmd = [python, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(BACKEND_PORT), "--reload"]
    backend_proc = subprocess.Popen(
        cmd, cwd=BACKEND_DIR,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        preexec_fn=os.setsid,
    )
    processes.append(backend_proc)
    t = threading.Thread(target=stream_output, args=(backend_proc.stdout, "Backend"), daemon=True)
    t.start()
    return backend_proc


def start_frontend_windows():
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
    t = threading.Thread(target=stream_output, args=(proc.stdout, "Frontend"), daemon=True)
    t.start()
    return proc


def start_frontend_posix():
    print(f"[Frontend] Starting frontend ({PLATFORM_NAME})...")
    npm = get_npm_path()
    cmd = [npm, "run", "dev"]
    proc = subprocess.Popen(
        cmd, cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
        preexec_fn=os.setsid,
    )
    processes.append(proc)
    t = threading.Thread(target=stream_output, args=(proc.stdout, "Frontend"), daemon=True)
    t.start()
    return proc


def start_backend():
    if IS_WINDOWS:
        return start_backend_windows()
    else:
        return start_backend_posix()


def start_frontend():
    if IS_WINDOWS:
        return start_frontend_windows()
    else:
        return start_frontend_posix()


def stop_services_windows(signum=None, frame=None):
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


def stop_services_posix(signum=None, frame=None):
    print(f"\n\nStopping services ({PLATFORM_NAME})...")
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
    if IS_WINDOWS:
        stop_services_windows(signum, frame)
    else:
        stop_services_posix(signum, frame)


def main():
    global BACKEND_PORT, FRONTEND_PORT
    parser = argparse.ArgumentParser(description="Student Points Mall Startup Script")
    parser.add_argument("--mode", choices=["all", "backend", "frontend"], default="all", help="Startup mode")
    parser.add_argument("--backend-port", type=int, default=BACKEND_PORT, help=f"Backend port (default: {BACKEND_PORT})")
    parser.add_argument("--frontend-port", type=int, default=FRONTEND_PORT, help=f"Frontend port (default: {FRONTEND_PORT})")
    args = parser.parse_args()

    BACKEND_PORT = args.backend_port
    FRONTEND_PORT = args.frontend_port

    print("=" * 50)
    print("  Student Points Mall - Startup Script")
    print(f"  Platform: {PLATFORM_NAME}")
    print(f"  Mode: {args.mode}")
    print("=" * 50)

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
        print(f"  Backend: http://0.0.0.0:{BACKEND_PORT}")
        print(f"  API Docs: http://0.0.0.0:{BACKEND_PORT}/docs")
    if args.mode in ["all", "frontend"]:
        print(f"  Frontend: http://0.0.0.0:{FRONTEND_PORT}")
    print("=" * 50)
    print("\nPress Ctrl+C to stop services...\n")

    while True:
        time.sleep(1)


if __name__ == "__main__":
    main()
