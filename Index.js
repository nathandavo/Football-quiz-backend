import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/quiz-question", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/players/topscorers?league=39&season=2025",
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.API_FOOTBALL_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );
    const data = await response.json();
    const topScorers = data.response.slice(0, 5);

    const prompt = `
    Create one multiple-choice football quiz question based on these top scorers:
    ${JSON.stringify(topScorers)}
    Provide the question, 4 answer options, and indicate the correct answer.
    Format as JSON: { question: "", options: ["", "", "", ""], answer: "" }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const quiz = completion.choices[0].message.content;
    res.json(JSON.parse(quiz));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating quiz question");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
