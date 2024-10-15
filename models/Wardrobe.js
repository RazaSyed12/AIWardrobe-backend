import mongoose from 'mongoose';

const ClothesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String },
  type: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const WardrobeSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  name: { type: String, required: true },
  clothes: [ClothesSchema]
});

const Wardrobe = mongoose.model('Wardrobe', WardrobeSchema);
export default Wardrobe;
