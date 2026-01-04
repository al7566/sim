# DigitalOcean App Platform Deployment Guide

Deploy Sim to DigitalOcean App Platform with managed PostgreSQL.

## Prerequisites

- DigitalOcean account
- `doctl` CLI tool (optional, for CLI deployment)
- GitHub account

## Deploy via UI

1. **Create App**
   - Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Select "GitHub" as source
   - Authorize and select `simstudioai/sim` repository

2. **Configure Build**
   - Dockerfile: `docker/app.Dockerfile`
   - HTTP Port: `3000`
   - Health Check: `/api/health/ready`

3. **Add Database**
   - Click "Add Resource" → "Database"
   - Select "PostgreSQL 16"
   - Choose cluster size (Dev: $15/mo, Basic: $25/mo, Pro: $50/mo+)
   - DigitalOcean auto-configures `DATABASE_URL`

4. **Set Environment Variables**
   ```bash
   # Required - Generate these
   BETTER_AUTH_SECRET=<openssl rand -hex 32>
   ENCRYPTION_KEY=<openssl rand -hex 32>
   INTERNAL_API_SECRET=<openssl rand -hex 32>
   API_ENCRYPTION_KEY=<openssl rand -hex 32>
   
   # Auto-configured
   BETTER_AUTH_URL=${APP_URL}
   NEXT_PUBLIC_APP_URL=${APP_URL}
   DATABASE_URL=${db.DATABASE_URL}
   
   # Payment providers (optional)
   CLICKBANK_VENDOR_ID=...
   CLICKBANK_SECRET_KEY=...
   CLICKBANK_API_KEY=...
   PAYPAL_CLIENT_ID=...
   PAYPAL_SECRET=...
   PAYPAL_MODE=live
   STRIPE_SECRET_KEY=...
   ```

5. **Deploy**
   - Click "Create Resources"
   - DigitalOcean builds and deploys
   - Access via: `https://your-app.ondigitalocean.app`

## Deploy via CLI

```bash
# Install doctl
brew install doctl  # macOS
# OR
snap install doctl  # Linux

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec deploy/digitalocean/app.yaml

# Set secrets
doctl apps update <app-id> --spec deploy/digitalocean/app.yaml

# Deploy
doctl apps create-deployment <app-id>
```

## Scaling

### Vertical Scaling
Change instance size in App Platform:
- **basic-xxs**: $5/mo (512MB RAM, 1 vCPU)
- **basic-xs**: $12/mo (1GB RAM, 1 vCPU)
- **professional-xs**: $25/mo (2GB RAM, 2 vCPU)
- **professional-s**: $50/mo (4GB RAM, 2 vCPU)

### Horizontal Scaling
```yaml
services:
  - name: app
    instance_count: 3  # Scale to 3 replicas
```

Load balancing is automatic.

## Monitoring

### Built-in Metrics
- CPU/Memory usage
- Request rate
- Response time
- Error rate

Access via: App Platform → Insights

### Custom Metrics
- Prometheus endpoint: `/metrics`
- Integrate with Grafana Cloud or managed Prometheus

### Logs
```bash
# View logs
doctl apps logs <app-id> --type run

# Follow logs
doctl apps logs <app-id> --follow
```

## Database Management

### Backups
- Automatic daily backups (retained 7 days)
- Point-in-time recovery available

### Connection
```bash
# Get connection details
doctl databases connection <db-id>

# Connect via psql
psql "postgresql://user:pass@host:port/db?sslmode=require"
```

## SSL/HTTPS

Automatic SSL certificates via Let's Encrypt:
- Enabled by default
- Auto-renewal
- Force HTTPS redirects

## Custom Domain

1. Add domain in App Platform settings
2. Update DNS:
   ```
   CNAME @ your-app.ondigitalocean.app
   ```
3. SSL certificate auto-provisions

## Webhooks

Configure in payment providers:
- **ClickBank IPN**: `https://yourdomain.com/api/webhooks/clickbank`
- **PayPal**: `https://yourdomain.com/api/webhooks/paypal`
- **Stripe**: Configure via Stripe Dashboard

## Troubleshooting

**Build fails?**
- Check `docker/app.Dockerfile` exists
- Verify build logs in App Platform

**Database connection fails?**
- Verify `DATABASE_URL` is set
- Check database is in same region as app

**Health check fails?**
- Verify `/api/health/ready` responds 200
- Check app logs for errors

## Cost Estimate

Minimum production setup:
- App (professional-xs): $25/mo
- Database (Basic 1GB): $15/mo
- **Total**: $40/mo

High availability setup:
- App (professional-s × 3): $150/mo
- Database (Professional 4GB): $60/mo
- **Total**: $210/mo

## Support

- DigitalOcean Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community/
- Sim Docs: https://docs.sim.ai
