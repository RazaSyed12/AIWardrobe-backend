import mongoose from 'mongoose';

const clothingItemSchema = new mongoose.Schema({
  itemId: { type: Number, required: true },
  wardrobeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wardrobe', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  season: { type: String, required: true },
  pattern: { type: String, required: true },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String, required: true },
  dressCode: { type: String, required: true },
});

const ClothingItem = mongoose.model('ClothingItem', clothingItemSchema);
export default ClothingItem;
