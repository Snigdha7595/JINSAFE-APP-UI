import { AuthState } from '@/store/slices/authSlice';

export const loadState = (): { authState?: AuthState } | undefined => {
  try {
    if (typeof sessionStorage === 'undefined') {
      return undefined;
    }
    const serializedAuthState = sessionStorage.getItem('authState');
    const serializedDataState = sessionStorage.getItem('dataState');

    return {
      authState: serializedAuthState ? JSON.parse(serializedAuthState) as AuthState : undefined,
    }
  } catch (err) {
    console.error('Could not load state from session storage', err);
    return undefined;
  }
};

export const saveState = (authState: AuthState) => {
  try {
    const serializedAuthState = JSON.stringify(authState);

    document.cookie = `token=${authState.token}`;
    sessionStorage.setItem('authState', serializedAuthState);

  } catch (err) {
    console.error('Could not save state to session storage', err);
  }
};

export const clearState = () => {
  try {
    document.cookie = `token=null; Max-Age=0; path=/`;
    document.cookie = `token=null; Max-Age=0; path=/${process.env.NEXT_PUBLIC_SUB_PATH}`;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('authState');
    sessionStorage.removeItem('dataState');
    sessionStorage.removeItem('sidebarItems');
    sessionStorage.removeItem('financialYearData');
  } catch (err) {
    console.error('Could not clear state from session storage', err);
  }
};

export const getObjIdState = ()=>{
  try{
    // const serializedAuthState = JSON.stringify(objIdState);

    return sessionStorage.getItem('objId')
  }catch(err){
    console.error('Could not get obj state from session storage', err)
  }
};

export const saveObjIdState = (objIdState: string)=>{
  try{
    // const serializedAuthState = JSON.stringify(objIdState);

    sessionStorage.setItem('objId', objIdState)
  }catch(err){
    console.error('Could not set state from session storage', err)
  }
};

export const clearObjIdState = () => {
  try {
    sessionStorage.removeItem('objId');
  } catch (err) {
    console.error('Could not clear state from session storage', err);
  }
};
