
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';
import { Shield, Search, Link as LinkIcon, BarChart, Zap, LogOut, History, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const features = [
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: 'Real-time',
    description: 'Continuously monitor and analyze web traffic in real-time to detect and block phishing attempts before they reach your network.',
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: 'Phishing Detection',
    description: 'Advanced algorithms identify and prevent sophisticated phishing attacks, protecting your sensitive information.',
  },
  {
    icon: <LinkIcon className="w-8 h-8 text-primary" />,
    title: 'URL Reputation Scoring',
    description: 'Comprehensive scanning of URLs to detect malicious links and prevent access to harmful websites.',
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: 'Detailed Insights Dashboard',
    description: 'User-friendly dashboard providing detailed reports and analytics on phishing attempts and blocked threats.',
  },
];


export default function FeaturesPage() {
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
  return (
    <div className="flex flex-col min-h-screen bg-dots">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.3),rgba(255,255,255,0))]"></div>
      
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" passHref>
            <Logo />
          </Link>
          
          <nav className="hidden md:flex">
            <div className="flex items-center gap-2 rounded-full bg-background/50 border border-border/40 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/20">
                {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          'rounded-full',
                          link.name === 'Features' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
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

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-in fade-in-50 duration-500">
        <div className="text-center mb-16">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
              Powerful Protection Features
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Advanced security solutions to keep your data safe from phishing threats.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
                <Card key={feature.title} className="bg-custom-gradient card-hover-effect text-left p-4 rounded-2xl">
                    <CardHeader className="items-start">
                        <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                            {feature.icon}
                        </div>
                        <CardTitle className='text-xl'>{feature.title}</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
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
