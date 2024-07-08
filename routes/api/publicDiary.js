import express from "express";
import PublicController from "../../controller/publicController.js";
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
  apis: ["./routes/api/publicDiary.js"], // Specificarea calei către fișierele cu rutare
};

const specs = swaggerJsdoc(options);

// Middleware pentru a afișa documentația Swagger-ului
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyIntake:
 *       type: object
 *       properties:
 *         totalCalories:
 *           type: number
 *           description: Total number of calories.
 *         recommendedProducts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The ID of the product.
 *               title:
 *                 type: string
 *                 description: The title of the product.
 *               calories:
 *                 type: number
 *                 description: The number of calories per serving.
 */

/**
 * @swagger
 * /api/products/public/daily-intake:
 *   get:
 *     summary: Returns the daily intake of calories.
 *     responses:
 *       200:
 *         description: Successfully retrieved daily intake data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyIntake'
 */
router.get("/public/daily-intake", PublicController.getDailyIntakePublic);

/**
 * @swagger
 * /api/products/public/not-recommended-products:
 *   get:
 *     summary: Returns the list of not recommended products.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of not recommended products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get(
  "/public/not-recommended-products",
  PublicController.getNotRecommendedProductsPublic
);

export default router;
