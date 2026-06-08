import { createSlice } from "@reduxjs/toolkit";

const lwSlice = createSlice({
  name: "lw",
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
    setScheduleId: (state, action) => {
      state.scheduleId = action.payload;
    },
    clearScheduleId: (state) => {
      state.scheduleId = null;
    },
  },
});

export const { setObjectId, clearObjectId, setScheduleId, clearScheduleId } = lwSlice.actions;
export default lwSlice.reducer;