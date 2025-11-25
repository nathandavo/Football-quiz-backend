// ---------- GET random fixture (optionally filtered by year) ----------
app.get("/random-fixture", (req, res) => {
  if (!fixtures.length) {
    return res.status(500).json({ error: "No fixtures loaded" });
  }

  const year = req.query.year;

  let filteredFixtures = fixtures;

  // If user selected a year, filter by that year
  if (year) {
    filteredFixtures = fixtures.filter(fix => {
      // If the fixture has a date like "12/05/2021"
      if (fix.date && fix.date.endsWith(year)) return true;

      // If the fixture has a separate year field
      if (fix.year && fix.year.toString() === year) return true;

      return false;
    });
  }

  // If year was selected but no matches found
  if (year && filteredFixtures.length === 0) {
    return res.status(404).json({ error: `No fixtures found for year ${year}` });
  }

  // Pick a random fixture (either from all fixtures or filtered ones)
  const randomIndex = Math.floor(Math.random() * filteredFixtures.length);
  res.json(filteredFixtures[randomIndex]);
});
