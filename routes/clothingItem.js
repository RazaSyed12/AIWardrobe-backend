// // import { execFile } from "child_process";
// // import path from "path";
// // import express from "express";
// // import multer from "multer";
// // import { fileURLToPath } from "url"; // Handle __dirname in ES module
// // import Wardrobe from "../models/Wardrobe.js";
// // import { v4 as uuidv4 } from "uuid"; // For generating unique file names
// // import authMiddleware from "../middleware/auth.js"; // Import the auth middleware
// // import fs from "fs"; // For file and directory operations
// // import AIOutfit from "../models/AIOutfit.js"; // Import the AIOutfit model
// // import ClothingItem from "../models/ClothingItem.js"; // Import the ClothingItem model
// // import scoringData from "../scoring-data/scoringData.json" with { type: "json" };

// // const router = express.Router();

// // // Get __dirname equivalent in ES module
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Configure multer storage to keep the correct file extension and organize by user
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     const userId = req.user._id.toString(); // Get the user ID from the authenticated user
// //     const userDir = `uploads/users/${userId}/clothingItems`; // Create directory for the user's clothing items
// //     fs.mkdirSync(userDir, { recursive: true }); // Ensure the user directory exists
// //     cb(null, userDir); // Save files in the user's clothingItems directory
// //   },
// //   filename: (req, file, cb) => {
// //     const ext = path.extname(file.originalname); // Get the file extension
// //     const uniqueName = uuidv4() + ext; // Generate a unique name with the correct extension
// //     cb(null, uniqueName); // Save the file with the unique name
// //   },
// // });

// // // Set up multer to use the custom storage configuration
// // const upload = multer({
// //   storage: storage,
// //   fileFilter: (req, file, cb) => {
// //     // Only allow image files
// //     if (!file.mimetype.startsWith("image/")) {
// //       return cb(new Error("File is not an image"), false);
// //     }
// //     cb(null, true);
// //   },
// // });

// // // Apply auth middleware to all routes
// // router.use(authMiddleware);

// // // Route to add a clothing item to a collection (with automatic AI processing)
// // router.post(
// //   "/collections/:collectionId/clothes",
// //   upload.single("image"),
// //   async (req, res) => {
// //     try {
// //       const { collectionId } = req.params;
// //       const { name } = req.body;

// //       // Extract the authenticated user's ID from req.user (from the JWT)
// //       const userId = req.user._id.toString();

// //       if (!name || !req.file) {
// //         return res
// //           .status(400)
// //           .json({ error: "Clothing name and image are required." });
// //       }

// //       // Find the collection in the user's wardrobe
// //       const wardrobe = await Wardrobe.findOne({
// //         userId,
// //         "collections._id": collectionId,
// //       });
// //       if (!wardrobe) {
// //         return res.status(404).json({ error: "Collection not found." });
// //       }

// //       // Add the clothing item (name and image only for now)
// //       const newClothingItem = {
// //         name,
// //         imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`, // Save the image URL
// //         primaryColor: null, // Will be updated by AI model
// //         secondaryColor: null, // Will be updated by AI model
// //         type: null, // Will be updated by AI model
// //         texture: null, // Will be updated by AI model
// //         fabric: null, // Will be updated by AI model
// //         shape: null, // Will be updated by AI model
// //         pattern: null, // Will be updated by AI model
// //         style: null, // Will be updated by AI model
// //       };

// //       const collection = wardrobe.collections.id(collectionId);
// //       collection.clothes.push(newClothingItem); // Add clothing item to the collection
// //       const savedWardrobe = await wardrobe.save(); // Save the wardrobe

// //       const clothingItem = collection.clothes[collection.clothes.length - 1]; // Get the last added item
// //       const imagePath = path.join(
// //         __dirname,
// //         "..",
// //         "uploads",
// //         "users",
// //         userId,
// //         "clothingItems",
// //         path.basename(clothingItem.imageUrl)
// //       );

