import express from "express";
import Wardrobe from "../models/Wardrobe.js";
import { clothesUpload } from "../middleware/imageUpload.js"; // Import the Multer configuration

const router = express.Router();

router.post(
  "/collections/:collectionId/clothes",
  clothesUpload,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { name, primaryColor, secondaryColor, type } = req.body;

      if (!name || !primaryColor || !type) {
        return res
          .status(400)
          .json({ error: "Clothing item is missing required fields." });
      }

      // Find the user's wardrobe
      const wardrobe = await Wardrobe.findOne({ userId: req.user._id });

      if (!wardrobe) {
        return res.status(404).json({ error: "Wardrobe not found." });
      }

      // Find the collection by ID
      const collection = wardrobe.collections.id(collectionId);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found." });
      }

      // Add the clothing item with the image URL
      collection.clothes.push({
        name,
        primaryColor,
        secondaryColor: secondaryColor || null,
        type,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      });

      // Save the updated wardrobe
      const updatedWardrobe = await wardrobe.save();

      res.status(201).json({
        message: "Clothing item added successfully",
        wardrobe: updatedWardrobe,
      });
    } catch (error) {
      console.error("Error adding clothing item:", error.message);
      res
        .status(500)
        .json({ error: "An error occurred while adding the clothing item." });
    }
  }
);

export default router;

// import express from 'express';
// import mongoose from 'mongoose';
// import ClothingItem from '../models/ClothingItem.js';

// const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const clothingItem = new ClothingItem({
//       itemId: req.body.itemId,
//       wardrobeId: new mongoose.Types.ObjectId(req.body.wardrobeId),
//       userId: new mongoose.Types.ObjectId(req.body.userId),
//       title: req.body.title,
//       category: req.body.category,
//       type: req.body.type,
//       season: req.body.season,
//       pattern: req.body.pattern,
//       primaryColor: req.body.primaryColor,
//       secondaryColor: req.body.secondaryColor,
//       dressCode: req.body.dressCode,
//     });
//     await clothingItem.save();
//     res.status(201).send('Clothing item added successfully');
//   } catch (error) {
//     console.error('Error adding clothing item:', error.message);
//     res.status(500).send('Error adding clothing item');
//   }
// });

// router.get('/:userId', async (req, res) => {
//   try {
//     const clothingItems = await ClothingItem.find({ userId: new mongoose.Types.ObjectId(req.params.userId) });
//     res.status(200).send(clothingItems);
//   } catch (error) {
//     console.error('Error getting clothing items:', error.message);
//     res.status(500).send('Error getting clothing items');
//   }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     await ClothingItem.findByIdAndUpdate(
//       new mongoose.Types.ObjectId(req.params.id),
//       req.body,
//       { new: true }
//     );
//     res.status(200).send('Clothing item updated successfully');
//   } catch (error) {
//     console.error('Error updating clothing item:', error.message);
//     res.status(500).send('Error updating clothing item');
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     await ClothingItem.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
//     res.status(200).send('Clothing item deleted successfully');
//   } catch (error) {
//     console.error('Error deleting clothing item:', error.message);
//     res.status(500).send('Error deleting clothing item');
//   }
// });

// export default router;
