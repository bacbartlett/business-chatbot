import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: ['/ping'],
  ignoredRoutes: ['/favicon.ico', '/sitemap.xml', '/robots.txt', '/_next/(.*)'],
});

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
