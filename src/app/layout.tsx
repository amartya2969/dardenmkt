import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — UVA & Darden Student Marketplace`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — UVA & Darden Student Marketplace`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: 'https://dardenmkt.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DardenMkt — UVA & Darden Student Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — UVA & Darden Student Marketplace`,
    description: SITE_DESCRIPTION,
    images: ['https://dardenmkt.vercel.app/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
