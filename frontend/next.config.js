/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  metadata: {
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
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
  },
};

module.exports = nextConfig;
