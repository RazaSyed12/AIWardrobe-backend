import mongoose from 'mongoose';

const wardrobeSchema = new mongoose.Schema({
  wardrobeId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
});

const Wardrobe = mongoose.model('Wardrobe', wardrobeSchema);
export default Wardrobe;
