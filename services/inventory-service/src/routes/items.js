const express = require('express');
const router = express.Router();

// In-memory storage (no database)
let items = [];
let nextId = 1;

// GET /items - List all items
router.get('/', async (req, res) => {
  try {
    res.json(items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /items/:id - Get specific item
router.get('/:id', async (req, res) => {
  try {
    const item = items.find(i => i._id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /items/barcode/:barcode - Find by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const item = items.find(i => i.barcode === req.params.barcode);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /items - Create new item
router.post('/', async (req, res) => {
  try {
    const item = {
      _id: String(nextId++),
      ...req.body,
      addedAt: new Date()
    };
    items.push(item);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const index = items.findIndex(i => i._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    items[index] = { ...items[index], ...req.body };
    res.json(items[index]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const index = items.findIndex(i => i._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    items.splice(index, 1);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

