import { useState, useEffect } from 'react';
import './App.css';

const PANTRY_STAPLES = [
  'Garlic',
  'Olive Oil',
  'Eggs',
  'Onion',
  'Butter',
  'Tomatoes',
  'Rice',
  'Cheese',
  'Soy Sauce',
  'Chicken'
];

const ACCENT_THEMES = [
  { id: 'violet', label: 'Violet Glow', color: '#a855f7' },
  { id: 'emerald', label: 'Emerald Forest', color: '#10b981' },
  { id: 'rose', label: 'Rose Velvet', color: '#f43f5e' },
  { id: 'sapphire', label: 'Sapphire Ocean', color: '#3b82f6' },
  { id: 'amber', label: 'Amber Flame', color: '#f59e0b' },
  { id: 'sunset', label: 'Sunset Coral', color: '#ff6b6b' }
];

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('pantry_mode') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('pantry_accent') || 'violet');
  const [inputVal, setInputVal] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sparks, setSparks] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('pantry_mode', mode);
    localStorage.setItem('pantry_accent', accent);
  }, [mode, accent]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const addIngredient = (item) => {
    const trimmed = item.trim().replace(/,/g, '');
    if (trimmed && !ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients((prev) => [...prev, trimmed]);
      setInputVal('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputVal);
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
    setRecipe(null);
    setCompletedSteps(new Set());
  };

  const handleGlobalClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;

    const count = 10;
    const newSparks = Array.from({ length: count }).map(() => ({
      id: Math.random() + Date.now(),
      x: e.clientX,
      y: e.clientY,
      dx: (Math.random() - 0.5) * 140,
      dy: (Math.random() - 0.5) * 140,
      size: Math.random() * 5 + 3,
      rotation: Math.random() * 360
    }));

    setSparks((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
    }, 700);
  };

  const toggleStep = (index) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient to start.');
      return;
    }

    const cleanedIngredients = ingredients.join(', ');
    setLoading(true);
    setError(null);
    setRecipe(null);
    setCompletedSteps(new Set());

    try {
      const res = await fetch('http://localhost:5000/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: cleanedIngredients })
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      setRecipe(data);
      showToast('Recipe crafted successfully!');
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Unable to craft recipe. Ensure your backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!recipe) return;
    const statsText = [
      recipe.prepTime ? `Prep Time: ${recipe.prepTime}` : '',
      recipe.cookTime ? `Cook Time: ${recipe.cookTime}` : '',
      recipe.calories ? `Calories: ~${recipe.calories} kcal/serving` : '',
      recipe.servings ? `Servings: ${recipe.servings}` : ''
    ].filter(Boolean).join(' | ');

    const text = `${recipe.title}\n${statsText ? `(${statsText})\n\n` : '\n'}Ingredients:\n${recipe.ingredients.map((i) => `• ${i}`).join('\n')}\n\nInstructions:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nSafety Notes:\n${(recipe.precautions || []).map((p) => `! ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    showToast('Recipe copied to clipboard');
  };

  const handleSave = () => {
    if (!recipe) return;
    const existing = JSON.parse(localStorage.getItem('saved_recipes') || '[]');
    const isAlreadySaved = existing.some((item) => item.title === recipe.title);

    if (!isAlreadySaved) {
      localStorage.setItem('saved_recipes', JSON.stringify([...existing, recipe]));
      showToast('Saved to your collection');
    } else {
      showToast('Already in your saved collection');
    }
  };

  return (
    <div className="page-wrapper" onClick={handleGlobalClick}>
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="bloom-orb bloom-1"></div>
      <div className="bloom-orb bloom-2"></div>
      <div className="bloom-orb bloom-3"></div>

      {/* Futuristic Floating Glass Toolbar */}
      <aside className="theme-toolbar" aria-label="Theme & Accent Switcher">
        <button
          type="button"
          className="mode-toggle-btn"
          onClick={toggleMode}
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mode === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="toolbar-divider"></div>
        <div className="toolbar-buttons">
          {ACCENT_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-color-btn ${accent === t.id ? 'is-active' : ''}`}
              style={{ '--btn-accent': t.color }}
              onClick={() => setAccent(t.id)}
              title={t.label}
            />
          ))}
        </div>
      </aside>

      {/* Sparkles */}
      <div className="spark-container">
        {sparks.map((spark) => (
          <span
            key={spark.id}
            className="sparkle sparkle-white"
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

      {/* Glass Floating Toast */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container">
        <header className="header">
          <div className="badge-wrapper">
            <span className="badge">Pantry AI • Studio</span>
          </div>
          <h1 className="main-title">Culinary Assistant</h1>
          <p className="subtitle">Curate balanced recipes from the ingredients in your kitchen.</p>
        </header>

        <main className="main-content">
          {/* Input Glass Card */}
          <div className="card input-card">
            <div className="card-header-row">
              <div className="label-wrapper">
                <span className="section-eyebrow">Available Pantry</span>
                <span className="tag-counter">{ingredients.length} items</span>
              </div>
              {ingredients.length > 0 && (
                <button type="button" className="reset-link" onClick={handleReset}>
                  Clear All
                </button>
              )}
            </div>

            {ingredients.length > 0 && (
              <div className="tags-grid">
                {ingredients.map((tag, idx) => (
                  <div key={idx} className="input-tag">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="tag-remove"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className={`input-field-box ${isFocused ? 'is-focused' : ''}`}>
                <input
                  type="text"
                  className="tag-input"
                  placeholder={ingredients.length === 0 ? 'Type an ingredient and hit Enter (e.g. garlic, eggs)...' : 'Add another ingredient...'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                {inputVal.length > 0 && (
                  <span className="input-hint">Press ↵</span>
                )}
              </div>
            )}

            {/* Quick Staples */}
            <div className="staples-section">
              <span className="staples-label">Quick Add:</span>
              <div className="staples-list">
                {PANTRY_STAPLES.map((staple) => {
                  const isSelected = ingredients.some(
                    (i) => i.toLowerCase() === staple.toLowerCase()
                  );
                  return (
                    <button
                      key={staple}
                      type="button"
                      disabled={isSelected || loading}
                      className={`staple-btn ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => addIngredient(staple)}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {staple}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={loading || ingredients.length === 0}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Formulating Recipe...
                </span>
              ) : (
                'Generate Recipe'
              )}
            </button>

            {error && <div className="error-banner">{error}</div>}
          </div>

          {/* Skeleton Loader */}
          {loading && (
            <div className="card recipe-skeleton-card">
              <div className="skeleton-line title-skel"></div>
              <div className="skeleton-pills-row">
                <div className="skeleton-pill"></div>
                <div className="skeleton-pill"></div>
                <div className="skeleton-pill"></div>
              </div>
              <div className="skeleton-grid">
                <div className="skeleton-block long"></div>
                <div className="skeleton-block medium"></div>
                <div className="skeleton-block short"></div>
              </div>
            </div>
          )}

          {/* Recipe Presentation Layout */}
          {recipe && !loading && (
            <div className="recipe-display-wrapper">
              <div className="card recipe-hero-card">
                <div className="hero-top-row">
                  <div className="hero-title-group">
                    <div className="meta-ribbon">
                      <span className="meta-tag">Custom Creation</span>
                      <span className="meta-tag highlight">AI Chef</span>
                    </div>
                    <h2 className="recipe-title">{recipe.title}</h2>
                  </div>

                  <div className="hero-controls-block">
                    <div className="recipe-stats-cluster">
                      {recipe.prepTime && (
                        <div className="stat-pill" title="Estimated Prep Time">
                          <span className="stat-icon">⏱️</span>
                          <span className="stat-label">Prep:</span>
                          <span className="stat-val">{recipe.prepTime}</span>
                        </div>
                      )}

                      {recipe.cookTime && (
                        <div className="stat-pill" title="Cooking Time">
                          <span className="stat-icon">🍳</span>
                          <span className="stat-label">Cook:</span>
                          <span className="stat-val">{recipe.cookTime}</span>
                        </div>
                      )}

                      {recipe.calories && (
                        <div className="stat-pill highlight-stat" title="Calories per Serving">
                          <span className="stat-icon">🔥</span>
                          <span className="stat-val">{recipe.calories} kcal</span>
                        </div>
                      )}

                      {recipe.servings && (
                        <div className="stat-pill" title="Servings Count">
                          <span className="stat-icon">🍽️</span>
                          <span className="stat-val">{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
                        </div>
                      )}
                    </div>

                    <div className="utility-buttons">
                      <button className="icon-btn" onClick={handleCopy} title="Copy Recipe Text">
                        📋 Copy
                      </button>
                      <button className="icon-btn highlight-btn" onClick={handleSave} title="Save to Browser">
                        ★ Save
                      </button>
                    </div>
                  </div>
                </div>

                {recipe.macros && (recipe.macros.protein || recipe.macros.carbs || recipe.macros.fat) && (
                  <div className="macros-bar">
                    <span className="macros-label">Nutritional Breakdown:</span>
                    <div className="macros-chips">
                      {recipe.macros.protein && (
                        <span className="macro-chip">Protein: <strong>{recipe.macros.protein}</strong></span>
                      )}
                      {recipe.macros.carbs && (
                        <span className="macro-chip">Carbs: <strong>{recipe.macros.carbs}</strong></span>
                      )}
                      {recipe.macros.fat && (
                        <span className="macro-chip">Fats: <strong>{recipe.macros.fat}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="recipe-grid">
                <div className="card recipe-main-card">
                  <section className="recipe-section">
                    <h3 className="section-title">Required Ingredients</h3>
                    <div className="ingredients-pill-wrap">
                      {recipe.ingredients.map((item, i) => (
                        <div key={i} className="ingredient-pill">
                          <span className="bullet">✦</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="divider-line"></div>

                  <section className="recipe-section">
                    <div className="section-header-flex">
                      <h3 className="section-title">Step-by-Step Method</h3>
                      <span className="completion-badge">
                        {completedSteps.size}/{recipe.steps.length} done
                      </span>
                    </div>
                    <ol className="steps-checklist">
                      {recipe.steps.map((step, i) => {
                        const isDone = completedSteps.has(i);
                        return (
                          <li
                            key={i}
                            className={`step-item ${isDone ? 'is-completed' : ''}`}
                            onClick={() => toggleStep(i)}
                          >
                            <span className="step-badge">{isDone ? '✓' : i + 1}</span>
                            <span className="step-text">{step}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                </div>

                <div className="card precaution-card">
                  <div className="precaution-header">
                    <span className="caution-icon">🛡️</span>
                    <h3 className="section-title caution-title">Safety & Handling</h3>
                  </div>
                  <ul className="precautions-list">
                    {(recipe.precautions || []).map((item, i) => (
                      <li key={i} className="precaution-item">
                        <span className="precaution-bullet">!</span>
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