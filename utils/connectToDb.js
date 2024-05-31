import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://tzutzuthekid:jvf9kjWAmQXuIKtX@cluster0.zsh4usw.mongodb.net/db-contacts"
    );
    console.log("Conectat la baza de date cu succes.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectToDb;
