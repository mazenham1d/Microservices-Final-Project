const axios = require('axios');

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

const lookupBarcode = async (barcode) => {
  try {
    const response = await axios.get(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);
    
    if (response.data.status === 0) {
      return null; // Product not found
    }

    const product = response.data.product;
    
    return {
      barcode: product.code || barcode,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      category: product.categories || product.categories_tags?.[0] || 'Uncategorized',
      brand: product.brands || '',
      image: product.image_url || product.image_front_url || '',
      nutrition: product.nutriments || {},
      ingredients: product.ingredients_text || ''
    };
  } catch (error) {
    console.error('Open Food Facts API error:', error.message);
    throw new Error('Failed to lookup barcode');
  }
};

module.exports = { lookupBarcode };

