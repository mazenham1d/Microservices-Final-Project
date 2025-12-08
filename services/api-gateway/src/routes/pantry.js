const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getUserFromAuth } = require('../middleware/auth');

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3001';
const BARCODE_SERVICE_URL = process.env.BARCODE_SERVICE_URL || 'http://barcode-service:3003';

// POST /api/pantry/scan - Scan barcode (routes to ML → Inventory)
router.post('/scan', async (req, res) => {
  try {
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // First, lookup product info from barcode service
    const barcodeResponse = await axios.get(`${BARCODE_SERVICE_URL}/lookup/${barcode}`);
    const productInfo = barcodeResponse.data;

    // Check if item already exists
    try {
      const existingItem = await axios.get(`${INVENTORY_SERVICE_URL}/items/barcode/${barcode}`);
      // Item exists, return it
      return res.json({ ...existingItem.data, productInfo });
    } catch (error) {
      // Item doesn't exist, create new one
      const newItem = {
        barcode: productInfo.barcode,
        name: productInfo.name,
        quantity: 1,
        category: productInfo.category,
        location: 'Pantry'
      };

      const createResponse = await axios.post(`${INVENTORY_SERVICE_URL}/items`, newItem);
      return res.json({ ...createResponse.data, productInfo });
    }
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/pantry/items - List all pantry items
router.get('/items', async (req, res) => {
  try {
    const response = await axios.get(`${INVENTORY_SERVICE_URL}/items`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/pantry/items - Add item manually
router.post('/items', async (req, res) => {
  try {
    const response = await axios.post(`${INVENTORY_SERVICE_URL}/items`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/pantry/items/:id - Update item
router.put('/items/:id', async (req, res) => {
  try {
    const response = await axios.put(`${INVENTORY_SERVICE_URL}/items/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/pantry/items/:id - Remove item
router.delete('/items/:id', async (req, res) => {
  try {
    await axios.delete(`${INVENTORY_SERVICE_URL}/items/${req.params.id}`);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

