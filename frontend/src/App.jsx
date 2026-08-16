import { useState } from 'react';
import './App.css';

const INPUT_PADDING_LEFT = 14;

function getTextWidth(text, font) {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

function App() {
  const [inputVal, setInputVal] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sparks, setSparks] = useState([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputVal.trim().replace(/,/g, '');
      if (trimmed && !ingredients.includes(trimmed)) {
        setIngredients([...ingredients, trimmed]);
        setInputVal('');
      }
    } else if (e.key === 'Backspace' && inputVal === '' && ingredients.length > 0) {
      e.preventDefault();
      const last = ingredients[ingredients.length - 1];
      setIngredients(ingredients.slice(0, -1));
      setInputVal(last);
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setIngredients([]);
    setInputVal('');
    setError(null);
  };

  const handleGlobalClick = (e) => {
    const count = 10;
    const newSparks = Array.from({ length: count }).map(() => ({
      id: Math.random() + Date.now(),
      x: e.clientX,
      y: e.clientY,
      dx: (Math.random() - 0.5) * 140,
      dy: (Math.random() - 0.5) * 140,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      gold: Math.random() > 0.5
    }));

    setSparks((prev) => [...prev, ...newSparks]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
    }, 800);
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Please enter at least one ingredient');
      return;
    }

    const cleanedIngredients = ingredients.join(', ');

    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const res = await fetch('http://localhost:5000/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: cleanedIngredients })
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

  const handleCopy = () => {
    if (!recipe) return;
    const text = `${recipe.title}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nSteps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!recipe) return;
    const existing = JSON.parse(localStorage.getItem('saved_recipes') || '[]');
    localStorage.setItem('saved_recipes', JSON.stringify([...existing, recipe]));
    setSaved(true);
  };

  const caretOffset = getTextWidth(inputVal, "500 14px 'Work Sans', sans-serif") + INPUT_PADDING_LEFT + 3;

  return (
    <div className="page-wrapper" onClick={handleGlobalClick}>
      <div className="bloom-orb bloom-1"></div>
      <div className="bloom-orb bloom-2"></div>
      <div className="bloom-orb bloom-3"></div>
      <div className="bloom-orb bloom-4"></div>
      <div className="bloom-orb bloom-5"></div>

      <div className="spark-container">
        {sparks.map((spark) => (
          <span
            key={spark.id}
            className={`sparkle ${spark.gold ? 'sparkle-gold' : 'sparkle-violet'}`}
            style={{
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              '--dx': `${spark.dx}px`,
              '--dy': `${spark.dy}px`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              transform: `rotate(${spark.rotation}deg)`
            }}
          />
        ))}
      </div>

      <div className="container">
        <header className="header">
          <span className="badge">Pantry AI</span>
          <h1 className="main-title">Recipe Generator</h1>
          <p className="subtitle">Transform your available ingredients into tailored recipes.</p>
        </header>

        <main className="main-content">
          <div className="input-card-row">
            <div className="card input-card">
              <div className="label-row">
                <span className="label">Add Items</span>
              </div>

              <div className="tags-stack">
                {ingredients.map((tag, idx) => (
                  <div key={idx} className="input-tag">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeIngredient(idx)} className="tag-remove">&times;</button>
                  </div>
                ))}
              </div>

              {!loading && (
                <div className="input-line">
                  <input
                    type="text"
                    className="tag-input"
                    placeholder="Type something..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  {isFocused && (
                    <div className="fake-cursor" style={{ left: `${caretOffset}px` }}>
                      <span className="cursor-bar"></span>
                      <span className="cursor-hint">Press Enter</span>
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Crafting Recipe...
                  </span>
                ) : (
                  'Generate Recipe'
                )}
              </button>

              {error && <div className="error-banner">{error}</div>}
            </div>

            {ingredients.length > 0 && (
              <button type="button" className="reset-btn-outside" onClick={handleReset}>
                Reset
              </button>
            )}
          </div>

          {loading && (
            <div className="card recipe-card skeleton-card">
              <div className="skeleton-line title-skel"></div>
              <div className="skeleton-badges">
                <div className="skeleton-chip"></div>
                <div className="skeleton-chip"></div>
                <div className="skeleton-chip"></div>
              </div>
              <div className="skeleton-line section-skel"></div>
              <div className="skeleton-tags">
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
              </div>
              <div className="skeleton-line section-skel"></div>
              <div className="skeleton-block"></div>
              <div className="skeleton-block"></div>
            </div>
          )}

          {recipe && !loading && (
            <div className="card recipe-card animated-card">
              <div className="recipe-header">
                <div className="title-action-row">
                  <h2 className="recipe-title">{recipe.title}</h2>
                  <div className="utility-buttons">
                    <button className="icon-btn" onClick={handleCopy} title="Copy Recipe">
                      {copied ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <button className="icon-btn" onClick={handleSave} title="Save Recipe">
                      {saved ? '★ Saved' : '☆ Save'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="recipe-columns">
                <div className="recipe-main">
                  <section className="recipe-section fade-in-section" style={{ animationDelay: '0.1s' }}>
                    <h3 className="section-title">Ingredients</h3>
                    <ul className="ingredients-list">
                      {recipe.ingredients.map((item, i) => (
                        <li key={i} className="ingredient-tag stagger-item" style={{ animationDelay: `${0.15 + i * 0.04}s` }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="recipe-section fade-in-section" style={{ animationDelay: '0.3s' }}>
                    <h3 className="section-title">Instructions</h3>
                    <ol className="steps-list">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="stagger-item" style={{ animationDelay: `${0.35 + i * 0.05}s` }}>
                          <span className="step-number">{i + 1}</span>
                          <span className="step-text">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>

                <div className="precaution-panel fade-in-section" style={{ animationDelay: '0.4s' }}>
                  <h3 className="section-title precaution-title">Precautions</h3>
                  <ul className="precautions-list">
                    {(recipe.precautions || []).map((item, i) => (
                      <li key={i} className="precaution-item stagger-item" style={{ animationDelay: `${0.45 + i * 0.05}s` }}>
                        <span className="precaution-icon">⚠️</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;