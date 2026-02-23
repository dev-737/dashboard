'use client';

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            toastOptions={{
                style: {
                    background: 'rgba(17, 24, 39, 0.98)',
                    color: 'hsl(210 40% 98%)',
                    border: '1px solid rgba(55, 65, 81, 0.6)',
                    backdropFilter: 'blur(12px)',
                },
                classNames: {
                    success: '!border-emerald-500/30 [&>*:first-child]:text-emerald-400',
                    error: '!border-red-500/30 [&>*:first-child]:text-red-400',
                    warning: '!border-amber-500/30 [&>*:first-child]:text-amber-400',
                    info: '!border-blue-500/30 [&>*:first-child]:text-blue-400',
                },
            }}
            style={
                {
                    '--border-radius': '0.5rem',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
