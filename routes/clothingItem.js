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
import UserOutfit from "../models/UserOutfit.js";
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
function getAttributeScore(attribute, preference, value, value2) {
  if (!value || !value2) return 0; // handle null or empty

  // Handle both single value and array cases
  const values = Array.isArray(value) ? value : [value];
  const values2 = Array.isArray(value2) ? value2 : [value2];

  const dataKey = `${attribute} (${preference})`;
  const arr = scoringData[dataKey];
  if (!arr || !arr.length) return 0;

  let totalScore = 0;
  let comparisons = 0;

  // For each value in first array
  for (const val1 of values) {
    // Find matching scoring object
    const scoringObj = arr.find((obj) => obj[attribute] === val1);
    if (!scoringObj) continue;

    // Add up scores for each value2 combination
    for (const val2 of values2) {
      if (scoringObj[val2] !== undefined) {
        totalScore += scoringObj[val2];
        comparisons++;
      }
    }
  }

  // Normalize score by dividing by the number of actual comparisons made
  return comparisons > 0 ? totalScore / comparisons : 0;
}

// 3) Combined function to calculate formal/casual
function calculateOutfitScores(top, bottom, preference) {
  // Define weightages for different attributes (total = 1.0)
  const weights = {
    category: 0.25, // Category match is very important (top-bottom compatibility)
    texture: 0.15, // Texture contrast/harmony is quite important
    fabric: 0.2, // Fabric compatibility is very important
    shape: 0.2, // Shape/silhouette harmony is very important
    pattern: 0.1, // Pattern coordination is less critical
    style: 0.1, // Style matching is supplementary
  };

  // Calculate weighted scores
  let weightedScore = 0;

  // Categories cross-table (type matching)
  weightedScore +=
    getCategoryScore(top.type, bottom.type, preference) * weights.category;

  // Texture
  weightedScore +=
    getAttributeScore("Texture", preference, top.texture, bottom.texture) *
    weights.texture;

  // Fabric
  weightedScore +=
    getAttributeScore("Fabric", preference, top.fabric, bottom.fabric) *
    weights.fabric;

  // Shape
  weightedScore +=
    getAttributeScore("Shape", preference, top.shape, bottom.shape) *
    weights.shape;

  // Pattern
  weightedScore +=
    getAttributeScore("Part", preference, top.pattern, bottom.pattern) *
    weights.pattern;

  // Style
  weightedScore +=
    getAttributeScore("Style", preference, top.style, bottom.style) *
    weights.style;

  return weightedScore;
}

// Test function for scoring helpers
function testScoringHelpers() {
  // Test data
  const testTop = {
    type: "Anorak",
    texture: ["rugby_striped", "stripe", "striped"],
    fabric: ["knit"],
    shape: ["pullover"],
    pattern: ["crew", "hooded"],
    style: ["biker"],
  };

  const testBottom = {
    type: "Chinos",
    texture: ["rugby_striped", "stripe", "striped"],
    fabric: ["knit"],
    shape: ["pullover"],
    pattern: ["crew", "hooded"],
    style: ["tailored"],
  };

  const preference = "Formal";
  console.log(
    "Outfit Score:",
    calculateOutfitScores(testTop, testBottom, preference)
  );
  // Test category scoring
  console.log("Category Score Test:");
  const catScoreFormal = getCategoryScore(
    testTop.type,
    testBottom.type,
    "Formal"
  );
  const catScoreCasual = getCategoryScore(
    testTop.type,
    testBottom.type,
    "Casual"
  );

  console.log(
    `Formal: Score for ${testTop.type} with ${testBottom.type}: ${catScoreFormal}`
  );
  console.log(
    `Casual: Score for ${testTop.type} with ${testBottom.type}: ${catScoreCasual}`
  );

  // Test attribute scoring
  console.log("\nAttribute Score Tests:");
  console.log(
    "Texture Score:",
    getAttributeScore("Texture", "Formal", testTop.texture, testBottom.texture),
    getAttributeScore("Texture", "Casual", testTop.texture, testBottom.texture)
  );
  console.log(
    "Fabric Score:",
    getAttributeScore("Fabric", "Formal", testTop.fabric, testBottom.fabric),
    getAttributeScore("Fabric", "Casual", testTop.fabric, testBottom.fabric)
  );
  console.log(
    "Shape Score:",
    getAttributeScore("Shape", "Formal", testTop.shape, testBottom.shape),
    getAttributeScore("Shape", "Casual", testTop.shape, testBottom.shape)
  );
  // console.log(
  //   "Pattern Score:",
  //   getAttributeScore("Part", "Formal", testTop.pattern)
  // );
  // console.log(
  //   "Style Score:",
  //   getAttributeScore("Style", "Formal", testTop.style)
  // );

  // // Test full outfit scoring
  // console.log("\nFull Outfit Scores:");
  // const formalScore = calculateOutfitScores(testTop, testBottom, "Formal");
  // const casualScore = calculateOutfitScores(testTop, testBottom, "Casual");
  // console.log("Formal Score:", formalScore);
  // console.log("Casual Score:", casualScore);
}

// testScoringHelpers();

