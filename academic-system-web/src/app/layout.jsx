import { Geist, Geist_Mono, Kulim_Park, Unbounded } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const kulimPark = Kulim_Park({
  variable: "--font-kulim-park",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Academic System",
  description: "City High School Academic System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${unbounded.variable} ${kulimPark.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
