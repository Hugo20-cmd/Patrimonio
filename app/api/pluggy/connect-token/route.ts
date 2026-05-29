import { PluggyClient } from 'pluggy-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pluggy = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID!,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
    });

    const data = await pluggy.createConnectToken();
    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error('Error generating pluggy token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
