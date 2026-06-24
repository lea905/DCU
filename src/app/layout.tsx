import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DCU Watch Order',
  description: 'The ultimate viewing order for the DC Universe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
