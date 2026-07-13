import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Kinetic — The AI Sales Operating System",
  description:
    "Kinetic automates your sales conversations end to end — from first message to qualified lead. Close more, work less.",
  keywords: ["AI sales", "sales automation", "CRM", "lead qualification", "sales OS"],
}

export const viewport = {
  themeColor: "#0a0e17",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
