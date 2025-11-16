// src/app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import ClientProviderWrapper from "./ClientProviderWrapper";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Tot ce folosește hook-uri client-side (Header) trebuie să fie în interiorul SessionProvider */}
        <ClientProviderWrapper>
          <Header />
          {children}
        </ClientProviderWrapper>
      </body>
    </html>
  );
}
