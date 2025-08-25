import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IAPVerificationRequest {
  receipt_data: string;
  platform: 'ios' | 'android' | 'stripe';
  product_id: string;
  device_id: string;
  transaction_id?: string;
}

interface HPackage {
  product_id: string;
  hp_amount: number;
  price_cents: number;
}

const HP_PACKAGES: Record<string, HPackage> = {
  'hp_200': { product_id: 'hp_200', hp_amount: 200, price_cents: 199 },
  'hp_1200': { product_id: 'hp_1200', hp_amount: 1200, price_cents: 999 },
  'hp_3500': { product_id: 'hp_3500', hp_amount: 3500, price_cents: 1999 },
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { receipt_data, platform, product_id, device_id, transaction_id }: IAPVerificationRequest = await req.json()
    
    if (!receipt_data || !platform || !product_id || !device_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate product ID
    const hpPackage = HP_PACKAGES[product_id]
    if (!hpPackage) {
      return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if this transaction was already processed
    if (transaction_id) {
      const existingTransaction = await supabase
        .from('hp_ledger')
        .select('id')
        .eq('user_id', user.id)
        .eq('reason', 'iap_purchase')
        .eq('meta->>transaction_id', transaction_id)
        .single()

      if (existingTransaction.data) {
        return new Response(JSON.stringify({ error: 'Transaction already processed' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Verify receipt based on platform
    let verificationResult = false
    let verificationDetails = {}

    switch (platform) {
      case 'ios':
        verificationResult = await verifyIOSReceipt(receipt_data, product_id)
        break
      case 'android':
        verificationResult = await verifyAndroidReceipt(receipt_data, product_id)
        break
      case 'stripe':
        verificationResult = await verifyStripePayment(receipt_data, product_id)
        break
      default:
        return new Response(JSON.stringify({ error: 'Unsupported platform' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    if (!verificationResult) {
      return new Response(JSON.stringify({ error: 'Receipt verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Award HP to user
    const { error: ledgerError } = await supabase
      .from('hp_ledger')
      .insert({
        user_id: user.id,
        delta: hpPackage.hp_amount,
        reason: 'iap_purchase',
        meta: { 
          product_id,
          platform,
          device_id,
          transaction_id,
          receipt_data: receipt_data.substring(0, 100), // Store partial receipt for audit
          verification_details: verificationDetails
        }
      })

    if (ledgerError) {
      return new Response(JSON.stringify({ error: 'Failed to award HP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Record payment
    const feeRate = 0.15 // 15% platform fee
    const feeCents = Math.round(hpPackage.price_cents * feeRate)
    const netCents = hpPackage.price_cents - feeCents

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        kind: 'iap_points',
        gross_cents: hpPackage.price_cents,
        fee_cents: feeCents,
        net_cents: netCents,
        provider: platform,
        provider_ref: transaction_id || `manual_${Date.now()}`
      })

    if (paymentError) {
      console.error('Payment recording error:', paymentError)
      // Continue anyway, this is not critical
    }

    return new Response(JSON.stringify({
      success: true,
      hp_awarded: hpPackage.hp_amount,
      new_balance: await getUpdatedBalance(supabase, user.id),
      message: `Successfully purchased ${hpPackage.hp_amount} HP!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in iap-points-verify:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function verifyIOSReceipt(receiptData: string, productId: string): Promise<boolean> {
  // In production, this would verify with Apple's servers
  // For now, we'll do basic validation
  const appleSharedSecret = Deno.env.get('IAP_APPLE_SHARED_SECRET')
  
  if (!appleSharedSecret) {
    console.warn('Apple shared secret not configured, skipping verification')
    return true // Allow in development
  }

  // Basic receipt format validation
  return receiptData.length > 100 && receiptData.includes('receipt')
}

async function verifyAndroidReceipt(receiptData: string, productId: string): Promise<boolean> {
  // In production, this would verify with Google Play
  // For now, we'll do basic validation
  const googleServiceAccount = Deno.env.get('IAP_GOOGLE_SERVICE_ACCOUNT')
  
  if (!googleServiceAccount) {
    console.warn('Google service account not configured, skipping verification')
    return true // Allow in development
  }

  // Basic receipt format validation
  return receiptData.length > 100 && receiptData.includes('purchaseToken')
}

async function verifyStripePayment(paymentIntentId: string, productId: string): Promise<boolean> {
  // In production, this would verify with Stripe
  const stripeSecret = Deno.env.get('STRIPE_SECRET')
  
  if (!stripeSecret) {
    console.warn('Stripe secret not configured, skipping verification')
    return true // Allow in development
  }

  // Basic payment intent format validation
  return paymentIntentId.startsWith('pi_') && paymentIntentId.length > 20
}

async function getUpdatedBalance(supabase: any, userId: string): Promise<number> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('hp_balance')
    .eq('id', userId)
    .single()
  
  return profile?.hp_balance || 0
}
