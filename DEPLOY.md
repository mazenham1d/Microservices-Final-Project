# Deploy to Digital Ocean App Platform

The easiest way to deploy Smart Pantry - no server management required!

## What You Get

- Automatic builds and deployments from GitHub
- Managed MongoDB databases with automatic backups
- Free SSL certificates
- Auto-scaling
- **Cost: ~$38/month** (can use $200 free credit for 60 days)

---

## Prerequisites

1. Digital Ocean account (get $200 credit: https://try.digitalocean.com/)
2. GitHub account with your code pushed

---

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
# If not already done
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/yourusername/smart-pantry.git
git push -u origin main
```

### 2. Update the App Configuration

Edit [.do/app.yaml](.do/app.yaml) and replace:
- `yourusername/your-repo-name` with your actual GitHub repo (e.g., `mazenhamid/smart-pantry`)

### 3. Deploy via Digital Ocean Console

#### Option A: Use the Configuration File (Recommended)

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"Edit Your App Spec"** (bottom of page)
4. Copy the contents of `.do/app.yaml`
5. Paste into the editor
6. Click **"Next"** → **"Create Resources"**

#### Option B: Use the UI Wizard

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. **Source**: Select your GitHub repo
4. **Authorize**: Grant Digital Ocean access to your GitHub
5. **Select Branch**: `main`
6. App Platform will auto-detect your services

**Add each service manually:**

**API Gateway:**
- Type: Web Service
- Source Directory: `services/api-gateway`
- Dockerfile: `services/api-gateway/Dockerfile`
- HTTP Port: 3000
- Routes: `/api`, `/health`

**Inventory Service:**
- Type: Web Service (Internal)
- Source Directory: `services/inventory-service`
- Dockerfile: `services/inventory-service/Dockerfile`
- HTTP Port: 3001

**Analytics Service:**
- Type: Web Service (Internal)
- Source Directory: `services/analytics-service`
- Dockerfile: `services/analytics-service/Dockerfile`
- HTTP Port: 3002

**Barcode Service:**
- Type: Web Service (Internal)
- Source Directory: `services/barcode-service`
- Dockerfile: `services/barcode-service/Dockerfile`
- HTTP Port: 3003

**Web Client:**
- Type: Static Site
- Source Directory: `client`
- Dockerfile: `client/Dockerfile`
- Route: `/`

7. **Add Databases:**
   - Click **"Add Database"**
   - Name: `inventory-db`, Engine: MongoDB
   - Click **"Add Database"** again
   - Name: `analytics-db`, Engine: MongoDB

8. **Configure Environment Variables:**

   For each service, add these in the "Environment Variables" section:

   **api-gateway:**
   ```
   PORT = 3000
   INVENTORY_SERVICE_URL = ${inventory-service.PRIVATE_URL}
   ANALYTICS_SERVICE_URL = ${analytics-service.PRIVATE_URL}
   BARCODE_SERVICE_URL = ${barcode-service.PRIVATE_URL}
   ```

   **inventory-service:**
   ```
   PORT = 3001
   MONGODB_URI = ${inventory-db.DATABASE_URL}
   ```

   **analytics-service:**
   ```
   PORT = 3002
   MONGODB_URI = ${analytics-db.DATABASE_URL}
   ```

   **barcode-service:**
   ```
   PORT = 3003
   ```

   **web-client:**
   ```
   VITE_API_URL = ${api-gateway.PUBLIC_URL}
   ```

9. Click **"Next"** → **"Review"** → **"Create Resources"**

### 4. Wait for Deployment

- Initial deployment takes 5-10 minutes
- App Platform will:
  - Build all Docker images
  - Create MongoDB databases
  - Set up networking
  - Provision SSL certificates
  - Deploy all services

### 5. Access Your App

Once deployed, you'll get a URL like:
```
https://smart-pantry-xxxxx.ondigitalocean.app
```

**Login credentials remain the same:**
- Admin: `admin` / `admin123`
- User: `user` / `user123`

---

## Cost Breakdown

| Resource | Cost/Month |
|----------|------------|
| API Gateway (basic-xxs) | $5 |
| Inventory Service (basic-xxs) | $5 |
| Analytics Service (basic-xxs) | $5 |
| Barcode Service (basic-xxs) | $5 |
| Web Client (static) | $3 |
| MongoDB - Inventory (dev) | $15 |
| MongoDB - Analytics (dev) | $15 |
| **Total** | **~$53/month** |

**Pro Tip:** Use your $200 credit = 3.7 months free!

---

## Monitoring & Management

### View Logs
1. Go to your app in DO Console
2. Click on a service
3. Click **"Runtime Logs"** tab

### Update Your App
```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# App Platform automatically rebuilds and redeploys!
```

### Scale Services
1. Go to your app
2. Click on a service
3. Click **"Edit"**
4. Increase **"Instance Count"**
5. Click **"Save"**

### Add Custom Domain
1. In your app settings
2. Click **"Settings"** → **"Domains"**
3. Add your domain
4. Update DNS records as instructed
5. SSL certificate auto-provisioned

---

## Troubleshooting

### Build Fails
Check build logs in the console:
- Verify Dockerfile paths are correct
- Ensure package.json exists in each service

### Service Can't Connect to Database
- Verify environment variables are set correctly
- Check database is in "Available" state
- Review connection strings in service logs

### 502 Bad Gateway
- Wait for all services to be "Running"
- Check health check endpoints
- Review service logs for errors

### Camera Not Working
- Custom domains work better than .ondigitalocean.app URLs
- Some browsers require HTTPS (auto-provided)
- Check browser permissions

---

## Rollback Deployment

If something goes wrong:
1. Go to your app
2. Click **"Settings"** → **"History"**
3. Find previous working deployment
4. Click **"Rollback"**

---

## Alternative: Deploy with CLI

```bash
# Install doctl
brew install doctl  # Mac
# or download from: https://docs.digitalocean.com/reference/doctl/

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml

# Check status
doctl apps list

# View logs
doctl apps logs <app-id>
```

---

## Next Steps

After deployment:

1. **Set up monitoring** - Enable DO monitoring in app settings
2. **Configure backups** - Databases backup automatically
3. **Add alerts** - Set up email alerts for downtime
4. **Custom domain** - Point your domain to the app
5. **Scale up** - Increase resources as needed

---

## Support

- Digital Ocean Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community/tags/app-platform
- Support: https://cloud.digitalocean.com/support

---

**That's it! Your microservices app is now live on Digital Ocean!**
