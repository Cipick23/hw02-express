// app.js
import express from "express";
import logger from "morgan";
import cors from "cors";
import authRouter from "./routes/api/auth.js";
import productsRouter from "./routes/api/products.js";
import connectToDb from "./utils/connectToDb.js";
import diaryPublicRouter from "./routes/api/publicDiary.js";
import { STATUS_CODES } from "./utils/constants.js";
import userDiaryRouter from "./routes/api/userDiary.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const PORT = process.env.PORT || 3000;

// Configurare Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Authentication API",
      version: "1.0.0",
      description: "API pentru autentificarea și înregistrarea utilizatorilor",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/api/auth.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

connectToDb();

app.use(express.static("public"));
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/users", authRouter);
app.use("/api/diary", diaryPublicRouter);
app.use("/api/users/diary", userDiaryRouter);

app.use((req, res) => {
  console.log(`Request to ${req.path} returned Not Found`);
  res.status(STATUS_CODES.notFound).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(STATUS_CODES.error).json({ message: err.message });
});

export default app;
