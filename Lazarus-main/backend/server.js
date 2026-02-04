const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// TEST route
app.get("/", (req, res) => {
  res.send("Lazarus backend running");
});

// CREATE PROJECT API
app.post("/api/projects", (req, res) => {
  const { title, description, video_type, funding_target, allowed_expenses } = req.body;

  if (!title || !funding_target) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // For hackathon demo (DB later)
  const project = {
    id: Date.now(),
    title,
    description,
    video_type,
    funding_target,
    allowed_expenses,
    status: "funding"
  };

  console.log("Project created:", project);

  res.status(201).json(project);
});

// START SERVER
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
