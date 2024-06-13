import express from 'express';
import mongoose from 'mongoose';
import AIOutfit from '../models/AIOutfit.js';
import ClothingItem from '../models/ClothingItem.js';

const router = express.Router();

// Dummy data to simulate AI model responses
const dummyRecognitionResponse = {
  type: 'T-Shirt',
  color: 'Blue',
  pattern: 'Solid',
};

const dummyScoreResponse = {
  overallScore: 8.5,
  formalScore: 3.0,
  casualScore: 9.0,
  summerScore: 8.0,
  winterScore: 7.0,
  fashionScore: 8.0,
};

router.post('/recognize', async (req, res) => {
  try {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));
    res.status(200).send(dummyRecognitionResponse);
  } catch (error) {
    console.error('Error recognizing clothing item:', error.message);
    res.status(500).send('Error recognizing clothing item');
  }
});

router.post('/score-outfit', async (req, res) => {
  try {
    const { userId, topId, bottomId } = req.body;
    const top = await ClothingItem.findById(mongoose.Types.ObjectId(topId));
    const bottom = await ClothingItem.findById(mongoose.Types.ObjectId(bottomId));

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));
    const scores = dummyScoreResponse;

    const newOutfit = new AIOutfit({
      outfitId: Date.now(),
      userId,
      topId,
      bottomId,
      overallScore: scores.overallScore,
      formalScore: scores.formalScore,
      casualScore: scores.casualScore,
      summerScore: scores.summerScore,
      winterScore: scores.winterScore,
      fashionScore: scores.fashionScore,
    });

    await newOutfit.save();

    res.status(200).send(newOutfit);
  } catch (error) {
    console.error('Error scoring outfit:', error.message);
    res.status(500).send('Error scoring outfit');
  }
});

export default router;
