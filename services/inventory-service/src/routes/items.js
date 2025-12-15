const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const mongoose = require('mongoose');

// In-memory storage fallback when DB is not connected
let inMemoryItems = [];
let nextId = 1;

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /items - List all items
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const items = await Item.find().sort({ addedAt: -1 });
      res.json(items);
    } else {
      res.json(inMemoryItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /items/:id - Get specific item
router.get('/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } else {
      const item = inMemoryItems.find(i => i._id === req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /items/barcode/:barcode - Find by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findOne({ barcode: req.params.barcode });
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } else {
      const item = inMemoryItems.find(i => i.barcode === req.params.barcode);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /items - Create new item
router.post('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = new Item(req.body);
      await item.save();
      res.status(201).json(item);
    } else {
      const item = {
        _id: String(nextId++),
        ...req.body,
        addedAt: new Date()
      };
      inMemoryItems.push(item);
      res.status(201).json(item);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } else {
      const index = inMemoryItems.findIndex(i => i._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      inMemoryItems[index] = { ...inMemoryItems[index], ...req.body };
      res.json(inMemoryItems[index]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const item = await Item.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item deleted successfully' });
    } else {
      const index = inMemoryItems.findIndex(i => i._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      inMemoryItems.splice(index, 1);
      res.json({ message: 'Item deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

