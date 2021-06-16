import { configureStore } from '@reduxjs/toolkit'

import viewReducer from './viewSlice'
import overlayIdReducer from './overlaySlice'
import topologyReducer from './topologySlice'
import toolsReducer from './toolsSlice'

export default configureStore({
  reducer: {
    view: viewReducer,
    overlayId: overlayIdReducer,
    topology: topologyReducer,
    tools: toolsReducer,
  },
});
