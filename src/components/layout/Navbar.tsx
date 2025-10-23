'use client';

import { ArrowRight, ExternalLink, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/NavigationMenu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const links = [
  {
    text: 'Docs',
    url: 'https://docs.interchat.dev',
  },
  {
    text: 'Discover',
    url: '/discover',
  },
  {
    text: 'Pricing',
    url: '/donate',
  },
  {
    text: 'Guidelines',
    url: '/guidelines',
  },
  {
    text: 'Vote',
    url: '/vote',
    external: true,
  },
];

interface NavbarProps {
  session?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

export function Navbar({ session }: NavbarProps) {
  const actualUser = session?.user;
  const isLoading = false; // Session is passed from server, no loading state

  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isDashboardPage = pathname.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`${isDashboardPage ? 'hidden' : ''} fixed top-0 z-50 w-full ${isScrolled ? 'bg-[#0a0a0c]/30 backdrop-blur-[6px]' : 'pointer-events-auto bg-transparent'}transition-all duration-300`}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 py-2">
        {/* Logo and Navigation */}
        <div className="flex items-center">
          <Link href="/" className="group mr-6 flex items-center gap-2">
            <Image
              alt="InterChat"
              src="/assets/images/logos/interchat.png"
              height={32}
              width={32}
              className="rounded-full transition-transform duration-300 group-hover:scale-105"
            />
            <span className="hidden font-bold text-lg text-white transition-colors duration-300 group-hover:text-primary sm:inline">
              InterChat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-1">
              {links.map((link) => (
                <NavigationMenuItem key={link.url}>
                  <NavigationMenuLink
                    href={link.url}
                    className={`group relative inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 font-medium text-gray-400 text-sm transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:translate-x-[-50%] after:bg-primary after:transition-all after:duration-300 hover:text-white hover:after:w-[80%] ${
                      pathname === link.url ? 'text-white after:w-[80%]' : ''
                    }`}
                  >
                    {link.text}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          {/* GitHub - Visible on large screens */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden rounded-full text-gray-400 transition-transform duration-300 hover:scale-110 hover:bg-transparent hover:text-white lg:flex"
          >
            <Link
              href="https://github.com/oxaradev/InterChat"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          {/* Discord Button - Hidden on small/medium screens */}
          <Button
            asChild
            className="hidden bg-gradient-to-r from-primary to-primary-alt font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-primary/20 lg:flex"
          >
            <Link href="/invite" className="items-center gap-2">
              Invite
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>

          {/* User Nav or Login */}
          {isLoading ? (
            <div className="hidden h-9 w-20 animate-pulse rounded-md bg-gray-800/50 lg:block" />
          ) : actualUser ? (
            <UserNav user={actualUser} />
          ) : (
            <Button
              asChild
              variant="ghost"
              className="hidden text-gray-400 backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:text-white lg:flex"
            >
              <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
                Login
              </Link>
            </Button>
          )}

          {/* Mobile/Tablet Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="group rounded-full border border-gray-700/30 text-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:bg-white/5 hover:text-white hover:shadow-lg hover:shadow-purple-500/10 lg:hidden"
              >
                <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] overflow-hidden border-gray-700/40 border-l bg-gradient-to-b from-gray-900/98 to-gray-950/98 p-0 shadow-2xl shadow-black/20 backdrop-blur-xl sm:w-[320px]"
            >
              <SheetHeader className="border-gray-700/40 border-b bg-gradient-to-r from-gray-900/50 to-gray-800/50 p-6 backdrop-blur-sm">
                <SheetTitle className="flex items-center gap-3 text-white">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-md" />
                    <Image
                      alt="InterChat"
                      src="/assets/images/logos/interchat.png"
                      height={24}
                      width={24}
                      className="relative rounded-full transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text font-semibold text-transparent">
                    InterChat Menu
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex h-full flex-col">
                <nav className="relative flex flex-col space-y-2 px-4 py-6">
                  {/* Vertical line connecting bullets */}
                  <div className="absolute top-[calc(1.5rem+0.75rem)] bottom-[calc(0.5rem+0.75rem)] left-[2.25rem] w-[2px] bg-gradient-to-b from-purple-500/40 via-indigo-500/30 to-purple-500/40" />

                  {links.map((link, index) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 font-medium text-sm transition-all duration-300 ${
                        pathname === link.url
                          ? 'border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                          : 'border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white hover:shadow-black/5 hover:shadow-md'
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div
                        className={`relative z-10 flex h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                          pathname === link.url
                            ? 'bg-purple-400 shadow-lg shadow-purple-400/50'
                            : 'bg-gray-600 group-hover:bg-purple-400 group-hover:shadow-md group-hover:shadow-purple-400/30'
                        }`}
                      />
                      <span className="truncate">{link.text}</span>
                      {link.external && (
                        <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                      )}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto space-y-3 border-gray-700/40 border-t bg-gradient-to-t from-gray-950/80 to-transparent p-6 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="group relative">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary-alt opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30" />
                      <Button
                        asChild
                        className="relative w-full bg-gradient-to-r from-primary to-primary-alt font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-primary-alt hover:to-primary hover:shadow-primary/20 hover:shadow-xl"
                      >
                        <Link
                          href="/invite"
                          className="group/btn flex items-center justify-center gap-2"
                        >
                          Invite Bot
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>

                    {isLoading ? (
                      <div className="h-10 w-full animate-pulse rounded-md bg-gray-800/50" />
                    ) : !actualUser ? (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-gray-700/50 bg-gray-800/30 text-gray-300 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50 hover:bg-gray-700/50 hover:text-white"
                      >
                        <Link
                          href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                        >
                          Login
                        </Link>
                      </Button>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-center border-gray-700/30 border-t pt-4">
                    <Link
                      href="https://github.com/oxaradev/InterChat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-2 rounded-lg p-2 text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover/link:scale-110" />
                      <span className="font-medium text-xs">
                        View on GitHub
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
