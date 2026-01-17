#!/usr/bin/env python3
"""
Convert all raster images to WebP format while maintaining 100% quality and aspect ratio.

This script:
- Scans public/cdn-assets/images/ recursively
- Converts PNG, JPEG, GIF, BMP, TIFF to WebP
- Preserves quality (lossless), aspect ratio, and metadata
- Handles responsive variants (-p-500, -p-800, -p-1080)
- Generates conversion log
"""

import os
import sys
import json
from pathlib import Path
from collections import defaultdict

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow (PIL) is not installed.")
    print("Please install it using: pip install Pillow")
    print("Or: python3 -m pip install --user Pillow")
    sys.exit(1)

# Base directory
BASE_DIR = Path(__file__).parent.parent
PUBLIC_DIR = BASE_DIR / "public"
CDN_ASSETS_DIR = PUBLIC_DIR / "cdn-assets"
IMAGES_DIR = CDN_ASSETS_DIR / "images"

# Image extensions to convert
RASTER_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.avif'}
SVG_EXTENSIONS = {'.svg'}

# Conversion log
conversion_log = {
    'converted': [],
    'skipped': [],
    'errors': [],
    'warnings': []
}

def is_animated_gif(image_path):
    """Check if a GIF file is animated."""
    try:
        with Image.open(image_path) as img:
            return hasattr(img, 'is_animated') and img.is_animated
    except Exception:
        return False

def convert_image_to_webp(input_path, output_path, quality=100, method=6):
    """
    Convert an image to WebP format.
    
    Args:
        input_path: Path to input image
        output_path: Path to output WebP file
        quality: WebP quality (100 = lossless)
        method: WebP compression method (0-6, 6 = best)
    
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        # Open image
        with Image.open(input_path) as img:
            # Check if animated GIF
            if input_path.suffix.lower() == '.gif' and is_animated_gif(input_path):
                # Convert first frame only
                img.seek(0)
                img.save(output_path, 'WEBP', quality=quality, method=method, lossless=True)
                return True, "Converted first frame of animated GIF"
            
            # Preserve mode (RGB, RGBA, etc.)
            # Convert to RGB if necessary (WebP supports RGB/RGBA)
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
            
            # Save as WebP with lossless quality
            save_kwargs = {
                'format': 'WEBP',
                'quality': quality,
                'method': method,
                'lossless': True  # Use lossless compression
            }
            
            # Preserve metadata if possible
            if hasattr(img, 'info'):
                # Try to preserve EXIF data
                exif = img.info.get('exif')
                if exif:
                    save_kwargs['exif'] = exif
            
            img.save(output_path, **save_kwargs)
            
            return True, "Converted successfully"
            
    except Exception as e:
        return False, f"Error: {str(e)}"

def find_images_to_convert(base_dir):
    """Find all raster images to convert."""
    images = []
    
    if not base_dir.exists():
        print(f"ERROR: Images directory not found: {base_dir}")
        return images
    
    # Walk through all subdirectories
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            file_path = Path(root) / file
            ext = file_path.suffix.lower()
            
            # Skip SVGs (vector graphics)
            if ext in SVG_EXTENSIONS:
                continue
            
            # Check if it's a raster image
            if ext in RASTER_EXTENSIONS:
                images.append(file_path)
    
    return images

def main():
    """Main conversion function."""
    print("=" * 70)
    print("Image to WebP Conversion Script")
    print("=" * 70)
    print(f"Images directory: {IMAGES_DIR}")
    print()
    
    # Check if images directory exists
    if not IMAGES_DIR.exists():
        print(f"ERROR: Images directory not found: {IMAGES_DIR}")
        sys.exit(1)
    
    # Find all images
    print("Scanning for images...")
    images = find_images_to_convert(IMAGES_DIR)
    print(f"Found {len(images)} images to convert")
    print()
    
    if not images:
        print("No images found to convert.")
        return
    
    # Convert each image
    converted_count = 0
    skipped_count = 0
    error_count = 0
    
    for img_path in sorted(images):
        # Create output path (same location, .webp extension)
        output_path = img_path.with_suffix('.webp')
        
        # Skip if already WebP
        if img_path.suffix.lower() == '.webp':
            conversion_log['skipped'].append({
                'path': str(img_path.relative_to(BASE_DIR)),
                'reason': 'Already WebP'
            })
            skipped_count += 1
            continue
        
        # Skip if output already exists (avoid re-conversion)
        if output_path.exists():
            print(f"SKIP: {img_path.name} -> {output_path.name} (already exists)")
            conversion_log['skipped'].append({
                'path': str(img_path.relative_to(BASE_DIR)),
                'reason': 'Output already exists'
            })
            skipped_count += 1
            continue
        
        # Convert
        print(f"Converting: {img_path.name} -> {output_path.name}...", end=' ')
        success, message = convert_image_to_webp(img_path, output_path)
        
        if success:
            print("✓")
            converted_count += 1
            conversion_log['converted'].append({
                'original': str(img_path.relative_to(BASE_DIR)),
                'webp': str(output_path.relative_to(BASE_DIR)),
                'message': message
            })
        else:
            print(f"✗ {message}")
            error_count += 1
            conversion_log['errors'].append({
                'path': str(img_path.relative_to(BASE_DIR)),
                'error': message
            })
    
    # Print summary
    print()
    print("=" * 70)
    print("Conversion Summary")
    print("=" * 70)
    print(f"Converted: {converted_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Errors: {error_count}")
    print()
    
    # Save conversion log
    log_path = BASE_DIR / "scripts" / "webp-conversion-log.json"
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(conversion_log, f, indent=2, ensure_ascii=False)
    
    print(f"Conversion log saved to: {log_path.relative_to(BASE_DIR)}")
    
    # Print warnings if any
    if conversion_log['warnings']:
        print("\nWarnings:")
        for warning in conversion_log['warnings']:
            print(f"  - {warning}")
    
    # Print errors if any
    if conversion_log['errors']:
        print("\nErrors:")
        for error in conversion_log['errors']:
            print(f"  - {error['path']}: {error['error']}")
        sys.exit(1)
    
    print("\n✓ Conversion completed successfully!")

if __name__ == "__main__":
    main()
