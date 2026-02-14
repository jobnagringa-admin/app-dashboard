#!/usr/bin/env python3
"""
Apply the image mapping to actually move and rename files.
"""

import json
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CDN_ASSETS = BASE_DIR / "public" / "cdn-assets"
MAPPING_FILE = BASE_DIR / "scripts" / "image-mapping.json"

def main():
    """Apply the mapping."""
    print("=" * 70)
    print("APPLYING IMAGE MAPPING")
    print("=" * 70)
    
    # Load mapping
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    
    print(f"\nLoaded {len(mapping)} image mappings")
    
    # Create all target directories first
    target_dirs = set()
    for item in mapping.values():
        new_relative = item["new_relative"]
        target_dir = CDN_ASSETS / Path(new_relative).parent
        target_dirs.add(target_dir)
    
    print(f"\nCreating {len(target_dirs)} target directories...")
    for target_dir in target_dirs:
        target_dir.mkdir(parents=True, exist_ok=True)
    
    # Move and rename files
    print(f"\nMoving and renaming {len(mapping)} files...")
    moved = 0
    skipped = 0
    errors = []
    
    for old_relative, item in mapping.items():
        old_path = CDN_ASSETS / old_relative
        new_path = CDN_ASSETS / item["new_relative"]
        
        if not old_path.exists():
            errors.append(f"Source file not found: {old_path}")
            skipped += 1
            continue
        
        # Skip if already in correct location with correct name
        if old_path == new_path:
            skipped += 1
            continue
        
        try:
            # Create parent directory if needed
            new_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Move/rename file
            shutil.move(str(old_path), str(new_path))
            moved += 1
            
            if moved % 50 == 0:
                print(f"  Processed {moved} files...")
        
        except Exception as e:
            errors.append(f"Error moving {old_path} to {new_path}: {e}")
            skipped += 1
    
    print(f"\n✓ Moved {moved} files")
    if skipped > 0:
        print(f"  Skipped {skipped} files")
    if errors:
        print(f"\n⚠ {len(errors)} errors occurred:")
        for error in errors[:10]:
            print(f"  {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")

if __name__ == "__main__":
    main()
