import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { clearState } from '@/utils/sessionStorage';
import { serverRequest } from '@/services/getServerSideRender';
import { CONSTANTS } from '@/config/constant';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  userRole: string | null;
  userState: any | null;
  currentDrilldownState: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  userRole: null,
  userState: null,
  currentDrilldownState: '',
};

interface FetchUserDataParams {
  roleCode: string;
  token: string;
}

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async ({ roleCode, token }: FetchUserDataParams) => {
    let userInformation = {
      state_name: null,
      district_name: null,
      district_code: null,
      block_name: null,
      block_code: null,
      block: null,
      block_udise:null,
      village: null,
      village_name: null,
      udise_village_ward_code: null,
      cluster:null,
      cluster_name: null,
      school: null,
      school_name: null,
    };
    return userInformation;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<any>) {
      console.log(action.payload.user)
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.userRole = action.payload.user.roleCode;
      state.token = action.payload.accessToken;
    },
    updateDrilldownState(state, action: PayloadAction<string | null>) {
      state.currentDrilldownState = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.userRole = null;
      state.userState = null;
      state.currentDrilldownState = null;
      clearState();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchUserData.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (state.userState) {
          state.userState = {
            ...state.userState,
            ...action.payload,
          };
        }
      }
    );
  },
});

export const { login, updateDrilldownState, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectUserToken = (state: RootState) => state.auth.token;
export const selectCurrentDrilldownState = (state: RootState) =>
  state.auth.currentDrilldownState;
export const selectUserRole = (state: RootState) => state.auth.userRole;
export const selectUserState = (state: RootState) => state.auth.userState;
