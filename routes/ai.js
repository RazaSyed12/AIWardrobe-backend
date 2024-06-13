import express from 'express';
import axios from 'axios';
import ClothingItem from '../models/ClothingItem.js';
import Outfit from '../models/Outfit.js';

const router = express.Router();

// AI model URLs
const CLOTHING_RECOGNITION_API = 'http://ai-models/clothing-recognition';
const OUTFIT_SCORING_API = 'http://ai-models/outfit-scoring';

router.post('/recognize', async (req, res) => {
  try {
    const { image } = req.body;
    const response = await axios.post(CLOTHING_RECOGNITION_API, { image });
    const clothingDetails = response.data;

    res.send(clothingDetails);
  } catch (error) {
    res.status(500).send('Error recognizing clothing item');
  }
});

router.post('/score-outfit', async (req, res) => {
  try {
    const { topId, bottomId } = req.body;
    const top = await ClothingItem.findById(topId);
    const bottom = await ClothingItem.findById(bottomId);

    const response = await axios.post(OUTFIT_SCORING_API, { top, bottom });
    const scores = response.data;

    res.send(scores);
  } catch (error) {
    res.status(500).send('Error scoring outfit');
  }
});

export default router;
