import { z } from 'zod/v4';
import { SortOptions } from '@/app/hubs/constants';

// Schema for creating a hub
export const createHubSchema = z.object({
  name: z.string().min(3).max(32),
  description: z.string().min(10).max(500),
  shortDescription: z.string().min(10).max(100).optional(),
  private: z.boolean().prefault(true),
  rules: z.array(z.string()).optional(),
  settings: z.any().optional(),
});

// Schema for hub search
export const hubSearchSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  skip: z.number().optional().prefault(0),
  limit: z.number().optional().prefault(12),
  sort: z.enum(SortOptions).optional().prefault(SortOptions.Trending),
});
