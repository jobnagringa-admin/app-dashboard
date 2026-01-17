#!/usr/bin/env python3
"""
Download and reorganize all GIF files:
1. Compare original version (src-legacy) with current version
2. Download external GIFs referenced in the codebase
3. Reorganize all GIFs in CDN assets structure
4. Check for 404 errors
"""

import os
import re
import shutil
import json
import hashlib
import urllib.request
import urllib.parse
from pathlib import Path
from urllib.parse import unquote, urlparse
from collections import defaultdict

# Base directories
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"
LEGACY_DIR = BASE_DIR / "src-legacy"
CDN_ASSETS_PUBLIC = PUBLIC_DIR / "cdn-assets"
CDN_ASSETS_LEGACY = LEGACY_DIR / "cdn-assets"

# Image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.avif', '.webp', '.svg'}

def get_file_hash(file_path):
    """Calculate MD5 hash of a file."""
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def find_all_gifs_in_legacy():
    """Find all GIF files in src-legacy."""
    gifs = {}
    if CDN_ASSETS_LEGACY.exists():
        for gif_file in CDN_ASSETS_LEGACY.rglob("*.gif"):
            if gif_file.is_file():
                rel_path = gif_file.relative_to(CDN_ASSETS_LEGACY)
                gifs[str(rel_path)] = {
                    "path": str(gif_file),
                    "relative_path": str(rel_path),
                    "name": gif_file.name,
                    "size": gif_file.stat().st_size,
                    "hash": get_file_hash(gif_file)
                }
    return gifs

def find_all_gifs_in_current():
    """Find all GIF files in public/cdn-assets."""
    gifs = {}
    if CDN_ASSETS_PUBLIC.exists():
        for gif_file in CDN_ASSETS_PUBLIC.rglob("*.gif"):
            if gif_file.is_file():
                rel_path = gif_file.relative_to(CDN_ASSETS_PUBLIC)
                gifs[str(rel_path)] = {
                    "path": str(gif_file),
                    "relative_path": str(rel_path),
                    "name": gif_file.name,
                    "size": gif_file.stat().st_size,
                    "hash": get_file_hash(gif_file)
                }
    return gifs

def find_external_gif_references():
    """Find all external GIF URLs referenced in the codebase."""
    external_gifs = []
    
    # Patterns to find external URLs
    patterns = [
        r'src=["\'](https?://[^"\']+\.gif)["\']',
        r'href=["\'](https?://[^"\']+\.gif)["\']',
        r'url\(["\']?(https?://[^"\']+\.gif)["\']?\)',
        r'background-image:\s*url\(["\']?(https?://[^"\']+\.gif)["\']?\)',
    ]
    
    for root, dirs, files in os.walk(SRC_DIR):
        if 'node_modules' in root:
            continue
        
        for file in files:
            if file.endswith(('.astro', '.ts', '.tsx', '.js', '.jsx', '.html')):
                file_path = Path(root) / file
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    for pattern in patterns:
                        matches = re.finditer(pattern, content, re.IGNORECASE)
                        for match in matches:
                            url = match.group(1)
                            external_gifs.append({
                                "url": url,
                                "file": str(file_path.relative_to(BASE_DIR)),
                                "line": content[:match.start()].count('\n') + 1,
                                "context": content[max(0, match.start()-50):match.end()+50]
                            })
                except Exception:
                    continue
    
    # Remove duplicates
    seen_urls = set()
    unique_gifs = []
    for gif in external_gifs:
        if gif["url"] not in seen_urls:
            seen_urls.add(gif["url"])
            unique_gifs.append(gif)
    
    return unique_gifs

def download_gif(url, target_path):
    """Download a GIF from URL."""
    try:
        print(f"  Downloading: {url}")
        urllib.request.urlretrieve(url, target_path)
        return True
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False

