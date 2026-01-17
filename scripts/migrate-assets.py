#!/usr/bin/env python3
"""
Script to actually perform the asset migration.
Moves and renames files according to the migration map.
"""

import os
import json
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
PUBLIC_DIR = BASE_DIR / "public"
MIGRATION_MAP_FILE = BASE_DIR / "scripts" / "asset-migration-map.json"

def load_migration_map():
    """Load the migration map."""
    with open(MIGRATION_MAP_FILE, "r") as f:
        return json.load(f)

def migrate_files(dry_run=True):
    """Perform the actual file migration."""
    migration_map = load_migration_map()
    
    print(f"Loaded {len(migration_map)} files to migrate")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print()
    
    # Create directories
    created_dirs = set()
    moved_files = []
    errors = []
    
    for rel_path, mapping in migration_map.items():
        old_path = Path(mapping["old_path"])
        new_rel_path = mapping["new_path"]
        new_path = PUBLIC_DIR / new_rel_path
        new_dir = new_path.parent
        
        # Skip if already in correct location with correct name
        if old_path == new_path:
            continue
        
        # Create directory if needed
        if new_dir not in created_dirs:
            if not dry_run:
                new_dir.mkdir(parents=True, exist_ok=True)
            created_dirs.add(new_dir)
            print(f"Created directory: {new_dir.relative_to(PUBLIC_DIR)}")
        
        # Move file
        if old_path.exists():
            try:
                if not dry_run:
                    # Ensure parent directory exists
                    new_path.parent.mkdir(parents=True, exist_ok=True)
                    # If file is already in the right place with right name, skip
                    if old_path != new_path:
                        # Move file
                        shutil.move(str(old_path), str(new_path))
                moved_files.append({
                    "old": str(old_path.relative_to(PUBLIC_DIR)),
                    "new": str(new_rel_path)
                })
                if old_path != new_path:
                    print(f"  {old_path.name} -> {new_rel_path}")
            except Exception as e:
                errors.append({
                    "file": str(rel_path),
                    "error": str(e)
                })
                print(f"  ERROR: {old_path.name} - {e}")
        else:
            errors.append({
                "file": str(rel_path),
                "error": "File not found"
            })
            print(f"  WARNING: {old_path.name} not found")
    
    # Clean up empty directories
    if not dry_run:
        for dir_path in sorted(PUBLIC_DIR.rglob("*"), reverse=True):
            if dir_path.is_dir() and dir_path != PUBLIC_DIR:
                try:
                    if not any(dir_path.iterdir()):
                        dir_path.rmdir()
                        print(f"Removed empty directory: {dir_path.relative_to(PUBLIC_DIR)}")
                except:
                    pass
    
    print(f"\nSummary:")
    print(f"  Files moved: {len(moved_files)}")
    print(f"  Errors: {len(errors)}")
    
    if errors:
        print(f"\nErrors:")
        for err in errors:
            print(f"  {err['file']}: {err['error']}")
    
    return moved_files, errors

if __name__ == "__main__":
    import sys
    
    dry_run = "--live" not in sys.argv
    
    if dry_run:
        print("Running in DRY RUN mode. Use --live to actually migrate files.")
    else:
        print("Running in LIVE mode. Files will be moved.")
        response = input("Continue? (yes/no): ")
        if response.lower() != "yes":
            print("Aborted.")
            exit(1)
    
    migrate_files(dry_run=dry_run)
