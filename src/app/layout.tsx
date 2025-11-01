
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { MouseSpotlight } from '@/components/mouse-spotlight';
import { StarryNight } from '@/components/starry-night';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'ShieldPhish - AI-Powered Phishing Detection',
  description: 'Your first line of defense against phishing attacks. Analyze URLs in real-time with our intelligent detection system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={cn(
          'font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <FirebaseClientProvider>
          <StarryNight />
          <MouseSpotlight />
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
