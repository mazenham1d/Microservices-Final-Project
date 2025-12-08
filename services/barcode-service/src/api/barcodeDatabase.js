const axios = require('axios');

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';
const UPC_DATABASE_API = 'https://api.upcitemdb.com/prod/trial/lookup';

// Helper function to clean and extract category
const cleanCategory = (categoryData) => {
  if (!categoryData) return 'Uncategorized';
  
  let category = categoryData;
  
  // If it's an array, get the first meaningful element
  if (Array.isArray(categoryData)) {
    category = categoryData[0] || 'Uncategorized';
  }
  
  // Convert to string
  category = String(category);
  
  // Split by comma and get the first category
  const parts = category.split(',');
  category = parts[0].trim();
  
  // Remove language prefixes (e.g., "en:", "fr:")
  category = category.replace(/^[a-z]{2}:/i, '');
  
  // Replace hyphens and underscores with spaces
  category = category.replace(/[-_]/g, ' ');
  
  // Capitalize first letter of each word
  category = category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Common category mappings
  const categoryMap = {
    'Beverages': 'Beverages',
    'Carbonated Drinks': 'Beverages',
    'Sodas': 'Beverages',
    'Soft Drinks': 'Beverages',
    'Drinks': 'Beverages',
    'Snacks': 'Snacks',
    'Sweet Snacks': 'Snacks',
    'Salty Snacks': 'Snacks',
    'Spreads': 'Spreads',
    'Sweet Spreads': 'Spreads',
    'Chocolate Spreads': 'Spreads',
    'Dairies': 'Dairy',
    'Dairy': 'Dairy',
    'Plant Based Foods': 'Plant Based',
    'Fruits': 'Fruits',
    'Vegetables': 'Vegetables',
    'Meats': 'Meat',
    'Meat': 'Meat',
    'Seafood': 'Seafood',
    'Cereals': 'Cereals',
    'Breakfast': 'Breakfast',
    'Breads': 'Bakery',
    'Bakery': 'Bakery',
    'Condiments': 'Condiments',
    'Sauces': 'Condiments',
    'Frozen Foods': 'Frozen',
    'Frozen': 'Frozen',
    'Canned': 'Canned Goods',
    'Pasta': 'Pasta',
    'Rice': 'Rice'
  };
  
  // Check if we have a mapping
  for (const [key, value] of Object.entries(categoryMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // If category is empty or too long, return default
  if (!category || category.length > 30) {
    return 'Uncategorized';
  }
  
  return category;
};

// Try Open Food Facts first
const lookupOpenFoodFacts = async (barcode) => {
  try {
    const response = await axios.get(`${OPEN_FOOD_FACTS_API}/${barcode}.json`, {
      timeout: 5000
    });
    
    if (response.data.status === 0 || !response.data.product) {
      return null;
    }

    const product = response.data.product;
    
    // Try multiple category fields
    const rawCategory = product.categories || 
                       product.categories_tags?.[0] || 
                       product.categories_en ||
                       'Uncategorized';
    
    return {
      barcode: product.code || barcode,
      name: product.product_name || product.product_name_en || '',
      category: cleanCategory(rawCategory),
      brand: product.brands || '',
      image: product.image_url || product.image_front_url || '',
      nutrition: product.nutriments || {},
      ingredients: product.ingredients_text || '',
      source: 'Open Food Facts'
    };
  } catch (error) {
    console.error('Open Food Facts API error:', error.message);
    return null;
  }
};

// Fallback to UPC Item DB (free tier: 100 requests/day)
const lookupUPCDatabase = async (barcode) => {
  try {
    const response = await axios.get(`${UPC_DATABASE_API}`, {
      params: { upc: barcode },
      timeout: 5000
    });
    
    if (response.data.code !== 'OK' || !response.data.items?.length) {
      return null;
    }

    const product = response.data.items[0];
    
    return {
      barcode: product.upc || product.ean || barcode,
      name: product.title || '',
      category: cleanCategory(product.category || 'Uncategorized'),
      brand: product.brand || '',
      image: product.images?.[0] || '',
      description: product.description || '',
      source: 'UPC Database'
    };
  } catch (error) {
    console.error('UPC Database API error:', error.message);
    return null;
  }
};

// Main lookup function - tries multiple sources
const lookupBarcode = async (barcode) => {
  console.log(`Looking up barcode: ${barcode}`);
  
  // Try Open Food Facts first (larger database, international)
  let result = await lookupOpenFoodFacts(barcode);
  
  if (result && result.name) {
    console.log(`Found in Open Food Facts: ${result.name}`);
    return { ...result, found: true };
  }
  
  // Fallback to UPC Database
  result = await lookupUPCDatabase(barcode);
  
  if (result && result.name) {
    console.log(`Found in UPC Database: ${result.name}`);
    return { ...result, found: true };
  }
  
  // Not found in any database
  console.log(`Barcode ${barcode} not found in any database`);
  return {
    barcode: barcode,
    name: '',
    category: 'Uncategorized',
    brand: '',
    image: '',
    found: false,
    source: 'Not found'
  };
};

module.exports = { lookupBarcode };

