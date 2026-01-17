#!/usr/bin/env python3
"""
Organize images into human-readable folder structure and filenames.

This script:
1. Analyzes all images in public/cdn-assets/
2. Extracts references from codebase
3. Generates human-readable names based on context
4. Creates mapping file for renaming
"""

import re
import json
import shutil
from pathlib import Path
from collections import defaultdict
from urllib.parse import unquote

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"
CDN_ASSETS = PUBLIC_DIR / "cdn-assets"
MAPPING_FILE = BASE_DIR / "scripts" / "image-mapping.json"

# Image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.avif', '.webp', '.svg'}

# Patterns to find image references
IMAGE_REF_PATTERNS = [
    r'src=["\'](/cdn-assets/[^"\']+)["\']',
    r'href=["\'](/cdn-assets/[^"\']+)["\']',
    r'url\(["\']?(/cdn-assets/[^"\']+)["\']?\)',
    r'background-image:\s*url\(["\']?(/cdn-assets/[^"\']+)["\']?\)',
    r'ogImage=["\'](/cdn-assets/[^"\']+)["\']',
    r"ogImage=['\"](/cdn-assets/[^\"']+)['\"]",
]

def find_all_images():
    """Find all image files in cdn-assets."""
    images = {}
    
    # Find images in images subdirectory
    images_dir = CDN_ASSETS / "images"
    if images_dir.exists():
        for img_file in images_dir.rglob("*"):
            if img_file.is_file() and img_file.suffix.lower() in IMAGE_EXTENSIONS:
                rel_path = img_file.relative_to(CDN_ASSETS)
                # Extract category from path: images/graphics/... -> graphics
                category = rel_path.parts[1] if len(rel_path.parts) > 1 else "root"
                images[str(rel_path)] = {
                    "path": str(img_file),
                    "relative_path": str(rel_path),
                    "category": category,
                    "filename": img_file.name,
                    "stem": img_file.stem,
                    "extension": img_file.suffix,
                }
    
    # Find images in root cdn-assets
    for img_file in CDN_ASSETS.iterdir():
        if img_file.is_file() and img_file.suffix.lower() in IMAGE_EXTENSIONS:
            rel_path = img_file.relative_to(CDN_ASSETS)
            images[str(rel_path)] = {
                "path": str(img_file),
                "relative_path": str(rel_path),
                "category": "root",
                "filename": img_file.name,
                "stem": img_file.stem,
                "extension": img_file.suffix,
            }
    
    return images

def find_image_references():
    """Find all image references in source files."""
    references = defaultdict(list)
    
    source_files = []
    for ext in ['.astro', '.ts', '.tsx', '.js', '.jsx']:
        source_files.extend(SRC_DIR.rglob(f"*{ext}"))
    
    for file_path in source_files:
        if 'node_modules' in str(file_path):
            continue
        
        try:
            content = file_path.read_text(encoding='utf-8')
        except Exception:
            continue
        
        for pattern in IMAGE_REF_PATTERNS:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                ref_path = match.group(1)
                decoded = unquote(ref_path)
                
                # Extract context
                start = max(0, match.start() - 100)
                end = min(len(content), match.end() + 100)
                context = content[start:end]
                
                # Try to extract alt text or nearby text
                alt_match = re.search(r'alt=["\']([^"\']+)["\']', context, re.IGNORECASE)
                alt_text = alt_match.group(1) if alt_match else None
                
                references[decoded].append({
                    "file": str(file_path.relative_to(BASE_DIR)),
                    "line": content[:match.start()].count('\n') + 1,
                    "context": context,
                    "alt": alt_text,
                })
    
    return references

