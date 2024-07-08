import Product from "../models/products.js";

const PublicController = {
  getDailyIntakePublic,
  getNotRecommendedProductsPublic,
};

async function getDailyIntakePublic(req, res) {
  try {
    const totalCalories = await calculateTotalCalories();
    res.status(200).json({
      message: "Aportul zilnic de calorii a fost returnat cu succes",
      data: {
        totalCalories,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Eroare la calcularea aportului zilnic de calorii" });
  }
}

async function getNotRecommendedProductsPublic(req, res) {
  try {
    const notRecommendedProducts = await Product.find({ notRecommended: true });
    res.status(200).json({
      message: "Lista de produse nerecomandate a fost returnată cu succes",
      data: notRecommendedProducts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Eroare la obținerea listei de produse nerecomandate" });
  }
}

async function calculateTotalCalories() {
  try {
    const products = await Product.find();
    const totalCalories = products.reduce(
      (total, product) => total + product.calories,
      0
    );
    return totalCalories;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default PublicController;
