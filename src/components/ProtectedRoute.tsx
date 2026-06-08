'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { roleRestrictions, userRedirects } from '@/config/path';
import { APP_URL } from '@/config/constant';

const ProtectedRoute = (WrappedComponent: any) => {
  const ProtectedRouteComponent = (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const [previousPath, setPreviousPath] = useState<any>([]);
    const { isAuthenticated, user } = useSelector(
      (state: RootState) => state.auth
    );
    useEffect(() => {
      setPreviousPath((prev: any) => [...prev, pathname]);
    }, [pathname]);
    useEffect(() => {
      if (!isAuthenticated && pathname !== APP_URL.CONTRACTOR_LOGIN) {
        router.push(APP_URL.DEFAULT_APP_PATH);
      } else {
        const userRoleCode = user.roleCode;
        const restrictedUrls = roleRestrictions[userRoleCode];
        if (restrictedUrls.some((route: any) => pathname.startsWith(route))) {
          // router.push(userRedirects[userRoleCode]);
        }
      }


    }, [isAuthenticated, user, router, pathname, previousPath]);

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
  return ProtectedRouteComponent;
};

export default ProtectedRoute;