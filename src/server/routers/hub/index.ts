import { router } from '../../trpc';
import { baseRouter } from './base';
import { invitesRouter } from './invites';
import { membersRouter } from './members';
import { settingsRouter } from './settings';

export const hubRouter = router({
  ...baseRouter._def.procedures,
  ...membersRouter._def.procedures,
  ...invitesRouter._def.procedures,
  ...settingsRouter._def.procedures,
});
