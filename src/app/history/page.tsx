
'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Shield, History, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { AnalysisHistoryItem } from '@/lib/types';
import Logo from '@/components/logo';
import Link from 'next/link';

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex-grow space-y-2">
             <div className="h-4 bg-muted/50 rounded w-3/4" />
             <div className="h-3 bg-muted/50 rounded w-1/4" />
          </div>
          <div className="h-8 w-20 bg-muted/50 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const historyQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore!, 'users', user.uid, 'analysisHistory'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: history, loading: historyLoading } = useCollection<AnalysisHistoryItem>(historyQuery);
  
  const getRiskBadge = (score: number) => {
    if (score > 80) return <Badge variant="destructive" className="bg-red-500/80 border-none">Critical</Badge>;
    if (score > 60) return <Badge variant="destructive" className="bg-orange-500/80 border-none">High</Badge>;
    if (score > 40) return <Badge variant="destructive" className="bg-yellow-500/80 border-none text-black">Medium</Badge>;
    return <Badge variant="default" className="bg-green-500/80 border-none">Low</Badge>;
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
     <div className="flex flex-col min-h-screen bg-dots">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.3),rgba(255,255,255,0))]"></div>
      
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-14 items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
              <ArrowLeft />
            </Button>
            <Link href="/" passHref>
                <Logo />
            </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50 duration-500">
        <Card className="w-full max-w-4xl mx-auto bg-custom-gradient card-hover-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-3xl">
              <History className="w-8 h-8 text-primary" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <HistorySkeleton />
            ) : history && history.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-center">Risk Score</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.url}</TableCell>
                            <TableCell className="text-center">{getRiskBadge(item.riskScore)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {item.createdAt ? formatDistanceToNow(new Date(item.createdAt.seconds * 1000)) : 'N/A'} ago
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>

            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You have no analysis history yet.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Analyze a URL</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

       <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="container mx-auto flex justify-center items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <p>&copy; {new Date().getFullYear()} ShieldPhish. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
