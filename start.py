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

def start_backend():
    global backend_proc
    print("\n[Backend] Starting backend...")
    python = get_python_path()
    cmd = [python, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(BACKEND_PORT), "--reload"]
    env = os.environ.copy()
    if platform.system() == "Windows":
        env["PATH"] = r"D:\miniconda3;D:\miniconda3\Scripts;" + env.get("PATH", "")
    backend_proc = subprocess.Popen(cmd, cwd=BACKEND_DIR, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    processes.append(backend_proc)
    t = threading.Thread(target=stream_output, args=(backend_proc.stdout, "Backend", None), daemon=True)
    t.start()
    return backend_proc

def start_frontend():
    print("[Frontend] Starting frontend...")
    npm = get_npm_path()
    cmd = [npm, "run", "dev"]
    env = os.environ.copy()
    if platform.system() == "Windows":
        env["PATH"] = r"C:\Program Files\nodejs;" + env.get("PATH", "")
    proc = subprocess.Popen(cmd, cwd=FRONTEND_DIR, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    processes.append(proc)
    t = threading.Thread(target=stream_output, args=(proc.stdout, "Frontend", None), daemon=True)
    t.start()
    return proc

def stop_services(signum=None, frame=None):
    print("\n\nStopping services...")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except:
            try:
                proc.kill()
            except:
                pass
    print("Services stopped.")
    sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="Student Points Mall Startup Script")
    parser.add_argument("--mode", choices=["all", "backend", "frontend"], default="all", help="Startup mode")
    args = parser.parse_args()

    print("=" * 50)
    print("  Student Points Mall - Startup Script")
    print(f"  Platform: {platform.system()}")
    print(f"  Mode: {args.mode}")
    print("=" * 50)

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
