# Recipe Generator

A full-stack app that turns the ingredients you have on hand into a tailored, AI-generated recipe — complete with prep/cook time, calories, macros, safety notes, and an interactive step checklist.

## Features

- **Kitchen Inventory** — a persistent pantry list (by category) with in-stock/out toggles; bulk-load in-stock items into your active ingredient basket
- **Constraints** — optionally set available appliances, skill level, and a max time cap; the AI respects all three
- **AI-generated recipes** — title, prep/cook time, servings, calories, macros (protein/carbs/fat), ingredients, steps, and chef's safety precautions
- **Step checklist** — click steps to mark them done while cooking
- **Copy / Save / Export** — copy as formatted text, save to a local recipe book, or export the recipe card as a PNG image
- **Theming** — light/dark mode and 5 accent color themes, persisted across visits

## Tech stack

| Layer     | Technology                              |
|-----------|-------------------------------------------|
| Frontend  | React (Vite), html2canvas                 |
| Backend   | Node.js + Express                          |
| Database  | MongoDB Atlas (via Mongoose)               |
| AI        | Google Gemini API (`@google/genai`)        |

## Project structure

```
Recipe-Generator/
├── README.md
├── .gitignore
├── backend/
│   ├── models/
│   │   └── Recipe.js
│   ├── server.js
│   ├── package.json
│   └── .env                  ← secrets, not committed
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Setup

**1. Install dependencies**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**2. Create `backend/.env`**
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```
- `MONGODB_URI` — from [MongoDB Atlas](https://mongodb.com/atlas): Database → Connect → Drivers → Node.js. Insert your database username/password and a database name before the `?`.
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com) → Get API key.
- In Atlas → Network Access, allow your current IP (or `0.0.0.0/0` for local development).

This file is git-ignored and must be created manually on any new machine.

## Running locally

Two terminals, both running at once:

```bash
# Terminal 1 — backend
cd backend
node server.js
# → "Server running on http://localhost:5000" + "Connected to MongoDB"

# Terminal 2 — frontend
cd frontend
npm run dev
# → open http://localhost:5173
```

## API routes

| Method | Route                    | Description                                      |
|--------|---------------------------|---------------------------------------------------|
| POST   | `/api/recipes/generate`   | Body: `{ ingredients, appliances, skillLevel, maxTime }` → generates + saves a recipe |
| GET    | `/api/recipes`            | Returns all saved recipes, newest first            |

## Notes

- The Gemini model name is set in `server.js` (`generateWithRetry`) — Google periodically retires model versions, so update it there if you start seeing 404 errors.
- A `503` from Gemini means the model is temporarily overloaded; the backend automatically retries with backoff.
- Local-only data (theme preference, pantry inventory, saved recipe book) lives in the browser's `localStorage`, not the database.