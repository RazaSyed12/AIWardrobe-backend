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
router.post("/generate-outfits", async (req, res) => {
  const { userId, preferences = {} } = req.body;

  try {
    // 1) Fetch user’s ClothingItem docs
    const clothingItems = await ClothingItem.find({ userId });

    // 2) Separate into tops & bottoms
    const tops = clothingItems.filter((item) =>
      ["Sweater", "Shirt", "Blouse", "Top", "T-Shirt"].includes(item.type)
    );
    const bottoms = clothingItems.filter((item) =>
      ["Skirt", "Pants", "Jeans", "Shorts", "Bottom"].includes(item.type)
    );

    if (!tops.length || !bottoms.length) {
      return res.status(400).json({
        error: "Not enough clothing items to generate outfits.",
      });
    }

    // 3) Generate combos & score them
    const outfits = [];
    tops.forEach((top) => {
      bottoms.forEach((bottom) => {
        const formalScore = calculateOutfitScores(top, bottom, "Formal");
        const casualScore = calculateOutfitScores(top, bottom, "Casual");

        // Weighted overall
        const overallScore =
          (preferences.formal || 0.5) * formalScore +
          (preferences.casual || 0.5) * casualScore;

        outfits.push({
          userId,
          topId: top._id,
          bottomId: bottom._id,
          overallScore,
          formalScore,
          casualScore,
          date: new Date(),
        });
      });
    });

    // 4) Insert into AIOutfit
    const savedOutfits = await AIOutfit.insertMany(outfits);

    // Format the response to include only outfitId, topId, bottomId, and scores
    const formattedOutfits = savedOutfits.map((outfit) => ({
      outfitId: outfit._id,
      topId: outfit.topId,
      bottomId: outfit.bottomId,
      overallScore: outfit.overallScore,
      formalScore: outfit.formalScore,
      casualScore: outfit.casualScore,
    }));

    res.status(201).json({
      message: "Outfits generated successfully",
      outfits: formattedOutfits,
    });
  } catch (error) {
    console.error("Error generating outfits:", error.message);
    res.status(500).json({ error: "Failed to generate outfits" });
  }
});

// GET /api/ai/fetch-outfits
router.get("/fetch-outfits", async (req, res) => {
  const { userId } = req.query;
  const { preference, sortBy = "overallScore" } = req.query;

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
