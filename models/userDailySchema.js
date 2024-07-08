// models/userDiaryModel.js
import mongoose from "mongoose";

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
  consumedProducts: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      calories: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

const UserDiary = mongoose.models.UserDiary || model("UserDiary", userDiarySchema);

export default UserDiary;
