#!/usr/bin/env python3
"""
Update all image references in the codebase to use WebP format.

This script:
- Finds all image references in .astro, .ts, .tsx files
- Updates extensions (.jpg/.jpeg/.png/.gif/.bmp/.tiff → .webp)
- Handles srcset attributes with multiple image variants
- Updates ogImage in frontmatter
- Generates conversion map for verification
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

# Base directory
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"

# File extensions to process
SOURCE_EXTENSIONS = {'.astro', '.ts', '.tsx', '.js', '.jsx'}

# Image extensions to replace
OLD_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.avif'}
NEW_EXTENSION = '.webp'

# Patterns to match image references
IMAGE_PATTERNS = [
    # Absolute paths: /cdn-assets/images/.../image.jpg
    (r'(/cdn-assets/images/[^"\'\s\)]+)\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)', r'\1.webp'),
    # Absolute paths: /cdn-assets/.../image.jpg (without images subdirectory)
    (r'(/cdn-assets/[^"\'\s\)]+)\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)', r'\1.webp'),
    # Relative paths: ../cdn-assets/images/.../image.jpg
    (r'(\.\./cdn-assets/images/[^"\'\s\)]+)\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)', r'\1.webp'),
    # Relative paths: ../cdn-assets/.../image.jpg
    (r'(\.\./cdn-assets/[^"\'\s\)]+)\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)', r'\1.webp'),
    # Paths without leading slash: cdn-assets/images/.../image.jpg
    (r'(cdn-assets/images/[^"\'\s\)]+)\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)', r'\1.webp'),
    # Paths without leading slash: cdn-assets/.../image.jpg
    (r'(cdn-assets/[^"\'\s\)]+)\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)', r'\1.webp'),
]

# Pattern for srcset attributes (handles multiple images)
SRCSET_PATTERN = r'srcset=["\']([^"\']+)["\']'

def update_srcset(srcset_value):
    """Update all image extensions in a srcset attribute value."""
    # Split by comma to handle multiple images
    parts = srcset_value.split(',')
    updated_parts = []
    
    for part in parts:
        part = part.strip()
        # Check if it contains an image path with old extension
        for old_ext in OLD_EXTENSIONS:
            if old_ext in part:
                # Replace the extension
                part = re.sub(
                    r'([^"\'\s\)]+)\.' + re.escape(old_ext) + r'(\s+\d+w)?',
                    r'\1' + NEW_EXTENSION + r'\2',
                    part
                )
                break
        updated_parts.append(part)
    
    return ', '.join(updated_parts)

def update_file_references(file_path):
    """Update image references in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, f"Error reading file: {e}", []
    
    original_content = content
    changes = []
    
    # Update regular image references (handle URL encoding)
    for pattern, replacement in IMAGE_PATTERNS:
        # First, handle URL-encoded paths
        url_encoded_pattern = pattern.replace(r'[^"\'\s\)]+', r'[^"\'\s\)%]+(?:%[0-9A-Fa-f]{2}[^"\'\s\)%]*)*')
        matches = re.finditer(url_encoded_pattern, content, re.IGNORECASE)
        for match in matches:
            old_path = match.group(0)
            # Decode URL encoding, replace extension, re-encode if needed
            decoded = old_path.replace('%20', ' ').replace('%28', '(').replace('%29', ')')
            new_path = re.sub(pattern, replacement, decoded, flags=re.IGNORECASE)
            # Re-encode spaces and parentheses if they were encoded originally
            if '%20' in old_path or '%28' in old_path or '%29' in old_path:
                new_path = new_path.replace(' ', '%20').replace('(', '%28').replace(')', '%29')
            if old_path != new_path:
                content = content.replace(old_path, new_path)
                changes.append({
                    'type': 'path',
                    'old': old_path,
                    'new': new_path
                })
        
        # Then handle non-URL-encoded paths
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            old_path = match.group(0)
            # Skip if already processed (contains %20, %28, %29)
            if '%20' in old_path or '%28' in old_path or '%29' in old_path:
                continue
            new_path = re.sub(pattern, replacement, old_path, flags=re.IGNORECASE)
            if old_path != new_path:
                content = content.replace(old_path, new_path)
                changes.append({
                    'type': 'path',
                    'old': old_path,
                    'new': new_path
                })
    
    # Update srcset attributes
    srcset_matches = re.finditer(SRCSET_PATTERN, content, re.IGNORECASE)
    for match in srcset_matches:
        srcset_value = match.group(1)
        updated_srcset = update_srcset(srcset_value)
        if srcset_value != updated_srcset:
            old_srcset = f'srcset="{srcset_value}"'
            new_srcset = f'srcset="{updated_srcset}"'
            # Also handle single quotes
            if match.group(0).startswith("srcset='"):
                old_srcset = f"srcset='{srcset_value}'"
                new_srcset = f"srcset='{updated_srcset}'"
            content = content.replace(old_srcset, new_srcset)
            changes.append({
                'type': 'srcset',
                'old': old_srcset,
                'new': new_srcset
            })
    
    # Update ogImage in frontmatter (YAML frontmatter)
    # Pattern: ogImage={'/cdn-assets/images/.../image.jpg'}
    ogimage_pattern = r"ogImage\s*=\s*\{?['\"]([^'\"]+\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif))['\"]\}?"
    ogimage_matches = re.finditer(ogimage_pattern, content, re.IGNORECASE)
    for match in ogimage_matches:
        old_path = match.group(1)
        if any(old_path.endswith(ext) for ext in OLD_EXTENSIONS):
            new_path = re.sub(r'\.(jpg|jpeg|png|gif|bmp|tiff|tif|avif)$', NEW_EXTENSION, old_path, flags=re.IGNORECASE)
            old_full = match.group(0)
            new_full = old_full.replace(old_path, new_path)
            content = content.replace(old_full, new_full)
            changes.append({
                'type': 'ogImage',
                'old': old_full,
                'new': new_full
            })
    
    # Write back if changes were made
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, f"Updated {len(changes)} references", changes
        except Exception as e:
            return False, f"Error writing file: {e}", []
    
    return False, "No changes needed", []

