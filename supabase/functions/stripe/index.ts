
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { stripe } from './stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (getUserError || !user) {
      throw new Error('Invalid user token')
    }

    const { data: existingSubscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

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

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'App Subscription',
              description: 'Access to all features',
            },
            unit_amount: 500, // ₹5 in paise
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('Origin')}/`,
      cancel_url: `${req.headers.get('Origin')}/subscribe`,
    })

    // Create or update subscription record
    if (!existingSubscription) {
      await supabaseClient.from('subscriptions').insert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        status: 'incomplete',
      })
    }

    return new Response(
      JSON.stringify({ sessionUrl: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
