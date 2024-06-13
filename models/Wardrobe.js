import mongoose from 'mongoose';

const wardrobeSchema = new mongoose.Schema({
  wardrobeId: { type: Number, unique: true, required: true },
  userId: { type: Number, required: true },
  title: { type: String, required: true },
});

const Wardrobe = mongoose.model('Wardrobe', wardrobeSchema);
export default Wardrobe;
