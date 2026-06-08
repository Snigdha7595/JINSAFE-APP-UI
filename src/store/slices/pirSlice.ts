import { createSlice } from "@reduxjs/toolkit";

const pirSlice = createSlice({
  name: "pir",
  initialState: {
    objectId: null,
    pirId: null,
    safetyId: null,
    responsiblePersonId: null,
  },
  reducers: {
    setObjectId: (state, action) => {
      state.objectId = action.payload;
    },
    clearObjectId: (state) => {
      state.objectId = null;
    },
    setPirId: (state, action) => {
      state.pirId = action.payload;
    },
    clearPirId: (state) => {
      state.pirId = null;
    },
    setSafetyId: (state, action) => {
      state.safetyId = action.payload;
    },
    clearSafetyId: (state) => {
      state.safetyId = null;
    },
    setResponsiblePersonId : (state, action) => {
      state.responsiblePersonId = action.payload;
    },
    clearResponsiblePersonId: (state) => {
      state.responsiblePersonId = null;
    },
  },
});

export const { setObjectId, clearObjectId, setPirId, clearPirId , setSafetyId, clearSafetyId, setResponsiblePersonId, clearResponsiblePersonId} = pirSlice.actions;
export default pirSlice.reducer;