// Helper to classify items into tops and bottoms
function classifyClothingItems(clothingItems) {
  const tops = [];
  const bottoms = [];

  // console.log("clothingItems:", clothingItems);
  clothingItems.forEach((item) => {
    if (item.isTop === "True" || item.isTop === "true") {
      tops.push(item);
    } else if (item.isTop === "False" || item.isTop === "false") {
      bottoms.push(item);
    }
  });

  console.log("tops:", tops);
  console.log("bottoms:", bottoms);

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
        isTop: null,
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
          // First, combine any split array values
          let rawString = stdout.trim();
          let inArray = false;
          let values = [];
          let currentValue = "";

          for (let char of rawString) {
            if (char === "[") inArray = true;
            if (char === "]") {
              inArray = false;
              currentValue += char;
              values.push(currentValue);
              currentValue = "";
              continue;
            }
            if (inArray) {
              currentValue += char;
            } else if (char === ",") {
              if (currentValue) values.push(currentValue.trim());
              currentValue = "";
            } else {
              currentValue += char;
            }
          }
          if (currentValue) values.push(currentValue.trim());

          // Helper function to parse array values
          const parseValue = (val) => {
            if (val === "[]") return [];
            if (val.startsWith("[") && val.endsWith("]")) {
              // Parse Python-style array
              const arrayContent = val.slice(2, -2).split("', '");
              return arrayContent.map((item) => item.trim());
            }
            if (val === "False") return false;
            if (val === "True") return true;
            return val;
          };

          // Suppose the AI returns a comma-separated list of 8 attributes
          const [
            primaryColor,
            secondaryColor,
            type,
            textureRaw,
            fabricRaw,
            shapeRaw,
            patternRaw,
            styleRaw,
            isTopRaw,
          ] = values;

          if (!primaryColor || !type) {
            console.error("AI model returned invalid output.");
            return res.status(500).json({ error: "AI processing failed" });
          }

          // Update with AI-generated values
          clothingItem.primaryColor = primaryColor;
          clothingItem.secondaryColor = secondaryColor;
          clothingItem.type = type;
          clothingItem.texture = parseValue(textureRaw);
          clothingItem.fabric = parseValue(fabricRaw);
          clothingItem.shape = parseValue(shapeRaw);
          clothingItem.pattern = parseValue(patternRaw);
          clothingItem.style = parseValue(styleRaw);
          clothingItem.isTop = parseValue(isTopRaw);

          // console.log(clothingItem);

          await wardrobe.save();

          // Now re-classify all items to generate outfits
          const allClothingItems = [];
          wardrobe.collections.forEach((col) => {
            allClothingItems.push(...col.clothes);
          });
          const { tops, bottoms } = classifyClothingItems(allClothingItems);
          console.log("tops:", tops);
          console.log("bottoms:", bottoms);
          // If enough items exist, generate outfits
          if (tops.length >= 2 && bottoms.length >= 2) {
            // First delete any existing outfits for this user
            await AIOutfit.deleteMany({ userId });
            // Then generate new outfits
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

/**
 * DELETE CLOTHING ITEM
 * DELETE /wardrobe/collections/:collectionId/clothes/:clothingItemId
 */
router.delete(
  "/collections/:collectionId/clothes/:clothingItemId",
  async (req, res) => {
    try {
      const { collectionId, clothingItemId } = req.params;
      const userId = req.user._id;

      const wardrobe = await Wardrobe.findOne({
        userId,
        "collections._id": collectionId,
      });
      if (!wardrobe) {
        return res.status(404).json({
          error: "Collection not found or does not belong to this user.",
        });
      }

      const collection = wardrobe.collections.id(collectionId);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found." });
      }

      // Filter out the item
      collection.clothes = collection.clothes.filter(
        (item) => item._id.toString() !== clothingItemId
      );

      await AIOutfit.deleteMany({
        userId,
        $or: [{ topId: clothingItemId }, { bottomId: clothingItemId }],
      });

      await UserOutfit.deleteMany({
        userId,
        $or: [{ topId: clothingItemId }, { bottomId: clothingItemId }],
      });

      const updatedWardrobe = await wardrobe.save();
      res.status(200).json({
        message: "Clothing item and associated outfits deleted successfully",
        wardrobe: updatedWardrobe,
      });
    } catch (error) {
      console.error("Error deleting clothing item:", error.message);
      res.status(500).json({
        error: "An error occurred while deleting the clothing item.",
        details: error.message,
      });
    }
  }
);

/**
 * EDIT CLOTHING ITEM
 * PUT /wardrobe/collections/:collectionId/clothes/:clothingItemId
 */
router.put(
  "/collections/:collectionId/clothes/:clothingItemId",
  upload.none(), // If not replacing the image, just use .none()
  async (req, res) => {
    try {
      const { collectionId, clothingItemId } = req.params;
      const {
        name,
        primaryColor,
        secondaryColor,
        type,
        texture,
        fabric,
        shape,
        pattern,
        style,
      } = req.body;
      const userId = req.user._id;

      const wardrobe = await Wardrobe.findOne({
        userId,
        "collections._id": collectionId,
      });
      if (!wardrobe) {
        return res.status(404).json({
          error: "Collection not found or does not belong to this user.",
        });
      }

      const collection = wardrobe.collections.id(collectionId);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found." });
      }

      const clothingItem = collection.clothes.id(clothingItemId);
      if (!clothingItem) {
        return res.status(404).json({ error: "Clothing item not found." });
      }

      // Update only the fields provided
      if (name !== undefined) clothingItem.name = name;
      if (primaryColor !== undefined) clothingItem.primaryColor = primaryColor;
      if (secondaryColor !== undefined)
        clothingItem.secondaryColor = secondaryColor;
      if (type !== undefined) clothingItem.type = type;
      if (texture !== undefined) clothingItem.texture = texture;
      if (fabric !== undefined) clothingItem.fabric = fabric;
      if (shape !== undefined) clothingItem.shape = shape;
      if (pattern !== undefined) clothingItem.pattern = pattern;
      if (style !== undefined) clothingItem.style = style;

      const updatedWardrobe = await wardrobe.save();
      res.status(200).json({
        message: "Clothing item updated successfully",
        wardrobe: updatedWardrobe,
      });
    } catch (error) {
      console.error("Error updating clothing item:", error.message);
      res.status(500).json({
        error: "An error occurred while updating the clothing item.",
        details: error.message,
      });
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
