import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Patrimônio+ | Organize í¢ÂÂ¢ Invista í¢ÂÂ¢ Evolua",
  description:
    "Plataforma premium para acompanhamento de ETFs, açí­Âµes, FIIs, Tesouro Direto, dividendos e evolução patrimonial. Invista com inteligí­Âªncia.",
  keywords: [
    "ETF", "açí­Âµes", "FII", "dividendos", "patrimônio", "investimentos",
    "Tesouro Direto", "carteira de investimentos", "renda passiva", "liberdade financeira"
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Patrimônio+",
  },
  openGraph: {
    title: "Patrimônio+",
    description: "Acompanhe ETFs, açí­Âµes, FIIs e patrimônio automaticamente com gráficos inteligentes.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrimônio+",
    description: "Plataforma premium de investimentos e patrimônio.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
