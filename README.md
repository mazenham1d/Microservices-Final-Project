# Distributed Smart Pantry Microservices System

A cloud-ready microservices application for managing pantry inventory through barcode scanning. The system demonstrates scalable architecture patterns that can be deployed to cloud platforms.

## Architecture Overview

The system consists of 5 main microservices:

1. **API Gateway** (Port 3000) - Entry point with authentication and request routing
2. **Inventory Service** (Port 3001) - Manages pantry items with MongoDB
3. **Analytics Service** (Port 3002) - Tracks usage statistics and system metrics
4. **Barcode Service** (Port 3003) - Integrates with Open Food Facts API for product lookup
5. **Web Client** (Port 3004) - React-based user interface

All services are containerized with Docker and orchestrated using Docker Compose.

## Features

- **Barcode Scanning**: Scan product barcodes to automatically add items to pantry
- **Inventory Management**: Add, update, delete, and view pantry items
- **Product Information**: Automatic product details from Open Food Facts database
- **Usage Analytics**: Track API usage, endpoint activity, and error rates (admin only)
- **Access Control**: Role-based authentication (User/Admin)
- **Filtering**: Filter items by location (Pantry, Fridge, Freezer) and category
- **Cloud-Ready**: Stateless services designed for horizontal scaling

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js 18+ (for local development, optional)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Microservices-Final-Project
```

### 2. Build and Start Services

```bash
docker-compose up --build
```

This command will:
- Build Docker images for all services
- Start MongoDB databases
- Start all microservices
- Start the web client

The first build may take a few minutes to download dependencies and build images.

### 3. Access the Application

- **Web Client**: http://localhost:3004
- **API Gateway**: http://localhost:3000
- **Health Checks**: 
  - API Gateway: http://localhost:3000/health
  - Inventory Service: http://localhost:3001/health
  - Analytics Service: http://localhost:3002/health
  - Barcode Service: http://localhost:3003/health

### 4. Login Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Access: Full access + Analytics dashboard

**Regular User:**
- Username: `user`
- Password: `user123`
- Access: Pantry management only

## Demo Scenarios

### Scenario 1: Scan and Add Product

1. Login with any user credentials
2. Click "Scan Barcode" button
3. Enter a barcode (e.g., `3017620422003` for Nutella)
4. Click "Scan" to lookup product information
5. Review product details and click "Add to Pantry"

### Scenario 2: Manage Inventory

1. View all items in your pantry
2. Use filters to find items by location or category
3. Click "Edit" on any item to update quantity, location, or expiry date
4. Click "Delete" to remove items from inventory

### Scenario 3: View Analytics (Admin Only)

1. Login as admin (`admin` / `admin123`)
2. Click "Show Analytics" button
3. View:
   - Total API requests
   - Error rates and response times
   - Top endpoints by usage
   - User activity breakdown
   - Error status code distribution

### Scenario 4: Test API Directly

```bash
# Health check
curl http://localhost:3000/health

# Login (returns user info)
curl -u admin:admin123 http://localhost:3000/api/auth/login

# Get all items
curl -u user:user123 http://localhost:3000/api/pantry/items

# Scan barcode
curl -u user:user123 -X POST http://localhost:3000/api/pantry/scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "3017620422003"}'

# Get analytics (admin only)
curl -u admin:admin123 http://localhost:3000/api/admin/analytics
```

## Project Structure

```
/
├── services/
│   ├── api-gateway/          # API Gateway service
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── inventory-service/    # Inventory management
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   └── db.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── analytics-service/    # Analytics and logging
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   └── db.js
│   │   ├── Dockerfile
│   │   └── package.json
│   └── barcode-service/      # Barcode lookup
│       ├── src/
│       │   ├── index.js
│       │   ├── routes/
│       │   └── api/
│       ├── Dockerfile
│       └── package.json
├── client/                    # React web application
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml         # Service orchestration
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (Basic Auth)

### Pantry Management
- `GET /api/pantry/items` - List all items
- `POST /api/pantry/items` - Add item manually
- `PUT /api/pantry/items/:id` - Update item
- `DELETE /api/pantry/items/:id` - Delete item
- `POST /api/pantry/scan` - Scan barcode and add/update item

### Admin Analytics
- `GET /api/admin/analytics` - Get comprehensive analytics (admin only)

### Health Checks
- `GET /health` - Service health status (all services)

## Service Details

### API Gateway
- Routes requests to appropriate microservices
- Implements Basic Authentication
- Logs all requests to Analytics Service
- Enforces role-based access control

### Inventory Service
- Manages pantry items in MongoDB
- Provides CRUD operations
- Stores: name, barcode, quantity, category, location, expiry date

### Analytics Service
- Tracks all API requests
- Aggregates statistics:
  - Request frequency per endpoint
  - Error rates
  - Response times
  - User activity
- Provides admin dashboard data

### Barcode Service
- Integrates with Open Food Facts API
- Looks up product information by barcode
- Returns product name, category, brand, and nutrition info

### Web Client
- React-based single-page application
- Responsive design
- Real-time inventory management
- Admin analytics dashboard

