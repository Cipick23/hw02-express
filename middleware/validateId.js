import mongoose from "mongoose";
import { STATUS_CODES } from "./../utils/constants.js";

function validateId(req, res, next) {
  const { productId } = req.params;
  console.log("Validating product ID:", productId);
  if (productId && !mongoose.isValidObjectId(productId)) {
    console.log("Invalid product ID");
    return res.status(STATUS_CODES.notFound).json({
      status: "error",
      message: "Invalid product ID",
      data: "not Found",
    });
  }
  next();
}

export default validateId;