// //       // Build the absolute path to the AI model script
// //       const aiModelPath = path.join(__dirname, "..", "ai_model", "ai_model.py");

// //       // Automatically trigger AI processing after upload
// //       execFile(
// //         "python",
// //         [aiModelPath, imagePath],
// //         async (error, stdout, stderr) => {
// //           if (error) {
// //             console.error(`Error executing AI model: ${error.message}`);
// //             return res
// //               .status(500)
// //               .json({ error: "Error processing the image" });
// //           }

// //           if (stderr) {
// //             console.error(`AI Model STDERR: ${stderr}`);
// //           }

// //           // Parse AI model result (primaryColor, secondaryColor, type, texture, fabric, shape, pattern, style)
// //           const [
// //             primaryColor,
// //             secondaryColor,
// //             type,
// //             texture,
// //             fabric,
// //             shape,
// //             pattern,
// //             style,
// //           ] = stdout.trim().split(",");

// //           if (!primaryColor || !type) {
// //             console.error("AI model returned invalid output.");
// //             return res.status(500).json({ error: "AI processing failed" });
// //           }

// //           // Update the clothing item with AI-generated values
// //           clothingItem.primaryColor = primaryColor;
// //           clothingItem.secondaryColor = secondaryColor || null;
// //           clothingItem.type = type;
// //           clothingItem.texture = texture || null;
// //           clothingItem.fabric = fabric || null;
// //           clothingItem.shape = shape || null;
// //           clothingItem.pattern = pattern || null;
// //           clothingItem.style = style || null;

// //           await wardrobe.save(); // Save the updated wardrobe

// //           // **Outfit Generation Logic Starts Here**

// //           // Fetch all clothing items for the user
// //           const allClothingItems = [];

// //           // Aggregate clothing items from all collections
// //           wardrobe.collections.forEach((collection) => {
// //             allClothingItems.push(...collection.clothes);
// //           });

// //           // Classify clothing items into tops and bottoms
// //           const { tops, bottoms } = classifyClothingItems(allClothingItems);

// //           // Check if there are enough items to generate outfits
// //           if (tops.length >= 2 && bottoms.length >= 2) {
// //             await generateAndStoreOutfits(userId, tops, bottoms);
// //           }

// //           res.status(201).json({
// //             message: "Clothing item added and processed successfully",
// //             wardrobe,
// //           });
// //         }
// //       );
// //     } catch (error) {
// //       console.error("Error adding clothing item:", error.message);
// //       res
// //         .status(500)
// //         .json({ error: "An error occurred while adding the clothing item." });
// //     }
// //   }
// // );

// // // Helper function to classify clothing items into tops and bottoms
// // function classifyClothingItems(clothingItems) {
// //   const tops = [];
// //   const bottoms = [];

// //   clothingItems.forEach((item) => {
// //     if (["Sweater", "Shirt", "Blouse", "T-Shirt", "Top"].includes(item.type)) {
// //       tops.push(item);
// //     } else if (
// //       ["Skirt", "Pants", "Jeans", "Shorts", "Bottom"].includes(item.type)
// //     ) {
// //       bottoms.push(item);
// //     }
// //     console.log("Generating tops and bottoms:", tops, bottoms);
// //   });

// //   return { tops, bottoms };
// // }

// // // Helper function to generate and store outfits
// // async function generateAndStoreOutfits(userId, tops, bottoms) {
// //   const combinations = [];

// //   // Generate all possible combinations of tops and bottoms
// //   tops.forEach((top) => {
// //     bottoms.forEach((bottom) => {
// //       combinations.push({ top, bottom });
// //     });
// //     console.log("Generating outfits with tops and bottoms:", tops, bottoms);
// //   });

// //   // Calculate scores and prepare outfits for storage
// //   const outfits = combinations.map(({ top, bottom }) => {
// //     const formalScore = calculateOutfitScores(top, bottom, "Formal");
// //     const casualScore = calculateOutfitScores(top, bottom, "Casual");
// //     const overallScore = calculateOverallScore(formalScore, casualScore);

