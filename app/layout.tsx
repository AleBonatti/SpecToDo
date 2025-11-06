import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FutureList - Your Personal Wishlist',
  description:
    'A minimalist app to track future activities—movies to watch, restaurants to try, places to visit, books to read.',
  keywords: [
    'wishlist',
    'todo',
    'personal organizer',
    'future activities',
    'movies',
    'restaurants',
    'trips',
    'books',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
