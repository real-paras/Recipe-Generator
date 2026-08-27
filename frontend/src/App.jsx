import { useState, useEffect } from 'react';
import './App.css';

const PANTRY_DEPARTMENTS = [
  {
    category: 'Produce',
    icon: '🥦',
    items: ['Garlic', 'Onion', 'Tomatoes', 'Spinach', 'Lemon', 'Bell Pepper']
  },
  {
    category: 'Proteins',
    icon: '🥩',
    items: ['Chicken', 'Eggs', 'Tofu', 'Ground Beef', 'Salmon', 'Chickpeas']
  },
  {
    category: 'Dairy & Cheese',
    icon: '🧀',
    items: ['Butter', 'Milk', 'Cheese', 'Heavy Cream', 'Yogurt']
  },
  {
    category: 'Pantry Staples',
    icon: '🫒',
    items: ['Olive Oil', 'Rice', 'Pasta', 'Soy Sauce', 'Flour', 'Black Pepper']
  }
];

const ACCENT_THEMES = [
  { id: 'terracotta', label: 'Paprika / Terracotta', color: '#D94830' },
  { id: 'sage', label: 'Rosemary / Sage', color: '#507A5E' },
  { id: 'butter', label: 'Dijon / Warm Butter', color: '#D97706' },
  { id: 'clay', label: 'Artisan Clay', color: '#C2593F' },
  { id: 'espresso', label: 'Smoked Espresso', color: '#4A3B32' }
];