// //     return {
// //       userId,
// //       topId: top._id,
// //       bottomId: bottom._id,
// //       overallScore,
// //       formalScore,
// //       casualScore,
// //       date: new Date(),
// //     };
// //   });

// //   // Save generated outfits to the database
// //   await AIOutfit.insertMany(outfits);
// //   console.log("Outfits generated and stored for user:", userId);
// // }

// // // Helper function to calculate outfit scores
// // function calculateOutfitScores(top, bottom, category) {
// //   const attributes = ["type", "texture", "fabric", "shape", "pattern", "style"];
// //   let score = 0;

// //   attributes.forEach((attr) => {
// //     const topAttrValue = top[attr];
// //     const bottomAttrValue = bottom[attr];

// //     // Get score from scoring data
// //     const topScore =
// //       scoringData[`${capitalize(attr)} (${category})`]?.[0][topAttrValue] || 0;
// //     const bottomScore =
// //       scoringData[`${capitalize(attr)} (${category})`]?.[0][bottomAttrValue] ||
// //       0;

// //     score += topScore + bottomScore;
// //   });

// //   return score;
// // }

// // // Helper function to calculate overall score
// // function calculateOverallScore(formalScore, casualScore) {
// //   const weights = { formal: 0.6, casual: 0.4 };
// //   return formalScore * weights.formal + casualScore * weights.casual;
// // }

// // // Helper function to capitalize attribute names
// // function capitalize(str) {
// //   return str.charAt(0).toUpperCase() + str.slice(1);
// // }

// // export default router;

import { execFile } from "child_process";
import path from "path";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import Wardrobe from "../models/Wardrobe.js";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "../middleware/auth.js";
import fs from "fs";
import AIOutfit from "../models/AIOutfit.js";
import ClothingItem from "../models/ClothingItem.js";

// Import your big JSON:
import scoringData from "../scoring-data/scoringData.json" assert { type: "json" };

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------ SCORING HELPER FUNCTIONS ------------------

// 1) Cross-table for Categories
function getCategoryScore(topType, bottomType, preference) {
  const dataKey = `Categories (${preference})`;
  const catArray = scoringData[dataKey];
  if (!catArray) return 0;

  // Find the row whose "Top \ Bottom" matches topType
  const row = catArray.find((obj) => obj["Top \\ Bottom"] === topType);
  if (!row) return 0;

  // Return the value for bottomType, or 0 if not found
  return row[bottomType] ?? 0;
}

// 2) Single-attribute tables (Texture, Fabric, Shape, Part, Style)
function getAttributeScore(attribute, preference, value) {
  if (!value) return 0; // handle null or empty

  const dataKey = `${attribute} (${preference})`;
  const arr = scoringData[dataKey];
  if (!arr || !arr.length) return 0;

  const scoringObj = arr[0];
  return scoringObj[value] ?? 0;
}

// 3) Combined function to calculate formal/casual
function calculateOutfitScores(top, bottom, preference) {
  let score = 0;

  // Categories cross-table
  score += getCategoryScore(top.type, bottom.type, preference);

  // Texture
  score += getAttributeScore("Texture", preference, top.texture);
  score += getAttributeScore("Texture", preference, bottom.texture);

  // Fabric
  score += getAttributeScore("Fabric", preference, top.fabric);
  score += getAttributeScore("Fabric", preference, bottom.fabric);

  // Shape
  score += getAttributeScore("Shape", preference, top.shape);
  score += getAttributeScore("Shape", preference, bottom.shape);

  // Part (or "pattern")
  // If your item stores "part" in `pattern`, adapt accordingly:
  score += getAttributeScore("Part", preference, top.pattern);
  score += getAttributeScore("Part", preference, bottom.pattern);

  // Style
  score += getAttributeScore("Style", preference, top.style);
  score += getAttributeScore("Style", preference, bottom.style);

  return score;
}

