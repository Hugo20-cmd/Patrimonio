"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalProvider({ user }: { user: any }) {
  const initialized = useRef(false);

  useEffect(() => {
    async function initOneSignal() {
      if (initialized.current) return;
      initialized.current = true;

      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
          allowLocalhostAsSecureOrigin: true, // para testes locais
          serviceWorkerPath: "sw.js",
          serviceWorkerParam: { scope: "/" },
        });

        // Após inicializar, se tivermos um usuário logado, fazemos o login dele no OneSignal
        if (user && user.id) {
          OneSignal.login(user.id);
        }
      } catch (error: any) {
        console.error("Erro ao inicializar OneSignal:", error);
        if (typeof window !== "undefined") {
          (window as any).oneSignalError = error.message || error.toString();
        }
      }
    }

    if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      initOneSignal();
    }
  }, [user]);

  return null;
}
