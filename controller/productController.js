import Product from "../models/products.js";
import mongoose from "mongoose";
import fs from "fs";

const ProductController = {
  listProducts,
  getProductById,
  addProduct,
  updateProduct,
  updateStatusProduct,
  removeProduct,
  getDailyIntake,
  getNotRecommendedProducts,
  updateGroupBloodNotAllowed,
  searchProductsInFile,
};

// Funcție pentru citirea fișierului products.json
function readProductsFromFile() {
  const data = fs.readFileSync("path/to/products.json", "utf8");
  return JSON.parse(data);
}

// Funcție pentru căutarea în fișierul JSON local
function searchProductsInFile(title) {
  const products = readProductsFromFile();
  return products.filter((product) =>
    product.title.toLowerCase().includes(title.toLowerCase())
  );
}

async function listProducts() {
  try {
    return Product.find();
  } catch (error) {
    console.error(error);
  }
}

async function getProductById(id) {
  try {
    console.log("ID received in getProductById:", id);

    // Verificați validitatea ID-ului pentru MongoDB
    if (!mongoose.isValidObjectId(id)) {
      console.log("Invalid product ID");
      throw new Error("Invalid product ID");
    }

    // Căutare produs în baza de date
    const product = await Product.findById(id);
    console.log("Product retrieved from database:", product);
    return product;
  } catch (error) {
    console.error("Error in getProductById:", error);
    throw error;
  }
}

async function addProduct(product) {
  return Product.create(product);
}

async function updateProduct(updatedProduct, id) {
  return Product.findByIdAndUpdate(id, updatedProduct, { new: true });
}

async function updateStatusProduct(id, favorite) {
  return Product.findByIdAndUpdate(id, { favorite }, { new: true });
}

async function removeProduct(id) {
  return Product.findByIdAndDelete(id);
}

async function getDailyIntake() {
  try {
    const products = await Product.find();
    const totalCalories = products.reduce(
      (total, product) => total + product.calories,
      0
    );
    return totalCalories;
  } catch (error) {
    console.error(error);
  }
}

async function getNotRecommendedProducts() {
  try {
    return Product.find({ notRecommended: true });
  } catch (error) {
    console.error(error);
  }
}

async function updateGroupBloodNotAllowed(groupNumber) {
  try {
    // Definim index-ul în funcție de groupNumber
    let index = groupNumber; // groupNumber poate fi 1, 2, 3 sau 4

    // Căutăm primele 5 produse unde groupBloodNotAllowed[index] este true
    const products = await Product.find({
      [`groupBloodNotAllowed.${index}`]: true,
    }).limit(5);

    // Returnăm lista de produse găsite
    return products;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default ProductController;
