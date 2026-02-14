#!/usr/bin/env python3
"""
Batch migrate HTML pages to Astro format.
"""

import re
import sys
import json
from pathlib import Path

def extract_body_content(html_content: str) -> str:
    """Extract body content from HTML, excluding page_wrapper (handled by BaseLayout)."""
    # Extract content inside page_wrapper (BaseLayout already has page_wrapper)
    # Match: <div class="page_wrapper">CONTENT</div> but need to handle nested divs
    # Use a more sophisticated approach to find the closing tag
    page_wrapper_start = html_content.find('<div class="page_wrapper">')
    if page_wrapper_start == -1:
        # Fallback: extract from body
        body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
        if body_match:
            body_content = body_match.group(1)
        else:
            return ""
    else:
        # Find the matching closing </div> for page_wrapper
        start_pos = page_wrapper_start + len('<div class="page_wrapper">')
        depth = 1
        pos = start_pos
        while pos < len(html_content) and depth > 0:
            if html_content[pos:pos+6] == '<div ' or html_content[pos:pos+5] == '<div>':
                depth += 1
                pos += 5
            elif html_content[pos:pos+7] == '</div>':
                depth -= 1
                if depth == 0:
                    body_content = html_content[start_pos:pos]
                    break
                pos += 7
            else:
                pos += 1
        else:
            # Fallback if we can't find matching tag
            body_match = re.search(r'<div class="page_wrapper">(.*?)</div>', html_content, re.DOTALL)
            if body_match:
                body_content = body_match.group(1)
            else:
                return ""
    
    # Remove nav_wrapper (handled by components)
    body_content = re.sub(
        r'<div class="nav_wrapper">.*?</div>\s*</div>',
        '',
        body_content,
        flags=re.DOTALL
    )
    
    # Remove general_style div (BaseLayout already has it)
    # Find the start position
    general_start = body_content.find('<div class="general_style')
    if general_start != -1:
        # Find </style> tag
        style_end = body_content.find('</style>', general_start)
        if style_end != -1:
            # Find the next </div> after </style>
            div_end = body_content.find('</div>', style_end)
            if div_end != -1:
                # Remove the entire div including whitespace
                before = body_content[:general_start].rstrip()
                after = body_content[div_end + 6:].lstrip()
                # Join with single newline if both parts exist
                if before and after:
                    body_content = before + '\n' + after
                elif before:
                    body_content = before
                elif after:
                    body_content = after
                else:
                    body_content = ''
    
    # Also try regex cleanup for any edge cases
    body_content = re.sub(r'<div\s+class="general_style[^"]*">.*?</style>\s*</div>', '', body_content, flags=re.DOTALL)
    
    # Clean up extra whitespace
    body_content = re.sub(r'\n{3,}', '\n\n', body_content)
    
    # Remove scripts (handled in layout)
    body_content = re.sub(r'<script[^>]*>.*?</script>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<noscript>.*?</noscript>', '', body_content, flags=re.DOTALL)
    
    # Update paths
    body_content = body_content.replace('../cdn-assets/', '/cdn-assets/')
    body_content = body_content.replace('member-dashboard.html', '/jng/member-dashboard')
    body_content = body_content.replace('jobs.html', '/jng/jobs')
    body_content = body_content.replace('index.html', '/jng/index')
    body_content = body_content.replace('course.html', '/jng/course')
    body_content = body_content.replace('community.html', '/jng/community')
    body_content = body_content.replace('partners.html', '/jng/partners')
    body_content = body_content.replace('companies-hiring.html', '/jng/companies-hiring')
    body_content = body_content.replace('resume-generator.html', '/jng/resume-generator')
    body_content = body_content.replace('job-search.html', '/jng/job-search')
    body_content = body_content.replace('jobs-brs-only.html', '/jng/jobs-brs-only')
    body_content = body_content.replace('jobs-with-vista-sponsors.html', '/jng/jobs-with-vista-sponsors')
    
    # Update relative links in aulas/modulo
    body_content = re.sub(r'href="\.\./([^"]+\.html)"', r'href="/jng/\1"', body_content)
    body_content = re.sub(r'href="([^/][^"]+\.html)"', lambda m: f'href="/jng/{m.group(1)}"', body_content)
    
    return body_content.strip()

