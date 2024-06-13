import express from 'express';
import mongoose from 'mongoose';
import Wardrobe from '../models/Wardrobe.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const wardrobe = new Wardrobe({
      userId: new mongoose.Types.ObjectId(req.body.userId),
      title: req.body.title,
    });
    await wardrobe.save();
    res.status(201).send('Wardrobe created successfully');
  } catch (error) {
    console.error('Error creating wardrobe:', error.message);
    res.status(400).send(error.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const wardrobes = await Wardrobe.find({ userId: new mongoose.Types.ObjectId(req.params.userId) });
    res.status(200).send(wardrobes);
  } catch (error) {
    console.error('Error getting wardrobes:', error.message);
    res.status(400).send(error.message);
  }
});

export default router;
