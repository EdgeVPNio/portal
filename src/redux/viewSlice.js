import { createSlice } from '@reduxjs/toolkit'

const initialState = { current: "OverlaysView" }; 

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setView(state, action) {
      state.current = action.payload
    },
  },
})

export const { setView } = viewSlice.actions

export default viewSlice.reducer
