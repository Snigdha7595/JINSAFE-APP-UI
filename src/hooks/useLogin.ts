'use client';

import { APP_URL } from '@/config/constant';
import { userRedirects } from '@/config/path';
import { fetchUserData, login } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

interface User {
  higher_role: Array<{ role_code: string }>;
}

interface LoginData {
  access_token: string;
  user: User;
  expiresInMins: number;
}

const useLogin = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const setSessionData = (token: string, user: User, expiresInMins: number) => {
    sessionStorage.setItem('token', JSON.stringify(token));
    sessionStorage.setItem('expiresInMins', expiresInMins.toString());
    sessionStorage.setItem('expiresAt', JSON.stringify(Date.now() + expiresInMins * 60 * 1000));
    //sessionStorage.setItem('userInfo', JSON.stringify(user));
  };

  const setCookie = (token: string) => {
    const maxAge = 60 * 60 * 24;
    const expires = new Date();
    expires.setTime(expires.getTime() + maxAge * 1000);
    document.cookie = `token=${token}; max-age=${maxAge}; expires=${expires.toUTCString()}; path=/`;
  };

  const redirectTo = (role_code: string) => {
    console.log("Redirecting based on role_code:", role_code);
    const redirectUrl =
      userRedirects[role_code] || APP_URL.DEFAULT_APP_PATH;
    router.push(redirectUrl);
  };

  const loginUser = async (data: any) => {
    console.log(data)
    const { accessToken, user, expiresInMins } = data; // access_token
    console.log("expiresInMins", expiresInMins);
    setSessionData(accessToken, user, expiresInMins); //jiten
    setCookie(accessToken);
    dispatch(login(data));
    dispatch(fetchUserData({roleCode: data.user.roleCode, token:data.accessToken}));
    //redirectTo(user.higher_role[0].role_code);
    redirectTo(user.roleCode);
  };

  return loginUser;
};

export default useLogin;
