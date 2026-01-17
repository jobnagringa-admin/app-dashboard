#!/usr/bin/env python3
"""
Script to help migrate HTML pages from src-legacy to Astro format.
Extracts body content and updates asset paths.
"""

import re
import sys
from pathlib import Path

def extract_body_content(html_content: str) -> str:
    """Extract body content from HTML, excluding nav and scripts."""
    # Find body tag
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
    if not body_match:
        return ""
    
    body_content = body_match.group(1)
    
    # Remove nav_wrapper sections (we'll use components)
    body_content = re.sub(
        r'<div class="nav_wrapper">.*?</div>\s*</div>',
        '',
        body_content,
        flags=re.DOTALL
    )
    
    # Remove script tags in body (handled in layout)
    body_content = re.sub(
        r'<script[^>]*>.*?</script>',
        '',
        body_content,
        flags=re.DOTALL
    )
    
    # Remove noscript GTM (handled in layout)
    body_content = re.sub(
        r'<noscript>.*?</noscript>',
        '',
        body_content,
        flags=re.DOTALL
    )
    
    # Update asset paths
    body_content = body_content.replace('../cdn-assets/', '/cdn-assets/')
    
    # Update page links
    link_replacements = {
        'member-dashboard.html': '/jng/member-dashboard',
        'jobs.html': '/jng/jobs',
        'index.html': '/jng/index',
        'course.html': '/jng/course',
        'community.html': '/jng/community',
        'partners.html': '/jng/partners',
        'companies-hiring.html': '/jng/companies-hiring',
        'resume-generator.html': '/jng/resume-generator',
        'job-search.html': '/jng/job-search',
        'jobs-brs-only.html': '/jng/jobs-brs-only',
        'jobs-with-vista-sponsors.html': '/jng/jobs-with-vista-sponsors',
    }
    
    for old, new in link_replacements.items():
        body_content = body_content.replace(old, new)
        body_content = body_content.replace(f'href="{old}"', f'href="{new}"')
        body_content = body_content.replace(f'href=\'{old}\'', f'href=\'{new}\'')
    
    return body_content.strip()

def extract_meta_info(html_content: str) -> dict:
    """Extract meta information from HTML head."""
    meta = {}
    
    # Title
    title_match = re.search(r'<title>(.*?)</title>', html_content)
    if title_match:
        meta['title'] = title_match.group(1)
    
    # Description
    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html_content)
    if desc_match:
        meta['description'] = desc_match.group(1)
    
    # OG Image
    og_image_match = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\']', html_content)
    if og_image_match:
        meta['ogImage'] = og_image_match.group(1).replace('../cdn-assets/', '/cdn-assets/')
    
    # Robots
    robots_match = re.search(r'<meta[^>]*name=["\']robots["\'][^>]*content=["\'](.*?)["\']', html_content)
    if robots_match:
        meta['robots'] = robots_match.group(1)
    
    return meta

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python migrate-page.py <html-file>")
        sys.exit(1)
    
    html_file = Path(sys.argv[1])
    if not html_file.exists():
        print(f"File not found: {html_file}")
        sys.exit(1)
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    body_content = extract_body_content(html_content)
    meta = extract_meta_info(html_content)
    
    print("=" * 80)
    print("META INFO:")
    print("=" * 80)
    for key, value in meta.items():
        print(f"{key}: {value}")
    
    print("\n" + "=" * 80)
    print("BODY CONTENT (first 2000 chars):")
    print("=" * 80)
    print(body_content[:2000])
    print("...")
