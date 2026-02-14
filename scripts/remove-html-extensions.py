#!/usr/bin/env python3
"""
Remove .html extensions from href attributes in Astro files.
Converts URLs like /modulo/networking.html to /modulo/networking
Preserves hash fragments and query parameters.
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"

def remove_html_extension(content, file_path):
    """Remove .html extension from internal href attributes."""
    changes_made = []
    
    def replace_href(match):
        quote = match.group(1)  # Quote character (" or ')
        href = match.group(2)   # The href value
        
        # Skip external URLs and special protocols
        if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
            return match.group(0)
        
        # Skip if no .html extension
        if '.html' not in href:
            return match.group(0)
        
        # Remove .html extension, preserving hash and query params
        # Pattern handles: /page.html, /page.html#hash, /page.html?query, /page.html?query#hash
        new_href = re.sub(r'\.html(?=[#?]|$)', '', href)
        
        if new_href != href:
            changes_made.append(f'{href} -> {new_href}')
            return f'href={quote}{new_href}{quote}'
        
        return match.group(0)
    
    # Match href="..." or href='...'
    pattern = r'href=(["\'])([^"\']+)\1'
    new_content = re.sub(pattern, replace_href, content)
    
    return new_content, changes_made

def process_file(file_path):
    """Process a single file and remove .html extensions."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, changes = remove_html_extension(content, file_path)
        
        if changes:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return changes
        
        return []
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return []

def main():
    """Main function to process all Astro files."""
    total_changes = 0
    files_modified = 0
    
    # Find all .astro files in src directory
    astro_files = list(SRC_DIR.rglob("*.astro"))
    
    print(f"Found {len(astro_files)} Astro files to process\n")
    
    for file_path in sorted(astro_files):
        changes = process_file(file_path)
        
        if changes:
            files_modified += 1
            total_changes += len(changes)
            rel_path = file_path.relative_to(BASE_DIR)
            print(f"✓ {rel_path}: {len(changes)} changes")
            for change in changes[:3]:  # Show first 3 changes
                print(f"    {change}")
            if len(changes) > 3:
                print(f"    ... and {len(changes) - 3} more")
    
    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  Files modified: {files_modified}")
    print(f"  Total changes: {total_changes}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
