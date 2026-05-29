import { NextResponse } from 'next/server';
import { syncPluggyItem } from '@/app/actions/pluggy';
import { createClient } from '@supabase/supabase-js'; // We need admin client here

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Webhook shape: { event: 'item/updated', itemId: 'uuid', ... }
    const { event, itemId, id, error } = body;

    console.log(`[Pluggy Webhook] Received ${event} for item ${itemId}`);

    if (event === 'item/updated' || event === 'item/created') {
      // Sync assets from Pluggy to our DB
      await syncPluggyItem(itemId);
    } 
    else if (event === 'item/error' || event === 'item/deleted') {
      // Admin bypass to update status without user session
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // fallback if service key missing
      );
      
      const newStatus = event === 'item/deleted' ? 'DELETED' : 'ERROR';
      
      await supabaseAdmin
        .from('pluggy_items')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('pluggy_item_id', itemId);
        
      if (event === 'item/deleted') {
        // Delete item completely
        await supabaseAdmin
          .from('pluggy_items')
          .delete()
          .eq('pluggy_item_id', itemId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Pluggy Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
