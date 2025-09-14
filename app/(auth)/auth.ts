// Deprecated: kept for legacy types only. Clerk is used now.
export type UserType = 'guest' | 'regular';

// Local Session type used throughout the app instead of next-auth
export interface Session {
  user?: {
    id?: string;
    type?: UserType;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  expires?: string;
}
