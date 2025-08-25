import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RefreshRequest {
  idempotency_key: string;
  device_id: string;
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
    const { idempotency_key, device_id }: RefreshRequest = await req.json()
    
    if (!idempotency_key || !device_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check rate limiting (10 requests per minute per user)
    const rateLimitKey = `refresh_rate_limit:${user.id}`
    const rateLimitCount = await supabase
      .from('hp_ledger')
      .select('id')
      .eq('user_id', user.id)
      .eq('reason', 'refresh_quote')
      .gte('created_at', new Date(Date.now() - 60000).toISOString())
      .count()

    if (rateLimitCount.count && rateLimitCount.count >= 10) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user can refresh (has enough HP or is premium)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, hp_balance')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const canRefresh = profile.is_premium || profile.hp_balance >= 10
    if (!canRefresh) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient HP balance',
        required_hp: 10,
        current_hp: profile.hp_balance
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Start transaction
    const { data: quote, error: quoteError } = await supabase
      .rpc('get_random_quote')

    if (quoteError) {
      return new Response(JSON.stringify({ error: 'Failed to get quote' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Deduct HP if not premium
    if (!profile.is_premium) {
      const { error: ledgerError } = await supabase
        .from('hp_ledger')
        .insert({
          user_id: user.id,
          delta: -10,
          reason: 'refresh_quote',
          meta: { 
            idempotency_key,
            device_id,
            quote_id: quote.id 
          }
        })

      if (ledgerError) {
        return new Response(JSON.stringify({ error: 'Failed to update HP balance' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else {
      // Premium users get refunded immediately
      const { error: refundError } = await supabase
        .from('hp_ledger')
        .insert({
          user_id: user.id,
          delta: 10,
          reason: 'premium_unlimited',
          meta: { 
            idempotency_key,
            device_id,
            quote_id: quote.id,
            original_cost: 10
          }
        })

      if (refundError) {
        console.error('Refund error:', refundError)
        // Continue anyway, this is not critical
      }
    }

    return new Response(JSON.stringify({
      success: true,
      quote: quote.text,
      author: quote.author,
      cost_hp: profile.is_premium ? 0 : 10,
      remaining_hp: profile.is_premium ? profile.hp_balance : profile.hp_balance - 10,
      is_premium: profile.is_premium
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in hp-refresh:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
