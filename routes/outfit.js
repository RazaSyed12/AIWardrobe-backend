import express from 'express';
import Outfit from '../models/Outfit.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const outfit = new Outfit(req.body);
    await outfit.save();
    res.status(201).send('Outfit created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const outfits = await Outfit.find({ userId: req.params.userId });
    res.send(outfits);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Outfit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send('Outfit updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Outfit.findByIdAndDelete(req.params.id);
    res.send('Outfit deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export default router;
