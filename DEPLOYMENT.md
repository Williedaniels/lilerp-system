# LILERP Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Cloud Deployment (Recommended)

#### Backend Deployment (Heroku/Railway)
```bash
# 1. Prepare backend for production
cd backend
npm install --production

# 2. Set environment variables
export DATABASE_URL="postgresql://..."
export TWILIO_ACCOUNT_SID="your_sid"
export TWILIO_AUTH_TOKEN="your_token"
export JWT_SECRET="your_secret"

# 3. Deploy to Heroku
heroku create lilerp-backend
git push heroku main
```

#### Frontend Deployment (Vercel/Netlify)
```bash
# 1. Build website
cd frontend/lilerp-website
pnpm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Build mobile app
cd ../../lilerp-mobile
pnpm run build
vercel --prod
```

### Option 2: VPS Deployment

#### Server Requirements
- **OS:** Ubuntu 20.04+ or CentOS 8+
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 20GB SSD
- **CPU:** 2 cores minimum
- **Network:** 100Mbps connection

#### Installation Steps
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 for process management
sudo npm install -g pm2

# 4. Clone and setup project
git clone <repository-url>
cd lilerp-system

# 5. Setup backend
cd backend
npm install --production
pm2 start server.js --name "lilerp-backend"

# 6. Setup nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/lilerp
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend website
    location / {
        root /var/www/lilerp-website/dist;
        try_files $uri $uri/ /index.html;
    }

    # Mobile app
    location /mobile {
        root /var/www/lilerp-mobile/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
# Database
DATABASE_URL=sqlite:./database/lilerp.db
# or for PostgreSQL: postgresql://user:pass@host:5432/lilerp

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=12

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_TWILIO_PHONE=+1234567890

# Analytics (optional)
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
```

## 📱 Twilio IVR Setup

### 1. Create Twilio Account
- Sign up at https://www.twilio.com
- Get Account SID and Auth Token
- Purchase a phone number

### 2. Configure Webhook
```bash
# Set webhook URL in Twilio Console
Webhook URL: https://your-backend-domain.com/api/ivr/voice
HTTP Method: POST
```

### 3. TwiML Application
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="dtmf speech" timeout="10" numDigits="1">
        <Say voice="alice">Welcome to LILERP Emergency Response. Press 1 to report a land dispute, Press 2 if violence is happening, Press 3 to speak with a traditional chief, or Press 4 to exit.</Say>
    </Gather>
    <Redirect>/api/ivr/voice</Redirect>
</Response>
```

## 🗄️ Database Setup

### SQLite (Development)
```bash
# Automatic setup - no additional configuration needed
npm run db:sync
```

### PostgreSQL (Production)
```bash
# 1. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Create database and user
sudo -u postgres psql
CREATE DATABASE lilerp;
CREATE USER lilerp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE lilerp TO lilerp_user;

# 3. Update connection string
DATABASE_URL=postgresql://lilerp_user:secure_password@localhost:5432/lilerp
```

## 🔒 Security Checklist

### SSL/TLS Configuration
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Setup
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Security Headers
```nginx
# Add to nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs lilerp-backend

# Restart application
pm2 restart lilerp-backend
```

### Log Rotation
```bash
# Install logrotate configuration
sudo nano /etc/logrotate.d/lilerp

/var/log/lilerp/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload lilerp-backend
    endscript
}
```

## 🔄 Backup Strategy

### Database Backup
```bash
# SQLite backup
cp database/lilerp.db backups/lilerp-$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump lilerp > backups/lilerp-$(date +%Y%m%d).sql
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/lilerp"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump lilerp > $BACKUP_DIR/db_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/lilerp-system

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Add to crontab: 0 2 * * * /path/to/backup.sh
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
pm2 logs lilerp-backend

# Common fixes
npm install
npm run db:sync
pm2 restart lilerp-backend
```

#### Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Reset database
npm run db:reset
```

#### Twilio Webhook Issues
```bash
# Test webhook locally with ngrok
npm install -g ngrok
ngrok http 3001

# Update Twilio webhook URL to ngrok URL
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_responses_incident_id ON responses(incident_id);
```

#### Nginx Caching
```nginx
# Add to nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📞 Support

For deployment support:
- **Technical Issues:** Check logs and error messages
- **Twilio Setup:** Refer to Twilio documentation
- **Server Configuration:** Consult hosting provider documentation

---

**Note:** This deployment guide assumes basic server administration knowledge. For production deployment, consider hiring a DevOps engineer or using managed services.
