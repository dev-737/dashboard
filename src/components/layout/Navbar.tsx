'use client';

import {
    ArrowRightIcon,
    Menu01Icon,
    Diamond02Icon,
    Compass01Icon,
    BookOpen01Icon,
    HeartCheckIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HomepageMobileSidebar } from './HomepageMobileSidebar';

const links = [
    {
        text: 'Premium',
        url: '/premium',
        icon: Diamond02Icon,
    },
    {
        text: 'Discover',
        url: '/discover',
        icon: Compass01Icon,
    },
    {
        text: 'Guidelines',
        url: '/guidelines',
        icon: BookOpen01Icon,
    },
    {
        text: 'Vote',
        url: '/vote',
        icon: HeartCheckIcon,
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
            className={`${isDashboardPage ? 'hidden' : ''} fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled
                ? 'bg-dash-surface/90 shadow-lg shadow-black/20 backdrop-blur-md border-b border-dash-border/50'
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
                        <span className="hidden bg-linear-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text font-bold text-lg text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:via-indigo-300 group-hover:to-blue-300 sm:inline">
                            InterChat
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        {links.map((link) => {
                            const isActive = pathname === link.url;
                            return (
                                <Link
                                    key={link.url}
                                    href={link.url}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-all duration-200',
                                        isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    )}
                                >
                                    {link.icon && (
                                        <HugeiconsIcon
                                            strokeWidth={2}
                                            icon={link.icon}
                                            className={cn(
                                                'h-4 w-4',
                                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                                            )}
                                        />
                                    )}
                                    {link.text}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        className="btn-primary hidden font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-primary/20 lg:flex"
                    >
                        <Link href="/invite" className="items-center gap-2">
                            Invite
                            <HugeiconsIcon
                                strokeWidth={2}
                                icon={ArrowRightIcon}
                                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            />
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
                        <HugeiconsIcon
                            strokeWidth={2}
                            icon={Menu01Icon}
                            className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                        />
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
