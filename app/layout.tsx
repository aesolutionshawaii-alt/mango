import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from './sw-register';

export const metadata: Metadata = {
  title: 'Mango',
  description: 'Grab your dried mango and find your perfect movie.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mango',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#fff7ed" />
      </head>
      <body className="bg-orange-50">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}