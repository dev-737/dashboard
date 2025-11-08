declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    sessionToken?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number | null;
  }
}

// Custom user type for our components
export interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
