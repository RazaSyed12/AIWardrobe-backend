import { execFile } from "child_process";
import path from "path";
import express from "express";
import Wardrobe from "../models/Wardrobe.js";

const router = express.Router();

// Route to process the image and update the clothing item with AI-generated fields
router.get("/process/:clothingId", async (req, res) => {
  try {
    const { clothingId } = req.params;

    // Find the wardrobe and clothing item
    const wardrobe = await Wardrobe.findOne({
      "collections.clothes._id": clothingId,
    });
    if (!wardrobe) {
      return res.status(404).json({ error: "Clothing item not found." });
    }

    const collection = wardrobe.collections.find((collection) =>
      collection.clothes.id(clothingId)
    );
    const clothingItem = collection.clothes.id(clothingId);

    // Full path to the image
    const imagePath = path.join(__dirname, "..", clothingItem.imageUrl);

    // Call the Python AI model script
    execFile(
      "python",
      ["path/to/ai_model.py", imagePath],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing AI model: ${error.message}`);
          return res.status(500).json({ error: "Error processing the image" });
        }

        // Parse the AI model result (for example, primaryColor, secondaryColor, and type)
        const [primaryColor, secondaryColor, type] = stdout.trim().split(","); // Assume AI returns a comma-separated string

        // Update the clothing item with AI-generated values
        clothingItem.primaryColor = primaryColor;
        clothingItem.secondaryColor = secondaryColor || null; // Optional field
        clothingItem.type = type;

        wardrobe.save(); // Save the updated wardrobe

        res.status(200).json({
          message:
            "Clothing item updated successfully with AI-generated details",
          wardrobe,
        });
      }
    );
  } catch (error) {
    console.error("Error processing clothing item:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while processing the clothing item." });
  }
});

export default router;

// import express from 'express';
// import mongoose from 'mongoose';
// import AIOutfit from '../models/AIOutfit.js';
// import ClothingItem from '../models/ClothingItem.js';

// const router = express.Router();

// // Dummy data to simulate AI model responses
// const dummyRecognitionResponse = {
//   type: 'T-Shirt',
//   color: 'Blue',
//   pattern: 'Solid',
// };

// const dummyScoreResponse = {
//   overallScore: 8.5,
//   formalScore: 3.0,
//   casualScore: 9.0,
//   summerScore: 8.0,
//   winterScore: 7.0,
//   fashionScore: 8.0,
// };

// router.post('/recognize', async (req, res) => {
//   try {
//     // Simulate processing time
//     await new Promise((resolve) => setTimeout(resolve, 100));
//     res.status(200).send(dummyRecognitionResponse);
//   } catch (error) {
//     console.error('Error recognizing clothing item:', error.message);
//     res.status(500).send('Error recognizing clothing item');
//   }
// });

// router.post('/score-outfit', async (req, res) => {
//   try {
//     const { userId, topId, bottomId } = req.body;
//     const top = await ClothingItem.findById(new mongoose.Types.ObjectId(topId));
//     const bottom = await ClothingItem.findById(new mongoose.Types.ObjectId(bottomId));

//     // Simulate processing time
//     await new Promise((resolve) => setTimeout(resolve, 100));
//     const scores = dummyScoreResponse;

//     const newOutfit = new AIOutfit({
//       userId: new mongoose.Types.ObjectId(userId),
//       topId: new mongoose.Types.ObjectId(topId),
//       bottomId: new mongoose.Types.ObjectId(bottomId),
//       overallScore: scores.overallScore,
//       formalScore: scores.formalScore,
//       casualScore: scores.casualScore,
//       summerScore: scores.summerScore,
//       winterScore: scores.winterScore,
//       fashionScore: scores.fashionScore,
//     });

//     await newOutfit.save();

//     res.status(200).send(newOutfit);
//   } catch (error) {
//     console.error('Error scoring outfit:', error.message);
//     res.status(500).send('Error scoring outfit');
//   }
// });

// export default router;
