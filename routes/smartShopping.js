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

// POST /api/smart-shopping/
router.post("/generate-shopping-list", async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!clothingItem || !clothingItem.type || !clothingItem.isTop) {
      return res
        .status(400)
        .json({ error: "Missing required clothing details" });
    }

    // Get user's existing wardrobe
    const wardrobe = await Wardrobe.findOne({ userId });
    if (!wardrobe) {
      return res.status(404).json({ error: "Wardrobe not found" });
    }

    // Get all clothing items from user's collections
    const existingItems = [];
    wardrobe.collections.forEach((collection) => {
      existingItems.push(...collection.clothes);
    });

    // Classify existing items into tops and bottoms
    const { tops, bottoms } = classifyClothingItems(existingItems);

    // Calculate compatibility scores with existing items
    let scores = [];
    if (clothingItem.isTop === "True" || clothingItem.isTop === true) {
      // If new item is a top, compare with existing bottoms
      bottoms.forEach((bottom) => {
        const formalScore = calculateOutfitScores(
          clothingItem,
          bottom,
          "Formal"
        );
        const casualScore = calculateOutfitScores(
          clothingItem,
          bottom,
          "Casual"
        );
        const overallScore = 0.6 * formalScore + 0.4 * casualScore;
        scores.push({
          matchingItem: bottom,
          scores: {
            formal: formalScore,
            casual: casualScore,
            overall: overallScore,
          },
        });
      });
    } else {
      // If new item is a bottom, compare with existing tops
      tops.forEach((top) => {
        const formalScore = calculateOutfitScores(top, clothingItem, "Formal");
        const casualScore = calculateOutfitScores(top, clothingItem, "Casual");
        const overallScore = 0.6 * formalScore + 0.4 * casualScore;
        scores.push({
          matchingItem: top,
          scores: {
            formal: formalScore,
            casual: casualScore,
            overall: overallScore,
          },
        });
      });
    }

    // Sort scores by overall compatibility
    scores.sort((a, b) => b.scores.overall - a.scores.overall);

    // Calculate average compatibility
    const avgScore =
      scores.reduce((sum, curr) => sum + curr.scores.overall, 0) /
      scores.length;

    res.json({
      message: "Shopping analysis completed",
      averageCompatibility: avgScore,
      bestMatches: scores.slice(0, 5), // Return top 5 matching items
      recommendation:
        avgScore > 6
          ? "This item would be a great addition to your wardrobe!"
          : avgScore > 4
          ? "This item could work with some of your clothes."
          : "This item might not match well with your current wardrobe.",
    });
  } catch (error) {
    console.error("Error analyzing shopping item:", error.message);
    res
      .status(500)
      .json({ error: "Failed to analyze shopping item compatibility" });
  }
});

export default router;
