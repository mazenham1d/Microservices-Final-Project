# Changelog

## [1.1.0] - AI Recipe Feature

### Added
- **New Recipe Service** (Port 3005)
  - AI-powered recipe suggestions using OpenAI GPT-4o
  - Validates ingredients against user's actual pantry items
  - Creative recipe generation even with limited ingredients

- **Recipe Ideas Tab** in Dashboard
  - Beautiful card-based UI for recipe display
  - Shows cooking time, difficulty level, and ingredients
  - Real-time recipe generation with loading states
  - Error handling for API issues

### Changed
- **Switched from GPT-3.5-turbo to GPT-4o**
  - Better instruction following
  - More accurate ingredient matching
  - Reduces hallucination of ingredients not in pantry
  - Cost: ~$0.01-0.02 per request (vs $0.001-0.002)

- **Enhanced Validation**
  - Server-side validation of suggested ingredients
  - Only shows ingredients that exist in user's pantry
  - Filters out recipes with no valid ingredients

- **Improved Prompting**
  - Explicit instructions to ONLY use available ingredients
  - Better handling of limited ingredient scenarios
  - More creative with simple/single ingredients

### Technical Details
- New API endpoint: `POST /api/recipes/suggestions`
- Updated API Gateway to route recipe requests
- Updated docker-compose.yml with recipe service
- Updated .do/app.yaml for Digital Ocean deployment
- Added environment variable: `OPENAI_API_KEY`

### Files Added
- `services/recipe-service/` - Complete new microservice
- `client/src/components/RecipeSuggestions.jsx` - Recipe UI component
- `client/src/components/RecipeSuggestions.css` - Recipe styling
- `RECIPE_SETUP.md` - Setup guide for recipe feature
- `QUICKSTART.md` - Quick start guide
- `.env.example` - Environment variable template
- `CHANGELOG.md` - This file

### Files Modified
- `services/api-gateway/src/index.js` - Added recipe routes
- `services/api-gateway/src/routes/recipes.js` - Recipe routing logic
- `client/src/components/Dashboard.jsx` - Added tabs for recipes
- `client/src/components/Dashboard.css` - Tab styling
- `client/src/services/api.js` - Recipe API client method
- `docker-compose.yml` - Added recipe service
- `.do/app.yaml` - Added recipe service for deployment
- `DEPLOY.md` - Updated deployment instructions

### Architecture
```
Total Services: 6 (was 5)
- API Gateway (3000)
- Inventory Service (3001)
- Analytics Service (3002)
- Barcode Service (3003)
- Web Client (3004)
- Recipe Service (3005) ← NEW
```

### Cost Impact
- Local development: Free (except OpenAI API usage)
- OpenAI API: ~$0.01-0.02 per recipe generation
- Digital Ocean: +$5/month for recipe service (basic-xxs instance)

---

## [1.0.0] - Initial Release

### Features
- Microservices architecture with 5 services
- Camera-based barcode scanning
- Multi-source product lookup (Open Food Facts, UPC Database)
- Inventory management (CRUD operations)
- Admin analytics dashboard
- Role-based access control
- Docker containerization
- Health checks and monitoring
- Horizontal scaling support
