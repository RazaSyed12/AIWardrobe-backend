import mongoose from "mongoose";

const ScheduledOutfitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    outfitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outfit",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ScheduledOutfit = mongoose.model(
  "ScheduledOutfit",
  ScheduledOutfitSchema
);
export default ScheduledOutfit;
