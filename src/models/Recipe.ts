import mongoose, { Schema, models, model } from 'mongoose';

const NutritionSchema = new Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true }
}, { _id: false });

const RecipeSchema = new Schema({
  tags: { type: [String], default: [] } ,
  ownerId: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String },
  requirements: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  instructions: { type: String, default: '' },
  prepTimeMinutes: { type: Number, required: true },
  nutrition: { type: NutritionSchema, required: true }
}, { timestamps: true });

export type Nutrition = { calories: number; protein: number; carbs: number; fats: number; };
export type Recipe = {
  tags: string[];
  _id: string;
  ownerId: string;
  title: string;
  imageUrl?: string;
  requirements: string[];
  ingredients: string[];
  instructions: string;
  prepTimeMinutes: number;
  nutrition: Nutrition;
  createdAt: string;
  updatedAt: string;
};
export default models.Recipe || model('Recipe', RecipeSchema);
