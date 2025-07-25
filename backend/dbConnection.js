// dbConnection.js
const mongoose = require('mongoose');

// MongoDB URI from MongoDB Atlas
 // Connect to MongoDB
const dotenv = require('dotenv');
dotenv.config();

// MongoDB URI from MongoDB Atlas
const uri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure -- useful in production to avoid a running broken server.
  }
};

module.exports = connectDB;
