# Affiliate Tracker App

A complete multi-provider affiliate tracking and commission management system integrated with ClickBank, PayPal, and Stripe.

## Features

- **Multi-Provider Support**: Track commissions from ClickBank, PayPal, and Stripe
- **Real-time Tracking**: Webhook-based instant affiliate credit
- **Commission Management**: Configurable commission rates and tiers
- **Referral Links**: Generate unique tracking links for affiliates
- **Dashboard**: Affiliate performance analytics and earnings
- **Payout Management**: Automated commission payouts
- **Fraud Detection**: Duplicate sale detection and validation

## Setup

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/affiliate

# Payment Providers
CLICKBANK_VENDOR_ID=your_vendor_id
CLICKBANK_SECRET_KEY=your_secret_key
CLICKBANK_API_KEY=your_api_key

PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PAYPAL_MODE=live

STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App Config
NEXT_PUBLIC_APP_URL=https://yourdomain.com
AFFILIATE_COMMISSION_RATE=0.30  # 30% default
```

### Database Schema

The app uses the following tables:
- `affiliates` - Affiliate user accounts
- `referrals` - Tracked referral links and conversions
- `commissions` - Commission records
- `payouts` - Payout history

### Webhook Configuration

Configure these webhook URLs in your payment providers:

**ClickBank IPN**: `https://yourdomain.com/api/webhooks/clickbank`
**PayPal**: `https://yourdomain.com/api/webhooks/paypal`  
**Stripe**: `https://yourdomain.com/api/webhooks/stripe`

## Usage

### For Affiliates

1. Sign up at `/affiliate/signup`
2. Get your unique referral link
3. Share with customers
4. Track earnings in dashboard
5. Request payouts when minimum reached

### For Merchants

1. Configure commission rates
2. Approve affiliate applications
3. Monitor affiliate performance
4. Process payouts
5. View analytics

## API Endpoints

### Affiliate Management
- `POST /api/affiliate/register` - Register new affiliate
- `GET /api/affiliate/stats` - Get affiliate statistics
- `POST /api/affiliate/payout` - Request payout

### Tracking
- `GET /api/track/:affiliateId` - Track referral click
- `POST /api/track/conversion` - Track conversion
- `GET /api/track/commissions` - Get commission history

### Webhooks
- `POST /api/webhooks/clickbank` - ClickBank IPN
- `POST /api/webhooks/paypal` - PayPal webhooks
- `POST /api/webhooks/stripe` - Stripe webhooks

## Commission Calculation

### ClickBank
- Initial sale: 50% commission
- Recurring: 40% commission
- Upgrades: 30% commission

### PayPal
- One-time payments: 30% commission
- Subscriptions: 25% first month, 20% recurring

### Stripe
- Configurable per product
- Default: 30% commission

## Deployment

### Railway
```bash
railway up
```

### DigitalOcean
```bash
doctl apps create --spec .do/app.yaml
```

### Docker
```bash
docker build -t affiliate-tracker .
docker run -p 3001:3001 affiliate-tracker
```

## Fraud Prevention

- IP-based duplicate detection
- Cookie tracking
- Sale validation against payment provider
- Manual review queue for suspicious activity

## Reporting

- Real-time earnings dashboard
- Monthly commission reports
- Payout history
- Top performers leaderboard
- Conversion funnel analytics

## Support

For issues or questions:
- Documentation: https://docs.sim.ai/affiliate
- Email: support@sim.ai
- Discord: https://discord.gg/sim
