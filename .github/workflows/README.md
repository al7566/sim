# GitHub Actions Workflows

## Automated Deployment

### `deploy-production.yml` - Railway Deployment

Automatically deploys the Sim platform to Railway with all payment integrations configured.

#### Required Repository Secrets

Set these in **Settings → Secrets and variables → Actions → Repository secrets**:

**Railway:**
- `RAILWAY_TOKEN` - Railway API token (get from https://railway.app/account/tokens)
- `RAILWAY_PROJECT_ID` (optional) - Existing project ID

**Core Application:**
- `BETTER_AUTH_SECRET` - Auth secret (auto-generated if not provided)
- `ENCRYPTION_KEY` - Encryption key (auto-generated if not provided)
- `API_ENCRYPTION_KEY` - API encryption key (auto-generated if not provided)
- `DATABASE_URL` - PostgreSQL connection string (Railway provides this automatically)

**Payment Providers (all optional):**

**PayPal:**
- `PAYPAL_CLIENT_ID` - From https://developer.paypal.com/dashboard
- `PAYPAL_SECRET` - PayPal REST API secret
- `PAYPAL_MODE` - Set to `live` for production (default: `live`)

**ClickBank:**
- `CLICKBANK_VENDOR_ID` - Your ClickBank vendor ID
- `CLICKBANK_SECRET_KEY` - IPN secret key
- `CLICKBANK_API_KEY` - ClickBank API key
- `CLICKBANK_CLERK_KEY` - ClickBank clerk key (optional)

**Stripe:**
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

#### How to Deploy

**Option 1: Automatic (on merge to main)**
```bash
# Deployment triggers automatically when you merge to main branch
git checkout main
git merge your-branch
git push origin main
```

**Option 2: Manual Trigger**
1. Go to **Actions** tab in GitHub
2. Select **Deploy to Production (Railway)**
3. Click **Run workflow**
4. Choose environment (production/staging)
5. Click **Run workflow**

#### After Deployment

1. **Get your deployment URL** from the workflow logs or Railway dashboard
2. **Configure webhooks** in payment provider dashboards:
   - ClickBank IPN: `https://your-app.railway.app/api/webhooks/clickbank`
   - PayPal: `https://your-app.railway.app/api/webhooks/paypal`
   - Stripe: `https://your-app.railway.app/api/webhooks/stripe`

#### Webhook Configuration

**ClickBank:**
1. Go to https://accounts.clickbank.com
2. Navigate to **Vendor Settings → My Site → Advanced Tools**
3. Enter IPN URL: `https://your-app.railway.app/api/webhooks/clickbank`
4. Save settings

**PayPal:**
1. Go to https://developer.paypal.com/dashboard
2. Select your app
3. Navigate to **Webhooks**
4. Add webhook: `https://your-app.railway.app/api/webhooks/paypal`
5. Subscribe to all event types

**Stripe:**
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-app.railway.app/api/webhooks/stripe`
3. Select events to listen to (subscription created, payment succeeded, etc.)
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` repository secret

#### Monitoring

- **Health Checks:** `/api/health/live` and `/api/health/ready`
- **Metrics:** `/metrics` (Prometheus format)
- **Railway Dashboard:** https://railway.app/dashboard

#### Troubleshooting

**Deployment fails:**
- Verify all required secrets are set correctly
- Check Railway token is valid
- Review workflow logs for specific errors

**Payment provider not working:**
- Verify credentials are set in repository secrets
- Check webhook URLs are configured correctly
- Review application logs in Railway dashboard

**Database connection issues:**
- Ensure DATABASE_URL is set
- Railway should provide PostgreSQL automatically
- Check database is provisioned in Railway project

#### Cost Optimization

Railway offers:
- **FREE tier:** $5 credit/month (good for development/testing)
- **Hobby plan:** $5/month + usage (recommended for production)
- **Pro plan:** $20/month + usage (for scaling)

Monitor usage in Railway dashboard to avoid unexpected charges.
