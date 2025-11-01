
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Shield, Zap, Lock, LogOut, History, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const principles = [
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: 'Our Mission',
    description: 'To provide robust, real-time protection against phishing threats, keeping your digital life secure and your mind at ease.',
    highlighted: false,
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: 'Fast & Efficient',
    description: 'Our advanced algorithms analyze URLs in milliseconds, providing instant security assessments without slowing you down.',
    highlighted: true,
  },
  {
    icon: <Lock className="w-8 h-8 text-primary" />,
    title: 'Privacy First',
    description: "Your security is our priority. We don't store your browsing history or personal information.",
    highlighted: false,
  },
];

export default function AboutPage() {
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
    <div className="flex flex-col min-h-screen bg-background bg-dots">
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
                           link.name === 'About' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
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

      <main className="flex-grow flex items-center justify-center p-4 animate-in fade-in-50 duration-500">
        <Card className="w-full max-w-4xl p-6 sm:p-8 md:p-12 relative bg-custom-gradient card-hover-effect">
          
          <header className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">About ShieldPhish</h1>
            <p className="mt-3 text-lg text-muted-foreground">Empowering users with advanced phishing protection</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((item) => (
              <Card 
                key={item.title} 
                className={cn(
                    "text-center p-6 bg-custom-gradient card-hover-effect rounded-2xl", 
                    item.highlighted && "bg-primary/5 border-primary/40 shadow-lg shadow-primary/10"
                )}
              >
                <CardHeader className="items-center">
                  <div className={cn("p-3 rounded-full bg-primary/10 mb-4 transition-colors", item.highlighted && 'bg-primary/20')}>
                    {item.icon}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
