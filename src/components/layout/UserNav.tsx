'use client';

import {
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { signOut } from 'next-auth/react';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

interface UserNavProps {
  user: User;
  firstPage?: { name: string; icon: React.ElementType; href: string };
}

export function UserNav({
  user,
  firstPage = { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
}: UserNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 cursor-pointer rounded-full border-2 border-transparent p-0 transition-all duration-200 hover:border-primary/30"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full overflow-hidden rounded-full"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.image ?? ''}
                alt={user.name ?? 'User avatar'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500/80 to-purple-500/80 text-white">
                {(user.name ?? 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="mt-1 w-64 rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 p-2 shadow-xl backdrop-blur-md"
        align="end"
        forceMount
      >
        <div className="mb-2 p-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage
                src={user.image ?? ''}
                alt={user.name ?? 'User avatar'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500/80 to-purple-500/80 text-lg text-white">
                {(user.name ?? 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-medium text-base text-white">{user.name}</p>
              <p className="max-w-[160px] truncate text-gray-400 text-xs">
                {user.email || user.id}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-gray-800/50" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-200 transition-colors duration-150 hover:bg-gray-800/50 hover:text-white"
          >
            <Link href={firstPage.href} className="flex w-full items-center">
              <firstPage.icon className="mr-2 h-4 w-4 text-indigo-400" />
              {firstPage.name}
              <DropdownMenuShortcut className="text-gray-500">
                ⌘D
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-200 transition-colors duration-150 hover:bg-gray-800/50 hover:text-white"
          >
            <Link href="/dashboard?tab=hubs" className="flex w-full items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-blue-400" />
              My Hubs
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-200 transition-colors duration-150 hover:bg-gray-800/50 hover:text-white"
          >
            <Link href="/dashboard" className="flex w-full items-center">
              <Home className="mr-2 h-4 w-4 text-green-400" />
              My Servers
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-gray-800/50" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-200 transition-colors duration-150 hover:bg-gray-800/50 hover:text-white"
          >
            <Link
              href="/dashboard/settings"
              className="flex w-full items-center"
            >
              <UserIcon className="mr-2 h-4 w-4 text-gray-400" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-gray-200 transition-colors duration-150 hover:bg-gray-800/50 hover:text-white"
          >
            <Link href="/support" className="flex w-full items-center">
              <HelpCircle className="mr-2 h-4 w-4 text-gray-400" />
              Help & Support
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-gray-800/50" />

        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-red-400 transition-colors duration-150 hover:bg-red-950/30 hover:text-red-300"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
