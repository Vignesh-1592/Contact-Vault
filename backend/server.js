const dns = require("dns");

// Fix Node.js DNS issue with MongoDB Atlas SRV connection
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const contactRoutes = require("./routes/contactRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/contacts", contactRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Contact Vault API is running"
  });
});

// Port
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });