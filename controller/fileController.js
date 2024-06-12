import multer from "multer";
import Jimp from "jimp";
import fs from "fs";
import path from "path";
import User from "../models/user.js";

const storage = multer.diskStorage({
  destination: "tmp/",
  filename: function (_req, file, cb) {
    // console.log(req.file.filename)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const uploadFile = multer({ storage: storage }).single("avatar");

async function processAvatar(req, res) {
  console.dir(req);
  console.dir(res);
  const userId = req.user.id; // Obține ID-ul utilizatorului (presupunând că ai middleware de autentificare)

  try {
    // Procesează avatarul cu Jimp
    const avatar = await Jimp.read(req.file.path);
    avatar.resize(250, 250).quality(80).write(req.file.path);

    // Mută avatarul în public/avatars
    const newFilename = `${userId}_${Date.now()}${path.extname(
      req.file.originalname
    )}`;
    const newPath = path.normalize(path.join("public", "avatars", newFilename));
    await fs.promises.rename(req.file.path, newPath);
    await User.findByIdAndUpdate(userId, { avatarURL: newPath });

    const result = {
      avatarUrl: newPath,
    };

    return result;
  } catch (error) {
    throw new Error(`${error}`);
  }
}

const FileController = {
  uploadFile,
  processAvatar,
};

export default FileController;
