#!/usr/bin/env python3
"""
Verify and fix all image paths in src files.
Ensures all image references point to existing files.
"""

import os
import re
from pathlib import Path
from urllib.parse import unquote

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"
CDN_ASSETS = PUBLIC_DIR / "cdn-assets"

def find_image_references_in_file(file_path):
    """Find all image references in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return []
    
    references = []
    
    # Pattern for /cdn-assets/ paths
    pattern = r'(/cdn-assets/[^"\'\s\)]+\.(?:jpg|jpeg|png|gif|bmp|tiff|tif|avif|webp|svg))'
    
    for match in re.finditer(pattern, content, re.IGNORECASE):
        path = match.group(1)
        references.append((match.start(), match.end(), path))
    
    return references

def check_file_exists(image_path):
    """Check if image file exists."""
    # Remove leading slash
    rel_path = image_path.lstrip('/')
    full_path = BASE_DIR / rel_path
    
    # Try exact path
    if full_path.exists():
        return True, full_path
    
    # Try URL-decoded path
    decoded_path = unquote(rel_path)
    decoded_full = BASE_DIR / decoded_path
    if decoded_full.exists():
        return True, decoded_full
    
    # Try WebP version
    webp_path = str(full_path).rsplit('.', 1)[0] + '.webp'
    webp_full = Path(webp_path)
    if webp_full.exists():
        return True, webp_full
    
    return False, None

def verify_all_paths():
    """Verify all image paths in src directory."""
    issues = []
    verified = []
    
    for root, dirs, files in os.walk(SRC_DIR):
        if 'node_modules' in root:
            continue
        
        for file in files:
            if file.endswith(('.astro', '.ts', '.tsx', '.js', '.jsx')):
                file_path = Path(root) / file
                references = find_image_references_in_file(file_path)
                
                for start, end, img_path in references:
                    exists, actual_path = check_file_exists(img_path)
                    if exists:
                        verified.append((str(file_path.relative_to(BASE_DIR)), img_path))
                    else:
                        issues.append((str(file_path.relative_to(BASE_DIR)), img_path, start, end))
    
    return verified, issues

def main():
    """Main function."""
    print("=" * 70)
    print("Verify Image Paths")
    print("=" * 70)
    print()
    
    print("Scanning src directory...")
    verified, issues = verify_all_paths()
    
    print(f"Verified: {len(verified)}")
    print(f"Issues: {len(issues)}")
    print()
    
    if issues:
        print("=" * 70)
        print("Issues Found:")
        print("=" * 70)
        for file_path, img_path, start, end in issues:
            print(f"  {file_path}")
            print(f"    Path: {img_path}")
            print()
    else:
        print("✓ All image paths are valid!")
    
    return len(issues) == 0

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
