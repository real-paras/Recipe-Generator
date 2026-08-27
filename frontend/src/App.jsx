import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

const DEFAULT_INVENTORY = [
  { id: '1', name: 'Garlic', category: 'Produce', inStock: true },
  { id: '2', name: 'Onion', category: 'Produce', inStock: true },
  { id: '3', name: 'Tomatoes', category: 'Produce', inStock: false },
  { id: '4', name: 'Spinach', category: 'Produce', inStock: false },
  { id: '5', name: 'Lemon', category: 'Produce', inStock: true },
  { id: '6', name: 'Chicken', category: 'Proteins', inStock: false },
  { id: '7', name: 'Eggs', category: 'Proteins', inStock: true },
  { id: '8', name: 'Tofu', category: 'Proteins', inStock: false },
  { id: '9', name: 'Ground Beef', category: 'Proteins', inStock: false },
  { id: '10', name: 'Butter', category: 'Dairy', inStock: true },
  { id: '11', name: 'Milk', category: 'Dairy', inStock: true },
  { id: '12', name: 'Cheese', category: 'Dairy', inStock: false },
  { id: '13', name: 'Olive Oil', category: 'Pantry', inStock: true },
  { id: '14', name: 'Rice', category: 'Pantry', inStock: true },
  { id: '15', name: 'Pasta', category: 'Pantry', inStock: false },
  { id: '16', name: 'Soy Sauce', category: 'Pantry', inStock: true },
  { id: '17', name: 'Black Pepper', category: 'Pantry', inStock: true }
];

const APPLIANCE_OPTIONS = [
  { id: 'Stovetop', label: 'Stovetop / Pan', icon: '🍳' },
  { id: 'Air Fryer', label: 'Air Fryer', icon: '♨️' },
  { id: 'Oven', label: 'Oven / Bake', icon: '🔥' },
  { id: 'Microwave', label: 'Microwave', icon: '⚡' },
  { id: 'Instant Pot', label: 'Instant Pot', icon: '🍲' },
  { id: 'Blender', label: 'Blender / No Cook', icon: '🥣' }
];

const SKILL_LEVELS = [
  { id: 'Beginner', label: 'Beginner' },
  { id: 'Intermediate', label: 'Intermediate' },
  { id: 'Advanced', label: 'Chef-Level' }
];

