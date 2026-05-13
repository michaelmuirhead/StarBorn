import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarBorn — Colonise Mars",
  description:
    "Lead a group of colonists from Earth to Mars. Build a colony, research new tech, survive dust storms, and eventually reach for the stars.",
};

export const viewport: Viewport = {
  themeColor: "#0a0d18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="starfield" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
