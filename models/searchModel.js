import mongoose from "mongoose";

const { Schema, model } = mongoose;

const searchModel = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
});

const search = model("search", searchModel);

export default search;
