const express = require('express');
const router = express.Router();
const { lookupBarcode } = require('../api/barcodeDatabase');

// POST /scan - Upload image/barcode and get product info
router.post('/scan', async (req, res) => {
  try {
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const productInfo = await lookupBarcode(barcode);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /lookup/:barcode - Direct barcode lookup
router.get('/lookup/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const productInfo = await lookupBarcode(barcode);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

