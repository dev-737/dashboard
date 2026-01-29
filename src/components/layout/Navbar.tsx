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
import { HomepageMobileSidebar } from './HomepageMobileSidebar';

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
  const [isOpen, setIsOpen] = useState(false);
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
      className={`${isDashboardPage ? 'hidden' : ''} fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-none bg-[#030812]/80 shadow-lg shadow-purple-500/5 backdrop-blur-md'
          : 'bg-transparent'
      }`}
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
                    className={`group relative inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 font-medium text-gray-400 text-sm transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:translate-x-[-50%] after:bg-primary after:transition-all after:duration-300 hover:text-white hover:after:w-[80%] ${
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

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden btn-primary font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-primary/20 lg:flex"
          >
            <Link href="/invite" className="items-center gap-2">
              Invite
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="group rounded-full border border-white/5 bg-white/5 text-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <HomepageMobileSidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            user={actualUser}
            links={links}
          />
        </div>
      </div>
    </header>
  );
}
