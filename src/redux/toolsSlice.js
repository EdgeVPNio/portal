import { createSlice } from "@reduxjs/toolkit";

const toolsSlice = createSlice({
  name: "tools",
  initialState: {
    zoomMinimum: 0.5,
    zoomMaximum: 2,
    zoomValue: 1,
    autoUpdate: true,
  },
  reducers: {
    setTools(state, action) {
      state.zoomMinimum = action.payload.zoomMinimum;
      state.zoomMaximum = action.payload.zoomMaximum;
      state.zoomValue = action.payload.zoomValue;
      state.autoUpdate = action.payload.autoUpdate;
    },
  },
});

export const { setTools } = toolsSlice.actions;

export default toolsSlice.reducer;
