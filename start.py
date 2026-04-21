#!/usr/bin/env python3
"""
JanSetu AI - One Command Startup Script
Starts both Backend (Flask) and Frontend (Vite) simultaneously
"""

import subprocess
import sys
import os
import signal
import time

def signal_handler(sig, frame):
    print("\n🛑 Shutting down JanSetu AI...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def start_backend():
    """Start Flask backend on port 5000"""
    print("🚀 Starting Backend (Flask) on http://localhost:5000")
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    return subprocess.Popen(
        [sys.executable, 'app.py'],
        cwd=backend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

def start_frontend():
    """Start Vite frontend on port 5173"""
    print("🚀 Starting Frontend (Vite) on http://localhost:5173")
    frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
    return subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=frontend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=True  # Required for npm on Windows
    )

def stream_output(process, prefix):
    """Stream output from a process with a prefix"""
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"[{prefix}] {line.strip()}")
    except:
        pass

def main():
    print("=" * 60)
    print("     JanSetu AI - Civic Complaint Redressal Platform")
    print("=" * 60)
    print()
    
    # Check if node_modules exists
    frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
    if not os.path.exists(os.path.join(frontend_path, 'node_modules')):
        print("⚠️  Frontend dependencies not found. Installing...")
        subprocess.run(['npm', 'install'], cwd=frontend_path, shell=True)
    
    # Start both services
    backend_proc = start_backend()
    time.sleep(2)  # Give backend a head start
    frontend_proc = start_frontend()
    
    print()
    print("✅ JanSetu AI is running!")
    print("   Backend:  http://localhost:5000")
    print("   Frontend: http://localhost:5173")
    print()
    print("Press Ctrl+C to stop both servers")
    print("-" * 60)
    
    try:
        while True:
            # Check if processes are still running
            if backend_proc.poll() is not None:
                print("❌ Backend stopped unexpectedly")
                break
            if frontend_proc.poll() is not None:
                print("❌ Frontend stopped unexpectedly")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        print("\n🛑 Stopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        time.sleep(1)
        if backend_proc.poll() is None:
            backend_proc.kill()
        if frontend_proc.poll() is None:
            frontend_proc.kill()
        print("✅ Servers stopped")

if __name__ == '__main__':
    main()
