// Deprecated: kept for legacy types only. Clerk is used now.
export type UserType = 'guest' | 'regular';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const auth = undefined as never;
export const signIn = undefined as never;
export const signOut = undefined as never;
export const GET = undefined as never;
export const POST = undefined as never;
