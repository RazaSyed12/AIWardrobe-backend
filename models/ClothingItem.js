import mongoose from 'mongoose';

const clothingItemSchema = new mongoose.Schema({
  itemId: { type: Number, unique: true, required: true },
  wardrobeId: { type: Number, required: true },
  userId: { type: Number, required: true },
  title: { type: String, required: true },
  category: { type: String },
  type: { type: String },
  season: { type: String },
  pattern: { type: String },
  primaryColor: { type: String },
  secondaryColor: { type: String },
  dressCode: { type: String },
});

const ClothingItem = mongoose.model('ClothingItem', clothingItemSchema);
export default ClothingItem;
