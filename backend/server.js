require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const contactRoutes = require("./routes/contactRoutes");
const app = express();

const PORT = 5000;

connectDB();

app.use(express.json());
app.use("/api/contacts", contactRoutes);

app.get("/", (req, res) => {
    res.send("Contact Vault Backend is running");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});