#!/usr/bin/env python3
"""
Find all 404 errors by analyzing source files and checking if referenced assets exist.
"""

import re
import json
from pathlib import Path
from urllib.parse import unquote
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src" / "pages"
PUBLIC_DIR = BASE_DIR / "public"
LEGACY_DIR = BASE_DIR / "src-legacy" / "cdn-assets"

# Collect all potential 404 errors
errors_404 = defaultdict(list)

def find_asset_references(content, file_path):
    """Find all asset references in content."""
    references = []
    
    # Pattern for /cdn-assets/ paths
    patterns = [
        r'src=["\'](/cdn-assets/[^"\']+)["\']',
        r'href=["\'](/cdn-assets/[^"\']+)["\']',
        r'url\(["\']?(/cdn-assets/[^"\']+)["\']?\)',
        r'background-image:\s*url\(["\']?(/cdn-assets/[^"\']+)["\']?\)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            ref_path = match.group(1)
            # Decode URL encoding
            decoded = unquote(ref_path)
            references.append({
                "path": decoded,
                "original": ref_path,
                "line": content[:match.start()].count('\n') + 1,
                "context": content[max(0, match.start()-50):match.end()+50]
            })
    
    return references

def check_asset_exists(asset_path):
    """Check if asset exists in public or legacy directories."""
    # Remove leading /cdn-assets/
    if asset_path.startswith("/cdn-assets/"):
        rel_path = asset_path[12:]  # Remove "/cdn-assets/"
    else:
        rel_path = asset_path
    
    # Check in public/cdn-assets
    public_path = PUBLIC_DIR / "cdn-assets" / rel_path
    if public_path.exists():
        return True, "public"
    
    # Check in legacy (for reference)
    legacy_path = LEGACY_DIR / rel_path
    if legacy_path.exists():
        return False, "legacy"
    
    # Try with different extensions
    base_name = Path(rel_path).stem
    for ext in ['.avif', '.webp', '.png', '.jpg', '.jpeg', '.svg']:
        test_path = PUBLIC_DIR / "cdn-assets" / f"{base_name}{ext}"
        if test_path.exists():
            return False, f"public (different extension: {ext})"
        
        test_path = LEGACY_DIR / f"{base_name}{ext}"
        if test_path.exists():
            return False, f"legacy (different extension: {ext})"
    
    return False, "not_found"

def check_page_references(content, file_path):
    """Check for internal page references that might be broken."""
    broken_links = []
    
    # Pattern for internal links
    patterns = [
        r'href=["\'](/[^"\']+)["\']',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            link_path = match.group(1)
            # Skip external links, assets, anchors
            if link_path.startswith("http") or link_path.startswith("#") or link_path.startswith("/cdn-assets"):
                continue
            
            # Check if page exists
            page_path = SRC_DIR / link_path.lstrip("/")
            if link_path.endswith("/"):
                page_path = page_path / "index.astro"
            else:
                page_path = page_path.with_suffix(".astro")
            
            # Also check parent directory for index
            if not page_path.exists():
                parent_index = page_path.parent / "index.astro"
                if not parent_index.exists():
                    broken_links.append({
                        "path": link_path,
                        "line": content[:match.start()].count('\n') + 1,
                    })
    
    return broken_links

def analyze_file(file_path):
    """Analyze a single file for 404 errors."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return
    
    rel_path = file_path.relative_to(SRC_DIR)
    page_url = f"/{rel_path.parent / rel_path.stem}" if rel_path.stem != "index" else f"/{rel_path.parent}" if rel_path.parent != Path('.') else "/"
    
    # Find asset references
    asset_refs = find_asset_references(content, file_path)
    for ref in asset_refs:
        exists, location = check_asset_exists(ref["path"])
        if not exists:
            errors_404[page_url].append({
                "type": "asset",
                "path": ref["path"],
                "original": ref["original"],
                "line": ref["line"],
                "location": location,
                "context": ref["context"][:100]
            })
    
    # Check page references
    broken_links = check_page_references(content, file_path)
    for link in broken_links:
        errors_404[page_url].append({
            "type": "route",
            "path": link["path"],
            "line": link["line"]
        })

def main():
    """Main function."""
    print("Analyzing files for 404 errors...\n")
    
    # Analyze all .astro files
    astro_files = list(SRC_DIR.rglob("*.astro"))
    print(f"Found {len(astro_files)} files to analyze\n")
    
    for astro_file in astro_files:
        analyze_file(astro_file)
        if len(errors_404) % 10 == 0 and errors_404:
            print(f"Processed {len(astro_files)} files, found errors in {len(errors_404)} pages...")
    
    # Generate report
    print("\n" + "="*60)
    print("404 ERROR REPORT")
    print("="*60)
    
    total_errors = sum(len(errors) for errors in errors_404.values())
    
    if total_errors == 0:
        print("\n✓ No 404 errors found!")
    else:
        print(f"\nFound {total_errors} potential 404 error(s) across {len(errors_404)} page(s)\n")
        
        # Group by type
        by_type = defaultdict(int)
        for errors in errors_404.values():
            for error in errors:
                by_type[error["type"]] += 1
        
        print("By Category:")
        for error_type, count in sorted(by_type.items()):
            print(f"  {error_type}: {count}")
        
        # Save detailed report
        report_file = BASE_DIR / "scripts" / "404-errors-report.json"
        with open(report_file, "w", encoding='utf-8') as f:
            json.dump(dict(errors_404), f, indent=2, ensure_ascii=False)
        print(f"\nDetailed report saved to: {report_file}")
        
        # Print summary (first 20 errors)
        print("\nSummary (first 20 errors):")
        count = 0
        for page_url, errors in sorted(errors_404.items()):
            if count >= 20:
                break
            if errors:
                print(f"\n{page_url}:")
                for error in errors[:3]:  # First 3 per page
                    if count >= 20:
                        break
                    print(f"  [{error['type']}] {error.get('path', error.get('original', 'Unknown'))}")
                    if error.get('location') and error.get('location') != 'not_found':
                        print(f"    → Found in: {error['location']}")
                    count += 1

if __name__ == "__main__":
    main()
