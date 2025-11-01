
"use client";

import { useState } from 'react';
import { Shield, Search, BrainCircuit, Globe, BarChart, FileCode2, LockKeyhole, Lightbulb, LogOut, ChevronDown, History } from 'lucide-react';
import { UrlForm } from '@/components/url-form';
import { AnalysisResults } from '@/components/analysis-results';
import { LoadingSkeletons } from '@/components/loading-skeletons';
import type { AnalysisState } from '@/lib/types';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { InteractiveGlobe } from '@/components/interactive-globe';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="bg-custom-gradient card-hover-effect rounded-2xl">
    <CardHeader className="flex flex-row items-center gap-4">
      {icon}
      <CardTitle className='text-lg'>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);


export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
  });
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
  ];
  const features = [
    {
      icon: <FileCode2 className="w-8 h-8 text-primary" />,
      title: 'HTML Content Analysis',
      description: 'The LLM checks for common red flags and patterns, like the use of specific terms often associated with phishing scams.',
    },
    {
      icon: <LockKeyhole className="w-8 h-8 text-primary" />,
      title: 'SSL Certificate Verification',
      description: 'Validate SSL certificate details to ensure they are valid and not self-signed, reporting any anomalies.',
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: 'Real-time Detection Alerts',
      description: 'Provide immediate alerts upon detection of a potentially malicious website, notifying users.',
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-primary" />,
      title: 'AI-Generated Suggestions',
      description: 'The AI provides suggestions for improving phishing detection rules and indicators.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-dots">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:radial-gradient(ellipse_40%_40%_at_50%_10%,rgba(255,255,255,0.3),rgba(255,255,255,0))]"></div>
      
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" passHref>
             <Logo />
          </Link>

          <nav className="hidden md:flex">
            <div className="flex items-center gap-2 rounded-full bg-background/50 border border-border/40 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/20">
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href}>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full">
                          {link.name}
                        </Button>
                    </Link>
                ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-24 h-8 bg-muted/50 animate-pulse rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/5 rounded-full">
                     <Avatar className="w-7 h-7">
                        <AvatarFallback className='text-xs bg-primary/10 border border-primary/20'>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <span className="hidden md:inline max-w-24 truncate">{user.email}</span>
                     <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                   <DropdownMenuItem onClick={() => router.push('/history')} className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 focus:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" passHref>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/5">Log In</Button>
                </Link>
                <Link href="/signup" passHref>
                    <Button size="sm" className="rounded-full btn-glow">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50 duration-500">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start text-left">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-gradient">
              Intelligent Phishing Detection
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Your real-time defense against phishing. Analyze URLs instantly and stay protected.
            </p>
            <div className="mt-8 w-full max-w-lg">
              <UrlForm setAnalysis={setAnalysis} />
            </div>
          </div>
          <div className="relative w-full aspect-square flex items-center justify-center group">
             <InteractiveGlobe />
          </div>
        </div>

        <div className={cn("transition-opacity duration-500", analysis.status !== 'idle' ? 'opacity-100' : 'opacity-0')}>
          <div className="mt-24 max-w-6xl mx-auto">
            {analysis.status === 'loading' && <LoadingSkeletons />}
            {analysis.status === 'success' && analysis.data && (
              <AnalysisResults results={analysis.data} />
            )}
            {analysis.status === 'error' && (
               <div className="text-center p-8 bg-destructive/10 border border-destructive/50 rounded-lg">
                  <h3 className="font-headline text-xl font-semibold text-destructive">Analysis Failed</h3>
                  <p className="text-destructive/80 mt-2">{analysis.error}</p>
               </div>
            )}
          </div>
        </div>

        <section id="features" className="mt-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                    <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
                ))}
            </div>
        </section>
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
