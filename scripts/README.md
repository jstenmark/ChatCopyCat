# Scripts

- createsvg.js
- imagetransform\.py
- wip_createmulticoloredsvg.js

## createsvg

The `createsvg.js` script is designed to generate vector icons in SVG format from PNG images.

Supports `png` bitmaps

### Installation

Before using the script, you need to install the required Node.js packages:

- **Setup paths**: Edit paths withing `createsvg.js` according to usage
- **Setup colours**: Edit the `color`-param within `createsvg.js` according to usage
```javscript
convertPngToSvg('path/to/source.png', 'path/to/destination.svg', 'color');
```

- **Install Node.js**: Ensure Node.js is installed on your system.
- **Install Dependencies**: Run the following commands in your
```zsh
# make sure your'e in the corrent folder eg:
cd ChatCopyCat/scripts

# Install deps
npm install

# Usage
npm run createsvg
```

### Key Features
- **Image Trimming**: Automatically trims the PNG image for a cleaner SVG output.
- **Color Customization**: Allows specifying the color of the SVG icon.

### Notes
- The script uses CommonJS module syntax, which is compatible with standard Node.js environments.

---

## imagetransform

The `imagetransform.py` script is designed to process images, specifically to resize them and make their backgrounds circular and transparent.

Suppots `png` and `jpeg` bitmaps

### Installation

Before using the script, ensure Python3 is installed and set up the required packages:

- **Setup paths**: Edit paths withing `imagetransform.py` according to usage
```python
make_circle_transparent_and_resize('path/to/source.png', 'path/to/destination.svg');
# or
make_circle_transparent_and_resize('path/to/source.png', 'path/to/destination.svg', (width, height));
```

- **Install Node.js**: Ensure Node.js is installed on your system.
- **Install Dependencies**: Run the following commands in your
```zsh
# make sure your'e in the corrent folder eg:
cd ChatCopyCat/scripts

# Install deps
pip install -r requirements.txt

# Usage
python imagetransform.py
```

### Key Features
- **Image Resizing**: Resizes the image to the specified dimensions using high-quality resampling.
- **Circular Transparency**: Creates a circular transparent background for the image.
