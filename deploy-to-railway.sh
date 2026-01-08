#!/bin/bash
# ONE-CLICK DEPLOYMENT TO RAILWAY (FREE TIER)
# This script deploys Sim to Railway with all payment integrations ready
# Perfect for making money immediately with PayPal, ClickBank, and Stripe

set -e

echo "🚀 SIM - ONE-CLICK DEPLOYMENT TO PRODUCTION"
echo "==========================================="
echo ""
echo "This will deploy your app to Railway (FREE tier) with:"
echo "  ✅ PayPal payment processing (LIVE mode)"
echo "  ✅ ClickBank affiliate tracking (50% commissions)"
echo "  ✅ Stripe subscriptions"
echo "  ✅ Health checks & monitoring"
echo "  ✅ Auto-recovery & circuit breakers"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Step 1: Login to Railway"
railway login

echo ""
echo "🎯 Step 2: Create or link project"
read -p "Do you have an existing Railway project? (y/n): " has_project

if [ "$has_project" = "y" ]; then
    echo "Linking to existing project..."
    railway link
else
    echo "Creating new project..."
    railway init
fi

echo ""
echo "💳 Step 3: Payment Provider Setup"
echo "=================================="
echo ""
echo "We'll configure your payment providers now."
echo "You can skip any provider and add it later."
echo ""

# Generate secure secrets
echo "🔑 Generating secure secrets..."
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
API_ENCRYPTION_KEY=$(openssl rand -hex 32)
INTERNAL_API_SECRET=$(openssl rand -hex 32)

railway variables set BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET"
railway variables set ENCRYPTION_KEY="$ENCRYPTION_KEY"
railway variables set API_ENCRYPTION_KEY="$API_ENCRYPTION_KEY"
railway variables set INTERNAL_API_SECRET="$INTERNAL_API_SECRET"
railway variables set NODE_ENV="production"

echo "✅ Core secrets configured"
echo ""

# Database
echo "📊 Database Configuration"
read -p "Do you have a PostgreSQL database URL? (y/n): " has_db

if [ "$has_db" = "y" ]; then
    read -p "Enter DATABASE_URL: " db_url
    railway variables set DATABASE_URL="$db_url"
    echo "✅ Database configured"
else
    echo "⚠️  You'll need to add a PostgreSQL database in Railway dashboard"
    echo "   Go to: Project → New → Database → PostgreSQL"
    echo "   Then set DATABASE_URL variable"
fi

echo ""

# PayPal
echo "💙 PayPal Setup (RECOMMENDED - Easiest to start)"
echo "----------------------------------------------"
echo "Get credentials: https://developer.paypal.com/dashboard"
echo ""
read -p "Configure PayPal now? (y/n): " setup_paypal

if [ "$setup_paypal" = "y" ]; then
    read -p "PayPal Client ID: " paypal_client_id
    read -p "PayPal Secret: " paypal_secret
    
    railway variables set PAYPAL_CLIENT_ID="$paypal_client_id"
    railway variables set PAYPAL_SECRET="$paypal_secret"
    railway variables set PAYPAL_MODE="live"
    
    echo "✅ PayPal configured (LIVE mode)"
    echo "   📌 After deployment, set webhook in PayPal dashboard:"
    echo "      https://your-app.railway.app/api/webhooks/paypal"
else
    echo "⏭️  Skipping PayPal (you can add later)"
fi

echo ""

# ClickBank
echo "🟠 ClickBank Setup (BEST for affiliates - 50% commissions!)"
echo "-----------------------------------------------------------"
echo "Get credentials: https://accounts.clickbank.com"
echo ""
read -p "Configure ClickBank now? (y/n): " setup_clickbank

if [ "$setup_clickbank" = "y" ]; then
    read -p "Vendor ID: " cb_vendor
    read -p "Secret Key (for IPN): " cb_secret
    read -p "API Key: " cb_api_key
    
    railway variables set CLICKBANK_VENDOR_ID="$cb_vendor"
    railway variables set CLICKBANK_SECRET_KEY="$cb_secret"
    railway variables set CLICKBANK_API_KEY="$cb_api_key"
    
    echo "✅ ClickBank configured"
    echo "   📌 After deployment, set IPN URL in ClickBank:"
    echo "      https://your-app.railway.app/api/webhooks/clickbank"
else
    echo "⏭️  Skipping ClickBank (you can add later)"
fi

echo ""

# Stripe
echo "💜 Stripe Setup (BEST for subscriptions)"
echo "---------------------------------------"
echo "Get credentials: https://dashboard.stripe.com/apikeys"
echo ""
read -p "Configure Stripe now? (y/n): " setup_stripe

if [ "$setup_stripe" = "y" ]; then
    read -p "Stripe Secret Key (sk_live_...): " stripe_key
    
    railway variables set STRIPE_SECRET_KEY="$stripe_key"
    
    echo "✅ Stripe configured"
    echo "   📌 After deployment, set webhook in Stripe dashboard:"
    echo "      https://your-app.railway.app/api/auth/webhook/stripe"
else
    echo "⏭️  Skipping Stripe (you can add later)"
fi

echo ""
echo "🚀 Step 4: Deploying to Railway..."
echo "==================================="

railway up

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""

# Get the app URL
APP_URL=$(railway status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$APP_URL" ]; then
    APP_URL="<check Railway dashboard>"
fi

echo "🎉 Your app is LIVE at: $APP_URL"
echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo ""

if [ "$setup_paypal" = "y" ]; then
    echo "1️⃣  Configure PayPal Webhook:"
    echo "   - Go to: https://developer.paypal.com/dashboard/webhooks"
    echo "   - Create webhook: $APP_URL/api/webhooks/paypal"
    echo "   - Select ALL events"
    echo "   - Copy Webhook ID and run:"
    echo "     railway variables set PAYPAL_WEBHOOK_ID=<webhook_id>"
    echo ""
fi

if [ "$setup_clickbank" = "y" ]; then
    echo "2️⃣  Configure ClickBank IPN:"
    echo "   - Go to: ClickBank Account → My Site → Advanced Tools"
    echo "   - IPN Version: 6.0"
    echo "   - URL: $APP_URL/api/webhooks/clickbank"
    echo "   - Secret: (your CLICKBANK_SECRET_KEY)"
    echo ""
fi

if [ "$setup_stripe" = "y" ]; then
    echo "3️⃣  Configure Stripe Webhook:"
    echo "   - Go to: https://dashboard.stripe.com/webhooks"
    echo "   - Add endpoint: $APP_URL/api/auth/webhook/stripe"
    echo "   - Events: checkout.session.completed, invoice.payment_succeeded"
    echo ""
fi

echo "4️⃣  Test your deployment:"
echo "   curl $APP_URL/api/health/ready"
echo ""

echo "5️⃣  Open your app:"
railway open

echo ""
echo "💰 START MAKING MONEY!"
echo "====================="
echo ""
echo "Your payment blocks are ready in the workflow builder:"
echo "  ✅ PayPal - 8 operations (orders, subscriptions, refunds)"
echo "  ✅ ClickBank - 5 operations (orders, refunds, products)"
echo "  ✅ Stripe - Full suite (subscriptions, one-time, etc.)"
echo ""
echo "Affiliate tracking is AUTOMATIC:"
echo "  • ClickBank: 50% initial, 40% recurring"
echo "  • PayPal: 30% commission"
echo "  • Stripe: 30% first month"
echo ""
echo "📚 Full guide: See /docs/QUICK_START_SELLING.md"
echo "📚 Deployment: See /DEPLOY_NOW.md"
echo ""
echo "🎊 YOU'RE READY TO SELL! Go build and make money! 💸"
