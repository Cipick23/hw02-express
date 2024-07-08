// userDiaryModel.js
import mongoose from "mongoose";
import consumedProductSchema from "./consumedProductSchema.js";

const { Schema, model } = mongoose;

const userDiarySchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  totalCalories: {
    type: Number,
    required: true,
  },
  consumedProducts: [consumedProductSchema], // Use the imported schema directly
});

const UserDiary =
  mongoose.models.UserDiary || model("UserDiary", userDiarySchema);

export default UserDiary;