// Helper to classify items into tops and bottoms
function classifyClothingItems(clothingItems) {
  const tops = [];
  const bottoms = [];

  clothingItems.forEach((item) => {
    // Decide how to classify by item.type
    if (
      ["Sweater", "Shirt", "Blouse", "T-Shirt", "Top", "Anorak"].includes(
        item.type
      )
    ) {
      tops.push(item);
    } else if (
      ["Skirt", "Pants", "Jeans", "Capris", "Shorts", "Bottom"].includes(
        item.type
      )
    ) {
      bottoms.push(item);
    }
  });

  return { tops, bottoms };
}

// Generate all combos & store them in AIOutfit
async function generateAndStoreOutfits(userId, tops, bottoms) {
  const outfits = [];

  tops.forEach((top) => {
    bottoms.forEach((bottom) => {
      const formalScore = calculateOutfitScores(top, bottom, "Formal");
      const casualScore = calculateOutfitScores(top, bottom, "Casual");
      const overallScore = 0.6 * formalScore + 0.4 * casualScore;

      outfits.push({
        userId,
        topId: top._id,
        bottomId: bottom._id,
        overallScore,
        formalScore,
        casualScore,
      });
    });
  });

  await AIOutfit.insertMany(outfits);
}

// ------------------ MULTER UPLOAD CONFIG ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user._id.toString();
    const userDir = `uploads/users/${userId}/clothingItems`;
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File is not an image"), false);
    }
    cb(null, true);
  },
});

// ------------------ ROUTES ------------------
router.use(authMiddleware);

