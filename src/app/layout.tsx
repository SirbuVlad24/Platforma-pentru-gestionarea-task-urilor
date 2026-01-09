// src/app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import ClientProviderWrapper from "./ClientProviderWrapper";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pirata+One&family=Creepster&family=Butcherman&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-red-50 min-h-screen">
        <ClientProviderWrapper>
          <Header />
          {children}
        </ClientProviderWrapper>
      </body>
    </html>
  );
}
