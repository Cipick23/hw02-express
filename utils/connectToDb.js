import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect(" ");
    console.log("Conectat la baza de date cu succes.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectToDb;
