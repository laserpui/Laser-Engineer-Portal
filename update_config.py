import os
import re
import json
import urllib.parse

# Define paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_JSON_PATH = os.path.join(ROOT_DIR, "config.json")
CONFIG_JS_PATH = os.path.join(ROOT_DIR, "config.js")

# Directories to exclude from scanning
EXCLUDE_DIRS = {".git", "__pycache__", "node_modules", ".gemini", "scratch"}

# Known category mappings for the initial directories
CATEGORY_MAPPINGS = {
    "Electrical Calculator": "calculator",
    "Spare Part List": "inventory",
    "ข้อมูลผลิตภัณฑ์": "inventory",
    "บันทึกรายงานต่างๆ": "reports"
}

# Default categories mapping for newly discovered directories
DEFAULT_CATEGORIES = {
    "calculator": {
        "name": "เครื่องมือคำนวณ & ออกแบบ",
        "icon": "calculator",
        "color": "from-blue-500 to-cyan-500",
        "bgClass": "bg-blue-500/10 text-blue-700 dark:text-blue-300"
    },
    "inventory": {
        "name": "รายการอะไหล่ & ผลิตภัณฑ์",
        "icon": "package",
        "color": "from-emerald-500 to-teal-500",
        "bgClass": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    },
    "reports": {
        "name": "บันทึกรายงานต่างๆ",
        "icon": "file-text",
        "color": "from-purple-500 to-indigo-500",
        "bgClass": "bg-purple-500/10 text-purple-700 dark:text-purple-300"
    }
}

def slugify(text):
    # Convert Thai and other characters to a simple slug
    text = text.lower().strip()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]', '', text)
    return text or "app"

def extract_html_metadata(file_path):
    title = ""
    description = ""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
            # Extract title
            title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
            if title_match:
                title = title_match.group(1).strip()
            
            # Extract description
            desc_match = re.search(
                r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', 
                content, 
                re.IGNORECASE | re.DOTALL
            )
            if not desc_match:
                desc_match = re.search(
                    r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']', 
                    content, 
                    re.IGNORECASE | re.DOTALL
                )
            if desc_match:
                description = desc_match.group(1).strip()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        
    if not title:
        title = os.path.basename(file_path).replace(".html", "")
        
    return title, description

def main():
    print("Scanning workspace for web applications...")
    
    # Load current configuration if exists
    config_data = {
        "systemName": "Laser Engineer Portal",
        "logoPath": "Laser Engineer_Logo_PNG-01.png",
        "categories": list(DEFAULT_CATEGORIES.values()),
        "apps": []
    }
    
    if os.path.exists(CONFIG_JSON_PATH):
        try:
            with open(CONFIG_JSON_PATH, "r", encoding="utf-8") as f:
                config_data = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to load existing config.json: {e}")

    # Build maps of existing apps and categories for lookup
    existing_apps = {app["path"]: app for app in config_data.get("apps", [])}
    categories_dict = {cat["id"]: cat for cat in config_data.get("categories", [])}
    
    scanned_apps = []
    scanned_paths = set()
    
    # Scan workspace folders
    for root, dirs, files in os.walk(ROOT_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        # Don't scan root directory files (exclude index.html at root)
        if root == ROOT_DIR:
            continue
            
        for file in files:
            if file.lower().endswith(".html"):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR).replace("\\", "/")
                
                # Check top-level folder name to determine category
                parts = rel_path.split("/")
                top_folder = parts[0]
                
                # Determine category ID
                category_id = CATEGORY_MAPPINGS.get(top_folder)
                if not category_id:
                    category_id = slugify(top_folder)
                    # If this category doesn't exist yet, add it
                    if category_id not in categories_dict:
                        new_category = {
                            "id": category_id,
                            "name": top_folder,
                            "icon": "folder",
                            "color": "from-slate-500 to-gray-500",
                            "bgClass": "bg-slate-500/10 text-slate-700 dark:text-slate-300"
                        }
                        categories_dict[category_id] = new_category
                        print(f"Discovered new category/folder: '{top_folder}' (id: '{category_id}')")
                
                # Extract metadata
                title, description = extract_html_metadata(full_path)
                
                # Check if this app was already in the configuration
                if rel_path in existing_apps:
                    # Preserve existing metadata, user may have customized it
                    app_info = existing_apps[rel_path]
                    # Update category and path just in case
                    app_info["category"] = category_id
                    # If description was empty, update it
                    if not app_info.get("description") and description:
                        app_info["description"] = description
                else:
                    # Create a new app entry
                    app_id = slugify(os.path.basename(file).replace(".html", ""))
                    # Avoid duplicate IDs
                    suffix = 1
                    base_id = app_id
                    all_ids = {a["id"] for a in scanned_apps} | {a["id"] for a in existing_apps.values()}
                    while app_id in all_ids:
                        app_id = f"{base_id}-{suffix}"
                        suffix += 1
                        
                    # Choose a default icon based on category
                    default_icon = "link"
                    if category_id == "calculator":
                        default_icon = "zap"
                    elif category_id == "inventory":
                        default_icon = "package"
                    elif category_id == "reports":
                        default_icon = "file-text"
                        
                    app_info = {
                        "id": app_id,
                        "name": title,
                        "category": category_id,
                        "path": rel_path,
                        "icon": default_icon,
                        "description": description or f"เว็บแอปพลิเคชันในโฟลเดอร์ {top_folder}",
                        "frequent": False
                    }
                    print(f"Discovered new web application: '{title}' at '{rel_path}'")
                
                scanned_apps.append(app_info)
                scanned_paths.add(rel_path)
                
    # Filter categories list to only include categories that have apps
    active_categories = []
    used_categories = {app["category"] for app in scanned_apps}
    for cat_id, cat in categories_dict.items():
        if cat_id in used_categories:
            active_categories.append(cat)
            
    # Update config structure
    config_data["categories"] = active_categories
    config_data["apps"] = scanned_apps
    
    # Save back to config.json
    with open(CONFIG_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=2, ensure_ascii=False)
    print("Updated config.json successfully.")
        
    # Save back to config.js
    config_js_content = f"""// Laser Engineer System Dashboard Configuration
// This file is auto-generated by update_config.py.
window.DASHBOARD_CONFIG = {json.dumps(config_data, indent=2, ensure_ascii=False)};
"""
    with open(CONFIG_JS_PATH, "w", encoding="utf-8") as f:
        f.write(config_js_content)
    print("Updated config.js successfully.")
    print(f"Total Categories: {len(active_categories)} | Total Apps: {len(scanned_apps)}")

if __name__ == "__main__":
    main()
