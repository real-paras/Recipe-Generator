require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection failed:', err));

app.get('/', (req, res) => {
  res.send('Backend is alive!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});