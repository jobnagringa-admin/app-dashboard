#!/usr/bin/env python3
"""
Convert all raster images to AVIF format.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from collections import defaultdict

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("WARNING: Pillow (PIL) is not installed. Will use ffmpeg instead.")

BASE_DIR = Path(__file__).parent.parent
PUBLIC_DIR = BASE_DIR / "public"
CDN_ASSETS_DIR = PUBLIC_DIR / "cdn-assets"

# Image extensions to convert
RASTER_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
SVG_EXTENSIONS = {'.svg'}

# Conversion log
conversion_log = {
    'converted': [],
    'skipped': [],
    'errors': [],
    'already_exists': [],
    'stats': {
        'total_size_before': 0,
        'total_size_after': 0,
        'files_converted': 0
    }
}

def get_file_size(file_path):
    """Get file size in bytes."""
    try:
        return file_path.stat().st_size
    except:
        return 0

def convert_with_pillow(input_path, output_path, quality=85):
    """Convert image to AVIF using Pillow."""
    try:
        with Image.open(input_path) as img:
            # Handle different modes
            if img.mode in ('RGBA', 'LA', 'P'):
                # Preserve transparency
                if img.mode == 'P' and 'transparency' in img.info:
                    img = img.convert('RGBA')
                elif img.mode == 'LA':
                    img = img.convert('RGBA')
                elif img.mode != 'RGBA':
                    img = img.convert('RGBA')
            elif img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGB')
            
            # Save as AVIF
            img.save(output_path, 'AVIF', quality=quality, method=6)
            return True, None
    except Exception as e:
        return False, str(e)

def convert_with_ffmpeg(input_path, output_path, quality=85):
    """Convert image to AVIF using ffmpeg."""
    try:
        # ffmpeg -i input.png -c:v libaom-av1 -crf 30 -b:v 0 output.avif
        # Quality mapping: 85% -> crf ~28-30
        crf = int(63 - (quality / 100) * 31)  # Map 0-100 to 63-32
        
        cmd = [
            'ffmpeg',
            '-i', str(input_path),
            '-c:v', 'libaom-av1',
            '-crf', str(crf),
            '-b:v', '0',
            '-y',  # Overwrite output file
            str(output_path)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0 and output_path.exists():
            return True, None
        else:
            return False, result.stderr
    except Exception as e:
        return False, str(e)

def convert_image(input_path, output_path, quality=85):
    """Convert an image to AVIF format."""
    # Check if output already exists
    if output_path.exists():
        return True, "already_exists"
    
    # Try Pillow first
    if PIL_AVAILABLE:
        success, error = convert_with_pillow(input_path, output_path, quality)
        if success:
            return True, None
        # If Pillow fails, try ffmpeg
        if error and 'AVIF' in error:
            print(f"  Pillow AVIF not available, trying ffmpeg...")
    
    # Try ffmpeg
    success, error = convert_with_ffmpeg(input_path, output_path, quality)
    if success:
        return True, None
    
    return False, error or "Unknown error"

def main():
    """Main conversion function."""
    print("Converting images to AVIF format...\n")
    
    # Find all images
    images_to_convert = []
    for ext in RASTER_EXTENSIONS:
        for img_path in CDN_ASSETS_DIR.rglob(f"*{ext}"):
            # Skip if already AVIF
            if img_path.suffix.lower() == '.avif':
                continue
            images_to_convert.append(img_path)
    
    print(f"Found {len(images_to_convert)} images to convert\n")
    
    if not images_to_convert:
        print("No images to convert!")
        return
    
    # Convert each image
    for i, img_path in enumerate(images_to_convert, 1):
        rel_path = img_path.relative_to(CDN_ASSETS_DIR)
        print(f"[{i}/{len(images_to_convert)}] {rel_path}")
        
        # Create output path
        output_path = img_path.with_suffix('.avif')
        
        # Get original size
        original_size = get_file_size(img_path)
        conversion_log['stats']['total_size_before'] += original_size
        
        # Convert
        success, error_msg = convert_image(img_path, output_path, quality=85)
        
        if success:
            if error_msg == "already_exists":
                conversion_log['already_exists'].append(str(rel_path))
                print(f"  ✓ Already exists")
            else:
                new_size = get_file_size(output_path)
                conversion_log['stats']['total_size_after'] += new_size
                conversion_log['stats']['files_converted'] += 1
                
                size_reduction = ((original_size - new_size) / original_size * 100) if original_size > 0 else 0
                print(f"  ✓ Converted ({original_size/1024:.1f}KB → {new_size/1024:.1f}KB, -{size_reduction:.1f}%)")
                conversion_log['converted'].append({
                    'input': str(rel_path),
                    'output': str(output_path.relative_to(CDN_ASSETS_DIR)),
                    'size_before': original_size,
                    'size_after': new_size,
                    'reduction': size_reduction
                })
        else:
            print(f"  ✗ Error: {error_msg}")
            conversion_log['errors'].append({
                'file': str(rel_path),
                'error': error_msg
            })
    
    # Print summary
    print("\n" + "="*60)
    print("CONVERSION SUMMARY")
    print("="*60)
    print(f"Total images: {len(images_to_convert)}")
    print(f"Converted: {len(conversion_log['converted'])}")
    print(f"Already existed: {len(conversion_log['already_exists'])}")
    print(f"Errors: {len(conversion_log['errors'])}")
    
    if conversion_log['stats']['files_converted'] > 0:
        total_reduction = ((conversion_log['stats']['total_size_before'] - conversion_log['stats']['total_size_after']) / 
                          conversion_log['stats']['total_size_before'] * 100)
        print(f"\nSize reduction: {total_reduction:.1f}%")
        print(f"Total size before: {conversion_log['stats']['total_size_before'] / 1024 / 1024:.1f} MB")
        print(f"Total size after: {conversion_log['stats']['total_size_after'] / 1024 / 1024:.1f} MB")
    
    # Save log
    log_file = BASE_DIR / "scripts" / "avif-conversion-log.json"
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(conversion_log, f, indent=2, ensure_ascii=False)
    print(f"\nConversion log saved to: {log_file}")

if __name__ == "__main__":
    main()
