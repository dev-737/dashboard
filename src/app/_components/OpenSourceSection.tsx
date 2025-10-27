import {
  ArrowRight,
  Code,
  GitFork,
  Github,
  Heart,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function OpenSourceSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 animate-pulse rounded-full bg-primary-alt/10 blur-3xl delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="relative z-10 mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Code className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-semibold tracking-wide">Open Source</span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white md:text-5xl lg:text-6xl">
            Built by the Community,
            <span className="mt-3 block text-primary">For the Community</span>
          </h2>
          <p className="mx-auto max-w-3xl text-gray-300 text-lg">
            InterChat is completely open source and free to use. Join our
            growing community of contributors and help shape the future of
            Discord cross-server communication.
          </p>
        </div>

        <div className="relative z-10 mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* GitHub Repository Card */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-alt/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-50" />

            <div className="relative h-full rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-primary/10 hover:shadow-xl group-hover:border-gray-600/70">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-full border border-gray-600/50 bg-gray-700/50 p-3">
                  <Github className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">
                    GitHub Repository
                  </h3>
                  <p className="text-gray-400">Explore the source code</p>
                </div>
              </div>

              <p className="mb-6 text-gray-300">
                Dive into InterChat&apos;s codebase, report issues, suggest
                features, and contribute to making cross-server communication
                better for everyone.
              </p>

              <div className="mb-6 flex flex-wrap gap-3">
                <Badge className="border-gray-600/50 bg-gray-700/50 text-gray-300">
                  <Star className="mr-1 h-3 w-3" />
                  25+ Stars
                </Badge>
                <Badge className="border-gray-600/50 bg-gray-700/50 text-gray-300">
                  <GitFork className="mr-1 h-3 w-3" />
                  4+ Forks
                </Badge>
                <Badge className="border-gray-600/50 bg-gray-700/50 text-gray-300">
                  <Users className="mr-1 h-3 w-3" />
                  8+ Contributors
                </Badge>
              </div>
            </div>
          </div>

          {/* Contribution Guidelines Card */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-alt/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-50" />

            <div className="relative h-full rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-primary/10 hover:shadow-xl group-hover:border-gray-600/70">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-full border border-gray-600/50 bg-gray-700/50 p-3">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">Get Involved</h3>
                  <p className="text-gray-400">Join our community</p>
                </div>
              </div>

              <p className="mb-6 text-gray-300">
                Whether you&apos;re a developer, designer, translator, or just
                passionate about Discord communities, there are many ways to
                contribute to InterChat.
              </p>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Report bugs and suggest features</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Contribute code and documentation</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Help with translations</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Join our Discord community</span>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-primary text-white transition-all duration-300 hover:bg-primary-alt"
              >
                <Link
                  href="https://discord.gg/interchat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Join Discord
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}