import mongoose from 'mongoose';

const aiOutfitSchema = new mongoose.Schema({
  outfitId: { type: Number, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  bottomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  overallScore: { type: Number, required: true },
  formalScore: { type: Number, required: true },
  casualScore: { type: Number, required: true },
  summerScore: { type: Number, required: true },
  winterScore: { type: Number, required: true },
  fashionScore: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const AIOutfit = mongoose.model('AIOutfit', aiOutfitSchema);
export default AIOutfit;
