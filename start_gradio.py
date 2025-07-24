#!/usr/bin/env python3
"""
Quick start script for the Gradio-wrapped React app
"""

import subprocess
import sys
import os

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import gradio
        import requests
        print("✅ Python dependencies found")
        return True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        print("Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        return True

def check_node_dependencies():
    """Check if Node.js dependencies are installed"""
    if not os.path.exists("node_modules"):
        print("📦 Installing Node.js dependencies...")
        subprocess.check_call(["npm", "install"])
    else:
        print("✅ Node.js dependencies found")

def main():
    print("🚀 Starting Grand Opus Tactical War Game with Gradio...")
    
    # Check dependencies
    check_dependencies()
    check_node_dependencies()
    
    # Run the Gradio app
    print("🌐 Launching Gradio interface...")
    subprocess.run([sys.executable, "gradio_app.py"])

if __name__ == "__main__":
    main()