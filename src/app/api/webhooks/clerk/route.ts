import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'

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
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  try {
    // Handle user creation - initialize with free plan
    if (eventType === 'user.created') {
      const { id } = evt.data
      
      await convex.mutation(api.prompts.updatePlan, {
        userId: id,
        plan: 'free'
      })

      console.log(`User ${id} initialized with free plan`)
    }

    // Handle subscription events from Clerk billing
    if (eventType === 'user.updated') {
      const { id, public_metadata } = evt.data as any
      
      // Check if plan info is in public metadata
      if (public_metadata?.plan) {
        const plan = public_metadata.plan as string
        
        await convex.mutation(api.prompts.updatePlan, {
          userId: id,
          plan: plan
        })

        console.log(`User ${id} plan updated to ${plan}`)
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
