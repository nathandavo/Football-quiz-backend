const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests

// ---------- Load all fixtures ----------
let fixtures = [];
const fixturesFolder = path.join(__dirname, "fixtures");

fs.readdirSync(fixturesFolder).forEach(file => {
  if (file.endsWith(".json")) {
    const data = JSON.parse(fs.readFileSync(path.join(fixturesFolder, file)));
    fixtures = fixtures.concat(data);
  }
});

console.log(`Loaded ${fixtures.length} total fixtures.`);

// ---------- In-memory leaderboard ----------
let leaderboard = []; // { name: string, score: number }

// ---------- GET random fixture ----------
app.get("/random-fixture", (req, res) => {
  if (!fixtures.length) return res.status(500).json({ error: "No fixtures loaded" });
  const randomIndex = Math.floor(Math.random() * fixtures.length);
  res.json(fixtures[randomIndex]);
});

// ---------- POST submit score ----------
app.post("/submit-score", (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") return res.status(400).json({ error: "Invalid data" });

  // Add to leaderboard
  leaderboard.push({ name, score });

  // Keep top 20 scores only
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 20) leaderboard = leaderboard.slice(0, 20);

  res.json({ success: true, leaderboard });
});

// ---------- GET leaderboard ----------
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

