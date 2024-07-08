/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API pentru gestionarea produselor
 */

import express from "express";
import searchController from "../../controller/searchController.js";
import respondWithError from "../../middleware/respondWithError.js";
const router = express.Router();
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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
  apis: ["./routes/api/searchApi.js"], // Specificarea calei către fișierele cu rutare
};

const specs = swaggerJsdoc(options);

// Middleware pentru a afișa documentația Swagger-ului
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Caută un produs după titlu.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: true
 *         description: Titlul produsului căutat.
 *     responses:
 *       200:
 *         description: Succes. Returnează produsul căutat.
 *       400:
 *         description: Eroare. Titlul este necesar pentru căutare.
 *       404:
 *         description: Eroare. Produsul nu a fost găsit.
 *       500:
 *         description: Eroare internă de server.
 */
router.get("/search", async (req, res) => {
  try {
    console.log(
      "Received request to /api/products/search with query:",
      req.query
    );
    await searchController.searchProducts(req, res);
  } catch (error) {
    console.log("Error in /api/products/search route:", error);
    respondWithError(res, error);
  }
});

export default router;
