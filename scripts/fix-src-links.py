#!/usr/bin/env python3
"""
Fix all links in src directory:
1. Convert relative imports to TypeScript path aliases
2. Convert relative href links to absolute paths
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"

# Mapping of relative paths to path aliases
IMPORT_MAPPINGS = [
    # Layouts
    (r"\.\./layouts/([^'\"]+)", r"@layouts/\1"),
    (r"\.\./\.\./layouts/([^'\"]+)", r"@layouts/\1"),
    # Components
    (r"\.\./components/([^'\"]+)", r"@components/\1"),
    (r"\.\./\.\./components/([^'\"]+)", r"@components/\1"),
    # Utils
    (r"\.\./utils/([^'\"]+)", r"@utils/\1"),
    (r"\.\./\.\./utils/([^'\"]+)", r"@utils/\1"),
    # Styles
    (r"\.\./styles/([^'\"]+)", r"@styles/\1"),
    (r"\.\./\.\./styles/([^'\"]+)", r"@styles/\1"),
    # Lib
    (r"\.\./lib/([^'\"]+)", r"@lib/\1"),
    (r"\.\./\.\./lib/([^'\"]+)", r"@lib/\1"),
    # Assets
    (r"\.\./assets/([^'\"]+)", r"@assets/\1"),
    (r"\.\./\.\./assets/([^'\"]+)", r"@assets/\1"),
    # Generic @/* for other paths
    (r"\.\./\.\./\.\./([^'\"]+)", r"@/\1"),
    (r"\.\./\.\./([^'\"]+)", r"@/\1"),
    (r"\.\./([^'\"]+)", r"@/\1"),
]

# Function to convert relative href to absolute path
def convert_href_to_absolute(match):
    """Convert relative href paths to absolute paths."""
    quote_char = match.group(1)  # ' or "
    relative_path = match.group(2)
    
    # Skip external links
    if relative_path.startswith(('http://', 'https://', 'mailto:', 'tel:', '/')):
        return match.group(0)
    
    # Remove leading ../
    path = relative_path
    while path.startswith('../'):
        path = path[3:]
    
    # Handle special cases
    if path == 'index' or path == '':
        path = '/'
    elif not path.startswith('/'):
        path = '/' + path
    
    return f'href={quote_char}{path}{quote_char}'

def fix_imports(content):
    """Fix import statements to use path aliases."""
    for pattern, replacement in IMPORT_MAPPINGS:
        # Match import statements with single or double quotes
        import_pattern = rf"import\s+.*?\s+from\s+['\"]({pattern})['\"]"
        content = re.sub(import_pattern, lambda m: m.group(0).replace(m.group(1), re.sub(pattern, replacement, m.group(1))), content)
    
    return content

def fix_hrefs(content):
    """Fix href attributes to use absolute paths."""
    # Pattern to match href="../something" or href="../../something" including the closing quote
    href_pattern = r'href=(["\'])(\.\./[^"\']*?)(["\'])'
    
    def replace_href(match):
        quote_char = match.group(1)
        relative_path = match.group(2)
        closing_quote = match.group(3)
        
        # Skip external links
        if relative_path.startswith(('http://', 'https://', 'mailto:', 'tel:', '/')):
            return match.group(0)
        
        # Remove leading ../
        path = relative_path
        while path.startswith('../'):
            path = path[3:]
        
        # Handle special cases
        if path == 'index' or path == '':
            path = '/'
        elif not path.startswith('/'):
            path = '/' + path
        
        return f'href={quote_char}{path}{closing_quote}'
    
    content = re.sub(href_pattern, replace_href, content)
    
    return content

def process_file(file_path):
    """Process a single file and fix all links."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix imports
        content = fix_imports(content)
        
        # Fix hrefs
        content = fix_hrefs(content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all files."""
    # Find all relevant files
    file_patterns = ['**/*.astro', '**/*.ts', '**/*.tsx']
    files_to_process = []
    
    for pattern in file_patterns:
        files_to_process.extend(SRC_DIR.glob(pattern))
    
    files_to_process = sorted(set(files_to_process))
    
    print(f"Found {len(files_to_process)} files to process")
    
    modified_count = 0
    for file_path in files_to_process:
        if process_file(file_path):
            modified_count += 1
            print(f"Fixed: {file_path.relative_to(BASE_DIR)}")
    
    print(f"\nDone! Modified {modified_count} files.")

if __name__ == '__main__':
    main()
