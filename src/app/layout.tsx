import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import AuthBootstrap from "@/components/auth/auth-bootstrap";
import AuthGate from "@/components/auth/auth-gate";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2ndbrain",
  description: "A second brain for project ideas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full font-sans">
        <ThemeProvider>
          <AuthProvider>
            <AuthBootstrap />
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
