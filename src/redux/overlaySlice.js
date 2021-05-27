import { createSlice } from '@reduxjs/toolkit'

const initialState = "";

const overlaySlice = createSlice({
  name: 'selectedOverlayId',
  initialState,
  reducers: {
    setOverlayId(state, action) {
      state.selectedOverlayId = action.payload
    },
  },
})

export const { setOverlayId } = overlaySlice.actions

export default overlaySlice.reducer

