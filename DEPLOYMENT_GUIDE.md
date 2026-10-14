# TravelAI Deployment Guide

## 🚀 Quick Start Deployment

This guide provides step-by-step instructions to deploy TravelAI using Docker Compose.

## 📋 Prerequisites

- **Docker Desktop** installed ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- Minimum 4GB RAM available
- Ports 5000, 5173, 5432, 6379, 27017, 9200 available

## 🔧 Step 1: Prepare Environment Configuration

### Create `.env` file from template:
```bash
cd e:\SIH207_TravelAI_Advanced_Full_Project
cp .env.example .env
```

### Edit `.env` with your settings:
```bash
# Edit the .env file with your configuration values
# Key variables to set:

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sih207
DB_USER=sih
DB_PASSWORD=sihpassword
DATABASE_URL=postgresql://sih:sihpassword@postgres:5432/sih207

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redispassword
REDIS_URL=redis://:redispassword@redis:6379

# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DB=sih207
MONGODB_URI=mongodb://mongodb:27017/sih207

# Elasticsearch
ELASTICSEARCH_HOST=elasticsearch
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_URL=http://elasticsearch:9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=7d

# API URLs (for Docker)
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
FRONTEND_API_URL=http://backend:5000
FRONTEND_SOCKET_URL=http://backend:5000

# Payment Gateway Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_EMAIL=noreply@travelai.com
SENDER_NAME=TravelAI

# Monitoring
DATADOG_API_KEY=your_datadog_api_key
DATADOG_SITE=datadoghq.com
SENTRY_DSN=your_sentry_dsn

# Admin Credentials
PGADMIN_EMAIL=admin@travelai.com
PGADMIN_PASSWORD=admin123
GRAFANA_PASSWORD=admin123
```

## 🐳 Step 2: Build and Start Services

### Option A: Start All Services
```bash
cd e:\SIH207_TravelAI_Advanced_Full_Project

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option B: Start Only Core Services
```bash
# Start just the database, cache, and API
docker-compose up -d postgres redis backend frontend

# View specific service logs
docker-compose logs -f backend
```

### Option C: Start with Monitoring Stack
```bash
# Start with Datadog, Prometheus, Grafana
docker-compose --profile monitoring up -d

# Access monitoring dashboards:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3000
# - pgAdmin: http://localhost:5050
```

## ✅ Step 3: Verify Deployment

### Check Service Status
```bash
# List all running containers
docker-compose ps

# Check service health
curl http://localhost:5000/health
curl http://localhost:5173/

# Verify database connection
docker-compose exec postgres psql -U sih -d sih207 -c "SELECT COUNT(*) FROM users;"

# Check Redis
docker-compose exec redis redis-cli ping

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Expected Output
```
✓ Backend: http://localhost:5000/health → "Backend is healthy"
✓ Frontend: http://localhost:5173 → React app loads
✓ PostgreSQL: Port 5432 → "sih207" database exists
✓ Redis: Returns PONG
✓ MongoDB: Returns {"ok": 1}
```

## 🌐 Step 4: Access Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend Web** | http://localhost:5173 | N/A |
| **Backend API** | http://localhost:5000 | N/A |
| **API Docs** | http://localhost:5000/api-docs | N/A |
| **pgAdmin** | http://localhost:5050 | admin@travelai.com / admin123 |
| **Prometheus** | http://localhost:9090 | N/A |
| **Grafana** | http://localhost:3000 | admin / admin123 |

## 📊 Step 5: Initialize Database

### Load Initial Data
```bash
# Run database initialization scripts
docker-compose exec -T postgres psql -U sih -d sih207 -f /docker-entrypoint-initdb.d/init.sql

# Seed sample data
docker-compose exec -T backend npm run seed
```

### Create Default Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@travelai.com",
    "password": "Admin@123",
    "role": "admin"
  }'
```

## 🔄 Step 6: Common Operations

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart postgres
```

### Stop Services
```bash
# Stop all services (data preserved)
docker-compose stop

# Stop specific service
docker-compose stop backend

# Stop and remove containers (data preserved in volumes)
docker-compose down

# Clean everything (WARNING: deletes data!)
docker-compose down -v
```

### Scale Services
```bash
# Run multiple instances of backend
docker-compose up -d --scale backend=3

# Load balance traffic between instances
# (Requires additional nginx configuration)
```

## 🔐 Production Deployment

### Security Best Practices

1. **Change All Passwords**
   ```bash
   # Generate strong passwords
   openssl rand -base64 32
   ```

2. **Use Environment Variables**
   - Store sensitive keys in `.env`
   - Never commit `.env` to git
   - Add `.env` to `.gitignore`

3. **SSL/TLS Configuration**
   ```bash
   # Generate self-signed certificate (development)
   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
   ```

4. **Database Backups**
   ```bash
   # Backup PostgreSQL
   docker-compose exec postgres pg_dump -U sih sih207 > backup.sql

   # Restore from backup
   docker-compose exec -T postgres psql -U sih sih207 < backup.sql
   ```

