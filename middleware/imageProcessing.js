import sharp from 'sharp';

const processImage = async (req, res, next) => {
  if (!req.file) return res.status(400).send('No image uploaded');

  try {
    const processedImage = await sharp(req.file.buffer)
      .resize(300, 300)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    req.file.buffer = processedImage;
    next();
  } catch (error) {
    console.error('Error processing image:', error.message);
    res.status(500).send('Error processing image');
  }
};

export default processImage;