require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 5000;

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection failed:', err));

app.get('/', (req, res) => {
  res.send('Backend is alive!');
});

app.post('/api/recipes/generate', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Suggest a recipe using only these ingredients: ${ingredients}. Respond ONLY with valid JSON in this exact format, no other text: {"title": "...", "ingredients": ["...", "..."], "steps": ["...", "..."]}`
    });

    const responseText = response.text.replace(/```json|```/g, '').trim();
    const recipe = JSON.parse(responseText);

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});