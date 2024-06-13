import express from 'express';
import ClothingItem from '../models/ClothingItem.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const clothingItem = new ClothingItem(req.body);
    await clothingItem.save();
    res.status(201).send('Clothing item added successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find({ userId: req.params.userId });
    res.send(clothingItems);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await ClothingItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send('Clothing item updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ClothingItem.findByIdAndDelete(req.params.id);
    res.send('Clothing item deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export default router;
