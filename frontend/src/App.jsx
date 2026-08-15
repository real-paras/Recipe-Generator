import { useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const res = await fetch('http://localhost:5000/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });

      if (!res.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await res.json();
      setRecipe(data);
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Failed to generate recipe. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI Recipe Generator</h1>

      <textarea
        placeholder="What ingredients do you have? e.g. rice, tomato, onion"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate recipe'}
      </button>

      {error && <p className="error">{error}</p>}

      {recipe && (
        <div className="recipe">
          <h2>{recipe.title}</h2>

          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3>Steps</h3>
          <ol>
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default App;