import { createSlice } from '@reduxjs/toolkit'

const viewSlice = createSlice({
  name: "view",
  initialState: { current: "AppView", selected: "" },
  reducers: {
    setCurrentView(state, action) {
      state.current = action.payload;
    },
    setSelectedView(state, action) {
      state.selected = action.payload;
    },
  },
});

export const { setCurrentView, setSelectedView } = viewSlice.actions;

export default viewSlice.reducer
