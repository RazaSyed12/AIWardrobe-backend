// import mongoose from 'mongoose';

// // Define the schema for each clothing item
// const ClothingItemSchema = new mongoose.Schema({
//   name: { type: String, required: true },  // Name of the clothing item
//   primaryColor: { type: String, required: true },  // Main color
//   secondaryColor: { type: String, default: null },  // Optional secondary color
//   type: { type: String, required: true },  // Type of clothing (e.g., T-shirt, Jacket)
//   imageUrl: { type: String, default: null }  // URL of the uploaded image
// });

// // Export the schema (used in the Collection schema)
// export default ClothingItemSchema;

import mongoose from 'mongoose';

// Define the schema for each clothing item
const ClothingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Name of the clothing item
  primaryColor: { type: String, required: true },  // Main color
  secondaryColor: { type: String, default: null },  // Optional secondary color
  type: { type: String, required: true },  // Type of clothing (e.g., T-shirt, Jacket)
  imageUrl: { type: String, default: null }  // URL of the uploaded image
});

// Export the schema (used in the Collection schema)
export default ClothingItemSchema;
