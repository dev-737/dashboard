import { auth } from '@/auth';
import { Navbar } from './Navbar';

export async function NavbarWrapper() {
  const session = await auth();
  return <Navbar session={session} />;
}
