import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { WalletProvider } from "../contexts/WalletContext";
import WalletButton from "../components/WalletButton";

export const metadata: Metadata = {
  title: "Wavlake Music Player",
  description: "Listen to music from Wavlake with Cashu payment support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                  Wavlake Music
                </Link>
                <nav className="flex space-x-4 items-center">
                  <Link href="/" className="hover:text-blue-400">
                    Home
                  </Link>
                  <WalletButton />
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="bg-gray-800 py-4 text-center text-gray-400">
              <div className="container mx-auto">
                <p>Powered by Wavlake API and Cashu</p>
              </div>
            </footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
