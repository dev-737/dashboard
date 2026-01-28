import { Settings, User } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserSettingsForm } from '@/components/forms/UserSettingsForm';

export const metadata: Metadata = {
  title: 'Settings | InterChat Dashboard',
  description: 'Manage your settings and preferences on InterChat',
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/settings');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl text-white">Account Settings</h1>
        <p className="text-gray-400">Manage your profile and preferences</p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="rounded-xl border border-gray-700/50 bg-linear-to-br from-gray-900/90 to-gray-950/90 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            <h2 className="font-semibold text-white text-xl">Profile</h2>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <div className="relative">
              <Image
                src={
                  session.user.image ||
                  'https://api.dicebear.com/7.x/shapes/svg?seed=user'
                }
                alt={session.user.name || 'User'}
                width={64}
                height={64}
                className="rounded-full border-2 border-purple-500/30"
              />
              <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-gray-900 bg-emerald-500"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg text-white">
                {session.user.name}
              </h3>
              <p className="mt-1 inline-block rounded bg-gray-800/50 px-2 py-1 font-mono text-gray-400 text-xs">
                ID: {session.user.id}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
            <p className="text-blue-200 text-sm">
              <strong>Note:</strong> Profile info is synced from Discord. Update
              your avatar and username there.
            </p>
          </div>
        </div>

        {/* Account Preferences */}
        <div className="rounded-xl border border-gray-700/50 bg-linear-to-br from-gray-900/90 to-gray-950/90 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            <h2 className="font-semibold text-white text-xl">Preferences</h2>
          </div>

          <UserSettingsForm />
        </div>
      </div>
    </div>
  );
}
