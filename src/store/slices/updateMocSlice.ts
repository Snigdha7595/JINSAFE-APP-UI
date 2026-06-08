import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MocState {
  objectId: string | null;
  mocAfNo: string | null;
  updateMocData: any | null;
}

const initialState: MocState = {
  objectId: null,
  mocAfNo: null,
  updateMocData: null,
};

const updatemocSlice = createSlice({
  name: "mocupdate",
  initialState,
  reducers: {
    setUpdateMocData: (state, action: PayloadAction<any>) => {
      state.updateMocData = action.payload;
      state.objectId = action.payload?.objectId ?? state.objectId;
      state.mocAfNo = action.payload?.mocAfNo ?? state.mocAfNo;
    },
    clearUpdateMocData: (state) => {
      state.updateMocData = null;
    },
  },
});

export const { setUpdateMocData, clearUpdateMocData } = updatemocSlice.actions;
export default updatemocSlice.reducer;