def generate_human_readable_name(image_info, references, all_images):
    """Generate a human-readable name for an image."""
    filename = image_info["filename"]
    stem = image_info["stem"]
    category = image_info["category"]
    extension = image_info["extension"]
    
    # If already has a good name, keep it (normalize)
    if not re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', filename, re.I):
        if not re.match(r'^graphic-\d+', filename, re.I):
            # Already readable, just normalize
            normalized = stem.lower().replace('_', '-').replace(' ', '-')
            normalized = re.sub(r'-+', '-', normalized)
            return normalized
    
    # Try to infer from references
    refs = references.get(f"/cdn-assets/{image_info['relative_path']}", [])
    
    # Check alt text
    for ref in refs:
        if ref.get("alt"):
            alt = ref["alt"].lower().strip()
            if alt and alt not in ["", "image", "img", "photo", "picture"]:
                name = re.sub(r'[^a-z0-9\s-]', '', alt)
                name = re.sub(r'\s+', '-', name)
                name = re.sub(r'-+', '-', name)
                if len(name) > 3:
                    return name
    
    # Check context for keywords
    keywords = []
    for ref in refs:
        context = ref.get("context", "").lower()
        # Look for common patterns
        if "job" in context or "career" in context:
            keywords.append("job")
        if "linkedin" in context:
            keywords.append("linkedin")
        if "resume" in context or "cv" in context:
            keywords.append("resume")
        if "avatar" in context or "profile" in context:
            keywords.append("avatar")
        if "logo" in context:
            keywords.append("logo")
        if "icon" in context:
            keywords.append("icon")
        if "screenshot" in context:
            keywords.append("screenshot")
        if "example" in context:
            keywords.append("example")
        if "tutorial" in context:
            keywords.append("tutorial")
        if "background" in context or "mesh" in context:
            keywords.append("background")
        if "og-image" in context or "ogimage" in context:
            keywords.append("og-image")
    
    # Generate name based on category and keywords
    if category == "graphics":
        if "og-image" in keywords:
            return "og-image-jng"
        if "background" in keywords or "mesh" in stem.lower():
            return "background-mesh"
        if keywords:
            return f"graphic-{'-'.join(set(keywords[:2]))}"
        return "graphic-illustration"
    
    elif category == "icons":
        if "linkedin" in keywords:
            return "icon-linkedin"
        if "social" in stem.lower():
            return "icon-social"
        if keywords:
            return f"icon-{'-'.join(set(keywords[:2]))}"
        return "icon-ui"
    
    elif category == "logos":
        # Try to extract brand name from filename
        brand_match = re.search(r'logo-([a-z]+)', stem.lower())
        if brand_match:
            return f"logo-{brand_match.group(1)}"
        if keywords:
            return f"logo-{'-'.join(set(keywords[:2]))}"
        return "logo-company"
    
    elif category == "photos":
        if "avatar" in keywords or "profile" in keywords:
            return "photo-avatar"
        if keywords:
            return f"photo-{'-'.join(set(keywords[:2]))}"
        return "photo-general"
    
    elif category == "screenshots":
        if "example" in keywords:
            return "screenshot-example"
        if "tutorial" in keywords:
            return "screenshot-tutorial"
        if keywords:
            return f"screenshot-{'-'.join(set(keywords[:2]))}"
        return "screenshot-ui"
    
    elif category == "root":
        # Root level images - analyze filename
        if "mesh" in stem.lower():
            return "background-mesh-840"
        if "example" in stem.lower():
            return f"screenshot-example-{stem.lower().replace('example', '').replace('-', '')}"
        if "linkedin" in stem.lower():
            return f"screenshot-example-linkedin-{stem.lower().replace('linkedin', '').replace('-', '')}"
        return f"asset-{stem.lower().replace('_', '-')}"
    
    return f"image-{category}"

def determine_new_path(image_info, new_name, all_images):
    """Determine the new path for an image."""
    category = image_info["category"]
    extension = image_info["extension"]
    
    # New folder structure
    folder_map = {
        "graphics": {
            "og-image": "graphics/social",
            "background": "graphics/backgrounds",
            "default": "graphics/illustrations",
        },
        "icons": {
            "linkedin": "icons/social",
            "social": "icons/social",
            "brand": "icons/brands",
            "default": "icons/ui",
        },
        "logos": {
            "default": "logos/companies",
        },
        "photos": {
            "avatar": "photos/avatars",
            "profile": "photos/avatars",
            "default": "photos/general",
        },
        "screenshots": {
            "example": "screenshots/examples",
            "tutorial": "screenshots/tutorials",
            "default": "screenshots/interfaces",
        },
        "root": {
            "background": "graphics/backgrounds",
            "screenshot": "screenshots/examples",
            "default": "screenshots/examples",
        },
    }
    
    # Determine subfolder
    subfolder = "default"
    if "og-image" in new_name:
        subfolder = "og-image"
    elif "background" in new_name or "mesh" in new_name:
        subfolder = "background"
    elif "example" in new_name:
        subfolder = "example"
    elif "tutorial" in new_name:
        subfolder = "tutorial"
    elif "avatar" in new_name or "profile" in new_name:
        subfolder = "avatar"
    elif "linkedin" in new_name or "social" in new_name:
        subfolder = "linkedin" if category == "icons" else "social"
    
    folder_structure = folder_map.get(category, {}).get(subfolder, folder_map.get(category, {}).get("default", f"{category}/general"))
    
    # Handle duplicates
    base_path = f"images/{folder_structure}/{new_name}{extension}"
    counter = 1
    final_path = base_path
    
    # Check if this path already exists in mapping
    existing_paths = {m.get("new_relative", "") for m in all_images.values() if isinstance(m, dict) and "new_relative" in m}
    while final_path in existing_paths:
        final_path = f"images/{folder_structure}/{new_name}-{counter}{extension}"
        counter += 1
    
    return final_path

def main():
    """Main function."""
    print("=" * 70)
    print("IMAGE ORGANIZATION ANALYSIS")
    print("=" * 70)
    
    print("\n1. Finding all images...")
    all_images = find_all_images()
    print(f"   Found {len(all_images)} images")
    
    print("\n2. Finding image references in codebase...")
    references = find_image_references()
    print(f"   Found {len(references)} unique image references")
    
    print("\n3. Generating human-readable names...")
    mapping = {}
    for rel_path, image_info in all_images.items():
        new_name = generate_human_readable_name(image_info, references, all_images)
        new_path = determine_new_path(image_info, new_name, mapping)
        
        mapping[rel_path] = {
            "old_path": f"/cdn-assets/{rel_path}",
            "new_path": f"/cdn-assets/{new_path}",
            "old_relative": rel_path,
            "new_relative": new_path,
            "category": image_info["category"],
            "new_name": new_name,
        }
    
    print(f"   Generated {len(mapping)} mappings")
    
    print("\n4. Saving mapping file...")
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    print(f"   Saved to: {MAPPING_FILE}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    by_category = defaultdict(int)
    for item in mapping.values():
        by_category[item["category"]] += 1
    
    print("\nImages by category:")
    for cat, count in sorted(by_category.items()):
        print(f"  {cat}: {count}")
    
    print(f"\nTotal images to organize: {len(mapping)}")
    print(f"\nMapping file: {MAPPING_FILE}")

if __name__ == "__main__":
    main()
