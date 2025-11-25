# Project Overview

**InterChat Web Dashboard** is a modern, responsive web dashboard for InterChat, built to provide comprehensive hub management, analytics, and administrative tools for Discord server networks.

## Key Features

*   **Hub Management**: Dashboard for statistics, connection management, moderation tools, member management, and invite systems.
*   **Authentication & Security**: Discord OAuth integration, role-based access control, and secure session management via NextAuth.js.
*   **Analytics & Insights**: Real-time metrics, performance dashboards, and user analytics.
*   **Modern UI/UX**: Responsive design with dark/light themes, built using Radix UI and Tailwind CSS.
*   **Administrative Tools**: NSFW compliance monitoring and announcement systems.

## Architecture

The project uses **Next.js 16 App Router** and is built with **TypeScript**. It leverages **tRPC v11** for type-safe API communication between the client and server. Database interactions are handled via **Prisma v7** (PostgreSQL) and **Redis** (ioredis).
