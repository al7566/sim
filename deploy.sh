#!/bin/bash
# Quick deployment script for Sim with payment integrations

set -e

echo "🚀 Deploying Sim with Payment Integrations"
echo "=========================================="

# Check environment
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  echo "Please copy .env.example to .env and configure your payment credentials"
  exit 1
fi

# Load environment
source .env

echo "✅ Environment loaded"

# Check required variables
REQUIRED_VARS=("DATABASE_URL" "BETTER_AUTH_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  fi
done

echo "✅ Required variables present"

# Check payment providers
PAYMENT_PROVIDERS=()
if [ -n "$CLICKBANK_VENDOR_ID" ]; then
  PAYMENT_PROVIDERS+=("ClickBank")
fi
if [ -n "$PAYPAL_CLIENT_ID" ]; then
  PAYMENT_PROVIDERS+=("PayPal")
fi
if [ -n "$STRIPE_SECRET_KEY" ]; then
  PAYMENT_PROVIDERS+=("Stripe")
fi

if [ ${#PAYMENT_PROVIDERS[@]} -eq 0 ]; then
  echo "⚠️  No payment providers configured"
  echo "Add credentials to .env to enable payments"
else
  echo "✅ Payment providers: ${PAYMENT_PROVIDERS[*]}"
fi

# Choose deployment platform
echo ""
echo "Select deployment platform:"
echo "1) Railway"
echo "2) DigitalOcean"
echo "3) Docker (local)"
echo "4) Kubernetes (Helm)"
read -p "Choice (1-4): " choice

case $choice in
  1)
    echo ""
    echo "🚂 Deploying to Railway..."
    if ! command -v railway &> /dev/null; then
      echo "Installing Railway CLI..."
      npm install -g @railway/cli
    fi
    railway login
    railway up
    railway variables set DATABASE_URL="$DATABASE_URL"
    railway variables set BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET"
    
    if [ -n "$CLICKBANK_VENDOR_ID" ]; then
      railway variables set CLICKBANK_VENDOR_ID="$CLICKBANK_VENDOR_ID"
      railway variables set CLICKBANK_SECRET_KEY="$CLICKBANK_SECRET_KEY"
      railway variables set CLICKBANK_API_KEY="$CLICKBANK_API_KEY"
    fi
    
    if [ -n "$PAYPAL_CLIENT_ID" ]; then
      railway variables set PAYPAL_CLIENT_ID="$PAYPAL_CLIENT_ID"
      railway variables set PAYPAL_SECRET="$PAYPAL_SECRET"
      railway variables set PAYPAL_MODE="${PAYPAL_MODE:-live}"
    fi
    
    if [ -n "$STRIPE_SECRET_KEY" ]; then
      railway variables set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
    fi
    
    echo "✅ Deployed to Railway!"
    railway open
    ;;
    
  2)
    echo ""
    echo "🌊 Deploying to DigitalOcean..."
    if ! command -v doctl &> /dev/null; then
      echo "❌ doctl not found. Install from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
      exit 1
    fi
    
    doctl auth init
    doctl apps create --spec deploy/digitalocean/app.yaml
    
    echo "✅ App created! Configure environment variables in DigitalOcean dashboard"
    echo "Required variables:"
    echo "  - BETTER_AUTH_SECRET"
    echo "  - ENCRYPTION_KEY"
    echo "  - CLICKBANK_* (if using ClickBank)"
    echo "  - PAYPAL_* (if using PayPal)"
    echo "  - STRIPE_* (if using Stripe)"
    ;;
    
  3)
    echo ""
    echo "🐳 Building Docker image..."
    docker build -f docker/app.Dockerfile -t sim:latest .
    
    echo "Starting containers..."
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "✅ Running on http://localhost:3000"
    echo "Health check: http://localhost:3000/api/health/ready"
    ;;
    
  4)
    echo ""
    echo "☸️  Deploying to Kubernetes..."
    if ! command -v helm &> /dev/null; then
      echo "❌ Helm not found. Install from: https://helm.sh/docs/intro/install/"
      exit 1
    fi
    
    echo "Creating namespace..."
    kubectl create namespace sim --dry-run=client -o yaml | kubectl apply -f -
    
    echo "Installing with Helm..."
    helm upgrade --install sim ./helm/sim \
      --namespace sim \
      --set app.env.DATABASE_URL="$DATABASE_URL" \
      --set app.env.BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
      --set app.env.CLICKBANK_VENDOR_ID="$CLICKBANK_VENDOR_ID" \
      --set app.env.PAYPAL_CLIENT_ID="$PAYPAL_CLIENT_ID" \
      --wait
    
    echo "✅ Deployed to Kubernetes!"
    kubectl get pods -n sim
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure webhook URLs in your payment provider dashboards:"
echo "   - ClickBank IPN: https://yourdomain.com/api/webhooks/clickbank"
echo "   - PayPal: https://yourdomain.com/api/webhooks/paypal"
echo "   - Stripe: https://yourdomain.com/api/webhooks/stripe"
echo ""
echo "2. Test health endpoints:"
echo "   - Liveness: /api/health/live"
echo "   - Readiness: /api/health/ready"
echo ""
echo "3. Monitor metrics: /metrics"
echo ""
echo "4. Start accepting payments! 💰"
