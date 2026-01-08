# 🚀 Deploy to Production NOW - Make Money Today!

## ⚡ FASTEST PATH: Railway (Free Plan)

### Step 1: Get Payment Credentials (5 minutes)

#### PayPal (EASIEST - Start Here!)
1. Go to https://developer.paypal.com/dashboard
2. Create App → Get Client ID & Secret
3. Switch to LIVE mode (toggle in dashboard)
4. Note your credentials

#### ClickBank (Best Commissions - 50%!)
1. Sign up at https://clickbank.com
2. Get Vendor ID from Account Settings
3. Create API Keys in API section
4. Set IPN URL (we'll do this after deploy)

#### Stripe (For Subscriptions)
1. Go to https://dashboard.stripe.com
2. Get API Keys → Copy Live Secret Key

### Step 2: Deploy to Railway (2 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to project
railway link

# Set environment variables
railway variables set BETTER_AUTH_SECRET=$(openssl rand -hex 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)
railway variables set API_ENCRYPTION_KEY=$(openssl rand -hex 32)
railway variables set INTERNAL_API_SECRET=$(openssl rand -hex 32)

# PayPal (LIVE MODE)
railway variables set PAYPAL_CLIENT_ID=<your_client_id>
railway variables set PAYPAL_SECRET=<your_secret>
railway variables set PAYPAL_MODE=live

# ClickBank
railway variables set CLICKBANK_VENDOR_ID=<your_vendor>
railway variables set CLICKBANK_SECRET_KEY=<your_secret>
railway variables set CLICKBANK_API_KEY=<your_api_key>

# Stripe (optional)
railway variables set STRIPE_SECRET_KEY=sk_live_...

# Deploy!
railway up
```

### Step 3: Get Your App URL
```bash
# Railway will give you a URL like: https://sim-production.up.railway.app
railway open
```

### Step 4: Configure Webhooks (3 minutes)

#### PayPal Webhooks
1. Go to https://developer.paypal.com/dashboard/webhooks
2. Create Webhook
3. URL: `https://your-railway-url.up.railway.app/api/webhooks/paypal`
4. Select ALL events
5. Save → Note the Webhook ID
6. Add webhook ID: `railway variables set PAYPAL_WEBHOOK_ID=<webhook_id>`

#### ClickBank IPN
1. Go to ClickBank Account Settings
2. My Site → IPN Version 6.0
3. URL: `https://your-railway-url.up.railway.app/api/webhooks/clickbank`
4. Secret Key: (use your CLICKBANK_SECRET_KEY)

#### Stripe Webhooks (if using)
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint
3. URL: `https://your-railway-url.up.railway.app/api/auth/webhook/stripe`
4. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`

### Step 5: START MAKING MONEY! 💰

Your app is LIVE! Payment blocks are ready in workflow builder:
- ✅ ClickBank (5 operations)
- ✅ PayPal (8 operations)
- ✅ Stripe (full suite)

## 🎯 Create Your First Paid Workflow

### Option 1: Simple Service ($27-$97)
```
1. Add PayPal "Create Order" block
   - Amount: 47.00
   - Currency: USD
   - Description: "SEO Audit Report"
   
2. Add your service blocks (AI, scraping, etc.)

3. Add Email block to send results

4. Share workflow URL → Get paid!
```

### Option 2: SaaS Subscription ($29/mo)
```
1. Add Stripe "Create Subscription" block
   - Plan: Create in Stripe Dashboard
   - Price: $29/month
   
2. Grant API access to customer

3. Monthly recurring revenue!
```

### Option 3: Affiliate Product ($497, pay 50%)
```
1. Add ClickBank "Create Order" block
   - Product ID: Your product
   - Affiliate tracking: Automatic!
   
2. Recruit affiliates

3. They promote, you both profit!
```

## 📊 Monitor Your Revenue

```bash
# Health check
curl https://your-app.railway.app/api/health/ready

# View metrics
curl https://your-app.railway.app/metrics

# Check Railway logs
railway logs
```

## 🔥 AFFILIATE COMMISSIONS (Automatic!)

Every sale automatically tracks affiliates:

### ClickBank
- **50%** on first sale
- **40%** on recurring
- Tracked via `ctransaffiliate` parameter
- Share: `https://your-product.hop.clickbank.net/?aff=AFFILIATE-CODE`

### PayPal  
- **30%** commission
- Tracked via `?ref=AFFILIATE-CODE`
- Share: `https://your-app.railway.app/product?ref=CODE`

### Stripe
- **30%** first month
- Tracked via metadata
- Built into checkout flow

## 💡 QUICK WIN IDEAS

### 1. SEO Audit Tool ($47)
- PayPal payment
- AI analyzes website
- Email PDF report
- **Profit: $47 per sale**

### 2. Social Media Manager ($29/mo)
- Stripe subscription
- Auto-post to platforms
- Content calendar
- **Profit: $29/month per user**

### 3. Course Platform ($297 + affiliates)
- ClickBank payment
- 50% to affiliates
- Evergreen revenue
- **Profit: $148.50 per sale + affiliates selling**

## 🆘 Troubleshooting

### Payments not working?
```bash
# Check environment variables
railway variables

# Test webhook
curl -X POST https://your-app.railway.app/api/health/ready

# View logs
railway logs --tail
```

### Need help?
- Check `/docs/QUICK_START_SELLING.md`
- Railway docs: https://docs.railway.app
- PayPal docs: https://developer.paypal.com
- ClickBank docs: https://support.clickbank.com

## 📈 Scale Up

Railway free tier includes:
- ✅ 500 hours/month (free forever)
- ✅ 1GB RAM
- ✅ Shared CPU
- ✅ Custom domain

Upgrade when profitable:
- **$5/mo**: More resources
- **$20/mo**: Dedicated resources
- **$50/mo**: High performance

## 🎉 YOU'RE LIVE!

**What's ready:**
- ✅ Payment processing (PayPal, ClickBank, Stripe)
- ✅ Affiliate tracking (automatic commissions)
- ✅ Health monitoring (Kubernetes-ready)
- ✅ Circuit breakers (auto-recovery)
- ✅ Metrics (Prometheus compatible)

**Start selling NOW!**
1. Payment blocks are in workflow builder
2. Share workflow URLs
3. Collect money instantly
4. Affiliates earn automatically

**Your first dollar is one workflow away! 💰**

---

## Alternative: DigitalOcean ($12/mo)

If you prefer DigitalOcean:

```bash
# Install doctl
brew install doctl  # or apt-get install doctl

# Auth
doctl auth init

# Create app
doctl apps create --spec deploy/digitalocean/app.yaml

# Set variables in DO dashboard
# Deploy URL will be: https://sim-<random>.ondigitalocean.app
```

## Alternative: Docker (Local Testing)

```bash
# Copy environment
cp apps/sim/.env.example apps/sim/.env

# Edit .env with your credentials

# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Access at http://localhost:3000
```

---

**NOW GO MAKE MONEY! 🚀💰**
