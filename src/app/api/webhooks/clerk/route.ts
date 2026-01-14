import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get Clerk webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  // Handle user creation
  if (eventType === 'user.created') {
    const { id } = evt.data
    
    // Initialize user with free plan
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
      if (!convexUrl) {
        console.error('NEXT_PUBLIC_CONVEX_URL not set')
        return NextResponse.json({ success: false }, { status: 500 })
      }

      // Call Convex to initialize user
      // Note: You'll need to expose this as an HTTP action
      await fetch(`${convexUrl}/updatePlan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: id,
          plan: 'free'
        })
      })

      console.log(`User ${id} initialized with free plan`)
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }

  // Handle subscription updates (when using Clerk's billing)
  if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
    // This will be triggered by Clerk's billing system
    console.log('Subscription event:', evt.data)
    // You'll need to extract the plan info from evt.data based on Clerk's response
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
