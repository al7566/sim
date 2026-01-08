# Quick Start: Selling Apps and Making Money with Sim

## 🚀 Get Started in 15 Minutes

### Step 1: Add Payment Provider Credentials

Edit your `.env` file:

```bash
# Choose one or more providers:

# ClickBank - Best for digital products (50% commissions!)
CLICKBANK_VENDOR_ID=your_vendor
CLICKBANK_SECRET_KEY=your_secret
CLICKBANK_API_KEY=your_api_key

# PayPal - Instant setup, global reach
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PAYPAL_MODE=live

# Stripe - Best for SaaS subscriptions
STRIPE_SECRET_KEY=sk_live_...
```

### Step 2: Deploy Your App

Run the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

Choose your platform:
1. **Railway** - Easiest, one-click deploy
2. **DigitalOcean** - More control, $40/mo
3. **Docker** - Local testing
4. **Kubernetes** - Enterprise scale

### Step 3: Configure Webhooks

Go to your payment provider dashboard and add these webhook URLs:

- **ClickBank IPN**: `https://yourdomain.com/api/webhooks/clickbank`
- **PayPal Webhooks**: `https://yourdomain.com/api/webhooks/paypal`  
- **Stripe Webhooks**: `https://yourdomain.com/api/webhooks/stripe`

### Step 4: Start Selling!

Your payment blocks are now live in the workflow builder:
- ClickBank block (5 operations)
- PayPal block (8 operations)
- Stripe block (full suite)

## 💰 Monetization Options

### Option 1: Sell Workflow Templates
- Create useful workflows
- Add payment block at start
- Charge $27-$97 one-time
- **Example**: SEO Audit Tool, Email Automation, Data Scraper

### Option 2: SaaS Subscription
- Build app with workflows
- Use Stripe/PayPal subscriptions
- Charge $29-$99/month
- **Example**: AI Content Generator, Social Media Scheduler

### Option 3: Affiliate Marketing
- Enable affiliate tracking (automatic!)
- Recruit affiliates
- Pay 30-50% commissions
- **Example**: Course platform, Digital products

## 📊 Track Your Revenue

### View Dashboard
```bash
# Revenue metrics
curl https://yourdomain.com/api/analytics/revenue

# Affiliate stats
curl https://yourdomain.com/api/affiliate/leaderboard
```

### Monitor Health
- Liveness: `/api/health/live`
- Readiness: `/api/health/ready`
- Metrics: `/metrics` (Prometheus format)

## 🎯 Affiliate System

### Automatic Tracking

All sales automatically track affiliates:

**ClickBank**: Uses `ctransaffiliate` field (50% commission)
**PayPal**: Uses `custom_id` with `aff_CODE` format (30%)
**Stripe**: Uses `metadata.affiliate_code` (30%)

### Affiliate URLs

```
https://yourapp.com/product?ref=AFFILIATE-CODE
```

Commissions are automatically:
- ✅ Tracked on sale
- ✅ Calculated by provider
- ✅ Stored in database
- ✅ Ready for payout

## 🔥 Examples

### Example 1: $97 One-Time Service

```yaml
Product: SEO Audit Report
Provider: PayPal
Price: $97
Commission: 30%

Workflow:
1. Customer pays via PayPal
2. Webhook triggers workflow
3. AI analyzes their website  
4. PDF report emailed
5. Affiliate gets $29.10
```

### Example 2: $29/mo SaaS

```yaml
Product: AI Content Writer
Provider: Stripe
Price: $29/month
Commission: 30% first month

Workflow:
1. User subscribes via Stripe
2. Account created
3. API access granted
4. Monthly billing automatic
5. Affiliate gets $8.70 one-time
```

### Example 3: $497 Course (Affiliates)

```yaml
Product: Complete AI Course
Provider: ClickBank
Price: $497
Commission: 50%

Workflow:
1. Affiliate shares link
2. Customer purchases
3. Course access granted
4. Affiliate gets $248.50
5. Recurring upsells = more commissions
```

## 🛠️ Technical Setup

### Health Checks (for K8s/Railway)

```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 30

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 10
```

### Circuit Breakers (auto-recovery)

```typescript
import { withCircuitBreaker } from '@/lib/core/resilience/circuit-breaker'

await withCircuitBreaker('paypal-api', async () => {
  return await createPayPalOrder(params)
})
```

### Retry Logic (exponential backoff)

```typescript
import { withRetry } from '@/lib/core/resilience/retry'

await withRetry(async () => {
  return await capturePayment(orderId)
}, {
  maxAttempts: 3,
  initialDelay: 1000
})
```

## 📈 Revenue Optimization

### Pricing Tiers

**One-Time**:
- Entry: $7-$27
- Standard: $47-$97
- Premium: $197-$497

**Subscriptions**:
- Basic: $9-$29/mo
- Pro: $49-$99/mo
- Enterprise: $199+/mo

### Conversion Tips
1. Add social proof (sales counter)
2. Offer money-back guarantee
3. Use urgency (limited time)
4. Provide value ladder (upsells)

## 🆘 Troubleshooting

### Payment Not Working?

```bash
# Check logs
tail -f /var/log/sim/payments.log

# Test webhook
curl -X POST https://yourdomain.com/api/webhooks/clickbank \
  -H "Content-Type: application/x-www-form-urlencoded"

# Verify credentials
echo $CLICKBANK_API_KEY
echo $PAYPAL_CLIENT_ID
```

### Affiliate Not Tracked?

1. Check URL has `?ref=CODE`
2. Verify affiliate status is "active"
3. Review webhook logs
4. Test with sandbox first

## 🎉 You're Ready!

**Next Steps**:
1. ✅ Deploy with `./deploy.sh`
2. ✅ Add webhook URLs to providers
3. ✅ Create your first paid workflow
4. ✅ Share and start earning!

**Need Help?**
- Discord: https://discord.gg/sim
- Docs: https://docs.sim.ai
- Email: support@sim.ai

## 💡 Pro Tips

- Start with PayPal (easiest setup)
- Test in sandbox mode first
- Use ClickBank for affiliate sales
- Use Stripe for subscriptions
- Track everything with `/metrics`
- Set affiliate commission at 40-50%
- Offer recurring products for passive income
- Build email list for upsells

**Now go make money! 💰**
