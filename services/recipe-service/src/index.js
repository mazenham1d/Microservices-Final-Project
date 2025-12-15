const express = require('express');
const cors = require('cors');
const recipesRouter = require('./routes/recipes');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'recipe-service',
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Recipe routes
app.use('/recipes', recipesRouter);

app.listen(PORT, () => {
  console.log(`Recipe service running on port ${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('WARNING: OPENAI_API_KEY not configured!');
  }
});
