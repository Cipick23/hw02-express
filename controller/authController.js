// AuthController.js
import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { STATUS_CODES } from "../utils/constants.js";
import gravatar from "gravatar";

const AuthController = {
  login,
  signup,
  validateAuth,
  getPayloadFromJWT,
};

const secretForToken = process.env.TOKEN_SECRET;

async function login(data) {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Username is not matching");
  }

  const isMatching = await bcrypt.compare(password, user.password);
  if (isMatching) {
    const token = jwt.sign({ data: user }, secretForToken, { expiresIn: "1h" });
    await User.findOneAndUpdate({ email: email }, { token: token });
    return token;
  } else {
    throw new Error("Username is not matching");
  }
}

async function signup(data) {
  const saltRounds = 10;
  const encryptedPassword = await bcrypt.hash(data.password, saltRounds);
  const userAvatar = gravatar.url(data.email, { s: "250", d: "retro" }, true);

  const newUser = new User({
    email: data.email,
    password: encryptedPassword,
    subscription: "starter",
    token: null,
    avatarURL: userAvatar,
  });

  return User.create(newUser);
}

function getPayloadFromJWT(token) {
  try {
    return jwt.verify(token, secretForToken);
  } catch (err) {
    throw new Error("Invalid Token");
  }
}

export function validateAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretForToken, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    User.findById(decoded.data._id)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
      })
      .catch(next);
  });
}

export default AuthController;
