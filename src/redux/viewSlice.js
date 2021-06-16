import { createSlice } from '@reduxjs/toolkit'

//const initialState = { current: "OverlaysView" }; 

const viewSlice = createSlice({
  name: 'view',
  initialState: { current: "AppView", selected: "" },
  reducers: {
    setView(state, action) {
      state.current = action.payload.current
      state.selected = action.payload.selected;
    },
  },
})

export const { setView } = viewSlice.actions

export default viewSlice.reducer
