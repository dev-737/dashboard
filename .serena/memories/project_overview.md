# Project Overview

## InterChat Web Dashboard

A Next.js 15 web application providing hub management, analytics, and administrative tools for the InterChat Discord bot platform.

**Purpose**: InterChat is a cross-server Discord communication platform. The web dashboard enables users to:
- Manage Discord server hubs and connections
- Configure moderation settings and view infractions
- Access analytics and platform statistics
- Manage user settings and appeals
- Discover public hubs

**Parent Project**: This is part of a monorepo (`interchat-monorepo`) with:
- `projects/bot/` - Discord bot (Python 3.12+, discord.py)
- `projects/web/` - Web dashboard (Next.js 15, React 19, TypeScript) **[This project]**
- `projects/db/` - Shared database layer (SQLAlchemy 2.0+, PostgreSQL)
- `projects/cli/` - Development CLI (Typer)

**Key Features**:
- Cross-server message broadcasting through interconnected hubs
- Multi-tiered moderation with network-wide enforcement
- Real-time analytics and statistics
- Discord OAuth authentication
- Type-safe APIs via tRPC

**Current Working Directory**: `/home/deboid/Documents/code/interchat.py/projects/web`
