require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const Recipe = require('./models/Recipe');

const app = express();
app.use(cors());
const PORT = 5000;

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection failed:', err));

app.get('/', (req, res) => {
  res.send('Backend is alive!');
});

async function generateWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.log(`Model busy, retrying in ${(i + 1) * 2}s...`);
        await new Promise(r => setTimeout(r, (i + 1) * 2000));
      } else {
        throw err;
      }
    }
  }
}

app.post('/api/recipes/generate', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    const response = await generateWithRetry(
      `Suggest a recipe using only these ingredients: ${ingredients}. Respond ONLY with valid JSON in this exact format, no other text: {"title": "...", "ingredients": ["...", "..."], "steps": ["...", "..."]}`
    );

    const responseText = response.text.replace(/```json|```/g, '').trim();
    const recipe = JSON.parse(responseText);

    const savedRecipe = await Recipe.create(recipe);

    res.json(savedRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});