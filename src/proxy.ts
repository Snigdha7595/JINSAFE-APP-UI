import { NextRequest, NextResponse } from 'next/server';
import { APP_URL } from './config/constant';

export default function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS' || req.method === 'DELETE' || req.method === 'PUT') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  const { pathname } = req.nextUrl;

  const publicPaths = ['/', '/favicon.ico', '/public', '/_next', '/api'];
  const assetFolders = ['/images'];
  const fontsFolders = ['/font'];
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    assetFolders.some((folder) => pathname.startsWith(folder)) ||
    fontsFolders.some((folder) => pathname.startsWith(folder))
  ) {
    const response = NextResponse.next();
    response.headers.delete('x-powered-by');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }


  const token = req.cookies.get('token');
  if (!token && (req.nextUrl.pathname != '/forgot')) {
    const redirectURL = new URL(APP_URL.DEFAULT_APP_PATH, req.nextUrl.origin);
    const response = NextResponse.redirect(redirectURL.toString());
    response.headers.delete('x-powered-by');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

export const config = {
  matcher: [
    '/',
    '/:path*'
  ], 
};
