
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { ArrowRight, Link as LinkIcon, Search, Shield, LogOut, History, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const steps = [
    {
      icon: <LinkIcon className="w-8 h-8 text-primary" />,
      title: 'Enter URL or Email',
      description: 'Simply paste the suspicious URL or email address you want to analyze into our secure scanning interface.',
    },
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: 'Instant Analysis',
      description: 'Our advanced AI engine performs comprehensive real-time analysis of SSL certificates, HTML content, and URL structure.',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Get Results',
      description: 'Receive detailed risk assessment with actionable insights and recommendations to protect your organization.',
    },
  ];

export default function HowItWorksPage() {
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
                           link.name === 'How It Works' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
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
              How It Works
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Simple, powerful protection in just a few steps
            </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
            {steps.map((step, index) => (
                <React.Fragment key={step.title}>
                    <Card className="bg-custom-gradient card-hover-effect w-full max-w-sm text-center relative p-6 rounded-2xl">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </div>
                        <CardHeader className="items-center">
                            <div className="p-3 rounded-full bg-primary/10 mb-2">
                                {step.icon}
                            </div>
                            <CardTitle className='text-xl'>{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </CardContent>
                    </Card>
                    {index < steps.length - 1 && (
                        <ArrowRight className="hidden md:block w-8 h-8 text-primary/50 shrink-0" />
                    )}
                </React.Fragment>
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
