import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Food Court",
  description: "Multi-vendor food ordering system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
