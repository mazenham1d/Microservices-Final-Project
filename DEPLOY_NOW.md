# Deploy to Digital Ocean - Quick Guide

## Where to Put Your OpenAI API Key

You have **2 options** for the OpenAI key:

### Option 1: Put it in .do/app.yaml (Easy, but less secure)

**Line 106** of `.do/app.yaml`:
```yaml
- key: OPENAI_API_KEY
  value: "sk-your-actual-key-here"  # Replace this!
  type: SECRET
```

⚠️ **Important:** This will be in your git history. Use Option 2 if you want better security.

### Option 2: Add it in Digital Ocean Console (More secure - RECOMMENDED)

1. Deploy without changing line 106
2. After deployment, go to your app in DO Console
3. Click on **recipe-service**
4. Click **Settings** → **Environment Variables**
5. Edit `OPENAI_API_KEY` and paste your actual key
6. Click **Save** → Your app will redeploy automatically

---

## About the .env File

### For Local Development (docker-compose):
**KEEP the .env file** - You need it for running locally!

Create `.env` in project root:
```bash
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

### For Digital Ocean Deployment:
**The .env file is NOT used** - Digital Ocean uses the environment variables from `.do/app.yaml` or the Console.

---

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
# Add all files (but .env is already in .gitignore, so it won't be pushed)
git add .

# Commit
git commit -m "Ready for Digital Ocean deployment"

# Push
git push origin main
```

### 2. Deploy to Digital Ocean

Go to: https://cloud.digitalocean.com/apps

1. Click **"Create App"**
2. Click **"Edit Your App Spec"** (at the bottom)
3. Open `.do/app.yaml` and copy ALL the contents
4. Paste into the Digital Ocean editor
5. **OPTIONAL:** Replace line 106 with your OpenAI key (or do it later in Console)
6. Click **"Next"** → **"Create Resources"**

### 3. Wait for Deployment (5-10 minutes)

Digital Ocean will:
- Build all your services
- Create MongoDB databases
- Set up networking
- Give you a live URL!

### 4. Add OpenAI Key (if you didn't in step 2)

1. Go to your app in the DO Console
2. Click **recipe-service**
3. Go to **Settings** → **Environment Variables**
4. Find `OPENAI_API_KEY`
5. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual key
6. Click **Save**
7. Wait 2-3 minutes for redeployment

### 5. Access Your Live App! 🎉

You'll get a URL like:
```
https://smart-pantry-xxxxx.ondigitalocean.app
```

Login with:
- Admin: `admin` / `admin123`
- User: `user` / `user123`

---

## Quick Summary

**Files:**
- `.env` → For LOCAL development with `docker-compose` (NOT pushed to GitHub)
- `.do/app.yaml` → For Digital Ocean deployment (pushed to GitHub)

**OpenAI Key:**
- **Local:** Put in `.env` file
- **Digital Ocean:** Put in `.do/app.yaml` line 106 OR add in DO Console (more secure)

**Git Security:**
- `.env` is in `.gitignore` → Your local key is safe
- If you put key in `.do/app.yaml`, it will be in GitHub (less secure but easier)
- Best practice: Use DO Console to add the key instead

---

## Need Help?

**Push failed?**
```bash
git remote -v  # Check remote is correct
git push -u origin main  # Force push to main
```

**Want to test locally first?**
```bash
# Make sure .env exists with your key
docker-compose down
docker-compose up --build
# Visit http://localhost:3004
```

**Deployment failed?**
- Check build logs in DO Console
- Make sure your OpenAI key is valid
- Check all services show "Running"

---

Ready to deploy? Run these commands:

```bash
# 1. Make sure everything is committed
git add .
git commit -m "Deploy to Digital Ocean with recipe feature"

# 2. Push to GitHub
git push origin main

# 3. Go to https://cloud.digitalocean.com/apps and deploy!
```
