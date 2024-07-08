/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - weight
 *         - calories
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the product.
 *         weight:
 *           type: number
 *           description: The weight of the product in grams.
 *         calories:
 *           type: number
 *           description: The number of calories per serving.
 */

// Definirea rutelor și a funcțiilor lor de controller

import express from "express";
import ProductController from "../../controller/productController.js";
import Joi from "joi";
import "../../passport.js";
import AuthController from "../../controller/authController.js";
import { STATUS_CODES } from "../../utils/constants.js";
// import mongoose from "mongoose";
import validateId from "./../../middleware/validateId.js";
import validateBody from "./../../middleware/validateBody.js";
import respondWithError from "./../../middleware/respondWithError.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

// Configurare Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Diary API",
      version: "1.0.0",
      description: "API pentru gestionarea jurnalului utilizatorului",
    },
  },
  apis: ["./routes/api/products.js"], // Specificarea calei către fișierele cu rutare
};

const specs = swaggerJsdoc(options);

// Middleware pentru a afișa documentația Swagger-ului
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

// Schema de validare Joi pentru adăugarea și actualizarea produselor
const addSchema = Joi.object({
  categories: Joi.string().required(),
  weight: Joi.number().required(),
  title: Joi.string().required(),
  calories: Joi.number().required(),
  groupBloodNotAllowed: Joi.array().items(Joi.boolean()).required(),
});

const updateSchema = Joi.object({
  title: Joi.string(),
  categories: Joi.string(),
  weight: Joi.number(),
  calories: Joi.number(),
  groupBloodNotAllowed: Joi.array().items(Joi.string()),
}).min(1);

// GET localhost:3000/api/products

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns all products.
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", AuthController.validateAuth, async (req, res) => {
  try {
    const products = await ProductController.listProducts();

    res.status(STATUS_CODES.success).json({
      message: "Lista a fost returnată cu succes",
      data: products,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

// GET /api/products/:productId

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get a product by ID.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: Successful response with the product data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating product was not found.
 */

router.get("/:productId", validateId, async (req, res) => {
  try {
    console.log("Fetching product with ID:", req.params.productId);
    const product = await ProductController.getProductById(
      req.params.productId
    );
    if (!product) {
      return res.status(STATUS_CODES.notFound).json({
        message: "Produsul nu a fost găsit",
      });
    }
    res.status(STATUS_CODES.success).json({
      message: "Produsul a fost returnat cu succes",
      data: product,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

// POST /api/products

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Adaugă un produs nou.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: string
 *               weight:
 *                 type: number
 *               title:
 *                 type: string
 *               calories:
 *                 type: number
 *               groupBloodNotAllowed:
 *                 type: array
 *                 items:
 *                   type: boolean
 *     responses:
 *       201:
 *         description: Produsul a fost adăugat cu succes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produsul Omelette a fost adăugat cu succes."
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datele introduse pentru produs sunt nevalide.
 *       500:
 *         description: Eroare la adăugarea produsului.
 */
router.post("/", validateBody(addSchema), async (req, res) => {
  try {
    const product = await ProductController.addProduct(req.body);
    res.status(STATUS_CODES.created).json({
      message: `Produsul ${product.title} a fost adăugat cu succes.`,
      data: product,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

// PUT /api/products/:productId

// PUT /api/products/:productId
/**
 * @swagger
 * /api/products/{productId}:
 *   put:
 *     summary: Update a product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Successfully updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request, invalid body or parameters
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:productId",
  validateId,
  validateBody(updateSchema),
  async (req, res) => {
    try {
      const updatedProduct = await ProductController.updateProduct(
        req.body,
        req.params.productId
      );
      if (!updatedProduct) {
        return res.status(STATUS_CODES.notFound).json({
          message: "Produsul nu a fost găsit",
        });
      }
      res.status(STATUS_CODES.success).json({
        message: "Produsul a fost actualizat cu succes",
        data: updatedProduct,
      });
    } catch (error) {
      respondWithError(res, error);
    }
  }
);

// DELETE /api/products/:productId
// DELETE /api/products/:productId
/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     summary: Delete a product by ID.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete.
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: Produsul a fost șters cu succes
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Produsul nu a fost găsit
 */
router.delete("/:productId", validateId, async (req, res) => {
  try {
    const removeProduct = await ProductController.removeProduct(
      req.params.productId
    );
    if (!removeProduct) {
      return res.status(STATUS_CODES.notFound).json({
        message: "Produsul nu a fost găsit",
      });
    }
    res.status(STATUS_CODES.deleted).json({
      message: "Produsul a fost șters cu succes",
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

// GET /api/products/public/daily-intake
// GET /api/products/public/daily-intake
/**
 * @swagger
 * /api/products/public/daily-intake:
 *   get:
 *     summary: Get total daily intake calories and not recommended products.
 *     responses:
 *       200:
 *         description: Successful response with total calories and products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCalories:
 *                       type: number
 *                       description: The total calories intake.
 *                     notRecommendedProducts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 */
router.get("/public/daily-intake", async (req, res) => {
  try {
    const totalCalories = await ProductController.getDailyIntake();
    const notRecommendedProducts =
      await ProductController.getNotRecommendedProducts();

    res.status(STATUS_CODES.success).json({
      message: "Datele au fost returnate cu succes",
      data: {
        totalCalories,
        notRecommendedProducts,
      },
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

// GET /api/products/food-not-allowed/:groupNumber
/**
 * @swagger
 * /api/products/food-not-allowed/{groupNumber}:
 *   get:
 *     summary: Returns a list of products not allowed for a specific blood group.
 *     parameters:
 *       - in: path
 *         name: groupNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The number representing the blood group (1-4).
 *     responses:
 *       200:
 *         description: A list of products not allowed for the specified blood group.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input, such as a non-numeric groupNumber.
 *       500:
 *         description: Internal server error.
 */
router.get("/food-not-allowed/:groupNumber", async (req, res) => {
  try {
    const { groupNumber } = req.params;
    const foodNotAllowed = await ProductController.updateGroupBloodNotAllowed(
      Number(groupNumber)
    );

    res.status(200).json({
      message: "Lista de produse interzise a fost returnată cu succes",
      data: foodNotAllowed,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

export default router;