const TIME_PRESETS = [
  { id: 'Any', label: 'No Limit' },
  { id: '15 mins', label: '≤ 15 mins' },
  { id: '30 mins', label: '≤ 30 mins' },
  { id: '45 mins', label: '≤ 45 mins' }
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
  const [mode, setMode] = useState(() => localStorage.getItem('pantry_mode') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('pantry_accent') || 'terracotta');
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('kitchen_inventory');
    return saved ? JSON.parse(saved) : DEFAULT_INVENTORY;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newPantryItem, setNewPantryItem] = useState('');
  const [newPantryCategory, setNewPantryCategory] = useState('Pantry');

  const [inputVal, setInputVal] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [selectedAppliances, setSelectedAppliances] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('Intermediate');
  const [selectedTime, setSelectedTime] = useState('Any');
  const [recipe, setRecipe] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const recipeCardRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('pantry_mode', mode);
    localStorage.setItem('pantry_accent', accent);
  }, [mode, accent]);

  useEffect(() => {
    localStorage.setItem('kitchen_inventory', JSON.stringify(inventory));
  }, [inventory]);

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

  const toggleAppliance = (applianceId) => {
    setSelectedAppliances((prev) =>
      prev.includes(applianceId) ? prev.filter((a) => a !== applianceId) : [...prev, applianceId]
    );
  };

  const handleReset = () => {
    setIngredients([]);
    setSelectedAppliances([]);
    setSelectedSkill('Intermediate');
    setSelectedTime('Any');
    setInputVal('');
    setError(null);
    setRecipe(null);
    setCompletedSteps(new Set());
  };

  const toggleStock = (id) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  const handleAddCustomInventory = (e) => {
    e.preventDefault();
    const trimmed = newPantryItem.trim();
    if (!trimmed) return;
    if (inventory.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Item already exists in inventory');
      return;
    }
    const newItem = {
      id: String(Date.now()),
      name: trimmed,
      category: newPantryCategory,
      inStock: true
    };
    setInventory((prev) => [...prev, newItem]);
    setNewPantryItem('');
    showToast(`Added ${trimmed} to pantry`);
  };

  const handleLoadInStock = () => {
    const inStockItems = inventory.filter((item) => item.inStock).map((item) => item.name);
    if (inStockItems.length === 0) {
      showToast('No items are currently marked in stock');
      return;
    }
    setIngredients((prev) => {
      const merged = [...prev];
      inStockItems.forEach((name) => {
        if (!merged.some((i) => i.toLowerCase() === name.toLowerCase())) {
          merged.push(name);
        }
      });
      return merged;
    });
    setIsDrawerOpen(false);
    showToast(`Loaded ${inStockItems.length} in-stock items!`);
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
        body: JSON.stringify({
          ingredients: cleanedIngredients,
          appliances: selectedAppliances,
          skillLevel: selectedSkill,
          maxTime: selectedTime
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      setRecipe(data);
      showToast('Chef created a tailored recipe!');
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
      recipe.servings ? `Servings: ${recipe.servings}` : '',
      recipe.appliance ? `Gear: ${recipe.appliance}` : '',
      recipe.skillLevel ? `Skill: ${recipe.skillLevel}` : ''
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

  const handleExportImage = async () => {
    if (!recipeCardRef.current || !recipe) return;
    setExporting(true);
    showToast('Rendering high-res recipe card...');

    try {
      const element = recipeCardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const link = document.createElement('a');
      const sanitizedTitle = (recipe.title || 'recipe')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      link.download = `pantry-ai-${sanitizedTitle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Recipe card exported!');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Failed to export recipe image.');
    } finally {
      setExporting(false);
    }
  };

  const categories = ['Produce', 'Proteins', 'Dairy', 'Pantry'];
  const inStockCount = inventory.filter((i) => i.inStock).length;

  return (
    <div className="page-wrapper">
      {/* Top Floating Action Bar */}
      <div className="top-navigation-bar">
        <button
          type="button"
          className="inventory-toggle-btn"
          onClick={() => setIsDrawerOpen(true)}
        >
          <span>📦 My Kitchen Inventory</span>
          <span className="inventory-chip">{inStockCount} In Stock</span>
        </button>
      </div>

      {/* Slide-Over Pantry Drawer */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2 className="drawer-title">Kitchen Inventory</h2>
                <p className="drawer-subtitle">Manage stocked items in your home pantry</p>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="drawer-add-form" onSubmit={handleAddCustomInventory}>
              <input
                type="text"
                className="drawer-input"
                placeholder="Add item (e.g. Avocado, Oregano)..."
                value={newPantryItem}
                onChange={(e) => setNewPantryItem(e.target.value)}
              />
              <select
                className="drawer-select"
                value={newPantryCategory}
                onChange={(e) => setNewPantryCategory(e.target.value)}
              >
                <option value="Produce">Produce</option>
                <option value="Proteins">Proteins</option>
                <option value="Dairy">Dairy</option>
                <option value="Pantry">Pantry</option>
              </select>
              <button type="submit" className="drawer-btn-add">
                + Add
              </button>
            </form>

            <div className="drawer-list-wrap">
              {categories.map((cat) => {
                const items = inventory.filter((i) => i.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="inventory-category-group">
                    <span className="inventory-category-name">{cat}</span>
                    <div className="inventory-items-grid">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`inventory-toggle-card ${item.inStock ? 'is-stocked' : ''}`}
                          onClick={() => toggleStock(item.id)}
                        >
                          <span className="inv-icon">{getIngredientIcon(item.name)}</span>
                          <span className="inv-name">{item.name}</span>
                          <span className="inv-badge">{item.inStock ? 'In Stock' : 'Out'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="btn-load-pantry"
                onClick={handleLoadInStock}
              >
                📥 Load In-Stock Items into Basket ({inStockCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Toolbar */}
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

      {/* Toast Notification */}
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
          <p className="subtitle">Select your ingredients, equipment, and preferences for a tailored culinary dish.</p>
        </header>

        <main className="main-content">
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

            {/* Cooking Setup & Constraints */}
            <div className="constraints-section">
              <div className="constraint-block">
                <span className="constraint-label">Available Equipment (Optional):</span>
                <div className="constraints-pill-group">
                  {APPLIANCE_OPTIONS.map((app) => {
                    const isSelected = selectedAppliances.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        className={`constraint-pill ${isSelected ? 'is-active' : ''}`}
                        onClick={() => toggleAppliance(app.id)}
                      >
                        <span className="constraint-icon">{app.icon}</span>
                        <span>{app.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="constraints-row">
                <div className="constraint-block">
                  <span className="constraint-label">Skill Level:</span>
                  <div className="constraints-pill-group">
                    {SKILL_LEVELS.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        className={`constraint-pill ${selectedSkill === skill.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedSkill(skill.id)}
                      >
                        <span>{skill.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="constraint-block">
                  <span className="constraint-label">Time Cap:</span>
                  <div className="constraints-pill-group">
                    {TIME_PRESETS.map((time) => (
                      <button
                        key={time.id}
                        type="button"
                        className={`constraint-pill ${selectedTime === time.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedTime(time.id)}
                      >
                        <span>{time.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
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

          {/* Printable & Exportable Recipe Display Card */}
          {recipe && !loading && (
            <div className="recipe-export-container" ref={recipeCardRef}>
              <div className="recipe-display-wrapper">
                <div className="card recipe-hero-card">
                  <div className="hero-top-row">
                    <div className="hero-title-group">
                      <div className="meta-ribbon">
                        <span className="meta-tag">{recipe.skillLevel || selectedSkill} Level</span>
                        <span className="meta-tag highlight">{recipe.appliance || 'Standard Cookware'}</span>
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

                      <div className="utility-buttons" data-html2canvas-ignore="true">
                        <button
                          className="icon-btn highlight-export"
                          onClick={handleExportImage}
                          disabled={exporting}
                          title="Export as PNG Image"
                        >
                          {exporting ? '⏳ Rendering...' : '📸 Export Card'}
                        </button>
                        <button className="icon-btn" onClick={handleCopy} title="Copy Recipe Text">
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
                      <span className="macros-label">Nutritional Breakdown:</span>
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
                        <span className="completion-badge" data-html2canvas-ignore="true">
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

                {/* Branded Watermark in Exported Card */}
                <div className="card-brand-footer">
                  <span>🍳 Crafted with Pantry AI • Studio</span>
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