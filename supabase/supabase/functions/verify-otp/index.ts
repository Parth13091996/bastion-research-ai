import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: 'Phone number and OTP are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing one or more required environment variables.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const otpHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(otp))
    const hashArray = Array.from(new Uint8Array(otpHash))
    const hashedOtp = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('phone_number', phone)
      .eq('otp_hash', hashedOtp)
      .gte('created_at', fiveMinutesAgo)
      .single()

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Invalid or expired OTP.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Delete the OTP record after successful verification
    await supabase.from('otp_verifications').delete().eq('id', data.id)

    return new Response(JSON.stringify({ success: true, message: "OTP verified successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