def find_source_files(base_dir):
    """Find all source files to process."""
    files = []
    
    if not base_dir.exists():
        return files
    
    for root, dirs, filenames in os.walk(base_dir):
        # Skip node_modules and other common exclusions
        if 'node_modules' in root or '.git' in root:
            continue
        
        for filename in filenames:
            file_path = Path(root) / filename
            if file_path.suffix.lower() in SOURCE_EXTENSIONS:
                files.append(file_path)
    
    return files

def main():
    """Main update function."""
    print("=" * 70)
    print("Image Reference Update Script (to WebP)")
    print("=" * 70)
    print(f"Source directory: {SRC_DIR}")
    print()
    
    # Find all source files
    print("Scanning for source files...")
    files = find_source_files(SRC_DIR)
    print(f"Found {len(files)} files to process")
    print()
    
    if not files:
        print("No source files found.")
        return
    
    # Process each file
    updated_count = 0
    total_changes = 0
    file_changes = defaultdict(list)
    
    for file_path in sorted(files):
        success, message, changes = update_file_references(file_path)
        
        if success:
            updated_count += 1
            total_changes += len(changes)
            file_changes[str(file_path.relative_to(BASE_DIR))] = changes
            print(f"✓ {file_path.relative_to(BASE_DIR)}: {message}")
        elif changes:
            print(f"✗ {file_path.relative_to(BASE_DIR)}: {message}")
    
    # Print summary
    print()
    print("=" * 70)
    print("Update Summary")
    print("=" * 70)
    print(f"Files updated: {updated_count}")
    print(f"Total references updated: {total_changes}")
    print()
    
    # Save conversion map
    conversion_map = {
        'files_updated': updated_count,
        'total_changes': total_changes,
        'changes_by_file': dict(file_changes)
    }
    
    map_path = BASE_DIR / "scripts" / "webp-reference-updates.json"
    with open(map_path, 'w', encoding='utf-8') as f:
        json.dump(conversion_map, f, indent=2, ensure_ascii=False)
    
    print(f"Reference update map saved to: {map_path.relative_to(BASE_DIR)}")
    print("\n✓ Reference update completed successfully!")

if __name__ == "__main__":
    main()
