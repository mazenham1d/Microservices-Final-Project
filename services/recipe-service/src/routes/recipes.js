const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate recipe suggestions based on pantry items
router.post('/suggestions', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'No items provided. Please add items to your pantry first.'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.'
      });
    }

    // Format items for the prompt
    const itemNames = items.map(item => item.name);
    const itemList = items.map(item => {
      const parts = [`${item.name}`];
      if (item.quantity) parts.push(`(${item.quantity})`);
      if (item.category) parts.push(`[${item.category}]`);
      return parts.join(' ');
    }).join('\n');

    // Create prompt for OpenAI
    const prompt = `I ONLY have these exact ingredients in my pantry:

${itemList}

IMPORTANT RULES:
1. You can ONLY use ingredients from the list above - NO additional ingredients
2. The "ingredients" field must ONLY contain items that appear in my pantry list
3. If the pantry has limited items, be creative with simple recipes or suggest adding them to drinks/desserts
4. Do NOT assume I have common items like salt, pepper, oil, etc. unless they're listed above

Please suggest 3 creative recipes using ONLY these ingredients. For each recipe:
1. Give it a catchy name
2. List the main ingredients needed (MUST be from my pantry list ONLY)
3. Provide a brief description
4. Include approximate cooking/prep time
5. Add difficulty level (Easy/Medium/Hard)

Format your response as JSON with this structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": ["ingredient1", "ingredient2"],
      "description": "Brief description",
      "cookingTime": "30 minutes",
      "difficulty": "Easy"
    }
  ]
}`;

    console.log('Requesting recipe suggestions from OpenAI (GPT-4o)...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe expert. You create recipes using ONLY the ingredients provided by the user - never suggest ingredients they don't have. Be creative with limited ingredients. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const recipes = JSON.parse(responseText);

    // Validate that suggested ingredients are actually in the pantry
    const pantryItemsLower = itemNames.map(name => name.toLowerCase());
    const validatedRecipes = (recipes.recipes || []).map(recipe => {
      // Filter out any ingredients not in the user's pantry
      const validIngredients = (recipe.ingredients || []).filter(ingredient => {
        const ingredientLower = ingredient.toLowerCase();
        return pantryItemsLower.some(pantryItem =>
          ingredientLower.includes(pantryItem) || pantryItem.includes(ingredientLower)
        );
      });

      return {
        ...recipe,
        ingredients: validIngredients
      };
    }).filter(recipe => recipe.ingredients.length > 0); // Only keep recipes with valid ingredients

    console.log(`Generated ${validatedRecipes.length} recipe suggestions`);

    res.json({
      success: true,
      recipes: validatedRecipes,
      itemsUsed: items.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating recipes:', error);

    // Handle specific OpenAI errors
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        error: 'Invalid OpenAI API key. Please check your configuration.'
      });
    }

    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'OpenAI API quota exceeded. Please check your billing.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate recipe suggestions',
      details: error.message
    });
  }
});

module.exports = router;
