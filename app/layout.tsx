import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0b0b0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://osama-gym.local'),
  title: 'Osama Gym & Meal Tracker',
  description: 'Private offline-first gym workout and nutrition tracker with smart progressive overload, rest timer, walking log, and AI-ready training export.',
  applicationName: 'Osama Gym & Meal Tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Osama Gym & Meal Tracker',
  },
  icons: {
    icon: [
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Osama Gym & Meal Tracker',
    description: 'Private offline-first gym workout and nutrition tracker with smart progressive overload, rest timer, walking log, and AI-ready training export.',
    type: 'website',
    images: [
      {
        url: '/app-cover.jpg',
        width: 1280,
        height: 720,
        alt: 'Osama Gym & Meal Tracker Cover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Osama Gym & Meal Tracker',
    description: 'Private offline-first gym workout and nutrition tracker with smart progressive overload, rest timer, walking log, and AI-ready training export.',
    images: ['/app-cover.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-[#0b0b0e] text-[#ededf0] antialiased min-h-screen selection:bg-[#d4b26f]/30 selection:text-[#fae5b5]"
      >
        {children}
      </body>
    </html>
  );
}
