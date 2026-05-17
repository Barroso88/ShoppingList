import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Shopping List',
  description: 'Organize as compras da sua família com estilo',
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
