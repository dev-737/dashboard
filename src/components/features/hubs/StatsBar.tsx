"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from 'react';

// Lazy-load motion and icons for non-blocking load
const Activity = dynamic(() => import("lucide-react").then(mod => mod.Activity), { ssr: false });
const Globe = dynamic(() => import("lucide-react").then(mod => mod.Globe), { ssr: false });
const TrendingUp = dynamic(() => import("lucide-react").then(mod => mod.TrendingUp), { ssr: false });

// Dynamically load motion and store in state
import type { motion as MotionType } from "motion/react";

interface StatsData {
  activeServers: number;
  publicHubs: number;
  weeklyMessages: number;
}

interface StatsBarProps {
  stats?: StatsData;
}

/**
 * 2️⃣ Stats Bar (below hero)
 * Quick stats with icons and animated counter-up effect
 */

export function StatsBar({ stats }: StatsBarProps) {
  const [animatedStats, setAnimatedStats] = useState({
    activeServers: 0,
    publicHubs: 0,
    weeklyMessages: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [motionObj, setMotionObj] = useState<typeof import("motion/react") | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const defaultStats = {
    activeServers: 1200,
    publicHubs: 60,
    weeklyMessages: 300000,
  };

  const finalStats = stats || defaultStats;
  // Dynamically import motion on mount (client only)
  useEffect(() => {
    let cancelled = false;
    import("motion/react").then((mod) => {
      if (!cancelled) setMotionObj(mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Intersection Observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Animated counter effect (only when visible)
  useEffect(() => {
    if (!isVisible) return;

    let start: number | null = null;
    const duration = 2000;

    function animateCounter(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        activeServers: Math.floor(finalStats.activeServers * easeOutQuart),
        publicHubs: Math.floor(finalStats.publicHubs * easeOutQuart),
        weeklyMessages: Math.floor(finalStats.weeklyMessages * easeOutQuart),
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateCounter);
      } else {
        setAnimatedStats(finalStats);
        animationRef.current = null;
      }
    }

    animationRef.current = requestAnimationFrame(animateCounter);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [finalStats, isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const statsItems = [
    {
      icon: TrendingUp,
      value: animatedStats.activeServers,
      label: 'Active Servers',
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconGradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
    },
    {
      icon: Globe,
      value: animatedStats.publicHubs,
      label: 'Public Hubs',
      color: 'blue',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconGradient: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-400',
    },
    {
      icon: Activity,
      value: animatedStats.weeklyMessages,
      label: 'Messages This Week',
      color: 'purple',
      gradient: 'from-purple-500/20 to-violet-500/20',
      iconGradient: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-400',
    },
  ];

  // Helper to render either motion.div or div
  const MotionDiv = motionObj?.motion?.div || "div";

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border-y border-white/10 backdrop-blur-xl py-12"
    >
      <div className="container mx-auto px-4">
        <MotionDiv
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          {...(motionObj && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.3 },
          })}
        >
          {statsItems.map((stat, index) => {
            const Icon = stat.icon;
            const ItemMotionDiv = motionObj?.motion?.div || "div";
            const IconMotionDiv = motionObj?.motion?.div || "div";
            return (
              <ItemMotionDiv
                key={stat.label}
                className="group"
                {...(motionObj && {
                  initial: { opacity: 0, scale: 0.8 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.6, delay: 0.4 + index * 0.1 },
                  whileHover: { y: -4, scale: 1.02 },
                })}
              >
                <div className={`
                  relative p-6 rounded-2xl border backdrop-blur-xl
                  bg-gradient-to-br ${stat.gradient}
                  border-${stat.color}-400/30 hover:shadow-${stat.color}-500/25
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:border-opacity-50
                  before:absolute before:inset-0 before:rounded-2xl
                  before:bg-gradient-to-br before:from-white/5 before:to-transparent
                  before:pointer-events-none
                  overflow-hidden
                `}>
                  {/* Background decoration */}
                  <div
                    className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${stat.iconGradient}`}
                  />

                  <div className="flex items-center justify-center mb-6">
                    <IconMotionDiv
                      className={`
                        relative p-4 rounded-xl bg-gradient-to-br ${stat.iconGradient}
                        shadow-lg group-hover:shadow-xl transition-all duration-300
                        mr-4
                      `}
                      {...(motionObj && {
                        whileHover: { rotate: 5, scale: 1.1 },
                        transition: { type: "spring", stiffness: 300 },
                      })}
                    >
                      <Icon className="h-8 w-8 text-white" />
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </IconMotionDiv>

                    <div className="text-left">
                      <div className={`text-4xl font-black tracking-tight bg-gradient-to-r ${stat.textColor} bg-clip-text`}>
                        {formatNumber(stat.value)}
                      </div>
                      <div className="text-sm text-gray-300 font-medium uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>

                  {/* Subtle progress bar */}
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <IconMotionDiv
                      className={`h-full bg-gradient-to-r ${stat.iconGradient}`}
                      {...(motionObj && {
                        initial: { width: 0 },
                        animate: { width: "85%" },
                        transition: { duration: 1, delay: 0.5 + index * 0.1 },
                      })}
                    />
                  </div>
                </div>
              </ItemMotionDiv>
            );
          })}
        </MotionDiv>
      </div>
    </div>
  );
}