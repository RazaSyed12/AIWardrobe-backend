import express from 'express';
import Wardrobe from '../models/Wardrobe.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const wardrobe = new Wardrobe(req.body);
    await wardrobe.save();
    res.status(201).send('Wardrobe created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const wardrobes = await Wardrobe.find({ userId: req.params.userId });
    res.send(wardrobes);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export default router;
