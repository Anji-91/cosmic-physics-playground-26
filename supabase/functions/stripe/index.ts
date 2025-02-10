
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { stripe } from './stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user data
    const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (getUserError || !user) {
      console.error('Auth error:', getUserError)
      throw new Error('Invalid user token')
    }

    // Check for existing subscription
    const { data: existingSubscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (subError) {
      console.error('Subscription check error:', subError)
      throw new Error('Failed to check subscription status')
    }

    if (existingSubscription?.status === 'active') {
      return new Response(
        JSON.stringify({ message: 'Already subscribed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create or get Stripe customer
    let stripeCustomerId = existingSubscription?.stripe_customer_id
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      stripeCustomerId = customer.id
    }

    // Create Stripe Checkout session with one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Full Access',
              description: 'One-time payment for full access to all features',
            },
            unit_amount: 500, // ₹5 in paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('Origin')}/`,
      cancel_url: `${req.headers.get('Origin')}/subscribe`,
    })

    // Create or update subscription record
    if (!existingSubscription) {
      const { error: insertError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          status: 'incomplete',
        })

      if (insertError) {
        console.error('Insert subscription error:', insertError)
        throw new Error('Failed to create subscription record')
      }
    }

    return new Response(
      JSON.stringify({ sessionUrl: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Stripe function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
