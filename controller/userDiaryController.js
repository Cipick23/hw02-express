// userDiaryController.js
import Product from "./../models/products.js";
import UserDiary from "../models/userDiaryModel.js";
import consumedProductSchema from "../models/consumedProductSchema.js";

const UserDiaryController = {
  getDailyIntakePrivate,
  getNotRecommendedProductsPrivate,
  recordDailyIntake,
  findNotRecommendedProducts,
  recordConsumedProduct,
  deleteConsumedProduct,
  getDailyDetails,
};

async function getDailyDetails(req, res) {
  const { date } = req.body;

  try {
    const userDiary = await UserDiary.findOne({
      date: new Date(date).setHours(0, 0, 0, 0),
    }).populate("consumedProducts.productId", "title calories"); // Populăm detalii despre produsele consumate

    if (!userDiary) {
      return res
        .status(404)
        .json({ message: "Jurnalul pentru data specificată nu există" });
    }

    res.status(200).json({
      message: "Detaliile pentru ziua specificată au fost returnate cu succes",
      data: userDiary,
    });
  } catch (error) {
    console.error(
      `Eroare la obținerea detaliilor pentru ziua specificată: ${error.message}`
    );
    res.status(500).json({
      message: "Eroare la obținerea detaliilor pentru ziua specificată",
    });
  }
}

async function deleteConsumedProduct(req, res) {
  const { date, productId } = req.body;

  try {
    let userDiary = await UserDiary.findOne({
      date: new Date(date).setHours(0, 0, 0, 0),
    });

    if (!userDiary) {
      return res
        .status(404)
        .json({ message: "Jurnalul pentru data specificată nu există" });
    }

    // Găsim produsul consumat pe care dorim să-l ștergem
    const consumedProductIndex = userDiary.consumedProducts.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (consumedProductIndex === -1) {
      return res.status(404).json({
        message: "Produsul consumat nu a fost găsit în jurnalul utilizatorului",
      });
    }

    // Ștergem produsul consumat din array
    const deletedProduct = userDiary.consumedProducts.splice(
      consumedProductIndex,
      1
    );
    userDiary.totalCalories -=
      deletedProduct[0].calories * deletedProduct[0].quantity;

    // Salvăm jurnalul actualizat
    await userDiary.save();

    res.status(200).json({
      message:
        "Produsul consumat a fost șters cu succes din jurnalul utilizatorului",
      data: userDiary,
    });
  } catch (error) {
    console.error(`Eroare la ștergerea produsului consumat: ${error.message}`);
    res.status(500).json({
      message:
        "Eroare la ștergerea produsului consumat din jurnalul utilizatorului",
    });
  }
}

async function getDailyIntakePrivate(req, res) {
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

async function getNotRecommendedProductsPrivate(req, res) {
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

async function recordDailyIntake(req, res) {
  const { date, totalCalories } = req.body;
  try {
    const userDiary = new UserDiary({
      date,
      totalCalories,
    });
    await userDiary.save();
    res.status(201).json({
      message:
        "Informațiile au fost înregistrate cu succes în jurnalul utilizatorului",
      data: userDiary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Eroare la înregistrarea informațiilor în jurnalul utilizatorului",
    });
  }
}

async function recordConsumedProduct(req, res) {
  const { date, productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produsul nu a fost găsit" });
    }

    let userDiary = await UserDiary.findOne({
      date: new Date(date).setHours(0, 0, 0, 0),
    });

    if (!userDiary) {
      userDiary = new UserDiary({
        date: new Date(date).setHours(0, 0, 0, 0),
        totalCalories: 0,
        consumedProducts: [],
      });
    }

    // Adaugă un consumat nou produs utilizând schema consumată
    userDiary.consumedProducts.push({
      productId,
      title: product.title,
      calories: product.calories,
      quantity,
    });
    userDiary.totalCalories += product.calories * quantity;
    await userDiary.save();

    res.status(201).json({
      message: "Produsul a fost adăugat cu succes în jurnalul utilizatorului",
      data: userDiary,
    });
  } catch (error) {
    console.error(
      `Eroare la adăugarea produsului în jurnalul utilizatorului: ${error.message}`
    );
    res.status(500).json({
      message: "Eroare la adăugarea produsului în jurnalul utilizatorului",
    });
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

async function findNotRecommendedProducts() {
  try {
    const notRecommendedProducts = await Product.find({
      "groupBloodNotAllowed.1": true,
    }).limit(5);
    return notRecommendedProducts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default UserDiaryController;
