'use client';

import { ArrowRight, ExternalLink, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

const links = [
  {
    text: 'Docs',
    url: '/docs',
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

export function Navbar() {
  const { data: session } = useSession();
  const actualUser = session?.user;
  
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isDocsOrDashboardPage =
    pathname?.startsWith('/docs') || pathname.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`${isDocsOrDashboardPage ? 'hidden' : ''} fixed top-0 z-50 w-full ${isScrolled ? 'bg-[#0a0a0c]/30 backdrop-blur-[6px]' : 'pointer-events-auto bg-transparent'}transition-all duration-300`}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 py-2">
        {/* Logo and Navigation */}
        <div className="flex items-center">
          <Link href="/" className="group mr-6 flex items-center gap-2">
            <Image
              alt="InterChat"
              src="/interchat.png"
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
              href="https://github.com/interchatapp/InterChat"
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
          {actualUser ? (
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
                className="rounded-full text-gray-400 backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] border-gray-800/30 border-l bg-[#0a0a0c]/95 p-0 backdrop-blur-md sm:w-[320px]"
            >
              <SheetHeader className="border-gray-800/30 border-b p-6">
                <SheetTitle className="flex items-center gap-2 text-white">
                  <Image
                    alt="InterChat"
                    src="/interchat.png"
                    height={24}
                    width={24}
                    className="rounded-full transition-transform duration-300 hover:scale-105"
                  />
                  <span className="font-medium">InterChat Menu</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex h-full flex-col">
                <nav className="flex flex-col py-4">
                  {links.map((link) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      className={`relative flex items-center px-6 py-3 font-medium text-gray-400 text-sm transition-all duration-300 hover:text-white ${pathname === link.url ? 'bg-white/5 pl-8 text-white' : ''}hover:bg-white/5 hover:pl-8`}
                    >
                      {link.text}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto space-y-4 border-gray-800/30 border-t p-6">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-primary to-primary-alt font-medium text-white shadow-md transition-all duration-300 hover:shadow-primary/20"
                  >
                    <Link
                      href="/invite"
                      className="group flex items-center justify-center gap-2"
                    >
                      Invite
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>

                  {!actualUser && (
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full text-gray-400 backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:text-white"
                    >
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                      >
                        Login
                      </Link>
                    </Button>
                  )}

                  <div className="flex items-center justify-between border-gray-800/30 border-t pt-4">
                    <Link
                      href="https://github.com/interchatapp/InterChat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-2 text-gray-400 transition-colors hover:text-white"
                    >
                      <ExternalLink className="h-5 w-5" />
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
