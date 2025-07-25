#!/bin/bash

# PWA Icon Generation Script
# This script generates all required PWA icons from the source logo

SOURCE_LOGO="public/logos/bulb.png"
ICONS_DIR="public/icons"

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "Ubuntu/Debian: sudo apt install imagemagick"
    echo "macOS: brew install imagemagick"
    echo "Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "Source logo not found: $SOURCE_LOGO"
    exit 1
fi

echo "Generating PWA icons from $SOURCE_LOGO..."

# Standard PWA icon sizes
declare -a sizes=("72" "96" "128" "144" "152" "192" "384" "512")

# Generate standard icons
for size in "${sizes[@]}"; do
    echo "Generating ${size}x${size} icon..."
    convert "$SOURCE_LOGO" -resize "${size}x${size}" "$ICONS_DIR/icon-${size}x${size}.png"
done

# Generate maskable icons (with padding for safe area)
echo "Generating maskable icons..."
convert "$SOURCE_LOGO" -resize "154x154" -gravity center -extent "192x192" -background "white" "$ICONS_DIR/icon-192x192-maskable.png"
convert "$SOURCE_LOGO" -resize "410x410" -gravity center -extent "512x512" -background "white" "$ICONS_DIR/icon-512x512-maskable.png"

# Generate favicon sizes
echo "Generating favicon..."
convert "$SOURCE_LOGO" -resize "16x16" "$ICONS_DIR/favicon-16x16.png"
convert "$SOURCE_LOGO" -resize "32x32" "$ICONS_DIR/favicon-32x32.png"
convert "$SOURCE_LOGO" -resize "48x48" "$ICONS_DIR/favicon-48x48.png"

# Generate Apple Touch Icons
echo "Generating Apple Touch Icons..."
convert "$SOURCE_LOGO" -resize "180x180" "$ICONS_DIR/apple-touch-icon.png"
convert "$SOURCE_LOGO" -resize "167x167" "$ICONS_DIR/apple-touch-icon-ipad.png"

echo "Icon generation complete!"
echo "Generated icons in: $ICONS_DIR"
