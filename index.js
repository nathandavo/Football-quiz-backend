const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests

// ---------- Load all fixtures ----------
let fixtures = [];
const fixturesFolder = path.join(__dirname, "fixtures");

if (!fs.existsSync(fixturesFolder)) {
  console.error("Fixtures folder not found! Please create a 'fixtures' folder in the project root.");
  process.exit(1);
}

fs.readdirSync(fixturesFolder).forEach(file => {
  if (file.endsWith(".json")) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(fixturesFolder, file)));
      fixtures = fixtures.concat(data);
    } catch (err) {
      console.error(`Error parsing fixture file ${file}:`, err);
    }
  }
});

console.log(`Loaded ${fixtures.length} total fixtures.`);

// ---------- In-memory leaderboard ----------
let leaderboard = []; // { name: string, score: number }

// ---------- Helper to get season from a date ----------
const getSeason = (dateString) => {
  const [day, month, year] = dateString.split("/").map(Number);
  // Football season logic: July+ → season starts this year
  if (month >= 7) {
    return `${year}/${(year + 1).toString().slice(-2)}`; // e.g., "2015/16"
  } else {
    return `${year - 1}/${(year).toString().slice(-2)}`;
  }
};

// ---------- GET random fixture (optionally filtered by year or season) ----------
app.get("/random-fixture", (req, res) => {
  if (!fixtures.length) {
    return res.status(500).json({ error: "No fixtures loaded" });
  }

  const year = req.query.year;
  const season = req.query.season;

  let filteredFixtures = fixtures;

  // Filter by year if provided
  if (year) {
    filteredFixtures = filteredFixtures.filter(fix => {
      if (fix.date && fix.date.endsWith(year)) return true;
      if (fix.year && fix.year.toString() === year) return true;
      return false;
    });
  }

  // Filter by season if provided
  if (season) {
    filteredFixtures = filteredFixtures.filter(fix => {
      if (fix.season && fix.season === season) return true;
      if (fix.date && getSeason(fix.date) === season) return true;
      return false;
    });
  }

  // Check if any fixtures left after filtering
  if (filteredFixtures.length === 0) {
    return res.status(404).json({ error: "No fixtures found for the selected year/season." });
  }

  // Pick a random fixture from filtered list
  const randomIndex = Math.floor(Math.random() * filteredFixtures.length);
  res.json(filteredFixtures[randomIndex]);
});

// ---------- POST submit score ----------
app.post("/submit-score", (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

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
