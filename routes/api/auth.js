import express from "express";
import AuthController from "../../controller/authController.js";
import { STATUS_CODES } from "../../utils/constants.js";
import User from "../../models/user.js";

const router = express.Router();

// POST localhost:3000/users/login;
router.post("/login", async (req, res, next) => {
  try {
    const isValid = checkLoginPayload(req.body);
    if (!isValid) {
      throw new Error("The login request is invalid.");
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NoContent).json({
        status: "error",
        code: 401,
        message: "Username or password is not correct",
        data: "Conflict",
      });
    }

    const token = await AuthController.login({ email, password });

    res
      .status(STATUS_CODES.success)
      .json({ message: "Utilizatorul a fost logat cu succes", token: token });
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

// POST localhost:3000/users/signup;
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

    res.status(201).json({ message: "Utilizatorul a fost creat" });
  } catch (error) {
    throw new Error(error);
  }
});

// GET localhost:3000/api/users/logout/
router.get("/logout", AuthController.validateAuth, async (req, res, next) => {
  try {
    const header = req.get("authorization");
    if (!header) {
      throw new Error("E nevoie de autentificare pentru aceasta ruta.");
    }
    console.log("Token");
    const token = header.split(" ")[1];
    const payload = AuthController.getPayloadFromJWT(token);

    await User.findOneAndUpdate({ email: payload.data.email }, { token: null });

    res.status(204).send();
  } catch (error) {
    throw new Error(error);
  }
});

// GET localhost:3000/api/users/current
router.get("/current", AuthController.validateAuth, async (req, res) => {
  try {
    const user = req.user;

    // Respond with user data
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// validate contact body
function checkLoginPayload(data) {
  if (!data?.email || !data?.password) {
    return false;
  }

  return true;
}

// validate contact body
function checkSignupPayload(data) {
  if (!data?.email || !data?.password) {
    return false;
  }

  if (data?.password > 8) {
    return false;
  }

  return true;
}

// error cases
function respondWithError(res, error, statusCode) {
  console.error(error);
  res.status(statusCode).json({ message: `${error}` });
}

export default router;
