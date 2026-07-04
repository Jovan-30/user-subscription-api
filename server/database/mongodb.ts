import mongoose, { connect } from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.ts";

async function connectToDatabse() {
  try {
    await connect(DB_URI);
    console.log(`Connected to databse in ${NODE_ENV} mode`);

    await mongoose.connection.db?.command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    await mongoose.connection.close();

    console.error(`Error connecting to MongoDB: ${error}`);
  }
}

export default connectToDatabse;
