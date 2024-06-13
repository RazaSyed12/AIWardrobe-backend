// models/UserOutfit.js
import mongoose from 'mongoose';

const userOutfitSchema = new mongoose.Schema({
  outfitId: { type: Number, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  bottomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const UserOutfit = mongoose.model('UserOutfit', userOutfitSchema);
export default UserOutfit;
