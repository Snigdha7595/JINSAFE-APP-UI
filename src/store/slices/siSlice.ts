import { createSlice } from "@reduxjs/toolkit";

const siSlice = createSlice({
  name: "si",
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

export const { setObjectId, clearObjectId, setScheduleId, clearScheduleId } = siSlice.actions;
export default siSlice.reducer;