5. **Rate Limiting**
   - Configured in backend/src/middleware/rateLimit.js
   - Adjust limits in .env for your needs

### AWS Deployment

1. **Using ECS (Elastic Container Service)**
   ```bash
   # Push images to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
   docker tag sih207-travel-backend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/sih207-backend:latest
   docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/sih207-backend:latest
   ```

2. **Using RDS for PostgreSQL**
   - Update DATABASE_URL in .env with RDS endpoint
   - Security group should allow port 5432 from ECS

3. **Using ElastiCache for Redis**
   - Update REDIS_URL in .env with ElastiCache endpoint

4. **Using Secrets Manager**
   ```bash
   # Store secrets securely
   aws secretsmanager create-secret --name sih207/db --secret-string file://secrets.json
   ```

### GCP Deployment

1. **Using Cloud Run**
   ```bash
   # Build and push to Artifact Registry
   gcloud builds submit --tag gcr.io/PROJECT_ID/sih207-backend

   # Deploy to Cloud Run
   gcloud run deploy sih207-backend --image gcr.io/PROJECT_ID/sih207-backend --platform managed
   ```

2. **Using Cloud SQL**
   - Connect to Cloud SQL instance from Cloud Run

3. **Using Memorystore for Redis**
   - Update REDIS_URL to Memorystore instance

### Azure Deployment

1. **Using App Service**
   ```bash
   # Create resource group
   az group create --name sih207-rg --location eastus

   # Create App Service plan
   az appservice plan create --name sih207-plan --resource-group sih207-rg --sku B1 --is-linux

   # Deploy container
   az webapp create --name sih207 --resource-group sih207-rg --plan sih207-plan --deployment-container-image-name
   ```

2. **Using Azure Database for PostgreSQL**
3. **Using Azure Cache for Redis**

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Inspect container
docker inspect sih207-backend

# Rebuild container
docker-compose down
docker-compose build --no-cache backend
docker-compose up backend
```

### Database connection error
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Test connection
docker-compose exec postgres psql -U sih -d sih207 -c "SELECT version();"
```

### Port already in use
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port in .env
DB_PORT=5433
REDIS_PORT=6380
```

### Memory issues
```bash
# Increase Docker memory allocation
# Settings → Resources → Memory: 4GB+

# Check memory usage
docker stats
```

## 📈 Performance Optimization

### Caching Strategy
```bash
# Enable Redis caching
CACHE_ENABLED=true
CACHE_TTL=3600

# Monitor cache hits
curl http://localhost:5000/metrics | grep cache
```

### Database Optimization
```bash
# Analyze query performance
docker-compose exec postgres psql -U sih -d sih207 -c "EXPLAIN ANALYZE SELECT * FROM destinations LIMIT 10;"

# Create indexes
docker-compose exec postgres psql -U sih -d sih207 -f /indexes.sql
```

### Load Testing
```bash
# Install Apache Bench
# ab -n 1000 -c 100 http://localhost:5000/api/destinations

# Or use wrk
# wrk -t4 -c100 -d30s http://localhost:5000/api/destinations
```

## 🚨 Monitoring and Alerts

### Access Monitoring Dashboards
- **Prometheus**: http://localhost:9090 (metrics)
- **Grafana**: http://localhost:3000 (dashboards)
- **Datadog**: https://app.datadoghq.com (APM)
- **Sentry**: https://sentry.io (errors)

### Set Up Alerts
```bash
# In Grafana, create alert rules for:
# - High CPU usage (>80%)
# - High memory usage (>85%)
# - Database connection pool exhaustion
# - API error rate (>5%)
# - Response time (>1000ms)
```

## 📝 Maintenance

### Regular Tasks
- Daily: Check logs for errors
- Weekly: Review performance metrics
- Monthly: Database optimization, cleanup
- Quarterly: Security updates, dependency upgrades

### Update Services
```bash
# Update Docker images
docker-compose pull

# Restart with new images
docker-compose up -d

# Verify all services are running
docker-compose ps
```

### Backup Strategy
```bash
# Automated daily backups
0 2 * * * docker-compose exec -T postgres pg_dump -U sih sih207 > /backups/sih207-$(date +\%Y\%m\%d).sql

# Retain last 30 days of backups
find /backups -name "sih207-*.sql" -mtime +30 -delete
```

## 🎯 Next Steps

1. ✅ Prepare environment configuration
2. ✅ Start Docker Compose
3. ✅ Verify all services
4. ✅ Initialize database
5. ✅ Run integration tests
6. ✅ Set up monitoring
7. ✅ Configure backups
8. ✅ Deploy to production

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review documentation: `/docs/API.md`, `/docs/ARCHITECTURE.md`
- Inspect health endpoints: `/health` endpoints on all services

---

**Deployment Guide v1.0**  
Last Updated: September 2, 2026
