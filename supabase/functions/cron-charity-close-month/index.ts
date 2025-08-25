import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Verify cron secret (only allow from Supabase cron)
    const cronSecret = req.headers.get('x-cron-secret')
    const expectedSecret = Deno.env.get('CRON_SECRET')
    
    if (!cronSecret || cronSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current month
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthString = currentMonth.toISOString().split('T')[0].substring(0, 7) // YYYY-MM

    // Check if month is already closed
    const existingPayout = await supabase
      .from('charity_payouts')
      .select('id')
      .eq('month', monthString + '-01')
      .single()

    if (existingPayout.data) {
      return new Response(JSON.stringify({ 
        message: 'Month already closed',
        month: monthString,
        existing_payout: existingPayout.data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate net revenue for the month
    const monthStart = monthString + '-01'
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    // Get subscription revenue
    const { data: subscriptionRevenue, error: subError } = await supabase
      .from('payments')
      .select('net_cents')
      .eq('kind', 'subscription')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)

    if (subError) {
      console.error('Error getting subscription revenue:', subError)
      return new Response(JSON.stringify({ error: 'Failed to get subscription revenue' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get IAP revenue
    const { data: iapRevenue, error: iapError } = await supabase
      .from('payments')
      .select('net_cents')
      .eq('kind', 'iap_points')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)

    if (iapError) {
      console.error('Error getting IAP revenue:', iapError)
      return new Response(JSON.stringify({ error: 'Failed to get IAP revenue' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get ad revenue
    const { data: adRevenue, error: adError } = await supabase
      .from('payments')
      .select('net_cents')
      .eq('kind', 'ad')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)

    if (adError) {
      console.error('Error getting ad revenue:', adError)
      return new Response(JSON.stringify({ error: 'Failed to get ad revenue' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate totals
    const subscriptionTotal = subscriptionRevenue?.reduce((sum, payment) => sum + payment.net_cents, 0) || 0
    const iapTotal = iapRevenue?.reduce((sum, payment) => sum + payment.net_cents, 0) || 0
    const adTotal = adRevenue?.reduce((sum, payment) => sum + payment.net_cents, 0) || 0

    const totalNetRevenue = subscriptionTotal + iapTotal + adTotal

    // Get charity share percentage from environment
    const charitySharePercent = parseFloat(Deno.env.get('CHARITY_SHARE') || '0.5')
    const charityShareCents = Math.round(totalNetRevenue * charitySharePercent)

    // Create charity payout record
    const { data: payout, error: payoutError } = await supabase
      .from('charity_payouts')
      .insert({
        month: monthString + '-01',
        net_cents: totalNetRevenue,
        charity_share_cents: charityShareCents,
        tx_ref: `monthly_${monthString}_${Date.now()}`
      })
      .select()
      .single()

    if (payoutError) {
      console.error('Error creating charity payout:', payoutError)
      return new Response(JSON.stringify({ error: 'Failed to create charity payout' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log the monthly summary
    console.log(`Month ${monthString} closed:`, {
      subscription_revenue: subscriptionTotal,
      iap_revenue: iapTotal,
      ad_revenue: adTotal,
      total_net: totalNetRevenue,
      charity_share: charityShareCents,
      charity_percentage: charitySharePercent * 100
    })

    return new Response(JSON.stringify({
      success: true,
      month: monthString,
      summary: {
        subscription_revenue_cents: subscriptionTotal,
        iap_revenue_cents: iapTotal,
        ad_revenue_cents: adTotal,
        total_net_cents: totalNetRevenue,
        charity_share_cents: charityShareCents,
        charity_percentage: charitySharePercent * 100
      },
      payout_id: payout.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in cron-charity-close-month:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