def generate_gif_name(url_or_path):
    """Generate a clean name for a GIF file."""
    # Extract filename from URL or path
    if url_or_path.startswith('http'):
        parsed = urlparse(url_or_path)
        filename = os.path.basename(parsed.path)
    else:
        filename = os.path.basename(url_or_path)
    
    # Clean the filename
    # Remove hash prefixes
    filename = re.sub(r'^[a-f0-9]{24}_', '', filename)
    
    # Extract meaningful parts
    base_name = Path(filename).stem
    ext = Path(filename).suffix
    
    # Convert to lowercase and replace spaces/underscores with hyphens
    base_name = re.sub(r'[\s_]+', '-', base_name.lower())
    base_name = re.sub(r'[^\w\-]', '', base_name)
    base_name = re.sub(r'-+', '-', base_name).strip('-')
    
    # Ensure it starts with "graphic-" if it's a graphic
    if not base_name.startswith(('graphic-', 'logo-', 'icon-', 'screenshot-')):
        base_name = f"graphic-{base_name}"
    
    return f"{base_name}{ext}"

def organize_gif(gif_path, target_category="graphics"):
    """Organize a GIF file into the proper CDN structure."""
    # Determine target directory based on category
    if target_category == "graphics":
        target_dir = CDN_ASSETS_PUBLIC / "images" / "graphics" / "illustrations"
    elif target_category == "logos":
        target_dir = CDN_ASSETS_PUBLIC / "images" / "logos"
    elif target_category == "icons":
        target_dir = CDN_ASSETS_PUBLIC / "images" / "icons"
    elif target_category == "screenshots":
        target_dir = CDN_ASSETS_PUBLIC / "images" / "screenshots"
    else:
        target_dir = CDN_ASSETS_PUBLIC / "images" / "graphics" / "illustrations"
    
    target_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate new filename
    new_name = generate_gif_name(str(gif_path))
    target_path = target_dir / new_name
    
    # If target exists and is the same file, skip
    if target_path.exists():
        if get_file_hash(gif_path) == get_file_hash(target_path):
            return target_path, False
    
    # Copy file
    shutil.copy2(gif_path, target_path)
    return target_path, True

def compare_gifs(legacy_gifs, current_gifs):
    """Compare GIFs between original and current versions."""
    comparison = {
        "only_in_legacy": [],
        "only_in_current": [],
        "in_both": [],
        "different": []
    }
    
    # Create lookup by hash
    legacy_by_hash = {}
    for rel_path, info in legacy_gifs.items():
        if info["hash"]:
            if info["hash"] not in legacy_by_hash:
                legacy_by_hash[info["hash"]] = []
            legacy_by_hash[info["hash"]].append((rel_path, info))
    
    current_by_hash = {}
    for rel_path, info in current_gifs.items():
        if info["hash"]:
            if info["hash"] not in current_by_hash:
                current_by_hash[info["hash"]] = []
            current_by_hash[info["hash"]].append((rel_path, info))
    
    # Find GIFs only in legacy
    for rel_path, info in legacy_gifs.items():
        if info["hash"] and info["hash"] not in current_by_hash:
            comparison["only_in_legacy"].append((rel_path, info))
        elif info["hash"] and info["hash"] in current_by_hash:
            comparison["in_both"].append((rel_path, info))
    
    # Find GIFs only in current
    for rel_path, info in current_gifs.items():
        if info["hash"] and info["hash"] not in legacy_by_hash:
            comparison["only_in_current"].append((rel_path, info))
    
    return comparison

