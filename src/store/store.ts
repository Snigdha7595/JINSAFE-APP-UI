import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './slices/authSlice';
import { loadState, saveState } from '@/utils/sessionStorage';
import menuReducer from './slices/menuSlice';
import siReducer from './slices/siSlice';
import lwReducer from './slices/lwSlice';
import soReducer from './slices/soSlice';
import pirReducer from './slices/pirSlice';
import mocReducer from '@/store/slices/mocSlice';
import csmReducer from '@/store/slices/csmSlice';
import investigationReducer from './slices/investigationSlice';
import updatemocReducer from './slices/updateMocSlice';
import recommendationReducer from './slices/recommendationSlice';

export interface PreLoadState {
  auth: AuthState;
}

const preloadedState: PreLoadState = {
  auth: loadState()?.authState || {
    isAuthenticated: false,
    user: null,
    userRole: null,
    token: null,
    userState: null, // Add missing property
    currentDrilldownState: null, // Add missing property
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    si: siReducer,
    lw: lwReducer,
    so: soReducer,
    pir: pirReducer,
    moc: mocReducer,
    csm: csmReducer,
    investigation: investigationReducer,
    mocupdate: updatemocReducer,
    recommendation: recommendationReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveState(state.auth);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;