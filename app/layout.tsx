import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GSR Lone Star Report",
  description:
    "Statewide Texas news, politics, business, weather and sports built around journalistic integrity and journalist utility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
