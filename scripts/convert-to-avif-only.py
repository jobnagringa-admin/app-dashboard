#!/usr/bin/env python3
"""
Convert entire codebase to use only AVIF images.

This script:
1. Finds all image references in source files
2. Updates them to use AVIF format
3. Deletes all non-AVIF image files from public/cdn-assets
"""

import re
import json
import os
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"
CDN_ASSETS_DIR = PUBLIC_DIR / "cdn-assets"

# File extensions to process
SOURCE_EXTENSIONS = {'.astro', '.ts', '.tsx', '.js', '.jsx', '.css', '.html'}

# Image extensions to replace
OLD_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
NEW_EXTENSION = '.avif'

# Patterns to match image references
IMAGE_PATTERNS = [
    # Absolute paths: /cdn-assets/images/.../image.jpg
    (r'(/cdn-assets/images/[^"\'\s\)]+)\.(jpg|jpeg|png|webp)', r'\1.avif'),
    # Absolute paths: /cdn-assets/.../image.jpg (without images subdirectory)
    (r'(/cdn-assets/[^"\'\s\)]+)\.(jpg|jpeg|png|webp)', r'\1.avif'),
    # Relative paths: ../cdn-assets/images/.../image.jpg
    (r'(\.\./cdn-assets/images/[^"\'\s\)]+)\.(jpg|jpeg|png|webp)', r'\1.avif'),
    # Relative paths: ../cdn-assets/.../image.jpg
    (r'(\.\./cdn-assets/[^"\'\s\)]+)\.(jpg|jpeg|png|webp)', r'\1.avif'),
    # Paths without leading slash: cdn-assets/images/.../image.jpg
    (r'(cdn-assets/images/[^"\'\s\)]+)\.(jpg|jpeg|png|webp)', r'\1.avif'),
    # Paths without leading slash: cdn-assets/.../image.jpg
    (r'(cdn-assets/[^"\'\s\)]+)\.(jpg|jpeg|png|webp)', r'\1.avif'),
]

# Pattern for srcset attributes (handles multiple images)
SRCSET_PATTERN = r'srcset=["\']([^"\']+)["\']'

def update_image_references(content, file_path):
    """Update image references in content."""
    original_content = content
    new_content = content
    
    # Apply each pattern
    for pattern, replacement in IMAGE_PATTERNS:
        new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)
    
    # Handle srcset attributes separately (they contain multiple image paths)
    def replace_srcset(match):
        srcset_value = match.group(1)
        # Replace each image path in srcset
        for pattern, replacement in IMAGE_PATTERNS:
            srcset_value = re.sub(pattern, replacement, srcset_value, flags=re.IGNORECASE)
        return f'srcset="{srcset_value}"'
    
    new_content = re.sub(SRCSET_PATTERN, replace_srcset, new_content)
    
    return new_content, new_content != original_content

def process_file(file_path):
    """Process a single file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        new_content, changed = update_image_references(content, file_path)
        
        if changed:
            file_path.write_text(new_content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def find_non_avif_images():
    """Find all non-AVIF image files."""
    non_avif_files = []
    
    for ext in OLD_EXTENSIONS:
        for file_path in CDN_ASSETS_DIR.rglob(f"*{ext}"):
            non_avif_files.append(file_path)
    
    return non_avif_files

def delete_non_avif_files():
    """Delete all non-AVIF image files."""
    non_avif_files = find_non_avif_images()
    deleted = []
    errors = []
    
    for file_path in non_avif_files:
        try:
            file_path.unlink()
            deleted.append(str(file_path.relative_to(BASE_DIR)))
        except Exception as e:
            errors.append((str(file_path.relative_to(BASE_DIR)), str(e)))
    
    return deleted, errors

def main():
    """Main function."""
    print("="*60)
    print("CONVERTING CODEBASE TO AVIF-ONLY")
    print("="*60)
    print()
    
    # Step 1: Update all image references in source files
    print("Step 1: Updating image references in source files...")
    files_updated = []
    files_processed = 0
    
    for ext in SOURCE_EXTENSIONS:
        for file_path in SRC_DIR.rglob(f"*{ext}"):
            files_processed += 1
            if process_file(file_path):
                rel_path = file_path.relative_to(BASE_DIR)
                files_updated.append(str(rel_path))
                print(f"  Updated: {rel_path}")
    
    # Also check public directory for any HTML/CSS files
    for ext in SOURCE_EXTENSIONS:
        for file_path in PUBLIC_DIR.rglob(f"*{ext}"):
            if file_path.is_file():
                files_processed += 1
                if process_file(file_path):
                    rel_path = file_path.relative_to(BASE_DIR)
                    files_updated.append(str(rel_path))
                    print(f"  Updated: {rel_path}")
    
    print(f"\n  Files processed: {files_processed}")
    print(f"  Files updated: {len(files_updated)}")
    print()
    
    # Step 2: Delete non-AVIF image files
    print("Step 2: Deleting non-AVIF image files...")
    deleted, errors = delete_non_avif_files()
    
    print(f"  Files deleted: {len(deleted)}")
    if errors:
        print(f"  Errors: {len(errors)}")
        for file_path, error in errors[:10]:
            print(f"    Error deleting {file_path}: {error}")
        if len(errors) > 10:
            print(f"    ... and {len(errors) - 10} more errors")
    print()
    
    # Summary
    print("="*60)
    print("CONVERSION SUMMARY")
    print("="*60)
    print(f"Source files processed: {files_processed}")
    print(f"Source files updated: {len(files_updated)}")
    print(f"Image files deleted: {len(deleted)}")
    print(f"Errors: {len(errors)}")
    
    if files_updated:
        print(f"\nUpdated files (first 20):")
        for f in files_updated[:20]:
            print(f"  - {f}")
        if len(files_updated) > 20:
            print(f"  ... and {len(files_updated) - 20} more")
    
    if deleted:
        print(f"\nDeleted files (first 20):")
        for f in deleted[:20]:
            print(f"  - {f}")
        if len(deleted) > 20:
            print(f"  ... and {len(deleted) - 20} more")

if __name__ == "__main__":
    main()
