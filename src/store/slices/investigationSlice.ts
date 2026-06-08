import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InvestigationState {
  objectId: string | null;
}

const initialState: InvestigationState = {
  objectId: null,
};

const investigationSlice = createSlice({
  name: 'investigation',
  initialState,
  reducers: {
    setObjectId: (state, action: PayloadAction<string>) => {
      state.objectId = action.payload;
    },
    clearObjectId: (state) => {
      state.objectId = null;
    },
  },
});

export const { setObjectId, clearObjectId } = investigationSlice.actions;
export const selectObjectId = (state: any) => state.investigation.objectId;

export default investigationSlice.reducer;