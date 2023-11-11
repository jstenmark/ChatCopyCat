const potrace = require('potrace');
const sharp = require('sharp');
const fs = require('fs');

const convertPngToSvg = async (inputPath, outputPath, color = 'black') => {
  try {
    const trimmedBuffer = await sharp(inputPath)
      .trim()
      .toBuffer();

    const tempPath = `temp-${color}trimmed.png`;
    fs.writeFileSync(tempPath, trimmedBuffer);

    const potraceOpts = {
      background: 'transparent',
      color,
      optTolerance: 0.4,
      turdSize: 100,
    };

    potrace.trace(tempPath,potraceOpts, (err, svg) => {
      if (err) throw err;
      fs.writeFileSync(outputPath, svg);
      fs.unlinkSync(tempPath);
    });
  } catch (error) {
    console.error('Error converting PNG to SVG:', error);
  }
};

convertPngToSvg('../assets/chatcopycat_icon.png', '../images/svg/chatcopycat_bubble_dark.svg', 'white');
convertPngToSvg('../assets/chatcopycat_icon.png', '../images/svg/chatcopycat_bubble_light.svg', 'black');
