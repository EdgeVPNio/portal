import { configureStore } from '@reduxjs/toolkit'
import evioReducer from "../features/evio/evioSlice";
import viewReducer from '../features/view/viewSlice'
import toolsReducer from '../features/tools/toolsSlice'

export default configureStore({
  reducer: {
    view: viewReducer,
    evio: evioReducer,
    tools: toolsReducer,
  },
});
