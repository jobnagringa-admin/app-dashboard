#!/usr/bin/env python3
"""
Update all image references in source files to use AVIF format.
"""

import re
import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PUBLIC_DIR = BASE_DIR / "public"

# File extensions to process
SOURCE_EXTENSIONS = {'.astro', '.ts', '.tsx', '.js', '.jsx', '.css'}

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

def main():
    """Main function."""
    print("Updating image references to AVIF format...\n")
    
    files_updated = []
    files_processed = 0
    
    # Process all source files
    for ext in SOURCE_EXTENSIONS:
        for file_path in SRC_DIR.rglob(f"*{ext}"):
            files_processed += 1
            if process_file(file_path):
                rel_path = file_path.relative_to(BASE_DIR)
                files_updated.append(str(rel_path))
                print(f"Updated: {rel_path}")
    
    print(f"\n{'='*60}")
    print("UPDATE SUMMARY")
    print(f"{'='*60}")
    print(f"Files processed: {files_processed}")
    print(f"Files updated: {len(files_updated)}")
    
    if files_updated:
        print(f"\nUpdated files:")
        for f in files_updated[:20]:  # Show first 20
            print(f"  - {f}")
        if len(files_updated) > 20:
            print(f"  ... and {len(files_updated) - 20} more")

if __name__ == "__main__":
    main()
