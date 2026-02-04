const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();

/* =====================
   Middlewares
===================== */
app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* =====================
   PostgreSQL Connection
===================== */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/* =====================
   Test Routes
===================== */
app.get("/", (req, res) => {
  res.send("Lazarus backend running");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================
   Existing Routes
===================== */
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

/* =====================
   MOU Routes
===================== */
const mouRoutes = require("./routes/mou");
app.use("/api/mou", mouRoutes);

/* =====================
   Static PDF Access
===================== */
app.use("/mous", express.static(path.join(__dirname, "mous")));

/* =====================
   Server Start
===================== */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
