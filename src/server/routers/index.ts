/**
 * Main tRPC router that combines all sub-routers
 */
import { router } from '../trpc';
import { announcementRouter } from './announcement';
import { appealRouter } from './appeal';
import { connectionRouter } from './connection';
import { discoverRouter } from './discover';
import { hubRouter } from './hub';
import { messageRouter } from './message';
import { moderationRouter } from './moderation';
import { serverRouter } from './server';
import { tagsRouter } from './tags';
import { userRouter } from './user';

export const appRouter = router({
  hub: hubRouter,
  user: userRouter,
  server: serverRouter,
  moderation: moderationRouter,
  announcement: announcementRouter,
  discover: discoverRouter,
  tags: tagsRouter,
  connection: connectionRouter,
  appeal: appealRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
