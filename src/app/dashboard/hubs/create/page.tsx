import { ArrowLeft, Globe, Shield, Sparkles, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HubCreateForm } from '@/components/forms/HubCreateForm';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Create Hub | InterChat Dashboard',
  description: 'Create a new InterChat hub to connect Discord communities',
};

export default async function CreateHubPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/hubs/create');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hubs
            </Link>
          </Button>
          <div>
            <h1 className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text font-bold text-2xl text-transparent">
              Create New Hub
            </h1>
            <p className="text-gray-400 text-sm">
              Build a community that connects Discord servers worldwide
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="hidden items-center gap-6 text-gray-400 text-sm lg:flex">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>Instant Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span>Full Control</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            <span>Global Reach</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-8 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-indigo-300 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Create Your Community Hub</span>
        </div>
        <h2 className="mb-4 font-bold text-3xl text-white">
          Connect Discord servers across the globe
        </h2>
        <p className="mx-auto max-w-2xl text-gray-400 text-lg">
          Create a hub to enable cross-server communication, build larger
          communities, and connect with Discord servers that share your
          interests.
        </p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl">
        <HubCreateForm />
      </div>

      {/* Page Footer - provides scroll space for mobile prompts */}
      <PageFooter
        height="lg"
        message="Start building your community network! 🌐"
      />
    </div>
  );
}
