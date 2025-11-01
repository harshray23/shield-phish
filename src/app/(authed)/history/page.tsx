
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { AnalysisHistoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

function getRiskBadge(score: number) {
  if (score > 60) {
    return <Badge variant="destructive">High Risk</Badge>;
  }
  if (score > 40) {
    return <Badge variant="secondary">Medium Risk</Badge>;
  }
  return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Low Risk</Badge>;
}

export default function HistoryPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const historyQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'analysisHistory'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: history, loading } = useCollection<AnalysisHistoryItem>(historyQuery);

  return (
    <div className="container mx-auto py-8 animate-in fade-in-50 duration-500">
      <Card className="bg-custom-gradient card-hover-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <History className="w-6 h-6 text-primary" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-center">Risk Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
              {!loading && history?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    You haven't analyzed any URLs yet.
                  </TableCell>
                </TableRow>
              )}
              {history?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.riskScore > 40 ? <ShieldAlert className="w-5 h-5 text-destructive" /> : <ShieldCheck className="w-5 h-5 text-green-500" />}
                      <span className="font-medium">{item.riskScore > 40 ? 'High Risk' : 'Low Risk'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm max-w-sm truncate">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.url}</a>
                  </TableCell>
                  <TableCell className="text-center">
                    {getRiskBadge(item.riskScore)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt.seconds * 1000), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
