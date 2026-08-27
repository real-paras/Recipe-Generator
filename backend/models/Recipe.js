const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  prepTime: String,
  cookTime: String,
  servings: Number,
  calories: Number,
  macros: {
    protein: String,
    carbs: String,
    fat: String
  },
  appliance: String,
  skillLevel: String,
  ingredients: [String],
  steps: [String],
  precautions: [String],
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);