#!/usr/bin/env python3
"""
Bulk update asset references using the migration map.
"""

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MIGRATION_MAP_FILE = BASE_DIR / "scripts" / "asset-migration-map.json"

def load_migration_map():
    """Load the migration map."""
    with open(MIGRATION_MAP_FILE, "r") as f:
        return json.load(f)

def create_replacement_map(migration_map):
    """Create a map of old paths to new paths."""
    replacements = {}
    
    for rel_path, mapping in migration_map.items():
        old_name = mapping["old_name"]
        new_path = mapping["new_path"]
        
        # Create full old path
        old_full_path = f"/cdn-assets/{old_name}"
        new_full_path = f"/{new_path}"
        
        replacements[old_full_path] = new_full_path
        
        # Also map in quotes (for ogImage props)
        replacements[f'"/cdn-assets/{old_name}"'] = f'"/{new_path}"'
        replacements[f"'/cdn-assets/{old_name}'"] = f"'{new_full_path}"
        
        # Map cdn-assets relative paths
        if rel_path.startswith("cdn-assets/"):
            old_rel = f"/{rel_path}"
            replacements[old_rel] = new_full_path
    
    return replacements

def update_file(file_path, replacements):
    """Update a single file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        
        # Sort replacements by length (longest first) to avoid partial matches
        sorted_replacements = sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True)
        
        for old_path, new_path in sorted_replacements:
            content = content.replace(old_path, new_path)
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Main function."""
    print("Loading migration map...")
    migration_map = load_migration_map()
    
    print("Creating replacement map...")
    replacements = create_replacement_map(migration_map)
    
    print(f"Created {len(replacements)} replacement mappings")
    
    # Find all .astro files in src/
    src_dir = BASE_DIR / "src"
    astro_files = list(src_dir.rglob("*.astro"))
    
    print(f"Found {len(astro_files)} .astro files to check")
    
    updated_count = 0
    for file_path in astro_files:
        if update_file(file_path, replacements):
            print(f"Updated: {file_path.relative_to(BASE_DIR)}")
            updated_count += 1
    
    print(f"\nUpdated {updated_count} files")

if __name__ == "__main__":
    main()
