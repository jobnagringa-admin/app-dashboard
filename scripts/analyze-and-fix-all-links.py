#!/usr/bin/env python3
"""
Comprehensive analysis and fix of all <a> tags in src directory.
Finds inconsistencies and errors in href attributes.
"""

import re
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"

# Track all issues found
issues = defaultdict(list)

def analyze_href(href_value, file_path, line_num):
    """Analyze a single href value for issues."""
    href_issues = []
    
    # Skip external links, mailto, tel
    if href_value.startswith(('http://', 'https://', 'mailto:', 'tel:')):
        return href_issues
    
    # Issue 1: Relative paths without leading slash (not hash-only)
    if not href_value.startswith('/') and not href_value.startswith('#'):
        # Check if it's a page name (like "palavras-chave-dos-donts#")
        if '#' in href_value:
            page_name = href_value.split('#')[0]
            if page_name and not page_name.startswith('/'):
                href_issues.append({
                    'type': 'relative_without_slash',
                    'current': href_value,
                    'suggestion': f'/{page_name}#{href_value.split("#", 1)[1]}' if '#' in href_value else f'/{href_value}'
                })
        elif href_value and not href_value.startswith('#'):
            href_issues.append({
                'type': 'relative_without_slash',
                'current': href_value,
                'suggestion': f'/{href_value}'
            })
    
    # Issue 2: /index should be /
    if href_value == '/index' or href_value.startswith('/index#'):
        new_value = href_value.replace('/index', '/', 1)
        href_issues.append({
            'type': 'index_path',
            'current': href_value,
            'suggestion': new_value
        })
    
    # Issue 3: Hash-only links that might be incorrect
    if href_value.startswith('#') and len(href_value) > 1:
        # Check if it's a page name with hash (like "palavras-chave-dos-donts#")
        # This pattern suggests it should be an absolute path
        pass  # We'll handle this separately
    
    return href_issues

def find_all_anchor_tags(content, file_path):
    """Find all <a> tags and analyze their href attributes."""
    # Pattern to match <a> tags with href
    pattern = r'<a[^>]*href=(["\'])([^"\']+)\1[^>]*>'
    
    matches = []
    for match in re.finditer(pattern, content):
        quote_char = match.group(1)
        href_value = match.group(2)
        line_num = content[:match.start()].count('\n') + 1
        
        issues_found = analyze_href(href_value, file_path, line_num)
        if issues_found:
            matches.append({
                'match': match,
                'href': href_value,
                'line': line_num,
                'issues': issues_found
            })
    
    return matches

def fix_href_issues(content, file_path):
    """Fix all href issues found in content."""
    fixes_made = []
    
    # Fix 1: Relative paths without leading slash (page names)
    # Pattern: href="page-name#" -> href="/aulas/page-name#" or href="/modulo/page-name#"
    def fix_relative_page_links(match):
        quote = match.group(1)
        href = match.group(2)
        
        # Skip if already absolute or external
        if href.startswith(('/', 'http', 'mailto:', 'tel:', '#')):
            return match.group(0)
        
        # Check if it's a page name with hash
        if '#' in href:
            page_name, hash_part = href.split('#', 1)
            if page_name:
                # Determine correct path based on file location
                file_str = str(file_path)
                if '/jng/aulas' in file_str:
                    new_href = f'/jng/aulas/{page_name}#{hash_part}'
                elif '/aulas' in file_str:
                    new_href = f'/aulas/{page_name}#{hash_part}'
                elif '/jng/modulo' in file_str:
                    new_href = f'/jng/modulo/{page_name}#{hash_part}'
                elif '/modulo' in file_str:
                    new_href = f'/modulo/{page_name}#{hash_part}'
                else:
                    new_href = f'/{page_name}#{hash_part}'
                fixes_made.append(f'{href} -> {new_href}')
                return f'href={quote}{new_href}{quote}'
        elif href:
            # Just a page name without hash
            file_str = str(file_path)
            if '/jng/aulas' in file_str:
                new_href = f'/jng/aulas/{href}'
            elif '/aulas' in file_str:
                new_href = f'/aulas/{href}'
            elif '/jng/modulo' in file_str:
                new_href = f'/jng/modulo/{href}'
            elif '/modulo' in file_str:
                new_href = f'/modulo/{href}'
            else:
                new_href = f'/{href}'
            fixes_made.append(f'{href} -> {new_href}')
            return f'href={quote}{new_href}{quote}'
        
        return match.group(0)
    
    pattern1 = r'href=(["\'])([^"\']+)\1'
    content = re.sub(pattern1, fix_relative_page_links, content)
    
    # Fix 2: /index -> /
    def fix_index_path(match):
        quote = match.group(1)
        href = match.group(2)
        
        if href == '/index' or href.startswith('/index#'):
            new_href = href.replace('/index', '/', 1)
            fixes_made.append(f'{href} -> {new_href}')
            return f'href={quote}{new_href}{quote}'
        
        return match.group(0)
    
    content = re.sub(pattern1, fix_index_path, content)
    
    return content, fixes_made

def process_file(file_path):
    """Process a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find all anchor tags with issues
        anchor_issues = find_all_anchor_tags(content, file_path)
        
        # Fix issues
        content, fixes_made = fix_href_issues(content, file_path)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes_made, anchor_issues
        
        return False, [], anchor_issues
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, [], []

def main():
    """Main function."""
    file_patterns = ['**/*.astro']
    files_to_process = []
    
    for pattern in file_patterns:
        files_to_process.extend(SRC_DIR.glob(pattern))
    
    files_to_process = sorted(set(files_to_process))
    
    print(f"Analyzing {len(files_to_process)} files...\n")
    
    total_fixed = 0
    total_issues = 0
    
    for file_path in files_to_process:
        modified, fixes, issues_found = process_file(file_path)
        
        if issues_found:
            total_issues += len(issues_found)
            rel_path = file_path.relative_to(BASE_DIR)
            print(f"\n{rel_path}:")
            for issue in issues_found:
                print(f"  Line {issue['line']}: href=\"{issue['href']}\"")
                for i in issue['issues']:
                    print(f"    - {i['type']}: {i['current']} -> {i['suggestion']}")
        
        if fixes:
            total_fixed += len(fixes)
            rel_path = file_path.relative_to(BASE_DIR)
            print(f"\nFixed {rel_path}:")
            for fix in fixes:
                print(f"  - {fix}")
    
    print(f"\n{'='*60}")
    print(f"Analysis complete!")
    print(f"Files processed: {len(files_to_process)}")
    print(f"Total issues found: {total_issues}")
    print(f"Total fixes applied: {total_fixed}")

if __name__ == '__main__':
    main()
