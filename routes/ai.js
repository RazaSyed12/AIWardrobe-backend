import express from "express";
import AIOutfit from "../models/AIOutfit.js";
import ClothingItem from "../models/ClothingItem.js";
import authMiddleware from "../middleware/auth.js";

// We also need scoringData here
import scoringData from "../scoring-data/scoringData.json" assert { type: "json" };

const router = express.Router();
router.use(authMiddleware);

// ------------------ SCORING HELPERS ------------------
function getCategoryScore(topType, bottomType, preference) {
  const dataKey = `Categories (${preference})`;
  const catArray = scoringData[dataKey];
  if (!catArray) return 0;

  const row = catArray.find((obj) => obj["Top \\ Bottom"] === topType);
  if (!row) return 0;

  return row[bottomType] ?? 0;
}

function getAttributeScore(attribute, preference, value) {
  if (!value) return 0;
  const dataKey = `${attribute} (${preference})`;
  const arr = scoringData[dataKey];
  if (!arr || !arr.length) return 0;

  const scoringObj = arr[0];
  return scoringObj[value] ?? 0;
}

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
  score += getAttributeScore("Part", preference, top.pattern);
  score += getAttributeScore("Part", preference, bottom.pattern);

  // Style
  score += getAttributeScore("Style", preference, top.style);
  score += getAttributeScore("Style", preference, bottom.style);

  return score;
}

// ------------------ ROUTES ------------------

// POST /api/ai/generate-outfits
// Sample GET request:
// GET /api/ai/generate-outfits?preferences[occasion]=formal&preferences[collectionId]=123&preferences[clothingItemId]=456&preferences[color]=blue

router.get("/generate-outfits", async (req, res) => {
  const { preferences = {} } = req.query;
  const userId = req.user._id;

  try {
    // Build query based on preferences
    let query = { userId };
    let sortField = "overallScore";

    // Handle collection preference
    if (preferences.collectionId) {
      query["$or"] = [
        { "topId.collectionId": preferences.collectionId },
        { "bottomId.collectionId": preferences.collectionId },
      ];
    }

    // Handle specific clothing item
    if (preferences.clothingItemId) {
      query["$or"] = [
        { topId: preferences.clothingItemId },
        { bottomId: preferences.clothingItemId },
      ];
    }

    // Handle occasion preference
    if (preferences.occasion) {
      if (preferences.occasion === "formal") {
        sortField = "formalScore";
      } else if (preferences.occasion === "casual") {
        sortField = "casualScore";
      }
    }

    // Find outfits matching criteria
    const outfit = await AIOutfit.findOne(query)
      .sort({ [sortField]: -1 })
      .populate({
        path: "topId",
        select:
          "imageUrl name type primaryColor secondaryColor collectionId texture fabric shape pattern style",
      })
      .populate({
        path: "bottomId",
        select:
          "imageUrl name type primaryColor secondaryColor collectionId texture fabric shape pattern style",
      });

    if (!outfit) {
      return res
        .status(404)
        .json({ error: "No outfits found matching preferences" });
    }

    // Additional color filtering if specified
    if (preferences.color) {
      const hasColor = (item) => {
        return (
          item.primaryColor?.toLowerCase() ===
            preferences.color.toLowerCase() ||
          item.secondaryColor?.toLowerCase() === preferences.color.toLowerCase()
        );
      };

      if (!hasColor(outfit.topId) && !hasColor(outfit.bottomId)) {
        return res
          .status(404)
          .json({ error: "No outfits found with specified color" });
      }
    }

    // Format outfit for response
    const formattedOutfit = {
      outfitId: outfit._id,
      top: {
        id: outfit.topId._id,
        name: outfit.topId.name,
        imageUrl: outfit.topId.imageUrl,
        type: outfit.topId.type,
        primaryColor: outfit.topId.primaryColor,
        secondaryColor: outfit.topId.secondaryColor,
        collectionId: outfit.topId.collectionId,
      },
      bottom: {
        id: outfit.bottomId._id,
        name: outfit.bottomId.name,
        imageUrl: outfit.bottomId.imageUrl,
        type: outfit.bottomId.type,
        primaryColor: outfit.bottomId.primaryColor,
        secondaryColor: outfit.bottomId.secondaryColor,
        collectionId: outfit.bottomId.collectionId,
      },
      scores: {
        overall: outfit.overallScore,
        formal: outfit.formalScore,
        casual: outfit.casualScore,
      },
    };

    res.status(200).json({
      message: "Successfully retrieved preferred outfit",
      outfit: formattedOutfit,
    });
  } catch (error) {
    console.error("Error fetching preferred outfit:", error.message);
    res.status(500).json({ error: "Failed to fetch preferred outfit" });
  }
});

// GET /api/ai/fetch-outfits
router.get("/fetch-outfits", async (req, res) => {
  const { preference, sortBy = "overallScore" } = req.query;
  const userId = req.user._id;
  try {
    // 1) Fetch all outfits for the user, sorted by the desired field
    const outfits = await AIOutfit.find({ userId }).sort({ [sortBy]: -1 });

    // 2) Optional preference filter
    let filteredOutfits = outfits;
    if (preference) {
      filteredOutfits = outfits.filter(
        (o) => o[`${preference}Score`] && o[`${preference}Score`] > 0
      );
    }

    // 3) Format the response
    const formattedOutfits = filteredOutfits.map((outfit) => ({
      outfitId: outfit._id,
      topId: outfit.topId,
      bottomId: outfit.bottomId,
      overallScore: outfit.overallScore,
      formalScore: outfit.formalScore,
      casualScore: outfit.casualScore,
    }));

    res.status(200).json({ outfits: formattedOutfits });
  } catch (error) {
    console.error("Error fetching outfits:", error.message);
    res.status(500).json({ error: "Failed to fetch outfits" });
  }
});

export default router;
