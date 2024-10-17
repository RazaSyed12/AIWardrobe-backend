import mongoose from 'mongoose';
import ClothingItemSchema from './ClothingItem.js';  // Import the ClothingItem schema

// Define the schema for each collection within the wardrobe
const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Name of the collection (e.g., "Summer Collection")
  clothes: [ClothingItemSchema]  // Array of clothing items in the collection
});

// Export the schema (used in the Wardrobe schema)
export default CollectionSchema;
