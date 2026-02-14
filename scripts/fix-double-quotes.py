#!/usr/bin/env python3
"""
Fix double quotes in href attributes: href="/path"" -> href="/path"
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"

def fix_double_quotes(content):
    """Fix double quotes in href attributes."""
    # Pattern to match href="/path"" or href='/path''
    pattern = r'href=(["\'])([^"\']+)\1\1'
    
    def replace(match):
        quote = match.group(1)
        path = match.group(2)
        return f'href={quote}{path}{quote}'
    
    content = re.sub(pattern, replace, content)
    return content

def process_file(file_path):
    """Process a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_double_quotes(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function."""
    file_patterns = ['**/*.astro', '**/*.ts', '**/*.tsx']
    files_to_process = []
    
    for pattern in file_patterns:
        files_to_process.extend(SRC_DIR.glob(pattern))
    
    files_to_process = sorted(set(files_to_process))
    
    modified_count = 0
    for file_path in files_to_process:
        if process_file(file_path):
            modified_count += 1
            print(f"Fixed: {file_path.relative_to(BASE_DIR)}")
    
    print(f"\nDone! Fixed {modified_count} files.")

if __name__ == '__main__':
    main()
