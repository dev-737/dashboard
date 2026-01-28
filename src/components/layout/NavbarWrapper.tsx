import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Navbar } from './Navbar';

export async function NavbarWrapper() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return <Navbar session={session} />;
}
