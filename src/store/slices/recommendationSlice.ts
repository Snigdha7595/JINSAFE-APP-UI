// store/slices/recommendationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RecommendationState {
  editDraftObjectId: string | null;
  editRecommendationId: string | null;
  reviewRecommendationId: string | null;
}

const initialState: RecommendationState = {
  editDraftObjectId: null,
  editRecommendationId: null,
reviewRecommendationId: null,
};

const recommendationSlice = createSlice({
  name: "recommendation",
  initialState,
  reducers: {
    setEditDraftObjectId: (state, action: PayloadAction<string | null>) => {
      state.editDraftObjectId = action.payload;
    },
    setEditRecommendationId: (state, action: PayloadAction<string | null>) => {
      state.editRecommendationId = action.payload;
    },
     setReviewRecommendationId: (state, action: PayloadAction<string | null>) => {
      state.reviewRecommendationId = action.payload; // ← add this
    },
  },
});

export const { setEditDraftObjectId, setEditRecommendationId, setReviewRecommendationId } = recommendationSlice.actions;
export default recommendationSlice.reducer;