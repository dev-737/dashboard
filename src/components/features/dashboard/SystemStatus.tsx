'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  XCircle,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatusItem {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  icon: React.ElementType;
  description: string;
}

export function SystemStatus() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString());
  }, []);

  // Mock system status data - in a real app, this would come from an API
  const systemStatus: StatusItem[] = [
    {
      name: 'API Services',
      status: 'operational',
      icon: Zap,
      description: 'All API endpoints responding normally',
    },
    {
      name: 'Database',
      status: 'operational',
      icon: Database,
      description: 'Database queries executing within normal parameters',
    },
    {
      name: 'Discord Bot',
      status: 'operational',
      icon: Globe,
      description: 'Bot is online and processing messages',
    },
    {
      name: 'Web Dashboard',
      status: 'operational',
      icon: Activity,
      description: 'Dashboard fully functional',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'outage':
        return 'text-red-400';
      case 'maintenance':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle;
      case 'degraded':
        return AlertTriangle;
      case 'outage':
        return XCircle;
      case 'maintenance':
        return Clock;
      default:
        return CheckCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'outage':
        return 'Service Outage';
      case 'maintenance':
        return 'Under Maintenance';
      default:
        return 'Unknown';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const overallStatus = systemStatus.every(
    (item) => item.status === 'operational'
  )
    ? 'operational'
    : systemStatus.some((item) => item.status === 'outage')
      ? 'outage'
      : 'degraded';

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={container}
      className="h-full"
    >
      <Card className="h-full border-gray-800 bg-linear-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <div>
              <CardTitle className="font-bold text-xl">System Status</CardTitle>
              <CardDescription>
                Current status of InterChat services
              </CardDescription>
            </div>
          </div>

          {/* Overall Status */}
          <motion.div variants={item} className="mt-4">
            <div className="flex items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/30 p-3">
              {(() => {
                const StatusIcon = getStatusIcon(overallStatus);
                return (
                  <StatusIcon
                    className={cn('h-5 w-5', getStatusColor(overallStatus))}
                  />
                );
              })()}
              <div>
                <p className="font-medium text-white">Overall Status</p>
                <p className={cn('text-sm', getStatusColor(overallStatus))}>
                  {getStatusText(overallStatus)}
                </p>
              </div>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {systemStatus.map((service) => {
              const ServiceIcon = service.icon;
              const StatusIcon = getStatusIcon(service.status);

              return (
                <motion.div key={service.name} variants={item}>
                  <div className="flex items-center justify-between rounded-md border border-gray-800/50 p-3 transition-colors hover:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-gray-800/50 p-2">
                        <ServiceIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">
                          {service.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={cn(
                          'h-4 w-4',
                          getStatusColor(service.status)
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium text-xs',
                          getStatusColor(service.status)
                        )}
                      >
                        {getStatusText(service.status)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={item}
            className="mt-4 border-gray-800/30 border-t pt-3"
          >
            <p className="text-center text-gray-400 text-xs">
              Last updated: {lastUpdatedTime}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
