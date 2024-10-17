import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import Wardrobe from '../models/Wardrobe.js';

const router = express.Router();

// Configure Multer storage to store image files in the 'uploads' directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Save files to 'uploads/' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));  // Unique filename
  }
});

const upload = multer({ storage: storage });

// Specify fields for clothes array and the images
const clothesUpload = upload.fields([
  { name: 'clothes[0][image]', maxCount: 1 },
  { name: 'clothes[1][image]', maxCount: 1 },
  // Add more as needed
]);

// Create a new wardrobe with clothes, including multiple image uploads
router.post('/', clothesUpload, async (req, res) => {
  try {
    const { name, clothes } = req.body;  // Wardrobe name and clothes array

    // Log request body for debugging
    console.log(req.body);

    // Check if wardrobe name is present
    if (!name) {
      return res.status(400).json({ error: "Wardrobe name is required." });
    }

    // Ensure clothes array exists and has at least one item
    if (!clothes || clothes.length === 0) {
      return res.status(400).json({ error: "At least one clothing item is required." });
    }

    // Initialize parsed clothes array
    const parsedClothes = [];

    // Parse clothes array from the request
    clothes.forEach((item, i) => {
      const { name: itemName, primaryColor, type, secondaryColor } = item;

      // Ensure required fields for each clothing item
      if (!itemName || !primaryColor || !type) {
        return res.status(400).json({ error: `Clothing item ${i} is missing required fields.` });
      }

      parsedClothes.push({
        name: itemName,
        primaryColor,
        secondaryColor: secondaryColor || null,
        type,
        imageUrl: req.files && req.files[`clothes[${i}][image]`]
          ? `/uploads/${req.files[`clothes[${i}][image]`][0].filename}`
          : null
      });
    });

    // Create a new wardrobe object
    const wardrobe = new Wardrobe({
      userId: new mongoose.Types.ObjectId(),  // Generate a new ObjectId for userId
      name,
      clothes: parsedClothes  // Store the parsed clothes array with image URLs
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

router.get('/', async (req, res) => {
  try {
    // Fetch all wardrobes from the database
    const wardrobes = await Wardrobe.find();

    // If no wardrobes are found, return an empty array
    if (!wardrobes || wardrobes.length === 0) {
      return res.status(200).json({
        message: 'No wardrobes found',
        wardrobes: []
      });
    }

    // Return the list of wardrobes
    res.status(200).json({
      message: 'Wardrobes retrieved successfully',
      wardrobes
    });
  } catch (error) {
    console.error('Error retrieving wardrobes:', error.message);
    res.status(500).json({ error: 'An error occurred while retrieving the wardrobes.' });
  }
});

export default router;
