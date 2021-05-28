import { createSlice } from '@reduxjs/toolkit'

//const initialState = {};

const overlaySlice = createSlice({
  name: 'overlayId',
  initialState: {current : ""},
  reducers: {
    setOverlayId(state, action) {
      state.current = action.payload
    },
  },
})

export const { setOverlayId } = overlaySlice.actions

export default overlaySlice.reducer

