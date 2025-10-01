import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  wishlist: { type: [String], default: [] } // recipe IDs
}, { timestamps: true });

export type UserDoc = {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  wishlist: string[];
};

export default models.User || model('User', UserSchema);