def main():
    """Main function."""
    print("=" * 70)
    print("Download and Organize GIFs Script")
    print("=" * 70)
    print()
    
    # Step 1: Find all GIFs in original version
    print("Step 1: Finding GIFs in original version (src-legacy)...")
    legacy_gifs = find_all_gifs_in_legacy()
    print(f"Found {len(legacy_gifs)} GIF file(s) in original version")
    for rel_path, info in legacy_gifs.items():
        print(f"  - {rel_path} ({info['size']:,} bytes)")
    print()
    
    # Step 2: Find all GIFs in current version
    print("Step 2: Finding GIFs in current version (public/cdn-assets)...")
    current_gifs = find_all_gifs_in_current()
    print(f"Found {len(current_gifs)} GIF file(s) in current version")
    for rel_path, info in current_gifs.items():
        print(f"  - {rel_path} ({info['size']:,} bytes)")
    print()
    
    # Step 3: Compare versions
    print("Step 3: Comparing versions...")
    comparison = compare_gifs(legacy_gifs, current_gifs)
    print(f"  Only in original: {len(comparison['only_in_legacy'])}")
    print(f"  Only in current: {len(comparison['only_in_current'])}")
    print(f"  In both: {len(comparison['in_both'])}")
    print()
    
    # Step 4: Download external GIFs
    print("Step 4: Finding external GIF references...")
    external_gifs = find_external_gif_references()
    print(f"Found {len(external_gifs)} external GIF URL(s)")
    for gif in external_gifs:
        print(f"  - {gif['url']} (in {gif['file']})")
    print()
    
    # Step 5: Download and organize external GIFs
    downloaded_gifs = []
    if external_gifs:
        print("Step 5: Downloading external GIFs...")
        temp_dir = BASE_DIR / "scripts" / "temp_gifs"
        temp_dir.mkdir(exist_ok=True)
        
        for gif_info in external_gifs:
            url = gif_info["url"]
            filename = generate_gif_name(url)
            temp_path = temp_dir / filename
            
            if download_gif(url, temp_path):
                downloaded_gifs.append(temp_path)
                print(f"    ✓ Downloaded: {filename}")
            else:
                print(f"    ✗ Failed to download: {url}")
        print()
    
    # Step 6: Reorganize all GIFs
    print("Step 6: Reorganizing GIFs in CDN assets...")
    reorganization_map = {}
    
    # Copy GIFs from legacy that are missing or different
    for rel_path, info in comparison["only_in_legacy"]:
        legacy_path = Path(info["path"])
        target_path, copied = organize_gif(legacy_path)
        reorganization_map[str(rel_path)] = {
            "source": "legacy",
            "original_path": str(legacy_path),
            "new_path": str(target_path.relative_to(CDN_ASSETS_PUBLIC)),
            "copied": copied
        }
        if copied:
            print(f"  Copied from legacy: {rel_path} -> {target_path.relative_to(CDN_ASSETS_PUBLIC)}")
    
    # Reorganize current GIFs
    for rel_path, info in current_gifs.items():
        current_path = Path(info["path"])
        target_path, copied = organize_gif(current_path)
        if copied or str(target_path.relative_to(CDN_ASSETS_PUBLIC)) != rel_path:
            reorganization_map[rel_path] = {
                "source": "current",
                "original_path": str(current_path),
                "new_path": str(target_path.relative_to(CDN_ASSETS_PUBLIC)),
                "copied": copied
            }
            if copied:
                print(f"  Reorganized: {rel_path} -> {target_path.relative_to(CDN_ASSETS_PUBLIC)}")
    
    # Organize downloaded GIFs
    for downloaded_path in downloaded_gifs:
        target_path, copied = organize_gif(downloaded_path)
        reorganization_map[str(downloaded_path.name)] = {
            "source": "external",
            "original_path": str(downloaded_path),
            "new_path": str(target_path.relative_to(CDN_ASSETS_PUBLIC)),
            "copied": copied
        }
        if copied:
            print(f"  Organized downloaded: {downloaded_path.name} -> {target_path.relative_to(CDN_ASSETS_PUBLIC)}")
    
    print()
    
    # Step 7: Save reorganization map
    map_file = BASE_DIR / "scripts" / "gif-reorganization-map.json"
    with open(map_file, 'w', encoding='utf-8') as f:
        json.dump(reorganization_map, f, indent=2, ensure_ascii=False)
    print(f"Reorganization map saved to: {map_file.relative_to(BASE_DIR)}")
    print()
    
    # Step 8: Clean up temp directory
    if downloaded_gifs and temp_dir.exists():
        print("Step 7: Cleaning up temporary files...")
        for temp_file in temp_dir.iterdir():
            temp_file.unlink()
        temp_dir.rmdir()
        print("  ✓ Cleaned up")
        print()
    
    # Summary
    print("=" * 70)
    print("Summary")
    print("=" * 70)
    print(f"Original GIFs found: {len(legacy_gifs)}")
    print(f"Current GIFs found: {len(current_gifs)}")
    print(f"External GIFs found: {len(external_gifs)}")
    print(f"Downloaded GIFs: {len(downloaded_gifs)}")
    print(f"GIFs reorganized: {len(reorganization_map)}")
    print()
    print("Next step: Run find-404-errors.py to check for broken references")

if __name__ == "__main__":
    main()
