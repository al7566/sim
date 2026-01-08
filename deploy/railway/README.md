# Railway Deployment Guide for Sim

Deploy Sim to Railway.app with one click.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub account (for connecting repository)

## Quick Deploy

1. **Fork the Repository**
   ```bash
   # Fork simstudioai/sim to your GitHub account
   ```

2. **Create New Railway Project**
   - Go to [railway.app/new](https://railway.app/new)
   - Select "Deploy from GitHub repo"
   - Select your forked repository
   - Railway will auto-detect the Dockerfile

3. **Add Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Configure Environment Variables**
   
   Required:
   ```bash
   # Authentication
   BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>
   BETTER_AUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   
   # Security
   ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
   INTERNAL_API_SECRET=<generate with: openssl rand -hex 32>
   API_ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
   
   # App URL
   NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   ```
   
   Optional Payment Providers:
   ```bash
   # ClickBank
   CLICKBANK_VENDOR_ID=your_vendor_id
   CLICKBANK_SECRET_KEY=your_secret_key
   CLICKBANK_API_KEY=your_api_key
   
   # PayPal
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_SECRET=your_secret
   PAYPAL_MODE=sandbox  # or 'live' for production
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Railway will build and deploy automatically
   - Get your public URL from Railway dashboard

## Health Checks

Railway automatically monitors:
- **Liveness**: `/api/health/live` (checks if app is running)
- **Readiness**: `/api/health/ready` (checks DB connectivity)

## Scaling

To scale horizontally:
1. Go to your service settings
2. Increase "Replicas" count
3. Railway load balances automatically

## Monitoring

View metrics and logs:
- **Logs**: Railway Dashboard → Service → Logs
- **Metrics**: Railway Dashboard → Service → Metrics
- **Prometheus**: Access `/metrics` endpoint for custom monitoring

## Webhooks

Configure webhook URLs in your payment providers:
- **ClickBank IPN**: `https://your-domain.railway.app/api/webhooks/clickbank`
- **PayPal**: `https://your-domain.railway.app/api/webhooks/paypal`
- **Stripe**: Configure in Stripe Dashboard

## Troubleshooting

**Build fails?**
- Check Dockerfile path is correct
- Ensure all dependencies are in package.json

**Health check fails?**
- Verify DATABASE_URL is set
- Check logs for database connection errors

**App crashes on startup?**
- Ensure all required env vars are set
- Check memory limits (Railway provides 512MB-8GB)

## Cost Optimization

Railway pricing:
- **Hobby**: $5/month base + usage
- **Pro**: $20/month base + usage

Tips:
- Use single replica for development
- Scale up for production traffic
- Monitor metrics to optimize resources

## Support

- Railway Docs: https://docs.railway.app
- Sim Docs: https://docs.sim.ai
- Issues: https://github.com/simstudioai/sim/issues
