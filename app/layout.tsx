import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Shopping List',
  description: 'Organize as compras da sua família com estilo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ShopList',
  },
  manifest: '/manifest.json',
  themeColor: '#0f172a',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <link rel="icon" href="/icon.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
