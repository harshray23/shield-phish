
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dots">
         <div className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.3),rgba(255,255,255,0))]"></div>
      
        <header className="sticky top-0 z-50 w-full border-b rounded-b-lg border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="font-headline text-2xl font-bold tracking-tight">ShieldPhish</span>
                </Link>
                <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                    <Link href="/" passHref>
                        <Button variant="ghost">Dashboard</Button>
                    </Link>
                     <Link href="/history" passHref>
                        <Button variant="ghost">History</Button>
                    </Link>
                </nav>
            </div>
        </header>
        <main>{children}</main>
    </div>
  );
}
