import { createSlice } from "@reduxjs/toolkit";

const soSlice = createSlice({
  name: "so",
  initialState: {
    objectId: null,
    scheduleId: null,
  },
  reducers: {
    setObjectId: (state, action) => {
      state.objectId = action.payload;
    },
    clearObjectId: (state) => {
      state.objectId = null;
    },
    // setScheduleId: (state, action) => {
    //   state.scheduleId = action.payload;
    // },
    // clearScheduleId: (state) => {
    //   state.scheduleId = null;
    // },
  },
});

export const { setObjectId, clearObjectId } = soSlice.actions;
export default soSlice.reducer;