import { createSlice } from "@reduxjs/toolkit";

const csmSlice = createSlice({
  name: "csm",
  initialState: {
    objectId: null,
  },
  reducers: {
    setObjectId: (state, action) => {
      state.objectId = action.payload;
    },
    clearObjectId: (state) => {
      state.objectId = null;
    },
  },
});

export const { setObjectId, clearObjectId } = csmSlice.actions;
export default csmSlice.reducer;