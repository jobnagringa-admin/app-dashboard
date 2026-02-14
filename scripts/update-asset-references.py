#!/usr/bin/env python3
"""
Script to update all asset references in the codebase.
Replaces old paths with new organized paths.
"""

import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MIGRATION_MAP_FILE = BASE_DIR / "scripts" / "asset-migration-map.json"

# Files to search and update
SEARCH_PATTERNS = [
    "**/*.astro",
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "**/*.css",
    "**/*.html",
]

def load_migration_map():
    """Load the migration map."""
    with open(MIGRATION_MAP_FILE, "r") as f:
        return json.load(f)

def create_reverse_map(migration_map):
    """Create a reverse map from old paths to new paths."""
    reverse_map = {}
    
    for rel_path, mapping in migration_map.items():
        old_name = mapping["old_name"]
        new_path = mapping["new_path"]
        
        # Map old filename to new path (with /cdn-assets/ prefix)
        reverse_map[old_name] = f"/cdn-assets/{new_path}"
        
        # Map old filename without extension variations
        old_base = Path(old_name).stem
        reverse_map[old_base] = f"/cdn-assets/{new_path}"
        
        # Map old relative path
        reverse_map[rel_path] = f"/cdn-assets/{new_path}"
        
        # Map cdn-assets paths (with and without leading slash)
        if rel_path.startswith("cdn-assets/"):
            old_cdn_path = rel_path
            reverse_map[old_cdn_path] = f"/cdn-assets/{new_path}"
            reverse_map[f"/{old_cdn_path}"] = f"/cdn-assets/{new_path}"
        else:
            # Map direct public paths
            reverse_map[f"/{rel_path}"] = f"/cdn-assets/{new_path}"
            # Also map as cdn-assets path
            reverse_map[f"/cdn-assets/{rel_path}"] = f"/cdn-assets/{new_path}"
    
    return reverse_map

def update_file_references(file_path, reverse_map):
    """Update asset references in a file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        updated = False
        
        # Function to replace asset paths
        def replace_asset_path(match):
            full_match = match.group(0)
            # Extract the path part
            path_match = None
            for i in range(1, len(match.groups()) + 1):
                group = match.group(i)
                if group and '/cdn-assets/' in group:
                    path_match = group
                    break
            
            if not path_match:
                return full_match
            
            # Try exact match first
            if path_match in reverse_map:
                new_path = reverse_map[path_match]
                return full_match.replace(path_match, new_path)
            
            # Try with filename only
            filename = Path(path_match).name
            if filename in reverse_map:
                new_path = reverse_map[filename]
                return full_match.replace(path_match, new_path)
            
            # Try with relative path (without leading /cdn-assets/)
            rel_path = path_match.replace('/cdn-assets/', '')
            if rel_path in reverse_map:
                new_path = reverse_map[rel_path]
                return full_match.replace(path_match, new_path)
            
            return full_match
        
        # Pattern to match asset paths in various contexts
        # This pattern matches /cdn-assets/ followed by filename (with optional query params)
        pattern = r'(/cdn-assets/[^\s"\'<>\)\?]+)'
        
        new_content = re.sub(pattern, replace_asset_path, content)
        
        if new_content != content:
            file_path.write_text(new_content, encoding='utf-8')
            updated = True
        
        return updated
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def find_files_to_update():
    """Find all files that might contain asset references."""
    files = []
    
    for pattern in SEARCH_PATTERNS:
        for file_path in BASE_DIR.glob(pattern):
            # Skip node_modules, .git, dist, etc.
            if any(part in str(file_path) for part in ['node_modules', '.git', 'dist', '.astro']):
                continue
            if file_path.is_file():
                files.append(file_path)
    
    return files

def main():
    """Main function."""
    print("Loading migration map...")
    migration_map = load_migration_map()
    
    print("Creating reverse mapping...")
    reverse_map = create_reverse_map(migration_map)
    
    print(f"Created {len(reverse_map)} path mappings")
    
    print("Finding files to update...")
    files = find_files_to_update()
    
    print(f"Found {len(files)} files to check")
    
    updated_count = 0
    for file_path in files:
        if update_file_references(file_path, reverse_map):
            print(f"Updated: {file_path.relative_to(BASE_DIR)}")
            updated_count += 1
    
    print(f"\nUpdated {updated_count} files")

if __name__ == "__main__":
    main()
