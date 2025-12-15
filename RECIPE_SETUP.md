# Recipe Feature Setup Guide

The Smart Pantry app now includes AI-powered recipe suggestions using OpenAI!

## Where to Put Your OpenAI API Key

### Step 1: Get an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy your API key (starts with `sk-...`)

### Step 2: Create a `.env` File

In the **root of your project** (same folder as `docker-compose.yml`), create a file named `.env`:

```bash
# Create the .env file
touch .env
```

### Step 3: Add Your API Key

Edit the `.env` file and add:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Replace `sk-your-actual-api-key-here` with your actual OpenAI API key.

### Step 4: Start the App

```bash
docker-compose up --build
```

That's it! The recipe service will automatically use your API key.

---

## How to Use the Recipe Feature

1. **Start the app**: `docker-compose up --build`
2. **Login** at http://localhost:3004
3. **Add items to your pantry** using the barcode scanner or manually
4. **Click the "Recipe Ideas" tab** at the top
5. **Click "Get Recipe Ideas"** button
6. **Wait 5-10 seconds** while AI analyzes your pantry
7. **View personalized recipes** based on your ingredients!

---

## Features

- Analyzes all items in your pantry
- Suggests 3 personalized recipes
- Shows cooking time and difficulty level
- Lists main ingredients needed from your pantry
- Beautiful card-based UI

---

## Troubleshooting

### Error: "OpenAI API key not configured"

**Solution**: Make sure you created the `.env` file in the root directory with your API key.

```bash
# Check if .env file exists
ls -la .env

# View contents (be careful not to share this!)
cat .env
```

### Error: "Invalid OpenAI API key"

**Solution**: Double-check your API key:
1. Make sure it starts with `sk-`
2. No extra spaces or quotes
3. Copy it directly from OpenAI dashboard

### Error: "OpenAI API quota exceeded"

**Solution**:
1. Check your billing at https://platform.openai.com/account/billing
2. Add payment method if needed
3. Wait if you've hit rate limits

### Container won't start

**Solution**:
```bash
# Rebuild the recipe service
docker-compose build recipe-service

# Restart all services
docker-compose down
docker-compose up --build
```

---

## Cost Information

- Uses **GPT-4o** model (more accurate, follows instructions better)
- Each recipe request costs ~$0.01 - $0.02 (about 1-2 cents)
- 100 recipe generations ≈ $1-2
- Very affordable for personal use
- GPT-4o is better at only using ingredients you actually have!

---

## Technical Details

### New Service Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Web Client │ Port 3004
│  - Recipe Tab
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ API Gateway │ Port 3000
│  /api/recipes
└──────┬──────┘
       │
       ↓
┌──────────────────┐      ┌───────────┐
│  Recipe Service  │─────>│  OpenAI   │
│  Port 3005       │      │    API    │
└────────┬─────────┘      └───────────┘
         │
         ↓
┌─────────────────┐
│ Inventory Service│
│  (Gets pantry    │
│   items)         │
└──────────────────┘
```

### API Endpoints

**Get Recipe Suggestions:**
```bash
curl -u user:user123 -X POST http://localhost:3000/api/recipes/suggestions
```

**Check Recipe Service Health:**
```bash
curl http://localhost:3005/health
```

---

## Security Note

- **NEVER commit your `.env` file to git**
- The `.gitignore` already excludes `.env` files
- Use `.env.example` for documentation only
- For production, use environment variables or secrets management

---

## For Digital Ocean Deployment

When deploying to Digital Ocean App Platform:

1. Go to your app settings
2. Navigate to the **recipe-service** component
3. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: `your-api-key-here`
   - Check "Encrypt"

Or update [.do/app.yaml](.do/app.yaml) to include:

```yaml
- name: recipe-service
  envs:
    - key: OPENAI_API_KEY
      value: sk-your-key-here
      type: SECRET
```

---

**Enjoy AI-powered recipe suggestions!**
