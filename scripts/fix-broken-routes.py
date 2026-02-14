#!/usr/bin/env python3
"""
Fix broken .html route references to .astro routes.
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src" / "pages"

def fix_html_routes(content, file_path):
    """Replace .html routes with .astro routes."""
    original_content = content
    
    # Pattern to match /jng/...html routes
    pattern = r'(href=["\'])(/jng/[^"\']+)\.html(["\'])'
    
    def replace_func(match):
        prefix = match.group(1)
        route = match.group(2)
        suffix = match.group(3)
        
        # Remove .html extension
        new_route = route
        return f"{prefix}{new_route}{suffix}"
    
    new_content = re.sub(pattern, replace_func, content)
    
    return new_content, new_content != original_content

def main():
    """Main function."""
    print("Fixing broken .html route references...\n")
    
    fixed_count = 0
    files_updated = []
    
    # Process all .astro files in jng directory
    for astro_file in (SRC_DIR / "jng").rglob("*.astro"):
        try:
            content = astro_file.read_text(encoding='utf-8')
            new_content, changed = fix_html_routes(content, astro_file)
            
            if changed:
                astro_file.write_text(new_content, encoding='utf-8')
                files_updated.append(str(astro_file.relative_to(BASE_DIR)))
                fixed_count += 1
                print(f"Fixed: {astro_file.relative_to(BASE_DIR)}")
        except Exception as e:
            print(f"Error processing {astro_file}: {e}")
    
    print(f"\nFixed {fixed_count} file(s)")
    print(f"Updated {len(files_updated)} file(s)")

if __name__ == "__main__":
    main()
