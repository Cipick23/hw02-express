import { STATUS_CODES } from "./../utils/constants.js";

function respondWithError(res, error) {
  console.error(error);
  res.status(STATUS_CODES.error).json({ message: error.message });
}

export default respondWithError;
