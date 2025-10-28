# LILERP - Deployment Guide

**Version**: 1.0  
**Date**: October 27, 2025

---

## Overview

This guide provides step-by-step instructions for deploying the LILERP system to production. The deployment strategy uses modern cloud platforms for ease of setup and scalability.

---

## Deployment Architecture

The LILERP system consists of three main components:

1. **Backend API** (Node.js/Express)
2. **Frontend Website** (React/Vite)
3. **Mobile App** (Progressive Web App)

---

## Option 1: Quick Deployment (Recommended for Assignment)

### Backend Deployment to Railway

Railway provides a simple deployment process with automatic database provisioning.

1. **Create Railway Account**:
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to backend directory
   cd backend
   
   # Initialize Railway project
   railway init
   
   # Add PostgreSQL database
   railway add postgresql
   
   # Deploy
   railway up
   ```

3. **Configure Environment Variables**:
   - Go to Railway dashboard
   - Add environment variables from `.env` file
   - Note the backend URL (e.g., `https://your-app.railway.app`)

### Frontend Deployment to Vercel

Vercel offers seamless deployment for React applications.

1. **Create Vercel Account**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend Website**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Navigate to frontend directory
   cd frontend/lilerp-website
   
   # Deploy
   vercel
   
   # Follow prompts to configure project
   ```

3. **Update API URL**:
   - In `src/lib/config.js`, update `API_URL` to your Railway backend URL
   - Redeploy: `vercel --prod`

### Mobile App Deployment

The mobile app is a Progressive Web App (PWA) and can be deployed alongside the frontend.

1. **Deploy to Vercel**:
   ```bash
   cd lilerp-mobile
   vercel
   ```

2. **Generate APK (Optional)**:
   ```bash
   # Install Capacitor
   npm install @capacitor/core @capacitor/cli
   
   # Initialize Capacitor
   npx cap init
   
   # Add Android platform
   npx cap add android
   
   # Build and sync
   npm run build
   npx cap sync
   
   # Open in Android Studio
   npx cap open android
   
   # Build APK in Android Studio
   ```

---

## Option 2: Full Production Deployment

### Backend Deployment to AWS EC2

For a more robust production setup, deploy to AWS EC2 with RDS PostgreSQL.

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t2.medium or higher
   - Configure security groups (ports 22, 80, 443, 3001)

2. **Set Up Server**:
   ```bash
   # SSH into server
   ssh ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL client
   sudo apt install -y postgresql-client
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

3. **Deploy Application**:
   ```bash
   # Clone repository
   git clone [your-repo-url]
   cd lilerp-system/backend
   
   # Install dependencies
   npm install --production
   
   # Set up environment variables
   nano .env
   
   # Start with PM2
   pm2 start server.js --name lilerp-backend
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/lilerp
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/lilerp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Set Up SSL with Let's Encrypt**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Database Setup (AWS RDS)

1. **Create RDS PostgreSQL Instance**:
   - Go to AWS RDS console
   - Create PostgreSQL database
   - Note connection details

2. **Update Backend Configuration**:
   - Update `.env` with RDS connection details
   - Restart backend: `pm2 restart lilerp-backend`

### Frontend Deployment to CloudFront + S3

1. **Build Frontend**:
   ```bash
   cd frontend/lilerp-website
   npm run build
   ```

2. **Create S3 Bucket**:
   - Create bucket in AWS S3
   - Enable static website hosting
   - Upload `dist/` contents

3. **Set Up CloudFront**:
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom domain and SSL

---

## Option 3: Mobile App Package (APK)

### Using Capacitor

1. **Install Capacitor**:
   ```bash
   cd lilerp-mobile
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init
   # App name: LILERP
   # Package ID: com.lilerp.app
   ```

3. **Add Android Platform**:
   ```bash
   npx cap add android
   ```

4. **Build and Sync**:
   ```bash
   npm run build
   npx cap sync
   ```

5. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

6. **Build APK**:
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be in `android/app/build/outputs/apk/debug/`

### Using Cordova (Alternative)

1. **Install Cordova**:
   ```bash
   npm install -g cordova
   ```

2. **Create Cordova Project**:
   ```bash
   cordova create lilerp-cordova com.lilerp.app LILERP
   cd lilerp-cordova
   ```

3. **Add Android Platform**:
   ```bash
   cordova platform add android
   ```

4. **Copy Build Files**:
   ```bash
   # Copy your built app to www/ directory
   cp -r ../lilerp-mobile/dist/* www/
   ```

5. **Build APK**:
   ```bash
   cordova build android
   ```

---

## Post-Deployment Checklist

- [ ] Backend API is accessible and responding
- [ ] Frontend website loads correctly
- [ ] Mobile app connects to backend
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Monitoring set up (optional)
- [ ] Backup strategy in place (optional)

---

## Testing Deployed Application

1. **Test Backend API**:
   ```bash
   curl https://your-backend-url/health
   ```

2. **Test Frontend**:
   - Open browser and navigate to frontend URL
   - Test user registration and login
   - Test report submission

3. **Test Mobile App**:
   - Open mobile app URL on phone
   - Test all core functionalities
   - Verify offline mode (if applicable)

---

## Deployment URLs (To be filled after deployment)

- **Backend API**: `https://your-backend-url.railway.app`
- **Frontend Website**: `https://your-frontend-url.vercel.app`
- **Mobile App**: `https://your-mobile-url.vercel.app`
- **APK Download**: `https://your-storage-url/lilerp.apk`

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting  
**Solution**: Check logs with `railway logs` or `pm2 logs lilerp-backend`

**Problem**: Database connection error  
**Solution**: Verify database credentials in environment variables

### Frontend Issues

**Problem**: API calls failing  
**Solution**: Ensure `API_URL` in config matches backend URL

**Problem**: CORS errors  
**Solution**: Add frontend URL to CORS whitelist in backend

### Mobile App Issues

**Problem**: APK not installing  
**Solution**: Enable "Install from Unknown Sources" in Android settings

**Problem**: App not connecting to backend  
**Solution**: Verify API URL in mobile app configuration

---

## Support

For deployment assistance, contact:
- **Email**: williedaniels@example.com
- **GitHub Issues**: [repository-url]/issues

---

**Deployment completed successfully!** 🎉

