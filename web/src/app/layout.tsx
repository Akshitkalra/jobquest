import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPortal - Find Your Dream Job",
  description:
    "AI-powered job portal connecting companies with top talent using semantic matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
