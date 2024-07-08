import Product from "../models/products.js";
// import Product from "./../models/products.json";
import ProductController from "./productController.js";
import mongoose from "mongoose";
import fs from "fs";

const searchController = {
  searchProducts,
};

// Funcție pentru citirea fișierului products.json
function readProductsFromFile() {
  console.log("Reading products from file...");
  const data = fs.readFileSync("./../models/products.json", "utf8");
  console.log("Products data:", data);
  return JSON.parse(data);
}

// Funcție pentru căutarea ID-ului în fișierul JSON local pe baza titlului
function getProductIdByTitleFromFile(title) {
  console.log("Searching for product ID in file with title:", title);
  const products = readProductsFromFile();
  const product = products.find((product) =>
    product.title.toLowerCase().includes(title.toLowerCase())
  );
  console.log("Found product in file:", product);

  // Verificați dacă product există și dacă are _id cu formatul specific
  if (
    product &&
    product._id &&
    typeof product._id === "object" &&
    product._id.$oid
  ) {
    return product._id.$oid; // Returnăm doar $oid-ul pentru compatibilitatea cu MongoDB
  }

  // Dacă nu avem formatul specific, presupunem că avem direct _id-ul
  return product ? product._id : null;
}

async function searchProducts(req, res) {
  try {
    const { title } = req.query;

    if (title) {
      console.log("Searching for product ID with title:", title);
      const idFromFile = getProductIdByTitleFromFile(title);

      if (!idFromFile) {
        console.log("Product not found in file");
        return res.status(404).json({
          message: "Produsul nu a fost găsit în fișier",
        });
      }

      console.log("Found product ID in file:", idFromFile);
      const product = await ProductController.getProductById(idFromFile);

      if (!product) {
        console.log("Product not found in database");
        return res.status(404).json({
          message: "Produsul nu a fost găsit în baza de date",
        });
      }

      console.log("Product found in database:", product);
      return res.status(200).json({
        message: "Produsul a fost returnat cu succes",
        data: product,
      });
    }

    return res.status(400).json({
      message: "Titlul produsului este necesar pentru căutare",
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    res.status(500).json({ message: "Eroare la căutarea produselor" });
  }
}

export default searchController;
