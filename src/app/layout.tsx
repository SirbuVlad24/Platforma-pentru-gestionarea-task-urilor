// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import ClientProviderWrapper from "./ClientProviderWrapper"; // wrapper Client Component

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {}
        <ClientProviderWrapper>{children}</ClientProviderWrapper>
      </body>
    </html>
  );
}
