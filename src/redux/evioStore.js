import { configureStore } from '@reduxjs/toolkit'

import viewReducer from './viewSlice'
import overlayIdReducer from './overlaySlice'

export default configureStore({
  reducer: {
    currentView: viewReducer,
    selectedOverlayId: overlayIdReducer,
  },
})
