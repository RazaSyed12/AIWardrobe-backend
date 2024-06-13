import mongoose from 'mongoose';

const outfitSchema = new mongoose.Schema({
  outfitId: { type: Number, unique: true, required: true },
  userId: { type: Number, required: true },
  topId: { type: Number, required: true },
  bottomId: { type: Number, required: true },
  overallScore: { type: Number, required: true },
  formalScore: { type: Number, required: true },
  casualScore: { type: Number, required: true },
  summerScore: { type: Number, required: true },
  winterScore: { type: Number, required: true },
  fashionScore: { type: Number, required: true },
});

const Outfit = mongoose.model('Outfit', outfitSchema);
export default Outfit;
