require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const Recipe = require('./models/Recipe');

const app = express();
const PORT = 5000;

app.use(cors());
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
        model: 'gemini-2.5-flash',
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

    const prompt =
      `You are an expert chef and recipe API. Suggest a realistic, specific recipe using only these ingredients: ${ingredients}.\n\n` +
      `Respond with ONLY a JSON object, no markdown code blocks, no explanation, no text before or after it. ` +
      `The JSON MUST follow this exact schema:\n\n` +
      `{\n` +
      `  "title": "Garlic Butter Rice",\n` +
      `  "prepTime": "10 mins",\n` +
      `  "cookTime": "15 mins",\n` +
      `  "servings": 2,\n` +
      `  "calories": 340,\n` +
      `  "macros": {\n` +
      `    "protein": "6g",\n` +
      `    "carbs": "45g",\n` +
      `    "fat": "14g"\n` +
      `  },\n` +
      `  "ingredients": ["1 cup rice", "2 tbsp butter"],\n` +
      `  "steps": ["Cook the rice.", "Stir in butter."],\n` +
      `  "precautions": ["Cook rice until it reaches a safe serving temperature.", "Use a lid to avoid steam burns when checking the pot."]\n` +
      `}\n\n` +
      `Provide realistic estimated times (prepTime, cookTime), reasonable calorie estimation per serving (as an integer number), servings count, and 2-4 concrete safety precautions.`;

    const response = await generateWithRetry(prompt);

    const responseText = response.text.replace(/```json|```/g, '').trim();

    console.log('--- RAW AI RESPONSE ---');
    console.log(responseText);
    console.log('-----------------------');

    const recipeData = JSON.parse(responseText);
    const savedRecipe = await Recipe.create(recipeData);

    res.json(savedRecipe);
  } catch (err) {
    console.error('Error generating recipe:', err);
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