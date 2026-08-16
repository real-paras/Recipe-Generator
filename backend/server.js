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
        model: 'gemini-3.6-flash',
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
      `You are a recipe API. Suggest a realistic, specific recipe using only these ingredients: ${ingredients}.\n\n` +
      `Respond with ONLY a JSON object, no markdown, no explanation, no text before or after it. ` +
      `The JSON MUST include every one of these four keys:\n\n` +
      `{\n` +
      `  "title": "Garlic Butter Rice",\n` +
      `  "ingredients": ["1 cup rice", "2 tbsp butter"],\n` +
      `  "steps": ["Cook the rice.", "Stir in butter."],\n` +
      `  "precautions": ["Cook rice until it reaches a safe serving temperature.", "Use a lid to avoid steam burns when checking the pot."]\n` +
      `}\n\n` +
      `That example above is only a format reference — replace every value with real, specific content for the actual dish. ` +
      `For "precautions", give 2 to 4 concrete safety tips specific to cooking THIS dish. Include actual temperatures in Fahrenheit ` +
      `where food safety genuinely matters (e.g. "Cook chicken to an internal temperature of 165°F"), plus any real handling, ` +
      `cross-contamination, or equipment safety notes relevant to these ingredients. Avoid generic filler like "be careful".`;

    const response = await generateWithRetry(prompt);

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