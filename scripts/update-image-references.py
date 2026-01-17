#!/usr/bin/env python3
"""
Update all image references in source files to use new paths from mapping.
"""

import re
import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
MAPPING_FILE = BASE_DIR / "scripts" / "image-mapping.json"

# Patterns to match image references
IMAGE_REF_PATTERNS = [
    (r'src=["\'](/cdn-assets/[^"\']+)["\']', 'src'),
    (r'href=["\'](/cdn-assets/[^"\']+)["\']', 'href'),
    (r'url\(["\']?(/cdn-assets/[^"\']+)["\']?\)', 'url'),
    (r'background-image:\s*url\(["\']?(/cdn-assets/[^"\']+)["\']?\)', 'background-image'),
    (r'ogImage=["\'](/cdn-assets/[^"\']+)["\']', 'ogImage'),
    (r"ogImage=['\"](/cdn-assets/[^\"']+)['\"]", 'ogImage'),
]

def load_mapping():
    """Load the image mapping."""
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    
    # Create reverse lookup: old_path -> new_path
    path_mapping = {}
    for item in mapping.values():
        old_path = item["old_path"]
        new_path = item["new_path"]
        path_mapping[old_path] = new_path
        
        # Also map without leading slash for flexibility
        if old_path.startswith("/"):
            path_mapping[old_path[1:]] = new_path[1:] if new_path.startswith("/") else new_path
    
    return path_mapping

def update_file(file_path, path_mapping):
    """Update image references in a file."""
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False, 0
    
    original_content = content
    updates = 0
    
    # Update each pattern
    for pattern, attr_type in IMAGE_REF_PATTERNS:
        def replace_match(match):
            nonlocal updates
            old_path = match.group(1)
            
            # Check if this path needs updating
            if old_path in path_mapping:
                new_path = path_mapping[old_path]
                updates += 1
                return match.group(0).replace(old_path, new_path)
            
            # Try without leading slash
            if old_path.startswith("/") and old_path[1:] in path_mapping:
                new_path = path_mapping[old_path[1:]]
                if not new_path.startswith("/"):
                    new_path = "/" + new_path
                updates += 1
                return match.group(0).replace(old_path, new_path)
            
            return match.group(0)
        
        content = re.sub(pattern, replace_match, content, flags=re.IGNORECASE)
    
    # Handle srcset attributes (may contain multiple paths)
    srcset_pattern = r'srcset=["\']([^"\']+)["\']'
    def update_srcset(match):
        nonlocal updates
        srcset_value = match.group(1)
        updated = False
        new_srcset = srcset_value
        
        # Split by comma and update each path
        parts = srcset_value.split(',')
        new_parts = []
        for part in parts:
            part = part.strip()
            # Extract path (may have size descriptor like "image.jpg 2x")
            path_match = re.search(r'(/cdn-assets/[^\s]+)', part)
            if path_match:
                old_path = path_match.group(1)
                if old_path in path_mapping:
                    new_path = path_mapping[old_path]
                    new_part = part.replace(old_path, new_path)
                    new_parts.append(new_part)
                    updated = True
                    updates += 1
                else:
                    new_parts.append(part)
            else:
                new_parts.append(part)
        
        if updated:
            return f'srcset="{", ".join(new_parts)}"'
        return match.group(0)
    
    content = re.sub(srcset_pattern, update_srcset, content, flags=re.IGNORECASE)
    
    # Write back if changed
    if content != original_content:
        try:
            file_path.write_text(content, encoding="utf-8")
            return True, updates
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            return False, 0
    
    return False, updates

def main():
    """Main function."""
    print("=" * 70)
    print("UPDATING IMAGE REFERENCES")
    print("=" * 70)
    
    # Load mapping
    print("\nLoading image mapping...")
    path_mapping = load_mapping()
    print(f"  Loaded {len(path_mapping)} path mappings")
    
    # Find all source files
    print("\nFinding source files...")
    source_files = []
    for ext in ['.astro', '.ts', '.tsx', '.js', '.jsx']:
        source_files.extend(SRC_DIR.rglob(f"*{ext}"))
    
    # Filter out node_modules
    source_files = [f for f in source_files if 'node_modules' not in str(f)]
    print(f"  Found {len(source_files)} source files")
    
    # Update files
    print("\nUpdating references...")
    updated_files = 0
    total_updates = 0
    errors = []
    
    for file_path in source_files:
        try:
            changed, updates = update_file(file_path, path_mapping)
            if changed:
                updated_files += 1
                total_updates += updates
                if updated_files % 10 == 0:
                    print(f"  Updated {updated_files} files, {total_updates} references...")
        except Exception as e:
            errors.append(f"Error processing {file_path}: {e}")
    
    print(f"\n✓ Updated {updated_files} files")
    print(f"  Total reference updates: {total_updates}")
    
    if errors:
        print(f"\n⚠ {len(errors)} errors occurred:")
        for error in errors[:10]:
            print(f"  {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")

if __name__ == "__main__":
    main()
