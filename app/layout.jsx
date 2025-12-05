import { Russo_One, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

//  Metadata API - Funciona directamente sin importar nada
/**
 * Funciona en Server Components:
  Layouts (layout.jsx)
  Páginas (page.jsx)
  NO funciona en Client Components
 */
export const metadata = {
  title: "Fútbol App - Gestión de Equipo",
  description: "Sistema de gestión y seguimiento para un equipo de fútbol",
  generator: 'v0.app',
  keywords: ["fútbol", "equipo", "gestión"],
  authors: [{ name: "Luis Chicaiza" }],

  // FAVICON
  icons: {
    // Favicon principal 
    icon: "/icon.svg",
    // Fallback para navegadores antiguos
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" }
    ],
    apple: "/apple-icon.png",
    shortcut: "/icon.svg"
  },

  openGraph: {
    title: "Fútbol App",
    description: "Gestión de equipo de fútbol",
    images: ["/logo-og.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Fútbol App",
    description: "Gestión de equipo",
    images: ["/logo-og.jpg"]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${russoOne.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
