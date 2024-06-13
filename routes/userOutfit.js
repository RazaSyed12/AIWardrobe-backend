import express from 'express';
import mongoose from 'mongoose';
import UserOutfit from '../models/UserOutfit.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, topId, bottomId, name } = req.body;
    const newOutfit = new UserOutfit({
      userId: new mongoose.Types.ObjectId(userId),
      topId: new mongoose.Types.ObjectId(topId),
      bottomId: new mongoose.Types.ObjectId(bottomId),
      name,
    });

    await newOutfit.save();
    res.status(201).send('User outfit created successfully');
  } catch (error) {
    console.error('Error creating user outfit:', error.message);
    res.status(500).send('Error creating user outfit');
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const outfits = await UserOutfit.find({ userId: new mongoose.Types.ObjectId(req.params.userId) });
    res.status(200).send(outfits);
  } catch (error) {
    console.error('Error fetching user outfits:', error.message);
    res.status(500).send('Error fetching user outfits');
  }
});

router.put('/:id', async (req, res) => {
  try {
    await UserOutfit.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.params.id),
      req.body,
      { new: true }
    );
    res.status(200).send('User outfit updated successfully');
  } catch (error) {
    console.error('Error updating user outfit:', error.message);
    res.status(500).send('Error updating user outfit');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await UserOutfit.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
    res.status(200).send('User outfit deleted successfully');
  } catch (error) {
    console.error('Error deleting user outfit:', error.message);
    res.status(500).send('Error deleting user outfit');
  }
});

export default router;