def extract_meta(html_content: str) -> dict:
    """Extract meta information."""
    meta = {}
    
    title_match = re.search(r'<title>(.*?)</title>', html_content)
    if title_match:
        meta['title'] = title_match.group(1)
    
    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html_content)
    if desc_match:
        meta['description'] = desc_match.group(1)
    
    og_image_match = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\']', html_content)
    if og_image_match:
        meta['ogImage'] = og_image_match.group(1).replace('../cdn-assets/', '/cdn-assets/')
    
    robots_match = re.search(r'<meta[^>]*name=["\']robots["\'][^>]*content=["\'](.*?)["\']', html_content)
    if robots_match:
        meta['robots'] = robots_match.group(1)
    
    # Extract wf-page if exists
    wf_page_match = re.search(r'data-wf-page=["\']([^"\']+)["\']', html_content)
    if wf_page_match:
        meta['wfPage'] = wf_page_match.group(1)
    
    return meta

def generate_astro_page(html_file: Path, output_dir: Path, is_public: bool = True) -> None:
    """Generate Astro page from HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    body_content = extract_body_content(html_content)
    meta = extract_meta(html_content)
    
    # Determine output path
    rel_path = html_file.relative_to(Path('src-legacy/jng'))
    if rel_path.name == 'index.html':
        output_path = output_dir / 'jng' / 'index.astro'
    else:
        output_path = output_dir / 'jng' / rel_path.with_suffix('.astro')
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Generate Astro content - use set:html directive properly
    # Need to write body content directly in template
    # Use ensure_ascii=False to preserve Portuguese characters
    title_str = json.dumps(meta.get('title', 'Untitled'), ensure_ascii=False)
    desc_str = json.dumps(meta.get('description', ''), ensure_ascii=False)
    og_img_str = json.dumps(meta.get('ogImage', '/cdn-assets/66fa20663b706c601554155b_og-image-jng.jpg'), ensure_ascii=False)
    robots_str = json.dumps(meta.get('robots', ''), ensure_ascii=False)
    wf_page_str = json.dumps(meta.get('wfPage', '67fa3010efbb81d725f2360e'), ensure_ascii=False)
    
    # Escape body content for embedding
    body_escaped = body_content.replace('`', '\\`').replace('${', '\\${').replace('\\', '\\\\')
    
    # Write body content directly - Astro supports raw HTML
    astro_content = '''---
import BaseLayout from "../../layouts/BaseLayout.astro";
import PublicNavbar from "../../components/PublicNavbar.astro";
import CommunityNavbar from "../../components/CommunityNavbar.astro";
---

<BaseLayout
  title={''' + title_str + '''}
  description={''' + desc_str + '''}
  ogImage={''' + og_img_str + '''}
  robots={''' + robots_str + '''}
  wfPage={''' + wf_page_str + '''}
>
  <div class="nav_wrapper">
    <CommunityNavbar />
    <PublicNavbar />
  </div>
  
''' + body_content + '''

</BaseLayout>
'''
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(astro_content)
    
    print(f"Migrated: {html_file} -> {output_path}")

if __name__ == '__main__':
    legacy_dir = Path('src-legacy/jng')
    output_dir = Path('src/pages')
    
    # Find all HTML files
    html_files = list(legacy_dir.rglob('*.html'))
    
    print(f"Found {len(html_files)} HTML files to migrate")
    
    for html_file in html_files:
        try:
            generate_astro_page(html_file, output_dir)
        except Exception as e:
            print(f"Error migrating {html_file}: {e}")
