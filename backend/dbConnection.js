// dbConnection.js
const mongoose = require('mongoose');

// MongoDB URI from MongoDB Atlas
const uri = process.env.MONGO_URI;
// Connect to MongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
