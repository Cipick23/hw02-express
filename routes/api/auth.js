import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import AuthController from "../../controller/authController.js";
import { STATUS_CODES } from "../../utils/constants.js";
import User from "../../models/user.js";
import FileController from "../../controller/fileController.js";

const router = express.Router();

// Configurare Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Authentication API",
      version: "1.0.0",
      description: "API pentru autentificarea și înregistrarea utilizatorilor",
    },
  },
  apis: ["./routes/api/auth.js"], // Specificarea calei către fișierele cu rutare
};

const specs = swaggerJsdoc(options);

// Middleware pentru a afișa documentația Swagger-ului
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

// Middleware pentru a verifica payload-ul de login
function checkLoginPayload(data) {
  if (!data?.email || !data?.password) {
    return false;
  }
  return true;
}

// Middleware pentru a verifica payload-ul de signup
function checkSignupPayload(data) {
  if (!data?.email || !data?.password) {
    return false;
  }
  if (data?.password.length < 8) {
    return false;
  }
  return true;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address.
 *         password:
 *           type: string
 *           description: The user's password.
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         code:
 *           type: number
 *         message:
 *           type: string
 *         data:
 *           type: string
 */

// POST /api/users/login
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", async (req, res, next) => {
  try {
    const isValid = checkLoginPayload(req.body);
    if (!isValid) {
      throw new Error("The login request is invalid.");
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.unauthorized).json({
        status: "error",
        code: 401,
        message: "Email or password is not correct",
        data: "Conflict",
      });
    }

    const token = await AuthController.login({ email, password });

    res.status(STATUS_CODES.success).json({
      message: "User logged in successfully",
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

// POST /api/users/signup
/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Sign up a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Incorrect login or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email is already in use.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/signup", async (req, res, next) => {
  try {
    const isValid = checkSignupPayload(req.body);

    if (!isValid) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Incorrect login or password",
        data: "Bad request",
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }

    await AuthController.signup({ email, password });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

// GET /api/users/logout
/**
 * @swagger
 * /api/users/logout:
 *   get:
 *     summary: Log out the current user.
 *     responses:
 *       204:
 *         description: Successfully logged out.
 */
router.get("/logout", AuthController.validateAuth, async (req, res) => {
  try {
    const header = req.get("authorization");
    if (!header) {
      throw new Error("Authentication is required for this route.");
    }

    const token = header.split(" ")[1];
    const payload = AuthController.getPayloadFromJWT(token);

    await User.findOneAndUpdate({ email: payload.data.email }, { token: null });

    res.status(204).send();
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

// GET /api/users/current
/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Get current user information.
 *     responses:
 *       200:
 *         description: Successfully retrieved current user information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/current", AuthController.validateAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PATCH /api/users/avatars
/**
 * @swagger
 * /api/users/avatars:
 *   patch:
 *     summary: Update user avatar.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch(
  "/avatars",
  [AuthController.validateAuth, FileController.uploadFile],
  async (req, res) => {
    try {
      console.log("Req user:", req.user); // Log user info
      const response = await FileController.processAvatar(req, res);
      res.status(STATUS_CODES.success).json(response);
    } catch (error) {
      console.log("Error in patch route:", error);
      respondWithError(res, error, STATUS_CODES.error);
    }
  }
);

// GET /api/users/verify/:verificationToken
/**
 * @swagger
 * /api/users/verify/{verificationToken}:
 *   get:
 *     summary: Verify user by verification token.
 *     parameters:
 *       - in: path
 *         name: verificationToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token received by email.
 *     responses:
 *       200:
 *         description: User verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found or verification token invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/verify/:verificationToken", async (req, res) => {
  const token = req.params.verificationToken;
  const hasUser = await AuthController.getUserByValidationToken(token);

  if (hasUser) {
    try {
      await User.findOneAndUpdate(
        { verificationToken: token },
        { verify: true }
      );

      res.status(200).send({
        message: "Verification successful",
      });
    } catch (error) {
      throw new Error(
        "The username could not be found or it was already validated."
      );
    }
  } else {
    respondWithError(res, new Error("User not found"), STATUS_CODES.error);
  }
});

// POST /api/users/verify
/**
 * @swagger
 * /api/users/verify:
 *   post:
 *     summary: Send verification email to user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Email field is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/verify", async (req, res) => {
  try {
    const isValid = req.body?.email;
    const email = req.body?.email;

    if (isValid) {
      AuthController.updateToken(email);
      res.status(200).json({
        message: "Verification email sent",
      });
    } else {
      throw new Error("The email field is required");
    }
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

// Funcție pentru a răspunde cu eroare
function respondWithError(res, error, statusCode) {
  console.error("Error handler:", error);
  res.status(statusCode).json({ message: `${error}` });
}

export default router;
