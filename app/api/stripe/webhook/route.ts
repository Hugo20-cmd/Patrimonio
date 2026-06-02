import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia' as any,
});

// Need the admin client to bypass RLS in the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
);

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.client_reference_id) {
          const userId = session.client_reference_id;
          const isPaid = session.payment_status === 'paid';
          
          if (isPaid) {
            await supabaseAdmin.from('subscriptions').upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'active',
            });

            // Fetch user info for email
            const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
            
            // Create in-app notification
            await supabaseAdmin.from('notifications').insert({
              user_id: userId,
              title: 'Premium Desbloqueado! 👑',
              message: 'Seu pagamento foi confirmado. Aproveite todos os recursos do Patrimônio+ Premium!',
              type: 'achievement'
            });

            if (user?.user?.email) {
              const { sendPremiumConfirmationEmail } = await import('@/app/actions/emails');
              await sendPremiumConfirmationEmail(user.user.email, user.user.user_metadata?.name || 'Investidor');
            }

            // Referral Program: Give 1000 XP to the referrer
            const { data: profile } = await supabaseAdmin.from('profiles').select('referred_by').eq('id', userId).single();
            if (profile?.referred_by) {
               const { data: referrerProfile } = await supabaseAdmin.from('profiles').select('xp, level, xp_to_next_level').eq('id', profile.referred_by).single();
               if (referrerProfile) {
                 let newXp = (referrerProfile.xp || 0) + 1000;
                 let newLevel = referrerProfile.level || 1;
                 let newXpToNext = referrerProfile.xp_to_next_level || 1000;

                 while (newXp >= newXpToNext) {
                   newLevel += 1;
                   newXp -= newXpToNext;
                   newXpToNext = Math.floor(newXpToNext * 1.5);
                 }

                 await supabaseAdmin.from('profiles').update({
                   xp: newXp,
                   level: newLevel,
                   xp_to_next_level: newXpToNext
                 }).eq('id', profile.referred_by);

                 await supabaseAdmin.from('notifications').insert({
                   user_id: profile.referred_by,
                   title: 'Indicação Convertida! 🎉',
                   message: 'Um amigo que você indicou acabou de assinar o Premium! Você ganhou 1000 XP.',
                   type: 'achievement'
                 });
               }
            }
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { data: updatedSub } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
          .select('user_id')
          .single();

        if (updatedSub?.user_id) {
          const userId = updatedSub.user_id;

          // Downgrade to Free plan
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'Free' })
            .eq('id', userId);

          // Add notification
          await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            title: 'Plano Atualizado para Free 📉',
            message: 'Sua assinatura foi cancelada. O limite de 5 ativos foi aplicado e os ativos excedentes foram ocultados.',
            type: 'system'
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Database Error in Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
