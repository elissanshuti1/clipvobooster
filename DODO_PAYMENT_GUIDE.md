# Dodo Payment Integration Guide

## Overview
This document explains the complete Dodo payment integration for ClipVoBooster.

## Environment Variables (.env.local)

All Dodo payment configuration is stored in `.env.local`:

```bash
# Dodo Payments
DODO_API_KEY="yCZ2oFe0je-W0Tix.fStNeKOl_IrMu9wwrivD-bIUorxIwPcbzgOUZdO6ssKpZRX9"
DODO_MODE="test"  # Change to "live" when going to production

# Dodo Product IDs (Test Mode) - Already configured
DODO_STARTER_PRODUCT_ID_TEST="pdt_0Naglkoy66o9YGMhjFbaP"
DODO_PROFESSIONAL_PRODUCT_ID_TEST="pdt_0NagmtRCZteBajyGB1idi"
DODO_LIFETIME_PRODUCT_ID_TEST="pdt_0NagnIlqlWiT1x1ByWQPg"

# Dodo Product IDs (Live Mode) - Replace when going live
DODO_STARTER_PRODUCT_ID_LIVE="pdt_live_starter_here"
DODO_PROFESSIONAL_PRODUCT_ID_LIVE="pdt_live_professional_here"
DODO_LIFETIME_PRODUCT_ID_LIVE="pdt_live_lifetime_here"

# Dodo Redirect URLs
DODO_REDIRECT_URL_SUCCESS="https://clipvo.site/payment/success"
DODO_REDIRECT_URL_CANCEL="https://clipvo.site/pricing"
```

**Note:** No webhook secret is required. The webhook endpoint accepts all notifications without signature verification.

## Pricing Plans

### Starter - $15/month
- Product ID (Test): `pdt_0Naglkoy66o9YGMhjFbaP`
- 100 emails/month
- Unlimited AI generation
- Open & click tracking
- Basic analytics

### Professional - $29/month
- Product ID (Test): `pdt_0NagmtRCZteBajyGB1idi`
- 500 emails/month
- Everything in Starter
- Advanced analytics
- Custom templates
- Priority support
- Remove branding

### Lifetime - $60 (one-time)
- Product ID (Test): `pdt_0NagnIlqlWiT1x1ByWQPg`
- Unlimited emails
- All Pro features
- Lifetime access
- VIP support

## API Routes

### 1. Create Checkout Session
**Endpoint:** `POST /api/payment/dodo/create`

**Request:**
```json
{
  "plan": "starter"  // or "professional" or "lifetime"
}
```

**Response:**
```json
{
  "checkoutId": "chk_1234567890_abc123",
  "checkoutUrl": "https://test.checkout.dodopayments.com/buy/pdt_...?quantity=1&redirect_url=...&client_reference_id=...",
  "plan": {
    "name": "Starter",
    "price": 15,
    "interval": "month"
  }
}
```

### 2. Payment Callback
**Endpoint:** `GET /api/payment/dodo/callback`

Dodo redirects users here after payment. Parameters:
- `client_reference_id`: Checkout ID
- `status`: "success" or "failure"

### 3. Webhook
**Endpoint:** `POST /api/payment/dodo/webhook`

Dodo sends webhook notifications for payment events:
- `checkout.completed`
- `checkout.failed`
- `checkout.expired`

### 4. Get Subscription
**Endpoint:** `GET /api/payment/subscription`

Returns current user's subscription status.

### 5. Verify Payment
**Endpoint:** `POST /api/payment/verify`

Verifies payment on the success page.

## User Flow

1. **User visits pricing page** (`/pricing`)
   - If not logged in → redirected to login
   - If already subscribed → redirected to dashboard

2. **User clicks "Get Started" on a plan**
   - Creates checkout session via `/api/payment/dodo/create`
   - Redirects to Dodo checkout URL

3. **User completes payment on Dodo**
   - Dodo redirects to `/api/payment/dodo/callback`
   - Subscription is activated in database
   - User is redirected to `/payment/success`

4. **Payment verification page**
   - Verifies payment with anti-tamper protection
   - Shows success message
   - Auto-redirects to dashboard after 3 seconds

