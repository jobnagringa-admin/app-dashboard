#!/usr/bin/env python3
"""
Script to organize and standardize public assets.
Categorizes files by type and renames them with descriptive names.
"""

import os
import re
import shutil
import json
from pathlib import Path
from collections import defaultdict

# Base directory
BASE_DIR = Path(__file__).parent.parent
PUBLIC_DIR = BASE_DIR / "public"
CDN_ASSETS_DIR = PUBLIC_DIR / "cdn-assets"

# New organized structure
NEW_STRUCTURE = {
    "favicons": "favicons",
    "logos": "images/logos",
    "icons": "images/icons",
    "screenshots": "images/screenshots",
    "graphics": "images/graphics",
    "photos": "images/photos",
    "css": "styles",
    "js": "scripts",
    "other": "misc"
}

# File type mappings
FILE_CATEGORIES = {
    "favicon": ["favicon", "retina"],
    "logo": ["logo", "brand", "wells-fargo", "higlobe", "revelo", "braintrust", "cambly", 
             "vanhack", "strider", "mercord", "flatirons", "techfx", "adaflow", "langate",
             "planner", "very-good-ventures", "yougov", "axonius", "webfxinc", "mobiz",
             "propel", "bwisemedia", "intersec", "decentralized", "itscout", "pix4d",
             "airalocom", "truelogic", "whiz1", "brokerkit", "open-english", "vicarius",
             "goto", "onfleet", "thales", "partner"],
    "icon": ["icon", "x-icon", "linkedin", "google", "bing", "duckduckgo", "yahoo"],
    "screenshot": ["screenshot", "untitled", "image", "frame"],
    "graphic": ["vector", "wrapper", "mesh", "gemini", "currency", "usdbrl"],
    "photo": ["husky", "channels4", "profile"],
    "css": ["css"],
    "js": ["js", "webflow"]
}

# Name mappings for common files
KNOWN_NAMES = {
    "642aa9b6129f71848c627af5_favicon.jpg": "favicon.jpg",
    "642aa9ba69d01ce76135f2d0_retina.jpg": "apple-touch-icon.jpg",
    "64823ad1f11f6a5ee085b6c1_Vectors-Wrapper.svg": "logo-vectors-wrapper.svg",
    "64823ad2f11f6a5ee085b6d9_Vectors-Wrapper.svg": "logo-vectors-wrapper-alt.svg",
    "64a93447a4d8d06ce540f5fc_wells-fargo.svg": "logo-wells-fargo.svg",
    "657cb98d8f25b29d4ddda87a_usdbrl_cur (1).svg": "currency-usdbrl.svg",
    "66fa20663b706c601554155b_og-image-jng.jpg": "og-image.jpg",
    "67563aa17278edf4cf79c3cb_logo-small_white.svg": "logo-small-white.svg",
    "68838c5bc52c45d16d1c8bec_logo-techfx 1.svg": "logo-techfx.svg",
    "jobnagringa.webflow.shared.aca489c6b.min.css": "webflow-shared.min.css",
    "webflow.d94da6a8.ea62f8e5992eb517.js": "webflow-main.js",
    "webflow.schunk.59c6248219f37ae8.js": "webflow-chunk-1.js",
    "webflow.schunk.85d4c368d7c8f770.js": "webflow-chunk-2.js",
}

def categorize_file(filename):
    """Categorize a file based on its name."""
    filename_lower = filename.lower()
    
    # Check known names first
    if filename in KNOWN_NAMES:
        new_name = KNOWN_NAMES[filename]
        if "favicon" in new_name or "apple-touch" in new_name:
            return "favicons", new_name
        elif "logo" in new_name:
            return "logos", new_name
        elif "icon" in new_name:
            return "icons", new_name
        elif "og-image" in new_name:
            return "graphics", new_name
    
    # Check file categories
    for category, keywords in FILE_CATEGORIES.items():
        if any(keyword in filename_lower for keyword in keywords):
            if category == "favicon":
                return "favicons", None
            elif category == "logo":
                return "logos", None
            elif category == "icon":
                return "icons", None
            elif category == "screenshot":
                return "screenshots", None
            elif category == "graphic":
                return "graphics", None
            elif category == "photo":
                return "photos", None
            elif category == "css":
                return "css", None
            elif category == "js":
                return "js", None
    
    # Default categorization by extension
    ext = Path(filename).suffix.lower()
    if ext in [".css"]:
        return "css", None
    elif ext in [".js"]:
        return "js", None
    elif ext in [".svg"]:
        return "icons", None
    elif ext in [".jpg", ".jpeg", ".png", ".avif", ".webp", ".gif"]:
        return "graphics", None
    
    return "other", None

