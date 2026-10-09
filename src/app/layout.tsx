import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'CleverCrack | Technical interview readiness',
  description: 'Guided, role-specific interview roadmaps for Turing, Andela, and Toptal candidates.',
  keywords: ['technical interview preparation', 'forward deployed engineer', 'AI engineer', 'Turing', 'Andela', 'Toptal'],
  openGraph: {
    title: 'CleverCrack | Technical interview readiness',
    description: 'Follow every interview round from first screen to final readiness.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
          <footer className="site-branding">Build by Atif shaikh</footer>
        </ClerkProvider>
      </body>
    </html>
  )
}