5. **User accesses dashboard**
   - Plan badge appears in sidebar
   - Plan badge appears in top navigation bar
   - Full access to all features

## Security Features

### Anti-Tamper Protection
The payment success page includes:
- DevTools detection
- Console debugger detection
- DOM manipulation detection
- Element visibility monitoring
- Session invalidation on tamper detection

### Middleware Protection
- Unpaid users are redirected to pricing page
- Paid users cannot access pricing page (redirected to dashboard)
- Subscription status is tracked via secure cookies

### Database Collections

**users** collection - subscription field:
```javascript
{
  subscription: {
    plan: "starter",  // or "professional" or "lifetime"
    planName: "Starter",
    price: 15,
    interval: "month",  // or "one-time"
    status: "active",
    startDate: ISODate("2026-03-17T..."),
    checkoutId: "chk_..."
  }
}
```

**checkouts** collection - tracks all checkout sessions:
```javascript
{
  checkoutId: "chk_...",
  userId: "...",
  userEmail: "user@example.com",
  plan: "starter",
  planDetails: { name: "Starter", price: 15, interval: "month" },
  productId: "pdt_...",
  status: "completed",  // or "pending", "failed", "expired"
  createdAt: ISODate("..."),
  expiresAt: ISODate("..."),
  completedAt: ISODate("...")
}
```

## Testing

### Test Mode (Current)
1. Set `DODO_MODE="test"` in `.env.local`
2. Use test product IDs (already configured)
3. Access pricing at `http://localhost:3000/pricing`
4. Complete test payment on Dodo's test checkout
5. Verify subscription appears in dashboard

### Live Mode (Production)
1. Replace live product IDs in `.env.local`
2. Set `DODO_MODE="live"`
3. Update redirect URLs to production URLs
4. Configure webhook URL in Dodo dashboard: `https://clipvo.site/api/payment/dodo/webhook`

## Dodo Dashboard Setup

1. **Webhook Configuration:**
   - URL: `https://clipvo.site/api/payment/dodo/webhook`
   - Events: `checkout.completed`, `checkout.failed`, `checkout.expired`
   - Secret: Copy to `DODO_WEBHOOK_SECRET`

2. **Redirect URLs:**
   - Success: `https://clipvo.site/payment/success`
   - Cancel: `https://clipvo.site/pricing`

## Files Created/Modified

### New Files:
- `/app/api/payment/dodo/create/route.ts` - Create checkout session
- `/app/api/payment/dodo/callback/route.ts` - Handle Dodo callback
- `/app/api/payment/dodo/webhook/route.ts` - Handle webhooks
- `/app/api/payment/subscription/route.ts` - Get subscription status
- `/app/api/payment/verify/route.ts` - Verify payment
- `/app/payment/success/page.tsx` - Payment success page with anti-tamper

### Modified Files:
- `/app/pricing/page.tsx` - Updated with Dodo integration
- `/middleware.ts` - Added subscription-based routing
- `/app/dashboard/layout.tsx` - Added plan badges
- `/app/api/auth/me/route.ts` - Added subscription cookie
- `/app/api/auth/login/route.ts` - Added subscription cookie
- `/app/api/auth/signup/route.ts` - Added subscription cookie
- `/.env.local` - Added Dodo configuration

## Switching from Test to Live

When ready to go live:

1. **Update `.env.local`:**
   ```bash
   DODO_MODE="live"
   DODO_STARTER_PRODUCT_ID_LIVE="pdt_live_your_actual_id"
   DODO_PROFESSIONAL_PRODUCT_ID_LIVE="pdt_live_your_actual_id"
   DODO_LIFETIME_PRODUCT_ID_LIVE="pdt_live_your_actual_id"
   DODO_PUBLIC_KEY_LIVE="pk_live_your_key"
   DODO_SECRET_KEY_LIVE="sk_live_your_secret"
   ```

2. **Update Dodo Dashboard:**
   - Set live redirect URLs
   - Configure webhook with live endpoint

3. **Restart the application**

## Support

For issues or questions:
- Check Dodo documentation: https://docs.dodopayments.com
- Review webhook logs in Dodo dashboard
- Check application logs for payment errors