// POST: add a clothing item, run AI to detect attributes, then generate outfits
router.post(
  "/collections/:collectionId/clothes",
  upload.single("image"),
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { name } = req.body;
      const userId = req.user._id.toString();

      if (!name || !req.file) {
        return res
          .status(400)
          .json({ error: "Clothing name and image are required." });
      }

      // Find the collection in the user's Wardrobe
      const wardrobe = await Wardrobe.findOne({
        userId,
        "collections._id": collectionId,
      });
      if (!wardrobe) {
        return res.status(404).json({ error: "Collection not found." });
      }

      // Create new ClothingItem (initially with minimal info)
      const newClothingItem = {
        name,
        imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`,
        primaryColor: null,
        secondaryColor: null,
        type: null,
        texture: null,
        fabric: null,
        shape: null,
        pattern: null,
        style: null,
      };

      // Insert into the collection
      const collection = wardrobe.collections.id(collectionId);
      collection.clothes.push(newClothingItem);
      await wardrobe.save();

      // The last pushed item is the new clothing item
      const clothingItem = collection.clothes[collection.clothes.length - 1];
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "users",
        userId,
        "clothingItems",
        path.basename(clothingItem.imageUrl)
      );

      // Call your Python AI script
      const aiModelPath = path.join(__dirname, "..", "ai_model", "ai_model.py");
      execFile(
        "python",
        [aiModelPath, imagePath],
        async (error, stdout, stderr) => {
          if (error) {
            console.error("Error executing AI model:", error.message);
            return res
              .status(500)
              .json({ error: "Error processing the image" });
          }
          if (stderr) {
            console.error("AI Model STDERR:", stderr);
          }

          // Suppose the AI returns a comma-separated list of 8 attributes
          const [
            primaryColor,
            secondaryColor,
            type,
            texture,
            fabric,
            shape,
            pattern,
            style,
          ] = stdout.trim().split(",");

          if (!primaryColor || !type) {
            console.error("AI model returned invalid output.");
            return res.status(500).json({ error: "AI processing failed" });
          }

          // Update with AI-generated values
          clothingItem.primaryColor = primaryColor;
          clothingItem.secondaryColor = secondaryColor || null;
          clothingItem.type = type;
          clothingItem.texture = texture || null;
          clothingItem.fabric = fabric || null;
          clothingItem.shape = shape || null;
          clothingItem.pattern = pattern || null; // or 'part'
          clothingItem.style = style || null;
          await wardrobe.save();

          // Now re-classify all items to generate outfits
          const allClothingItems = [];
          wardrobe.collections.forEach((col) => {
            allClothingItems.push(...col.clothes);
          });
          const { tops, bottoms } = classifyClothingItems(allClothingItems);

          // If enough items exist, generate outfits
          if (tops.length >= 2 && bottoms.length >= 2) {
            await generateAndStoreOutfits(userId, tops, bottoms);
          }

          // Return success
          res.status(201).json({
            message: "Clothing item added and processed successfully",
            wardrobe,
          });
        }
      );
    } catch (error) {
      console.error("Error adding clothing item:", error.message);
      res
        .status(500)
        .json({ error: "An error occurred while adding the clothing item." });
    }
  }
);

export default router;

// import { execFile } from "child_process";
// import path from "path";
// import express from "express";
// import multer from "multer";
// import { fileURLToPath } from "url";
// import Wardrobe from "../models/Wardrobe.js";
// import { v4 as uuidv4 } from "uuid";
// import authMiddleware from "../middleware/auth.js";
// import fs from "fs";
// import AIOutfit from "../models/AIOutfit.js";
// import ClothingItem from "../models/ClothingItem.js";

// // Import your big JSON for scoring (if you still need scoring logic here)
// import scoringData from "../scoring-data/scoringData.json" assert { type: "json" };

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ------------------ SCORING HELPER FUNCTIONS (If used) ------------------
// // If not needed here, you can remove scoring references or keep them for AI logic

// function getCategoryScore(topType, bottomType, preference) {
//   const dataKey = `Categories (${preference})`;
//   const catArray = scoringData[dataKey];
//   if (!catArray) return 0;
//   const row = catArray.find((obj) => obj["Top \\ Bottom"] === topType);
//   if (!row) return 0;
//   return row[bottomType] ?? 0;
// }

// function getAttributeScore(attribute, preference, value) {
//   if (!value) return 0;
//   const dataKey = `${attribute} (${preference})`;
//   const arr = scoringData[dataKey];
//   if (!arr || !arr.length) return 0;
//   const scoringObj = arr[0];
//   return scoringObj[value] ?? 0;
// }

// function calculateOutfitScores(top, bottom, preference) {
//   let score = 0;
//   score += getCategoryScore(top.type, bottom.type, preference);
//   score += getAttributeScore("Texture", preference, top.texture);
//   score += getAttributeScore("Texture", preference, bottom.texture);
//   score += getAttributeScore("Fabric", preference, top.fabric);
//   score += getAttributeScore("Fabric", preference, bottom.fabric);
//   score += getAttributeScore("Shape", preference, top.shape);
//   score += getAttributeScore("Shape", preference, bottom.shape);
//   score += getAttributeScore("Part", preference, top.pattern);
//   score += getAttributeScore("Part", preference, bottom.pattern);
//   score += getAttributeScore("Style", preference, top.style);
//   score += getAttributeScore("Style", preference, bottom.style);
//   return score;
// }

// function classifyClothingItems(clothingItems) {
//   const tops = [];
//   const bottoms = [];
//   clothingItems.forEach((item) => {
//     if (
//       ["Sweater", "Shirt", "Blouse", "T-Shirt", "Top", "Anorak"].includes(
//         item.type
//       )
//     ) {
//       tops.push(item);
//     } else if (
//       ["Skirt", "Pants", "Jeans", "Capris", "Shorts", "Bottom"].includes(
//         item.type
//       )
//     ) {
//       bottoms.push(item);
//     }
//   });
//   return { tops, bottoms };
// }

// async function generateAndStoreOutfits(userId, tops, bottoms) {
//   const outfits = [];
//   tops.forEach((top) => {
//     bottoms.forEach((bottom) => {
//       const formalScore = calculateOutfitScores(top, bottom, "Formal");
//       const casualScore = calculateOutfitScores(top, bottom, "Casual");
//       // Weighted overall
//       const overallScore = 0.6 * formalScore + 0.4 * casualScore;
//       outfits.push({
//         userId,
//         topId: top._id,
//         bottomId: bottom._id,
//         overallScore,
//         formalScore,
//         casualScore,
//         date: new Date(),
//       });
//     });
//   });
//   await AIOutfit.insertMany(outfits);
// }

// // ------------------ MULTER UPLOAD CONFIG ------------------
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const userId = req.user._id.toString();
//     const userDir = `uploads/users/${userId}/clothingItems`;
//     fs.mkdirSync(userDir, { recursive: true });
//     cb(null, userDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueName = uuidv4() + ext;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("File is not an image"), false);
//     }
//     cb(null, true);
//   },
// });

// // Apply auth middleware
// router.use(authMiddleware);

// /**
//  * ADD NEW CLOTHING ITEM (+ AI processing)
//  * POST /wardrobe/collections/:collectionId/clothes
//  */
// router.post(
//   "/collections/:collectionId/clothes",
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { collectionId } = req.params;
//       const { name } = req.body;
//       const userId = req.user._id.toString();

//       if (!name || !req.file) {
//         return res
//           .status(400)
//           .json({ error: "Clothing name and image are required." });
//       }

//       // Find the collection
//       const wardrobe = await Wardrobe.findOne({
//         userId,
//         "collections._id": collectionId,
//       });
//       if (!wardrobe) {
//         return res
//           .status(404)
//           .json({
//             error: "Collection not found or does not belong to this user.",
//           });
//       }

//       // Create new item
//       const newClothingItem = {
//         name,
//         imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`,
//         primaryColor: null,
//         secondaryColor: null,
//         type: null,
//         texture: null,
//         fabric: null,
//         shape: null,
//         pattern: null,
//         style: null,
//       };

//       const collection = wardrobe.collections.id(collectionId);
//       collection.clothes.push(newClothingItem);
//       await wardrobe.save();

//       const clothingItem = collection.clothes[collection.clothes.length - 1];
//       const imagePath = path.join(
//         __dirname,
//         "..",
//         "uploads",
//         "users",
//         userId,
//         "clothingItems",
//         path.basename(clothingItem.imageUrl)
//       );

//       // Run Python AI script to fill item attributes
//       const aiModelPath = path.join(__dirname, "..", "ai_model", "ai_model.py");
//       execFile(
//         "python",
//         [aiModelPath, imagePath],
//         async (error, stdout, stderr) => {
//           if (error) {
//             console.error("Error executing AI model:", error.message);
//             return res
//               .status(500)
//               .json({ error: "Error processing the image with AI script" });
//           }
//           if (stderr) {
//             console.error("AI Model STDERR:", stderr);
//           }

//           // Suppose AI returns 8 comma-separated attributes
//           const [
//             primaryColor,
//             secondaryColor,
//             type,
//             texture,
//             fabric,
//             shape,
//             pattern,
//             style,
//           ] = stdout.trim().split(",");

//           if (!primaryColor || !type) {
//             console.error("AI model returned invalid output.");
//             return res.status(500).json({ error: "AI processing failed" });
//           }

//           // Update item with AI results
//           clothingItem.primaryColor = primaryColor;
//           clothingItem.secondaryColor = secondaryColor || null;
//           clothingItem.type = type;
//           clothingItem.texture = texture || null;
//           clothingItem.fabric = fabric || null;
//           clothingItem.shape = shape || null;
//           clothingItem.pattern = pattern || null;
//           clothingItem.style = style || null;

//           await wardrobe.save();

//           // Optionally auto-generate outfits if enough items exist
//           const allClothingItems = [];
//           wardrobe.collections.forEach((col) => {
//             allClothingItems.push(...col.clothes);
//           });
//           const { tops, bottoms } = classifyClothingItems(allClothingItems);

//           if (tops.length >= 2 && bottoms.length >= 2) {
//             await generateAndStoreOutfits(userId, tops, bottoms);
//           }

//           res.status(201).json({
//             message: "Clothing item added and processed successfully",
//             wardrobe,
//           });
//         }
//       );
//     } catch (error) {
//       console.error("Error adding clothing item:", error.message);
//       res
//         .status(500)
//         .json({ error: "An error occurred while adding the clothing item." });
//     }
//   }
// );

// /**
//  * DELETE CLOTHING ITEM
//  * DELETE /wardrobe/collections/:collectionId/clothes/:clothingItemId
//  */
// router.delete(
//   "/collections/:collectionId/clothes/:clothingItemId",
//   async (req, res) => {
//     try {
//       const { collectionId, clothingItemId } = req.params;
//       const userId = req.user._id;

//       const wardrobe = await Wardrobe.findOne({
//         userId,
//         "collections._id": collectionId,
//       });
//       if (!wardrobe) {
//         return res
//           .status(404)
//           .json({
//             error: "Collection not found or does not belong to this user.",
//           });
//       }

//       const collection = wardrobe.collections.id(collectionId);
//       if (!collection) {
//         return res.status(404).json({ error: "Collection not found." });
//       }

//       // Filter out the item
//       collection.clothes = collection.clothes.filter(
//         (item) => item._id.toString() !== clothingItemId
//       );

//       const updatedWardrobe = await wardrobe.save();
//       res.status(200).json({
//         message: "Clothing item deleted successfully",
//         wardrobe: updatedWardrobe,
//       });
//     } catch (error) {
//       console.error("Error deleting clothing item:", error.message);
//       res.status(500).json({
//         error: "An error occurred while deleting the clothing item.",
//         details: error.message,
//       });
//     }
//   }
// );

// /**
//  * EDIT CLOTHING ITEM
//  * PUT /wardrobe/collections/:collectionId/clothes/:clothingItemId
//  */
// router.put(
//   "/collections/:collectionId/clothes/:clothingItemId",
//   upload.none(), // If not replacing the image, just use .none()
//   async (req, res) => {
//     try {
//       const { collectionId, clothingItemId } = req.params;
//       const {
//         name,
//         primaryColor,
//         secondaryColor,
//         type,
//         texture,
//         fabric,
//         shape,
//         pattern,
//         style,
//       } = req.body;
//       const userId = req.user._id;

//       const wardrobe = await Wardrobe.findOne({
//         userId,
//         "collections._id": collectionId,
//       });
//       if (!wardrobe) {
//         return res
//           .status(404)
//           .json({
//             error: "Collection not found or does not belong to this user.",
//           });
//       }

//       const collection = wardrobe.collections.id(collectionId);
//       if (!collection) {
//         return res.status(404).json({ error: "Collection not found." });
//       }

//       const clothingItem = collection.clothes.id(clothingItemId);
//       if (!clothingItem) {
//         return res.status(404).json({ error: "Clothing item not found." });
//       }

//       // Update only the fields provided
//       if (name !== undefined) clothingItem.name = name;
//       if (primaryColor !== undefined) clothingItem.primaryColor = primaryColor;
//       if (secondaryColor !== undefined)
//         clothingItem.secondaryColor = secondaryColor;
//       if (type !== undefined) clothingItem.type = type;
//       if (texture !== undefined) clothingItem.texture = texture;
//       if (fabric !== undefined) clothingItem.fabric = fabric;
//       if (shape !== undefined) clothingItem.shape = shape;
//       if (pattern !== undefined) clothingItem.pattern = pattern;
//       if (style !== undefined) clothingItem.style = style;

//       const updatedWardrobe = await wardrobe.save();
//       res.status(200).json({
//         message: "Clothing item updated successfully",
//         wardrobe: updatedWardrobe,
//       });
//     } catch (error) {
//       console.error("Error updating clothing item:", error.message);
//       res.status(500).json({
//         error: "An error occurred while updating the clothing item.",
//         details: error.message,
//       });
//     }
//   }
// );

// export default router;
