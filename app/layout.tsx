import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const dynamic = 'force-dynamic'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MieteNow - Finde deine Wohnung schneller',
  description: 'Der schnellste und einfachste Weg, eine Wohnung in Deutschland zu finden. Intelligente Benachrichtigungen und zentrale Suche über alle Plattformen.',
  keywords: 'Wohnungssuche, Deutschland, Berlin, Immobilien, WG, Apartment, Miete',
  authors: [{ name: 'MieteNow' }],
  creator: 'MieteNow',
  publisher: 'MieteNow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mietenow.de'),
  alternates: {
    canonical: '/',
    languages: {
      'de-DE': '/de',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'MieteNow - Finde deine Wohnung schneller',
    description: 'Der schnellste und einfachste Weg, eine Wohnung in Deutschland zu finden.',
    url: 'https://mietenow.de',
    siteName: 'MieteNow',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MieteNow - Wohnungssuche in Deutschland',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MieteNow - Finde deine Wohnung schneller',
    description: 'Der schnellste und einfachste Weg, eine Wohnung in Deutschland zu finden.',
    images: ['/twitter-image.jpg'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${manrope.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
