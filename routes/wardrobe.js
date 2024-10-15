import express from 'express';
import mongoose from 'mongoose';
import Wardrobe from '../models/Wardrobe.js';

const router = express.Router();

// Create a new wardrobe with clothes
router.post('/', async (req, res) => {
  try {
    const { name, clothes } = req.body;

    // Auto-generate a new ObjectId for userId
    const userId = new mongoose.Types.ObjectId();

    // Create a new wardrobe object
    const wardrobe = new Wardrobe({
      userId,  // Use the auto-generated userId
      name,
      clothes, // Directly pass the clothes array from the request body
    });

    // Save the wardrobe to the database
    const savedWardrobe = await wardrobe.save();

    // Send the created wardrobe in the response
    res.status(201).json({
      message: 'Wardrobe created successfully',
      wardrobe: savedWardrobe  // Return the saved wardrobe object
    });
  } catch (error) {
    console.error('Error creating wardrobe:', error.message);
    res.status(400).send(error.message);
  }
});

export default router;
