import sys
import importlib.util
from pathlib import Path

# Add backend directory to sys.path so submodules (db, auth, engine, analysis, reporting) resolve correctly
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Load backend/main.py cleanly without circular name conflict
spec = importlib.util.spec_from_file_location("backend_main", backend_dir / "main.py")
backend_main = importlib.util.module_from_spec(spec)
sys.modules["backend_main"] = backend_main
spec.loader.exec_module(backend_main)

app = backend_main.app
