#!/usr/bin/env python3
"""
Find and fix missing image references.
1. Extract all image paths from src files
2. Check if they exist in public/cdn-assets
3. Look for them in src-legacy/cdn-assets
4. Copy and convert missing images to WebP
5. Fix broken paths
"""

import os
import re
import shutil
import json
from pathlib import Path
from urllib.parse import unquote

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow (PIL) is not installed.")
    print("Please install it using: pip install Pillow")
    import sys
    sys.exit(1)

# Base directories
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"
LEGACY_DIR = BASE_DIR / "src-legacy"
CDN_ASSETS_PUBLIC = PUBLIC_DIR / "cdn-assets"
CDN_ASSETS_LEGACY = LEGACY_DIR / "cdn-assets"

# Image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.avif', '.webp'}

def extract_image_paths_from_file(file_path):
    """Extract all image paths from a source file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return []
    
    paths = set()
    
    # Pattern for /cdn-assets/ paths
    patterns = [
        r'/cdn-assets/([^"\'\s\)]+\.(?:jpg|jpeg|png|gif|bmp|tiff|tif|avif|webp))',
        r'cdn-assets/([^"\'\s\)]+\.(?:jpg|jpeg|png|gif|bmp|tiff|tif|avif|webp))',
        r'\.\./cdn-assets/([^"\'\s\)]+\.(?:jpg|jpeg|png|gif|bmp|tiff|tif|avif|webp))',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for match in matches:
            # Decode URL encoding
            decoded = unquote(match)
            paths.add(decoded)
    
    return list(paths)

def find_all_image_references():
    """Find all image references in src directory."""
    all_paths = {}
    
    for root, dirs, files in os.walk(SRC_DIR):
        # Skip node_modules
        if 'node_modules' in root:
            continue
        
        for file in files:
            if file.endswith(('.astro', '.ts', '.tsx', '.js', '.jsx')):
                file_path = Path(root) / file
                paths = extract_image_paths_from_file(file_path)
                if paths:
                    all_paths[str(file_path.relative_to(BASE_DIR))] = paths
    
    return all_paths

def check_file_exists(path_in_cdn):
    """Check if file exists in public/cdn-assets."""
    # Try WebP first
    webp_path = CDN_ASSETS_PUBLIC / path_in_cdn.replace('.jpg', '.webp').replace('.jpeg', '.webp').replace('.png', '.webp').replace('.gif', '.webp').replace('.bmp', '.webp').replace('.tiff', '.webp').replace('.tif', '.webp').replace('.avif', '.webp')
    if webp_path.exists():
        return webp_path, True
    
    # Try original extension
    original_path = CDN_ASSETS_PUBLIC / path_in_cdn
    if original_path.exists():
        return original_path, False
    
    return None, False

def find_in_legacy(path_in_cdn):
    """Find image in legacy folder."""
    # Try various locations
    possible_paths = [
        CDN_ASSETS_LEGACY / path_in_cdn,
        CDN_ASSETS_LEGACY / path_in_cdn.replace('images/', ''),
        CDN_ASSETS_LEGACY / 'images' / path_in_cdn.split('/')[-1],
    ]
    
    # Also try with different extensions
    base_name = Path(path_in_cdn).stem
    for ext in ['.png', '.jpg', '.jpeg', '.gif', '.avif']:
        possible_paths.append(CDN_ASSETS_LEGACY / path_in_cdn.replace(Path(path_in_cdn).suffix, ext))
        possible_paths.append(CDN_ASSETS_LEGACY / 'images' / 'graphics' / (base_name + ext))
        possible_paths.append(CDN_ASSETS_LEGACY / 'images' / 'logos' / (base_name + ext))
        possible_paths.append(CDN_ASSETS_LEGACY / 'images' / 'screenshots' / (base_name + ext))
    
    for path in possible_paths:
        if path.exists():
            return path
    
    return None

def convert_to_webp(input_path, output_path):
    """Convert image to WebP."""
    try:
        with Image.open(input_path) as img:
            # Handle different modes
            if img.mode in ('RGBA', 'LA', 'P'):
                if img.mode == 'P' and 'transparency' in img.info:
                    img = img.convert('RGBA')
                elif img.mode == 'LA':
                    img = img.convert('RGBA')
                elif img.mode != 'RGBA':
                    img = img.convert('RGBA')
            elif img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGB')
            
            # Save as WebP with lossless quality
            save_kwargs = {
                'format': 'WEBP',
                'quality': 100,
                'method': 6,
                'lossless': True
            }
            
            img.save(output_path, **save_kwargs)
            return True
    except Exception as e:
        print(f"  Error converting {input_path}: {e}")
        return False

def main():
    """Main function."""
    print("=" * 70)
    print("Fix Missing Images Script")
    print("=" * 70)
    print()
    
    # Find all image references
    print("Scanning src directory for image references...")
    all_references = find_all_image_references()
    
    # Collect all unique image paths
    all_image_paths = set()
    for file_path, paths in all_references.items():
        for path in paths:
            all_image_paths.add(path)
    
    print(f"Found {len(all_image_paths)} unique image references")
    print()
    
    # Check which ones are missing
    missing = []
    found = []
    
    print("Checking which images exist...")
    for img_path in sorted(all_image_paths):
        exists, is_webp = check_file_exists(img_path)
        if exists:
            found.append((img_path, exists, is_webp))
        else:
            missing.append(img_path)
    
    print(f"Found: {len(found)}")
    print(f"Missing: {len(missing)}")
    print()
    
    if not missing:
        print("✓ All images exist!")
        return
    
    # Try to find missing images in legacy folder
    print("Looking for missing images in src-legacy...")
    found_in_legacy = []
    still_missing = []
    
    for img_path in missing:
        legacy_path = find_in_legacy(img_path)
        if legacy_path:
            found_in_legacy.append((img_path, legacy_path))
        else:
            still_missing.append(img_path)
    
    print(f"Found in legacy: {len(found_in_legacy)}")
    print(f"Still missing: {len(still_missing)}")
    print()
    
    # Copy and convert images from legacy
    if found_in_legacy:
        print("Copying and converting images from legacy...")
        for img_path, legacy_path in found_in_legacy:
            # Determine target location
            # Try to preserve directory structure
            target_dir = CDN_ASSETS_PUBLIC / Path(img_path).parent
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Target WebP path
            webp_name = Path(img_path).stem + '.webp'
            target_webp = target_dir / webp_name
            
            print(f"  Converting: {legacy_path.name} -> {target_webp.relative_to(BASE_DIR)}")
            if convert_to_webp(legacy_path, target_webp):
                print(f"    ✓ Success")
            else:
                print(f"    ✗ Failed")
        print()
    
    # Report still missing
    if still_missing:
        print("=" * 70)
        print("Still Missing Images:")
        print("=" * 70)
        for img_path in still_missing:
            print(f"  - {img_path}")
        print()
        print("These images need to be manually added or paths need to be corrected.")
    
    # Generate report
    report = {
        'total_references': len(all_image_paths),
        'found': len(found),
        'missing': len(missing),
        'found_in_legacy': len(found_in_legacy),
        'still_missing': still_missing,
        'files_processed': len(found_in_legacy)
    }
    
    report_path = BASE_DIR / "scripts" / "missing-images-report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Report saved to: {report_path.relative_to(BASE_DIR)}")

if __name__ == "__main__":
    main()
