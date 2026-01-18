---
skill: stripe
triggers: ["**/stripe/**", "**/payment/**", "**/billing/**"]
---

# Stripe

## Server-side (Nitro)

```typescript
// server/utils/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})
```

## Checkout Session

```typescript
// server/api/checkout/create.post.ts
export default defineEventHandler(async (event) => {
  const { priceId } = await readBody(event)
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
  })

  return { url: session.url }
})
```

## Webhooks

```typescript
// server/api/webhooks/stripe.post.ts
export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')!
  
  const webhookEvent = stripe.webhooks.constructEvent(
    body!,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  switch (webhookEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(webhookEvent.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(webhookEvent.data.object)
      break
  }

  return { received: true }
})
```

## Rules

1. Stripe SDK only on server
2. Validate webhooks with signature
3. Never expose secret key
4. Use Price IDs, not hardcoded values
