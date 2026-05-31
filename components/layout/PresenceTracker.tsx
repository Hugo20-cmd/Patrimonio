"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PresenceTracker({ userEmail, userName }: { userEmail: string; userName: string }) {
  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        // We just need to join and maintain presence
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const isMobile = /Mobi|Android/i.test(navigator.userAgent);
          await channel.track({
            email: userEmail,
            name: userName || 'Anônimo',
            device: isMobile ? 'Mobile' : 'Desktop',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail, userName]);

  return null;
}
