import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "VirtuAlly Virtual Nurse ROI Calculator",
  description: "VirtuAlly Virtual Nurse ROI Calculator - Estimate the financial impact of partnering with VirtuAlly",
  openGraph: {
    title: "VirtuAlly Virtual Nurse ROI Calculator",
    description: "VirtuAlly Virtual Nurse ROI Calculator - Estimate the financial impact of partnering with VirtuAlly",
    url: "https://virtu-ally-vrn-savings-calc.vercel.app/",
    siteName: "VirtuAlly",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VirtuAlly Virtual Nurse ROI Calculator",
    description: "VirtuAlly Virtual Nurse ROI Calculator - Estimate the financial impact of partnering with VirtuAlly",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
