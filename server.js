import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import wardrobeRoutes from './routes/wardrobe.js';
import clothingItemRoutes from './routes/clothingItem.js';
import userOutfitRoutes from './routes/userOutfit.js';
import aiRoutes from './routes/ai.js';
import imageUpload from './middleware/imageUpload.js';
import processImage from './middleware/imageProcessing.js';

const app = express();

mongoose.connect('mongodb://localhost:27017/wardrobe');

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/wardrobe', wardrobeRoutes);
app.use('/clothingItem', clothingItemRoutes);
app.use('/ai', aiRoutes);
app.use('/userOutfit', userOutfitRoutes);

app.post('/upload', imageUpload.single('image'), processImage, (req, res) => {
  res.send('Image uploaded and processed successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
