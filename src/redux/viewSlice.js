import { createSlice } from '@reduxjs/toolkit'

const initialState = "OverlaysView"; 

const viewSlice = createSlice({
  name: 'currentView',
  initialState,
  reducers: {
    changeView(state, action) {
      state.currentView = action.payload
    },
  },
})

export const { changeView } = viewSlice.actions

export default viewSlice.reducer
