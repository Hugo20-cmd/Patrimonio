import { PluggyClient } from 'pluggy-sdk'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const pluggy = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID!,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
    })

    const connectToken = await pluggy.createConnectToken({
      clientUserId: userData.user.id,
    })

    return Response.json({ accessToken: connectToken.accessToken })
  } catch (err: any) {
    console.error('[Pluggy] Error creating connect token:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