function getIngredientIcon(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('salmon') || lower.includes('fish') || lower.includes('tuna') || lower.includes('shrimp')) return '🐟';
  if (lower.includes('chicken') || lower.includes('poultry') || lower.includes('turkey')) return '🍗';
  if (lower.includes('beef') || lower.includes('steak') || lower.includes('meat') || lower.includes('pork')) return '🥩';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('milk') || lower.includes('cream') || lower.includes('yogurt')) return '🥛';
  if (lower.includes('cheese') || lower.includes('parmesan') || lower.includes('cheddar')) return '🧀';
  if (lower.includes('butter')) return '🧈';
  if (lower.includes('garlic')) return '🧄';
  if (lower.includes('onion') || lower.includes('shallot')) return '🧅';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('pepper') || lower.includes('chili') || lower.includes('spice')) return '🌶️';
  if (lower.includes('lemon') || lower.includes('lime') || lower.includes('citrus')) return '🍋';
  if (lower.includes('rice') || lower.includes('grain') || lower.includes('quinoa')) return '🍚';
  if (lower.includes('pasta') || lower.includes('noodle') || lower.includes('spaghetti')) return '🍝';
  if (lower.includes('oil') || lower.includes('olive') || lower.includes('vinegar') || lower.includes('sauce') || lower.includes('soy')) return '🍶';
  if (lower.includes('spinach') || lower.includes('herb') || lower.includes('basil') || lower.includes('leaf') || lower.includes('lettuce')) return '🥬';
  if (lower.includes('flour') || lower.includes('sugar') || lower.includes('baking') || lower.includes('salt')) return '🧂';
  if (lower.includes('bread') || lower.includes('toast')) return '🍞';
  if (lower.includes('tofu') || lower.includes('chickpea') || lower.includes('bean')) return '🌱';
  return '🥄';
}

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('pantry_mode') || 'light');
  const [accent, setAccent] = useState(() => localStorage.getItem('pantry_accent') || 'terracotta');
  const [inputVal, setInputVal] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      setError('Please add at least one ingredient from your kitchen.');
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
      showToast('Chef created a fresh recipe!');
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Unable to craft recipe. Check that your backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!recipe) return;
    const statsText = [
      recipe.prepTime ? `Prep: ${recipe.prepTime}` : '',
      recipe.cookTime ? `Cook: ${recipe.cookTime}` : '',
      recipe.calories ? `Calories: ~${recipe.calories} kcal/serving` : '',
      recipe.servings ? `Servings: ${recipe.servings}` : ''
    ].filter(Boolean).join(' | ');

    const text = `${recipe.title}\n${statsText ? `(${statsText})\n\n` : '\n'}Ingredients:\n${recipe.ingredients.map((i) => `• ${i}`).join('\n')}\n\nPreparation Steps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nChef's Notes & Safety:\n${(recipe.precautions || []).map((p) => `! ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    showToast('Recipe card copied to clipboard');
  };

  const handleSave = () => {
    if (!recipe) return;
    const existing = JSON.parse(localStorage.getItem('saved_recipes') || '[]');
    const isAlreadySaved = existing.some((item) => item.title === recipe.title);

    if (!isAlreadySaved) {
      localStorage.setItem('saved_recipes', JSON.stringify([...existing, recipe]));
      showToast('Saved to your Recipe Book');
    } else {
      showToast('Already in your Recipe Book');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Floating Kitchen Accent & Mode Switcher */}
      <aside className="theme-toolbar" aria-label="Kitchen Style Switcher">
        <button
          type="button"
          className="mode-toggle-btn"
          onClick={toggleMode}
          title={`Switch to ${mode === 'dark' ? 'Warm Linen' : 'Cast Iron'} Mode`}
        >
          {mode === 'dark' ? '☀️' : '🍳'}
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

      {/* Floating Toast */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container">
        <header className="header">
          <div className="badge-wrapper">
            <span className="badge">🍳 Pantry to Plate</span>
          </div>
          <h1 className="main-title">What's in Your Kitchen?</h1>
          <p className="subtitle">Select your on-hand ingredients and let our AI chef craft an artisanal dish.</p>
        </header>

        <main className="main-content">
          {/* Pantry Input Board */}
          <div className="card input-card">
            <div className="card-header-row">
              <div className="label-wrapper">
                <span className="section-eyebrow">🛒 On-Hand Ingredients</span>
                <span className="tag-counter">{ingredients.length} selected</span>
              </div>
              {ingredients.length > 0 && (
                <button type="button" className="reset-link" onClick={handleReset}>
                  Clear Basket
                </button>
              )}
            </div>

            {ingredients.length > 0 && (
              <div className="tags-grid">
                {ingredients.map((tag, idx) => (
                  <div key={idx} className="input-tag">
                    <span className="tag-icon">{getIngredientIcon(tag)}</span>
                    <span className="tag-text">{tag}</span>
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
                  placeholder={ingredients.length === 0 ? 'Type an ingredient (e.g. olive oil, garlic, basil) and press Enter...' : 'Add more ingredients...'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                {inputVal.length > 0 && (
                  <span className="input-hint">Enter ↵</span>
                )}
              </div>
            )}

            {/* Department Quick Picks */}
            <div className="departments-container">
              <span className="departments-header">Quick Pantry Selection:</span>
              <div className="departments-grid">
                {PANTRY_DEPARTMENTS.map((dept) => (
                  <div key={dept.category} className="department-group">
                    <div className="department-title">
                      <span>{dept.icon}</span>
                      <span>{dept.category}</span>
                    </div>
                    <div className="staples-list">
                      {dept.items.map((item) => {
                        const isSelected = ingredients.some(
                          (i) => i.toLowerCase() === item.toLowerCase()
                        );
                        return (
                          <button
                            key={item}
                            type="button"
                            disabled={isSelected || loading}
                            className={`staple-btn ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => addIngredient(item)}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
                  Simmering Recipe Ideas...
                </span>
              ) : (
                '👨‍🍳 Create Recipe'
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

          {/* Recipe Card Output */}
          {recipe && !loading && (
            <div className="recipe-display-wrapper">
              <div className="card recipe-hero-card">
                <div className="hero-top-row">
                  <div className="hero-title-group">
                    <div className="meta-ribbon">
                      <span className="meta-tag">Artisanal AI Kitchen</span>
                      <span className="meta-tag highlight">Fresh Formulation</span>
                    </div>
                    <h2 className="recipe-title">{recipe.title}</h2>
                  </div>

                  <div className="hero-controls-block">
                    <div className="recipe-stats-cluster">
                      {recipe.prepTime && (
                        <div className="stat-pill" title="Preparation Time">
                          <span className="stat-icon">⏱️</span>
                          <span className="stat-label">Prep:</span>
                          <span className="stat-val">{recipe.prepTime}</span>
                        </div>
                      )}

                      {recipe.cookTime && (
                        <div className="stat-pill" title="Cook Time">
                          <span className="stat-icon">🔥</span>
                          <span className="stat-label">Cook:</span>
                          <span className="stat-val">{recipe.cookTime}</span>
                        </div>
                      )}

                      {recipe.calories && (
                        <div className="stat-pill highlight-stat" title="Calories">
                          <span className="stat-icon">🥗</span>
                          <span className="stat-val">{recipe.calories} kcal</span>
                        </div>
                      )}

                      {recipe.servings && (
                        <div className="stat-pill" title="Portions">
                          <span className="stat-icon">🍽️</span>
                          <span className="stat-val">{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
                        </div>
                      )}
                    </div>

                    <div className="utility-buttons">
                      <button className="icon-btn" onClick={handleCopy} title="Copy Recipe">
                        📋 Copy
                      </button>
                      <button className="icon-btn highlight-btn" onClick={handleSave} title="Save to Recipe Book">
                        📖 Save
                      </button>
                    </div>
                  </div>
                </div>

                {recipe.macros && (recipe.macros.protein || recipe.macros.carbs || recipe.macros.fat) && (
                  <div className="macros-bar">
                    <span className="macros-label">Nutritional Estimation:</span>
                    <div className="macros-chips">
                      {recipe.macros.protein && (
                        <span className="macro-chip">Protein: <strong>{recipe.macros.protein}</strong></span>
                      )}
                      {recipe.macros.carbs && (
                        <span className="macro-chip">Carbs: <strong>{recipe.macros.carbs}</strong></span>
                      )}
                      {recipe.macros.fat && (
                        <span className="macro-chip">Fat: <strong>{recipe.macros.fat}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="recipe-grid">
                {/* Left Column: Ingredients & Method */}
                <div className="card recipe-main-card">
                  <section className="recipe-section">
                    <h3 className="section-title">Ingredients Needed</h3>
                    <div className="ingredients-list-grid">
                      {recipe.ingredients.map((item, i) => (
                        <div key={i} className="ingredient-card-item">
                          <span className="ingredient-item-icon">{getIngredientIcon(item)}</span>
                          <span className="ingredient-item-text">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="divider-line"></div>

                  <section className="recipe-section">
                    <div className="section-header-flex">
                      <h3 className="section-title">Cooking Method</h3>
                      <span className="completion-badge">
                        {completedSteps.size}/{recipe.steps.length} steps completed
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

                {/* Right Column: Chef's Kitchen Notes */}
                <div className="card precaution-card">
                  <div className="precaution-header">
                    <span className="caution-icon">👨‍🍳</span>
                    <h3 className="section-title caution-title">Chef's Prep & Safety Notes</h3>
                  </div>
                  <ul className="precautions-list">
                    {(recipe.precautions || []).map((item, i) => (
                      <li key={i} className="precaution-item">
                        <span className="precaution-bullet">✦</span>
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