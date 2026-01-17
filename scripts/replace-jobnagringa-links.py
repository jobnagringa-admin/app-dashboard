#!/usr/bin/env python3
"""
Replace all jobnagringa.com.br links with relative paths pointing to the current site.
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"

def replace_jobnagringa_links(content):
    """Replace all jobnagringa.com.br links with relative paths."""
    replacements = []
    
    # Pattern 1: https://www.jobnagringa.com.br/path or http://www.jobnagringa.com.br/path
    def replace_www(match):
        quote = match.group(1)  # quote character
        protocol = match.group(2)  # http:// or https://
        path = match.group(3)  # path after domain (including /)
        
        if not path or path == '/':
            new_path = '/'
        else:
            new_path = path  # path already includes leading /
        
        old_url = f"{protocol}www.jobnagringa.com.br{path}"
        replacements.append(f"{old_url} -> {new_path}")
        return f'href={quote}{new_path}{quote}'
    
    # Match href="https://www.jobnagringa.com.br/..." or href="http://www.jobnagringa.com.br/..."
    pattern1 = r'href=(["\'])(https?://www\.jobnagringa\.com\.br)(/.*?)?\1'
    content = re.sub(pattern1, replace_www, content)
    
    # Pattern 2: https://link.jobnagringa.com.br/path or http://link.jobnagringa.com.br/path
    def replace_link(match):
        quote = match.group(1)
        protocol = match.group(2)
        path = match.group(3)
        
        if not path or path == '/':
            new_path = '/'
        else:
            new_path = path
        
        old_url = f"{protocol}link.jobnagringa.com.br{path}"
        replacements.append(f"{old_url} -> {new_path}")
        return f'href={quote}{new_path}{quote}'
    
    pattern2 = r'href=(["\'])(https?://link\.jobnagringa\.com\.br)(/.*?)?\1'
    content = re.sub(pattern2, replace_link, content)
    
    # Pattern 3: http://accounts.jobnagringa.com.br/path or https://accounts.jobnagringa.com.br/path
    def replace_accounts(match):
        quote = match.group(1)
        protocol = match.group(2)
        path = match.group(3)
        
        if not path or path == '/':
            new_path = '/accounts/'
        else:
            new_path = '/accounts' + path
        
        old_url = f"{protocol}accounts.jobnagringa.com.br{path}"
        replacements.append(f"{old_url} -> {new_path}")
        return f'href={quote}{new_path}{quote}'
    
    pattern3 = r'href=(["\'])(https?://accounts\.jobnagringa\.com\.br)(/.*?)?\1'
    content = re.sub(pattern3, replace_accounts, content)
    
    # Pattern 4: http://jobnagringa.com.br/path or https://jobnagringa.com.br/path (without www)
    def replace_no_www(match):
        quote = match.group(1)
        protocol = match.group(2)
        path = match.group(3)
        
        if not path or path == '/':
            new_path = '/'
        else:
            new_path = path
        
        old_url = f"{protocol}jobnagringa.com.br{path}"
        replacements.append(f"{old_url} -> {new_path}")
        return f'href={quote}{new_path}{quote}'
    
    pattern4 = r'href=(["\'])(https?://jobnagringa\.com\.br)(/.*?)?\1'
    content = re.sub(pattern4, replace_no_www, content)
    
    # Pattern 5: Replace URLs in query parameters (redirect_url=https://jobnagringa.com.br/...)
    # URLs in query params typically don't have quotes
    def replace_in_query(match):
        prefix = match.group(1)  # "redirect_url="
        protocol = match.group(2)  # http:// or https://
        subdomain_full = match.group(3)  # "www.", "link.", "accounts.", or None
        subdomain_type = match.group(4)  # www, link, accounts, or None
        subdomain_dot = match.group(5)  # "." if subdomain exists
        path = match.group(6)  # path after domain (including /) or None
        
        # Determine new path based on subdomain
        if subdomain_type == 'www' or not subdomain_type:
            if not path or path == '/':
                new_path = '/'
            else:
                new_path = path
        elif subdomain_type == 'link':
            if not path or path == '/':
                new_path = '/'
            else:
                new_path = path
        elif subdomain_type == 'accounts':
            if not path or path == '/':
                new_path = '/accounts/'
            else:
                new_path = '/accounts' + path
        else:
            # Keep as is if unknown
            return match.group(0)
        
        subdomain = subdomain_full if subdomain_full else ""
        old_url = f"{protocol}{subdomain}jobnagringa.com.br{path or ''}"
        replacements.append(f"Query param: {old_url} -> {new_path}")
        return f'{prefix}{new_path}'
    
    # Match redirect_url=https://www.jobnagringa.com.br/... (no quotes in query params)
    # Groups: 1=redirect_url=, 2=protocol, 3=full subdomain (www.), 4=subdomain type (www), 5=dot, 6=path
    pattern5 = r'(redirect_url=)(https?://)((www|link|accounts)(\.))?jobnagringa\.com\.br(/[^"\'&]*)?'
    content = re.sub(pattern5, replace_in_query, content)
    
    return content, replacements

def process_file(file_path):
    """Process a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, replacements = replace_jobnagringa_links(content)
        
        if replacements:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ {file_path}: {len(replacements)} replacements")
            for rep in replacements[:5]:  # Show first 5
                print(f"  - {rep}")
            if len(replacements) > 5:
                print(f"  ... and {len(replacements) - 5} more")
            return len(replacements)
        return 0
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return 0

def main():
    """Main function."""
    total_replacements = 0
    files_processed = 0
    
    # Find all .astro files
    for file_path in SRC_DIR.rglob("*.astro"):
        count = process_file(file_path)
        if count > 0:
            files_processed += 1
            total_replacements += count
    
    print(f"\n✓ Processed {files_processed} files")
    print(f"✓ Made {total_replacements} total replacements")

if __name__ == "__main__":
    main()
