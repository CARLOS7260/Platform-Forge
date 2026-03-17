import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Platform Forge",
  description: "Internal Developer Platform for portfolio",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
