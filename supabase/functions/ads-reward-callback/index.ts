import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RewardCallbackRequest {
  server_verification_id: string;
  device_id: string;
  ad_network: 'admob' | 'applovin' | 'ironsource';
  ecpm_cents?: number;
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
    const { server_verification_id, device_id, ad_network, ecpm_cents }: RewardCallbackRequest = await req.json()
    
    if (!server_verification_id || !device_id || !ad_network) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check rate limiting (5 rewarded videos per hour per user)
    const rateLimitCount = await supabase
      .from('hp_ledger')
      .select('id')
      .eq('user_id', user.id)
      .eq('reason', 'rewarded_video')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .count()

    if (rateLimitCount.count && rateLimitCount.count >= 5) {
      return new Response(JSON.stringify({ error: 'Daily reward limit reached' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify server verification ID (this would normally verify with ad network)
    // For now, we'll do basic validation
    if (!server_verification_id.startsWith('reward_') || server_verification_id.length < 20) {
      return new Response(JSON.stringify({ error: 'Invalid verification ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if this verification ID was already used
    const existingReward = await supabase
      .from('hp_ledger')
      .select('id')
      .eq('user_id', user.id)
      .eq('reason', 'rewarded_video')
      .eq('meta->>server_verification_id', server_verification_id)
      .single()

    if (existingReward.data) {
      return new Response(JSON.stringify({ error: 'Reward already claimed' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Award 5 HP for watching rewarded video
    const { error: ledgerError } = await supabase
      .from('hp_ledger')
      .insert({
        user_id: user.id,
        delta: 5,
        reason: 'rewarded_video',
        meta: { 
          server_verification_id,
          device_id,
          ad_network,
          ecpm_cents: ecpm_cents || 0
        }
      })

    if (ledgerError) {
      return new Response(JSON.stringify({ error: 'Failed to award HP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log ad revenue (aggregated daily)
    const today = new Date().toISOString().split('T')[0]
    const ecpmShare = ecpm_cents || 50 // Default 50 cents per 1000 impressions
    
    // Check if we already have a payment record for today
    const existingPayment = await supabase
      .from('payments')
      .select('id')
      .eq('kind', 'ad')
      .eq('provider', ad_network)
      .gte('created_at', today)
      .single()

    if (!existingPayment.data) {
      // Create new daily payment record
      await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          kind: 'ad',
          gross_cents: ecpmShare,
          fee_cents: 0, // No fees for ad revenue
          net_cents: ecpmShare,
          provider: ad_network,
          provider_ref: `daily_${today}_${ad_network}`
        })
    }

    return new Response(JSON.stringify({
      success: true,
      hp_awarded: 5,
      new_balance: await getUpdatedBalance(supabase, user.id),
      message: 'Thank you for watching! You earned 5 HP.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in ads-reward-callback:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getUpdatedBalance(supabase: any, userId: string): Promise<number> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('hp_balance')
    .eq('id', userId)
    .single()
  
  return profile?.hp_balance || 0
}
