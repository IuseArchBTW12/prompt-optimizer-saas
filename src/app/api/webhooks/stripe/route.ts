import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId || session.client_reference_id

        if (!userId) {
          console.error('No userId found in session')
          break
        }

        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Determine plan based on price ID
        const priceId = subscription.items.data[0].price.id
        let plan = 'free'
        
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
          plan = 'starter'
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
          plan = 'pro'
        }

        // Update user plan in Convex
        await convex.mutation(api.prompts.updatePlan, {
          userId,
          plan,
        })

        console.log(`Updated user ${userId} to ${plan} plan`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId found in subscription')
          break
        }

        // Check if subscription is active
        if (subscription.status === 'active') {
          const priceId = subscription.items.data[0].price.id
          let plan = 'free'
          
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
            plan = 'starter'
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
            plan = 'pro'
          }

          await convex.mutation(api.prompts.updatePlan, {
            userId,
            plan,
          })

          console.log(`Updated user ${userId} to ${plan} plan`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId found in subscription')
          break
        }

        // Downgrade to free plan
        await convex.mutation(api.prompts.updatePlan, {
          userId,
          plan: 'free',
        })

        console.log(`Downgraded user ${userId} to free plan`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook event:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
