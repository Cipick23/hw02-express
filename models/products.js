import mongoose from "mongoose";

const { Schema, model } = mongoose;

const schema = new Schema({
  categories: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
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
  groupBloodNotAllowed: {
    type: [Boolean],
    default: [null, false, false, false, false],
  },
});

const Product = model("Product", schema);

export default Product;
