'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'discord',
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-size-[100px_100px]"></div>

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-purple-500 to-indigo-500 opacity-50 blur-lg"></div>
                <div className="relative rounded-full border border-gray-700/50 bg-gray-900/90 p-6 backdrop-blur-sm">
                  <Image
                    src="/assets/images/logos/interchat.png"
                    alt="InterChat"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="bg-linear-to-r from-white to-gray-300 bg-clip-text font-bold text-4xl text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-400 text-lg">
                Sign in to continue to your InterChat dashboard
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="rounded-(--radius) border-gray-700/50 bg-linear-to-br from-gray-900/90 to-gray-950/90 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-purple-500/10">
            <div className="space-y-6 p-8">
              <div className="space-y-4">
                <Button
                  onClick={handleDiscordLogin}
                  disabled={isLoading}
                  className="group h-14 w-full rounded-(--radius-button) bg-[#5865F2] font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:bg-[#4752C4] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Spinner className="h-5 w-5" />
                      <span>Connecting to Discord...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-6 w-6 transition-transform group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <title>Discord Logo</title>
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z" />
                      </svg>
                      <span>Continue with Discord</span>
                    </div>
                  )}
                </Button>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-gray-400 text-sm">
                  By signing in, you agree to our{' '}
                  <a
                    href="/terms"
                    className="text-purple-400 transition-colors hover:text-purple-300"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    className="text-purple-400 transition-colors hover:text-purple-300"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
          <div className="flex items-center gap-3 text-white">
            <Spinner className="h-6 w-6" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
