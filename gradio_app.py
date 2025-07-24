import gradio as gr
import subprocess
import threading
import time
import requests
import os
import signal
import sys

class ReactAppWrapper:
    def __init__(self):
        self.vite_process = None
        self.app_url = "http://localhost:3000"
        
    def start_react_app(self):
        """Start the Vite dev server in the background"""
        try:
            # Start the Vite dev server
            self.vite_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for the server to start
            max_attempts = 30
            for attempt in range(max_attempts):
                try:
                    response = requests.get(self.app_url, timeout=2)
                    if response.status_code == 200:
                        print(f"✅ React app started successfully at {self.app_url}")
                        return True
                except requests.exceptions.RequestException:
                    time.sleep(1)
                    
            print("❌ Failed to start React app")
            return False
            
        except Exception as e:
            print(f"❌ Error starting React app: {e}")
            return False
    
    def stop_react_app(self):
        """Stop the Vite dev server"""
        if self.vite_process:
            try:
                self.vite_process.terminate()
                self.vite_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.vite_process.kill()
            print("🛑 React app stopped")

# Initialize the wrapper
app_wrapper = ReactAppWrapper()

def get_app_iframe():
    """Return HTML iframe embedding the React app"""
    return f"""
    <iframe 
        src="{app_wrapper.app_url}" 
        width="100%" 
        height="800px" 
        frameborder="0"
        style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
        title="Grand Opus Tactical War Game">
    </iframe>
    """

def refresh_app():
    """Refresh the app iframe"""
    return get_app_iframe()

# Create the Gradio interface
with gr.Blocks(
    title="Grand Opus Tactical War Game",
    theme=gr.themes.Soft(),
    css="""
    .gradio-container {
        max-width: 1200px !important;
    }
    """
) as demo:
    
    gr.Markdown("""
    # 🎮 Grand Opus Tactical War Game
    
    A squad-based tactical war game with Ogre Battle-style mechanics built with React and TypeScript.
    
    **Features:**
    - Squad-based tactical combat
    - Unit recruitment and management  
    - Equipment and ember systems
    - Campaign progression
    - 3D battle visualization
    """)
    
    with gr.Row():
        with gr.Column(scale=4):
            app_display = gr.HTML(
                value=get_app_iframe(),
                label="Game Interface"
            )
        
        with gr.Column(scale=1):
            gr.Markdown("### 🎮 Controls")
            refresh_btn = gr.Button("🔄 Refresh Game", variant="secondary")
            
            gr.Markdown("### 📋 Game Info")
            gr.Markdown("""
            - **Units Page**: Manage your army
            - **Squad Editor**: Create formations  
            - **Battle System**: Tactical combat
            - **Store**: Buy equipment
            - **Campaign**: Story progression
            """)
            
            gr.Markdown("### 🔧 Development")
            gr.Markdown(f"""
            - **Local URL**: {app_wrapper.app_url}
            - **Framework**: React + Vite
            - **Language**: TypeScript
            """)
    
    # Event handlers
    refresh_btn.click(
        fn=refresh_app,
        outputs=app_display
    )

def cleanup():
    """Cleanup function to stop the React app"""
    app_wrapper.stop_react_app()

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print("\n🛑 Shutting down...")
    cleanup()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == "__main__":
    # Start the React app in a separate thread
    print("🚀 Starting React app...")
    
    def start_app_thread():
        app_wrapper.start_react_app()
    
    app_thread = threading.Thread(target=start_app_thread, daemon=True)
    app_thread.start()
    
    # Wait a moment for the app to start
    time.sleep(3)
    
    try:
        # Launch Gradio with share=True for community links
        print("🌐 Launching Gradio with public sharing...")
        print("⏳ Generating public share URL (this may take a moment)...")
        print("💡 Look for a line that says 'Public URL:' or contains '.gradio.live'")
        print("=" * 60)
        
        # Launch Gradio - it should automatically print the share URL
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=True,  # This enables Gradio's community links!
            show_error=True,
            quiet=False,  # Keep this False so we see all output including URLs
            inbrowser=False,  # Don't auto-open so we can see the URL first
            prevent_thread_lock=False
        )
        
        print("=" * 60)
        print("🔍 If you don't see a public URL above, try:")
        print("   1. Check your internet connection")
        print("   2. Run: pip install --upgrade gradio")
        print("   3. Try running the script again")
        print("=" * 60)
        
    except KeyboardInterrupt:
        cleanup()
    except Exception as e:
        print(f"❌ Error launching Gradio: {e}")
        print("💡 Try running: pip install --upgrade gradio")
        cleanup()
    finally:
        cleanup()