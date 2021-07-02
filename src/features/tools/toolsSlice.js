import { createSlice } from "@reduxjs/toolkit";

const toolsSlice = createSlice({
  name: "tools",
  initialState: {
    zoomMinimum: 0.5,
    zoomMaximum: 2.0,
    zoomValue: 1.0,
    autoUpdate: true,
  },
  reducers: {
    configureZoomRange(state, action) {
      state.zoomMinimum = action.payload.zoomMinimum;
      state.zoomMaximum = action.payload.zoomMaximum;
    },
    setZoomValue(state, action) {
      state.zoomValue = action.payload;
    },
    toggleAutoUpdate(state) {
      state.autoUpdate = !state.autoUpdate;
    },
  },
});

export const { configureZoomRange, setZoomValue, toggleAutoUpdate } =
  toolsSlice.actions;

export default toolsSlice.reducer;
