'use client';

import type {
  HubActivityLevel,
  Role,
} from '@/lib/generated/prisma/client/client';

export interface SimplifiedHub {
  id: string;
  name: string;
  description: string;
  shortDescription: string | null;
  iconUrl: string;
  bannerUrl: string | null;
  createdAt: Date;
  lastActive: Date;
  rules: string[];
  moderators: {
    id: string;
    role: Role;
    user: { name: string | null; image: string | null; id: string };
  }[];
  reviews: {
    id: string;
    createdAt: Date;
    user: {
      name: string | null;
      id: string;
      image: string | null;
    };
    rating: number;
    text: string;
  }[];
  tags: { name: string }[];
  nsfw: boolean;
  verified: boolean;
  partnered: boolean;
  activityLevel: HubActivityLevel;
  _count: {
    connections: number;
    messages?: number;
  };
}
