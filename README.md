# AI Recipe Generator

A full-stack app that takes a list of ingredients and generates a recipe using AI, saving each result to a database. Built as a hands-on project to learn how a frontend, backend, database, and AI API connect end to end.

## What it does

Type in the ingredients you have → the backend sends them to Google's Gemini API → a recipe comes back and gets saved to MongoDB → the frontend displays it.

## Tech stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React (via Vite)                     |
| Backend   | Node.js + Express                    |
| Database  | MongoDB Atlas (via Mongoose)         |
| AI        | Google Gemini API (`@google/genai`)  |

## Project structure

```
ai-recipe-generator/
├── README.md
├── .gitignore
├── backend/
│   ├── models/
│   │   └── Recipe.js        ← database schema for a recipe
│   ├── server.js             ← Express server, routes, AI call
│   ├── package.json
│   └── .env                  ← secrets (not committed)
└── frontend/
    ├── src/
    │   ├── App.jsx            ← main UI: form + recipe display
    │   ├── App.css            ← styling
    │   └── main.jsx           ← React entry point
    ├── index.html
    └── package.json
```

## One-time setup

Only needs to be done once, when first setting this project up on a machine.

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Set up the `.env` file

Inside `backend/`, create a file named exactly `.env` (no filename before the dot). It needs two values:

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

**Where to get these:**
- `MONGODB_URI` — from [MongoDB Atlas](https://mongodb.com/atlas): Database → Connect → Drivers → Node.js. Add your database username/password into the string, and insert a database name (e.g. `recipeApp`) right before the `?` in the URL.
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com) → Get API key → Create API key. Free tier, no card required.

This file is intentionally left out of GitHub (`.gitignore` handles this) since it holds private credentials. If you're setting this project up fresh on a new machine, you'll need to create this file yourself using the format above — it won't come from `git clone`.

## Running the project

Two servers run at the same time, each in its own terminal tab.

**Terminal 1 — backend:**
```bash
cd backend
node server.js
```
Look for:
```
Server running on http://localhost:5000
Connected to MongoDB
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```
Look for a line like:
```
Local:   http://localhost:5173/
```

Then open **http://localhost:5173** in your browser — that's the actual website.

Both terminals need to stay running while you use the site. `Ctrl + C` in either one stops that half of the app.

## API routes (backend)

| Method | Route                       | What it does                                  |
|--------|------------------------------|------------------------------------------------|
| POST   | `/api/recipes/generate`      | Takes `{ ingredients }`, returns a generated + saved recipe |
| GET    | `/api/recipes`               | Returns all previously saved recipes, newest first |

## Git workflow used on this project

```bash
git status        # see what's changed
git add .          # stage changes
git commit -m "describe what changed"
git push           # upload to GitHub
```

Committed after every working checkpoint (server running, database connected, AI route working, frontend connected, etc.) rather than in one large dump.

## Notes

- If you see a `503 UNAVAILABLE` error from Gemini, the model is temporarily overloaded — wait a few seconds and retry, or check `server.js` for the current model name being used, since Google updates these periodically.
- If `cors` isn't installed/configured in `server.js`, the frontend's requests to the backend will fail — this is required since the frontend and backend run on different ports.
![alt text](image-2.png)