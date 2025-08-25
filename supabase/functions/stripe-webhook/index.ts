import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get Stripe signature header
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get request body
    const body = await req.text()
    
    // Initialize Stripe
    const stripeSecret = Deno.env.get('STRIPE_SECRET')
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET not configured')
    }
    
    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured')
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in stripe-webhook:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await syncSubscription(subscription, supabase)
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await syncSubscription(subscription, supabase)
    
    // Record payment
    await recordPayment(invoice, supabase)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  await syncSubscription(subscription, supabase)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  await syncSubscription(subscription, supabase)
}

async function syncSubscription(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id
  
  if (!customerId || !priceId) {
    console.error('Missing customer ID or price ID in subscription')
    return
  }

  // Get user ID from customer ID (you might need to store this mapping)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  // Update or insert subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: profile.id,
      provider: 'stripe',
      status: subscription.status,
      current_period_end: currentPeriodEnd.toISOString(),
      price_id: priceId,
      updated_at: new Date().toISOString()
    })

  if (subError) {
    console.error('Error updating subscription:', subError)
    return
  }

  // Update profile premium status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      is_premium: isActive,
      premium_since: isActive ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
  }
}

async function recordPayment(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string
  const amount = invoice.amount_paid
  const fee = invoice.application_fee_amount || 0
  
  // Get user ID from customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  // Record payment
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: profile.id,
      kind: 'subscription',
      gross_cents: amount,
      fee_cents: fee,
      net_cents: amount - fee,
      provider: 'stripe',
      provider_ref: invoice.id
    })

  if (paymentError) {
    console.error('Error recording payment:', paymentError)
  }
}
