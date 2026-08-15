import { useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);

  const handleGenerate = () => {
    console.log('Ingredients typed:', ingredients);
  };

  return (
    <div className="app">
      <h1>AI Recipe Generator</h1>

      <textarea
        placeholder="What ingredients do you have? e.g. rice, tomato, onion"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <button onClick={handleGenerate}>Generate recipe</button>

      {recipe && (
        <div className="recipe">
          <h2>{recipe.title}</h2>
        </div>
      )}
    </div>
  );
}

export default App;