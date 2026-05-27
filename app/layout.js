import "./globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "Habit Forge — Forge Your Habits Daily",
  description: "Build powerful daily habits, track tasks, and level up your life — one day at a time.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg",    type: "image/svg+xml" },
      { url: "/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/favicon/apple-touch-icon-180.png", sizes: "180x180" },
  },
  openGraph: {
    title: "Habit Forge",
    description: "Build powerful daily habits, track tasks, and level up your life.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
