import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://tzutzuthekid:UrARzJ3kTaVv81eo@cluster0.rgy0yjn.mongodb.net/slimmomdb"
    );
    console.log("Conectat la baza de date cu succes.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectToDb;
