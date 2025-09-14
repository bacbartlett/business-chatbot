import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',
    '/((?!_next/static|_next/image).*)',
  ],
};