def clean_filename(filename, original_filename=None):
    """Clean and standardize a filename."""
    original = filename
    ext = Path(filename).suffix
    
    # Remove hash prefix (e.g., "642aa9b6129f71848c627af5_")
    filename = re.sub(r'^[a-f0-9]{24}_', '', filename)
    
    # Extract meaningful parts before cleaning
    # Look for patterns like "img_brain", "usdbrl", etc.
    meaningful_parts = []
    
    # Extract words after common prefixes
    if '_' in filename:
        parts = filename.split('_')
        meaningful_parts.extend([p for p in parts if len(p) > 2 and not p.isdigit()])
    
    # Remove "Untitled" and numbers
    filename = re.sub(r'Untitled\s*\(\d+\)', '', filename)
    filename = re.sub(r'Untitled\s*\d+', '', filename)
    
    # Remove " (1)", " (2)" etc.
    filename = re.sub(r'\s*\(\d+\)', '', filename)
    
    # Remove size suffixes like "-p-500", "-p-800", etc.
    filename = re.sub(r'-p-\d+', '', filename)
    
    # Extract remaining meaningful words
    words = re.findall(r'[a-zA-Z]{2,}', filename)
    if words:
        meaningful_parts.extend(words)
    
    # Clean up spaces and special characters
    filename = re.sub(r'\s+', '-', filename)
    filename = re.sub(r'[^\w\-\.]', '', filename)
    filename = re.sub(r'-+', '-', filename)
    filename = filename.strip('-')
    
    # Convert to lowercase
    filename = filename.lower()
    
    # If filename is empty or just extension, use meaningful parts
    if not filename or filename == ext.lower():
        if meaningful_parts:
            filename = '-'.join(meaningful_parts[:3])  # Use first 3 meaningful parts
        elif original_filename:
            # Use hash from original filename as fallback
            hash_match = re.search(r'^([a-f0-9]{8})', original_filename)
            if hash_match:
                filename = f"file-{hash_match.group(1)}"
            else:
                filename = "file"
        else:
            filename = "file"
    
    # Ensure extension is preserved
    if not filename.endswith(ext.lower()):
        filename = filename + ext.lower()
    
    return filename

def generate_new_name(old_name, category):
    """Generate a new standardized name for a file."""
    # Check if we have a known mapping
    if old_name in KNOWN_NAMES:
        return KNOWN_NAMES[old_name]
    
    # Clean the filename
    cleaned = clean_filename(old_name, old_name)
    
    # Remove extension temporarily for prefix check
    ext = Path(cleaned).suffix
    base_name = Path(cleaned).stem
    
    # Add category prefix if needed
    if category == "logos" and not base_name.startswith("logo-"):
        base_name = f"logo-{base_name}"
    elif category == "icons" and not base_name.startswith("icon-"):
        # Check if it's already descriptive
        if not any(x in base_name for x in ["linkedin", "google", "bing", "x", "yahoo", "duckduckgo"]):
            base_name = f"icon-{base_name}"
    elif category == "screenshots" and not base_name.startswith("screenshot-"):
        base_name = f"screenshot-{base_name}"
    elif category == "graphics" and not base_name.startswith("graphic-"):
        if not any(x in base_name for x in ["og-image", "mesh", "vector", "currency"]):
            base_name = f"graphic-{base_name}"
    
    return base_name + ext

def scan_files():
    """Scan all files in public directory."""
    files_map = {}
    seen_files = {}  # Track by filename to handle duplicates
    
    # First, scan cdn-assets (preferred location)
    if CDN_ASSETS_DIR.exists():
        for file_path in CDN_ASSETS_DIR.rglob("*"):
            if file_path.is_file():
                rel_path = file_path.relative_to(PUBLIC_DIR)
                filename = file_path.name
                # Prefer files in cdn-assets
                if filename not in seen_files:
                    files_map[str(rel_path)] = {
                        "old_path": str(file_path),
                        "relative_path": str(rel_path),
                        "name": file_path.name,
                        "size": file_path.stat().st_size
                    }
                    seen_files[filename] = str(rel_path)
    
    # Then scan public/ root, but skip if already in cdn-assets
    if PUBLIC_DIR.exists():
        for file_path in PUBLIC_DIR.iterdir():
            if file_path.is_file() and file_path.name not in ['robots.txt']:
                filename = file_path.name
                if filename not in seen_files:
                    # Move to cdn-assets
                    rel_path = f"cdn-assets/{filename}"
                    files_map[rel_path] = {
                        "old_path": str(file_path),
                        "relative_path": rel_path,
                        "name": file_path.name,
                        "size": file_path.stat().st_size,
                        "needs_move": True
                    }
                    seen_files[filename] = rel_path
    
    return files_map

def organize_files():
    """Main function to organize files."""
    print("Scanning files...")
    files_map = scan_files()
    
    print(f"Found {len(files_map)} files")
    
    # Create mapping of old to new paths
    migration_map = {}
    category_counts = defaultdict(int)
    
    for rel_path, file_info in files_map.items():
        old_name = file_info["name"]
        category, known_name = categorize_file(old_name)
        
        if known_name:
            new_name = known_name
        else:
            new_name = generate_new_name(old_name, category)
        
        # Ensure unique names
        if new_name in [m["new_name"] for m in migration_map.values()]:
            base_name = Path(new_name).stem
            ext = Path(new_name).suffix
            counter = category_counts[category]
            category_counts[category] += 1
            new_name = f"{base_name}-{counter}{ext}"
        else:
            category_counts[category] += 1
        
        # Determine new directory (within cdn-assets)
        new_dir = NEW_STRUCTURE.get(category, "misc")
        new_path = f"cdn-assets/{new_dir}/{new_name}"
        
        migration_map[rel_path] = {
            "old_path": file_info["old_path"],
            "old_name": old_name,
            "new_path": new_path,
            "new_name": new_name,
            "category": category,
            "new_dir": new_dir
        }
    
    # Save migration map
    migration_file = BASE_DIR / "scripts" / "asset-migration-map.json"
    with open(migration_file, "w") as f:
        json.dump(migration_map, f, indent=2)
    
    print(f"\nMigration map saved to {migration_file}")
    print(f"\nCategories:")
    for cat, count in sorted(category_counts.items()):
        print(f"  {cat}: {count} files")
    
    return migration_map

if __name__ == "__main__":
    migration_map = organize_files()
    print(f"\nTotal files to migrate: {len(migration_map)}")
