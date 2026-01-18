---
id: ST-INDEX
tags: [stripe, payments]
---

# Stripe Patterns

## ST-001: Client Initialization

```typescript
// server/utils/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})
```

## ST-002: Checkout Session

```typescript
// server/api/checkout.post.ts
export default defineEventHandler(async (event) => {
  const { priceId, userId } = await readBody(event)
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { userId }
  })
  
  return { url: session.url }
})
```

## ST-003: Webhook Handler

```typescript
// server/api/webhooks/stripe.post.ts
export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')!
  
  let stripeEvent: Stripe.Event
  
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    throw createError({ statusCode: 400, message: 'Invalid signature' })
  }
  
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      // Handle
      break
    case 'customer.subscription.deleted':
      // Handle
      break
  }
  
  return { received: true }
})
```

## ST-004: Customer Portal

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${baseUrl}/account`
})
```
