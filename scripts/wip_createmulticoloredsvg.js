const Vibrant = require('node-vibrant');
const sharp = require('sharp');
const potrace = require('potrace');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// This function extracts the three most dominant colors from an image using Vibrant
// and filters out the background color
const extractDominantColors = async (inputPath, backgroundColorToIgnore) => {
  const palette = await Vibrant.from(inputPath).getPalette();
  const colors = [palette.Vibrant, palette.Muted, palette.DarkVibrant]
    .map(swatch => swatch.getHex())
    .filter(color => color !== backgroundColorToIgnore.toLowerCase()); // Filter out background color
  return colors;
};


// This function creates a binary mask for each color
const createBinaryMask = async (inputPath, color) => {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  // Iterate over each pixel and set to white if it matches the color
  for (let i = 0; i < data.length; i += info.channels) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    if (colorMatches(red, green, blue, color)) {
      data[i] = 255; // Red channel
      data[i + 1] = 255; // Green channel
      data[i + 2] = 255; // Blue channel
    } else {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .toColourspace('b-w')
    .png()
    .toBuffer();
};

// This function checks if the color of a pixel matches the target color within a threshold
const colorMatches = (r, g, b, hexColor, threshold = 60) => {
  const target = hexToRgb(hexColor);
  const matches = (
    Math.abs(r - target.r) < threshold &&
    Math.abs(g - target.g) < threshold &&
    Math.abs(b - target.b) < threshold
  );
  const isWhite = r > 255 - threshold && g > 255 - threshold && b > 255 - threshold;
  console.log()
  return matches && !isWhite;
};

// Convert a hex color to RGB
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

// This function uses potrace to trace the binary mask and create an SVG
const traceToSvg = async (maskBuffer, color) => {
  return new Promise((resolve, reject) => {
    potrace.trace(maskBuffer, { color: color }, (err, svg) => {
      if (err) return reject(err);
      resolve(svg);
    });
  });
};

const combineSVGPaths = (svgPaths, colors) => {
  const { document } = new JSDOM(``).window;
  const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgRoot.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgRoot.setAttribute('viewBox', '0 0 width height'); // Replace with actual viewBox dimensions

  svgPaths.forEach((svg, index) => {
    const svgDOM = new JSDOM(svg);
    const paths = svgDOM.window.document.querySelectorAll('path');

    paths.forEach((path) => {
      // Clone the path to the new SVG document
      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      newPath.setAttribute('d', path.getAttribute('d'));
      newPath.setAttribute('fill', colors[index]);
      //newPath.setAttribute('fill-opacity', '0.5'); // Optional, if you want to see overlapping parts

      svgRoot.appendChild(newPath);
    });
  });

  return svgRoot.outerHTML;
};

// Main function to process an image and create a multi-colored SVG
const convertToMultiColoredSvg = async (inputPath, outputPath) => {
  const colors = await extractDominantColors(inputPath, '#f6fcf3');
  const svgPaths = [];

  for (const color of colors) {
    const maskBuffer = await createBinaryMask(inputPath, color);
    const svg = await traceToSvg(maskBuffer, color);
    svgPaths.push(svg); // Store each SVG path
  }

  const combinedSvg = combineSVGPaths(svgPaths, colors); // Pass the colors array here
  fs.writeFileSync(outputPath, combinedSvg);
};


convertToMultiColoredSvg('in.png', 'out.svg');
