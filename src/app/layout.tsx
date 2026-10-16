import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import RoleSwitcher from '@/components/RoleSwitcher';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'TasteChain BKK | AI & Trustless Gastronomy Protocol',
  description:
    'Decentralized Proof-of-Review protocol on Avalanche C-Chain indexing 43,000+ Bangkok venues with ElevenLabs AI Thai voice synthesis, 2-Option Proof, and dynamic token rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('tastechain_theme') || 'dark';
                document.documentElement.setAttribute('data-theme', savedTheme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen antialiased selection:bg-orange-500 selection:text-white">
        <Navbar />
        <RoleSwitcher />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
