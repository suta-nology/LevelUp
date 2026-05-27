import "./globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "Habit Forge — Forge Your Habits Daily",
  description: "Track habits, tasks, and personal growth every day.",
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
