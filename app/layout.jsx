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
  openGraph: {
    title: "Fútbol App",
    description: "Gestión de equipo de fútbol",
    images: ["/placeholder-logo.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Fútbol App",
    description: "Gestión de equipo",
    images: ["/placeholder-logo.png"]
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
