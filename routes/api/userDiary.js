// userDiary.js

import express from "express";
import UserDiaryController from "../../controller/userDiaryController.js";
import AuthController from "../../controller/authController.js";
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
  apis: ["./routes/api/userDiary.js"], // Specificarea calei către fișierele cu rutare
};

const specs = swaggerJsdoc(options);

// Middleware pentru a afișa documentația Swagger-ului
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

// Endpoint pentru obținerea detaliilor despre o anumită zi din jurnalul utilizatorului
/**
 * @swagger
 * /api/userDiary/private/daily-details:
 *   get:
 *     summary: Get daily details for a specific day in user's diary.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daily details fetched successfully.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/private/daily-details",
  AuthController.validateAuth,
  UserDiaryController.getDailyDetails
);

// Endpoint pentru ștergerea unui produs consumat într-o anumită zi
/**
 * @swagger
 * /api/userDiary/private/delete-consumed-product:
 *   delete:
 *     summary: Delete a consumed product from a specific day in user's diary.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Consumed product deleted successfully.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */
router.delete(
  "/private/delete-consumed-product",
  AuthController.validateAuth,
  UserDiaryController.deleteConsumedProduct
);

// Endpoint pentru aportul zilnic de calorii (privat)
/**
 * @swagger
 * /api/userDiary/private/daily-intake:
 *   get:
 *     summary: Get daily calorie intake for the user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daily calorie intake fetched successfully.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/private/daily-intake",
  AuthController.validateAuth,
  UserDiaryController.getDailyIntakePrivate
);

// Endpoint pentru lista de produse nerecomandate (privat)
/**
 * @swagger
 * /api/userDiary/private/not-recommended-products:
 *   get:
 *     summary: Get list of not recommended products for the user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of not recommended products fetched successfully.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/private/not-recommended-products",
  AuthController.validateAuth,
  UserDiaryController.getNotRecommendedProductsPrivate
);

// Endpoint pentru înregistrarea aportului zilnic de calorii în jurnalul utilizatorului
/**
 * @swagger
 * /api/userDiary/private/record-daily-intake:
 *   post:
 *     summary: Record daily calorie intake for the user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calories:
 *                 type: number
 *                 description: The number of calories consumed.
 *             required:
 *               - calories
 *     responses:
 *       200:
 *         description: Daily calorie intake recorded successfully.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/private/record-daily-intake",
  AuthController.validateAuth,
  UserDiaryController.recordDailyIntake
);

// Endpoint pentru adăugarea unui produs consumat într-o anumită zi
/**
 * @swagger
 * /api/userDiary/private/add-consumed-product:
 *   post:
 *     summary: Add consumed product for a specific day in user's diary.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product consumed.
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product consumed.
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Consumed product added successfully.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/private/add-consumed-product",
  AuthController.validateAuth,
  UserDiaryController.recordConsumedProduct
);

export default router;
