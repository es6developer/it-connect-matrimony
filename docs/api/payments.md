# Payments & Subscriptions API

Endpoints prefixed with: `/api/v1/payments` and `/api/v1/subscriptions`

Supports Razorpay and Stripe payment gateways.

---

## Payment Plans

### GET /subscriptions/plans

Get available subscription plans (public, no auth required).

#### Success Response (200)
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Free",
      "type": "free",
      "price": 0,
      "currency": "INR",
      "durationDays": null,
      "features": ["Basic search", "View profiles", "Send 5 interests per day"]
    },
    {
      "id": 2,
      "name": "Basic",
      "type": "basic",
      "price": 499,
      "currency": "INR",
      "durationDays": 30,
      "features": ["Unlimited interests", "Chat access", "Photo upload"]
    },
    {
      "id": 3,
      "name": "Premium",
      "type": "premium",
      "price": 999,
      "currency": "INR",
      "durationDays": 30,
      "features": ["All Basic features", "Priority support", "Profile badge", "Advanced filters"]
    },
    {
      "id": 4,
      "name": "VIP",
      "type": "vip",
      "price": 2499,
      "currency": "INR",
      "durationDays": 30,
      "features": ["All Premium features", "Relationship manager", "Profile boost", "Incognito mode"]
    }
  ]
}
```

## My Subscription

### GET /subscriptions/my

Get the current user's active subscription.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Subscription retrieved",
  "data": {
    "id": 1,
    "planType": "premium",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "autoRenew": true
  }
}
```

## Create Subscription

### POST /subscriptions/create

Create a new subscription order.

#### Request Body
```json
{
  "planType": "premium",
  "paymentGateway": "razorpay",
  "couponCode": "WELCOME50"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planType` | string | Yes | `basic`, `premium`, `vip` |
| `paymentGateway` | string | Yes | `razorpay` or `stripe` |
| `couponCode` | string | No | Optional coupon code |

#### Success Response (201)
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "orderId": "order_E5x4Gx4Jx4Jx4J",
    "amount": 99900,
    "currency": "INR",
    "gateway": "razorpay"
  }
}
```

## Payment Operations

### POST /payments/create-order

Create a one-time payment order (for subscriptions or other purchases).

#### Request Body
```json
{
  "amount": 99900,
  "currency": "INR",
  "description": "Premium Plan - 1 Month"
}
```

Amount is in smallest currency unit (paise for INR, cents for USD).

### POST /payments/verify

Verify a payment after successful completion on the client side.

#### Request Body
```json
{
  "gateway": "razorpay",
  "paymentId": "pay_E5x4Gx4Jx4Jx4J",
  "orderId": "order_E5x4Gx4Jx4Jx4J",
  "signature": "e5x4gx4jx4jx4j..."
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### POST /payments/webhook/:gateway

Webhook endpoint called by payment gateways for async events.

- **Gateway**: `razorpay` or `stripe`
- **Headers**: Gateway-specific signature headers for verification
  - Razorpay: `x-razorpay-signature`
  - Stripe: `stripe-signature`

### GET /payments/:id

Get payment details.

### POST /payments/:id/refund

Request a refund for a payment.

#### Request Body
```json
{
  "reason": "Did not find suitable matches"
}
```

## Subscription Management

### POST /subscriptions/cancel
Cancel auto-renewal of current subscription.

### POST /subscriptions/upgrade
Upgrade to a higher plan. Remaining days on current plan are prorated.

#### Request Body
```json
{
  "newPlanType": "vip"
}
```

### GET /subscriptions/history
Get payment history (paginated).

---

## Coupons

### POST /coupons/validate
Validate a coupon code before applying to subscription.

#### Request Body
```json
{
  "code": "WELCOME50"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "code": "WELCOME50",
    "discountType": "percentage",
    "discountValue": 50,
    "maxDiscount": 50000,
    "description": "50% off on all plans (max ₹500)"
  }
}
```

---

## Client-Side Integration

### Razorpay
```javascript
const options = {
  key: process.env.RAZORPAY_KEY_ID,
  amount: 99900,
  currency: 'INR',
  name: 'IT Connect Matrimony',
  description: 'Premium Plan - 1 Month',
  order_id: orderId,
  handler: function (response) {
    fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway: 'razorpay',
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      }),
    });
  },
  prefill: { email: user.email, contact: user.phone },
  theme: { color: '#6366f1' },
};
const rzp = new Razorpay(options);
rzp.open();
```

### Stripe
```javascript
const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
const { error } = await stripe.redirectToCheckout({
  sessionId: sessionId,
});
```

### Webhook Events

| Event | Gateway | Description |
|-------|---------|-------------|
| `payment.captured` | Razorpay | Payment successful |
| `payment.failed` | Razorpay | Payment failed |
| `checkout.session.completed` | Stripe | Payment successful |
| `checkout.session.expired` | Stripe | Session expired |
| `invoice.paid` | Stripe | Invoice paid (subscription) |
| `customer.subscription.updated` | Stripe | Subscription status change |
