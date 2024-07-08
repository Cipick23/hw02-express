// models/consumedProductSchema.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const consumedProductSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
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
});

export default consumedProductSchema;
