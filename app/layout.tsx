import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SION S-MART - Sistema de Gestion de Operaciones',
  description: 'SION S-MART - Sistema inteligente de gestion de operaciones para servicios de drones',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <body className="font-sans antialiased bg-background">
        {children}
      </body>
    </html>
  )
}
