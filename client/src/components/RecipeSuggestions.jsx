import React, { useState } from 'react';
import { api } from '../services/api';
import './RecipeSuggestions.css';

const RecipeSuggestions = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemsUsed, setItemsUsed] = useState(0);

  const getPassword = () => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved).password : '';
  };

  const getRecipeSuggestions = async () => {
    try {
      setLoading(true);
      setError('');

      const username = JSON.parse(localStorage.getItem('credentials'))?.username || '';
      const password = getPassword();

      const data = await api.getRecipeSuggestions(username, password);

      setRecipes(data.recipes || []);
      setItemsUsed(data.itemsUsed || 0);
    } catch (err) {
      console.error('Failed to get recipe suggestions:', err);
      setError(err.response?.data?.error || 'Failed to generate recipes. Please check your OpenAI API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-suggestions">
      <div className="recipe-header">
        <h2>AI Recipe Suggestions</h2>
        <p className="recipe-subtitle">
          Get personalized recipe ideas based on your pantry ingredients
        </p>
      </div>

      <div className="recipe-actions">
        <button
          className="btn btn-primary btn-large"
          onClick={getRecipeSuggestions}
          disabled={loading}
        >
          {loading ? 'Generating Recipes...' : 'Get Recipe Ideas'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>AI is analyzing your pantry and creating delicious recipes...</p>
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <div className="recipes-container">
          <div className="recipes-info">
            <p>Based on {itemsUsed} items in your pantry</p>
          </div>

          <div className="recipes-grid">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <div className="recipe-card-header">
                  <h3>{recipe.name}</h3>
                  <span className={`difficulty-badge difficulty-${recipe.difficulty?.toLowerCase()}`}>
                    {recipe.difficulty}
                  </span>
                </div>

                <div className="recipe-card-body">
                  <div className="recipe-meta">
                    <span className="recipe-time">
                      ⏱️ {recipe.cookingTime}
                    </span>
                  </div>

                  <p className="recipe-description">{recipe.description}</p>

                  <div className="recipe-ingredients">
                    <h4>Main Ingredients:</h4>
                    <ul>
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recipes.length === 0 && !error && (
        <div className="empty-state">
          <p>Click the button above to get AI-powered recipe suggestions based on your pantry items!</p>
        </div>
      )}
    </div>
  );
};

export default RecipeSuggestions;
