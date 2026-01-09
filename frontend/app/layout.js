import { Metadata } from 'next';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://barracuda.marketing'),
  title: {
    default: 'Barracuda Marketing - Premier Casino Affiliate Network',
    template: '%s | Barracuda Marketing'
  },
  description: 'Join Barracuda Marketing, the leading casino affiliate network. Partner with top-tier iGaming brands and maximize your earnings with premium offers, competitive payouts, and dedicated support across 50+ GEOs.',
  keywords: ['casino affiliate', 'iGaming network', 'affiliate marketing', 'online casino', 'gaming affiliates', 'revenue share', 'CPA offers', 'barracuda marketing'],
  authors: [{ name: 'Barracuda Marketing' }],
  creator: 'Barracuda Marketing',
  publisher: 'Barracuda Marketing',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://barracuda.marketing',
    siteName: 'Barracuda Marketing',
    title: 'Barracuda Marketing - Premier Casino Affiliate Network',
    description: 'Join Barracuda Marketing, the leading casino affiliate network. Maximize your earnings with premium iGaming offers.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Barracuda Marketing - Casino Affiliate Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barracuda Marketing - Premier Casino Affiliate Network',
    description: 'Join Barracuda Marketing, the leading casino affiliate network. Maximize your earnings with premium iGaming offers.',
    images: ['/images/og-image.jpg'],
    creator: '@barracudamarketing',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0A0A0F" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-background text-text antialiased">
        {children}
      </body>
    </html>
  );
}
