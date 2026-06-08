import { createSlice } from "@reduxjs/toolkit";

const mocSlice = createSlice({
  name: "moc",
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

export const { setObjectId, clearObjectId } = mocSlice.actions;
export default mocSlice.reducer;