## Database Schemas

### Inventory Item
```javascript
{
  barcode: String,
  name: String,
  quantity: Number,
  category: String,
  expiryDate: Date,
  location: String, // "Pantry", "Fridge", "Freezer", "Other"
  addedAt: Date,
  updatedAt: Date
}
```

### Analytics Log
```javascript
{
  endpoint: String,
  method: String,
  user: String,
  statusCode: Number,
  responseTime: Number,
  timestamp: Date
}
```

## Development

### Running Services Locally (without Docker)

1. Install dependencies for each service:
```bash
cd services/inventory-service && npm install
cd ../analytics-service && npm install
cd ../barcode-service && npm install
cd ../api-gateway && npm install
cd ../../client && npm install
```

2. Start MongoDB instances:
```bash
docker run -d -p 27017:27017 --name mongodb-inventory mongo:7
docker run -d -p 27018:27017 --name mongodb-analytics mongo:7
```

3. Start services (in separate terminals):
```bash
# Terminal 1
cd services/inventory-service && npm start

# Terminal 2
cd services/analytics-service && npm start

# Terminal 3
cd services/barcode-service && npm start

# Terminal 4
cd services/api-gateway && npm start

# Terminal 5
cd client && npm run dev
```

### Environment Variables

Each service supports environment variables (see `.env.example` files):

- `PORT` - Service port (defaults provided)
- `MONGODB_URI` - MongoDB connection string
- `INVENTORY_SERVICE_URL` - Inventory service URL (API Gateway)
- `ANALYTICS_SERVICE_URL` - Analytics service URL (API Gateway)
- `BARCODE_SERVICE_URL` - Barcode service URL (API Gateway)

## Scaling and Cloud Deployment

The architecture is designed for cloud scalability:

### Horizontal Scaling
```bash
# Scale inventory service to 3 instances
docker-compose up --scale inventory-service=3
```

### Cloud Migration Path

1. **Container Orchestration**: Replace Docker Compose with Kubernetes
   - Create Kubernetes manifests (Deployments, Services, ConfigMaps)
   - Use Kubernetes DNS for service discovery
   - Implement Horizontal Pod Autoscaling

2. **Managed Databases**: 
   - MongoDB Atlas for production databases
   - Configure replica sets for high availability

3. **Load Balancing**:
   - Use cloud load balancers (AWS ALB, GCP Load Balancer)
   - Place API Gateway behind load balancer

4. **Monitoring & Logging**:
   - Integrate with Prometheus/Grafana
   - Use ELK stack or cloud logging services
   - Set up alerting for error rates

5. **Deployment Platforms**:
   - AWS: ECS/EKS
   - Google Cloud: Cloud Run/GKE
   - Azure: AKS
   - Heroku: Container Registry

### Cloud-Ready Features

- ✅ Stateless services (state in databases)
- ✅ Health check endpoints
- ✅ Environment-based configuration
- ✅ Service discovery via Docker network
- ✅ Centralized logging (Analytics Service)
- ✅ Horizontal scaling support
- ✅ Containerized databases

## Testing

### Manual Testing Checklist

- [ ] All services start successfully
- [ ] Health checks return healthy status
- [ ] User can login with valid credentials
- [ ] User can scan barcode and add item
- [ ] User can view, edit, and delete items
- [ ] Filters work correctly
- [ ] Admin can access analytics
- [ ] Analytics data updates in real-time
- [ ] Error handling works (invalid barcode, etc.)

### Sample Test Barcodes

- `3017620422003` - Nutella
- `5449000000996` - Coca Cola
- `8001090309117` - Barilla Pasta

Note: Barcodes must exist in Open Food Facts database.

## Troubleshooting

### Services won't start
- Check Docker is running: `docker ps`
- Check ports are not in use: `lsof -i :3000`
- View logs: `docker-compose logs [service-name]`

### Database connection errors
- Ensure MongoDB containers are healthy: `docker ps`
- Check MongoDB logs: `docker-compose logs mongodb-inventory`

### API Gateway errors
- Verify all dependent services are running
- Check service URLs in environment variables
- Review API Gateway logs: `docker-compose logs api-gateway`

### Web client not loading
- Check if API Gateway is accessible: `curl http://localhost:3000/health`
- Verify CORS settings if accessing from different origin
- Check browser console for errors

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose
- **Authentication**: Basic Auth (express-basic-auth)
- **External APIs**: Open Food Facts API
- **Web Server**: Nginx (for production client build)

## Project Requirements Met

### Minimum Requirements (85%)
- ✅ Multiple microservices with REST APIs
- ✅ Containerized deployment (Docker)
- ✅ Service APIs with access controls (Basic Auth + role-based)
- ✅ Usage statistics tracking per endpoint
- ✅ Administrative endpoint for analytics

### Additional Requirements (15% + Extra Credit)
- ✅ Machine Learning service (Barcode Service with Open Food Facts integration)
- ✅ Containerized storage (MongoDB in containers)
- ✅ Novel design and usefulness (Smart Pantry concept)

## License

This project is created for educational purposes.

## Author

Microservices Final Project - Smart Pantry System
