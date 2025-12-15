const express = require('express');
const axios = require('axios');
const router = express.Router();

const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL || 'http://recipe-service:3005';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3001';

// Get recipe suggestions based on pantry items
router.post('/suggestions', async (req, res) => {
  try {
    // First, get all pantry items
    const inventoryResponse = await axios.get(`${INVENTORY_SERVICE_URL}/items`);
    const items = inventoryResponse.data;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'No items in pantry. Please add items first to get recipe suggestions.'
      });
    }

    // Send items to recipe service for AI suggestions
    const recipeResponse = await axios.post(`${RECIPE_SERVICE_URL}/recipes/suggestions`, {
      items: items
    });

    res.json(recipeResponse.data);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      error: 'Failed to generate recipe suggestions',
      details: error.message
    });
  }
});

// Health check for recipe service
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${RECIPE_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'recipe-service',
      error: error.message
    });
  }
});

module.exports = router;
