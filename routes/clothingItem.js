import express from 'express';
import mongoose from 'mongoose';
import ClothingItem from '../models/ClothingItem.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const clothingItem = new ClothingItem({
      itemId: req.body.itemId,
      wardrobeId: new mongoose.Types.ObjectId(req.body.wardrobeId),
      userId: new mongoose.Types.ObjectId(req.body.userId),
      title: req.body.title,
      category: req.body.category,
      type: req.body.type,
      season: req.body.season,
      pattern: req.body.pattern,
      primaryColor: req.body.primaryColor,
      secondaryColor: req.body.secondaryColor,
      dressCode: req.body.dressCode,
    });
    await clothingItem.save();
    res.status(201).send('Clothing item added successfully');
  } catch (error) {
    console.error('Error adding clothing item:', error.message);
    res.status(500).send('Error adding clothing item');
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find({ userId: new mongoose.Types.ObjectId(req.params.userId) });
    res.status(200).send(clothingItems);
  } catch (error) {
    console.error('Error getting clothing items:', error.message);
    res.status(500).send('Error getting clothing items');
  }
});

router.put('/:id', async (req, res) => {
  try {
    await ClothingItem.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.params.id),
      req.body,
      { new: true }
    );
    res.status(200).send('Clothing item updated successfully');
  } catch (error) {
    console.error('Error updating clothing item:', error.message);
    res.status(500).send('Error updating clothing item');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ClothingItem.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
    res.status(200).send('Clothing item deleted successfully');
  } catch (error) {
    console.error('Error deleting clothing item:', error.message);
    res.status(500).send('Error deleting clothing item');
  }
});

export default router;
