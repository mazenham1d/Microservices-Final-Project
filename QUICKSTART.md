# Quick Start Guide

## 1. Add Your OpenAI API Key

Create a `.env` file in the project root:

```bash
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env
```

Replace `sk-your-api-key-here` with your actual OpenAI API key from https://platform.openai.com/api-keys

## 2. Start the App

```bash
docker-compose up --build
```

Wait 2-3 minutes for all services to start.

## 3. Open in Browser

Go to: **http://localhost:3004**

## 4. Login

**Admin:**
- Username: `admin`
- Password: `admin123`

**User:**
- Username: `user`
- Password: `user123`

## 5. Try the Recipe Feature!

1. Add some items to your pantry (use barcode scanner or manual entry)
2. Click the **"Recipe Ideas"** tab at the top
3. Click **"Get Recipe Ideas"**
4. Get AI-powered recipe suggestions!

---

## Working Barcodes to Test

Add multiple items to get better recipe suggestions!

- `3017620422003` - Nutella
- `5449000000996` - Coca-Cola
- `8001090309117` - Barilla Pasta

**Tip:** The more ingredients you add, the better the AI recipe suggestions!

---

## Services Running

- **Web Client**: http://localhost:3004
- **API Gateway**: http://localhost:3000
- **Inventory Service**: http://localhost:3001
- **Analytics Service**: http://localhost:3002
- **Barcode Service**: http://localhost:3003
- **Recipe Service**: http://localhost:3005

---

## Troubleshooting

**Recipe feature not working?**
- Make sure you created the `.env` file with your OpenAI API key
- Restart: `docker-compose down && docker-compose up --build`

**Port already in use?**
- Kill existing process: `docker-compose down`
- Check what's using ports: `lsof -i :3000` (Mac/Linux)

---

For detailed deployment instructions, see [DEPLOY.md](DEPLOY.md)

For recipe feature setup, see [RECIPE_SETUP.md](RECIPE_SETUP.md)
