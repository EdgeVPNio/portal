import { createSlice } from "@reduxjs/toolkit";
import { 
  elementTypes, 
  appViews,
  nodeStates,} from "../../app/Shared";

const evioSlice = createSlice({
  name: "evio",
  initialState: {
    selectedOverlayId: "",
    cyElements: [],
    selectedElementType: elementTypes.eleTypeNone,
    selectedCyElementData: JSON.stringify({}),
    redrawGraph: false,
  },
  reducers: {
    setSelectedOverlayId(state, action) {
      state.selectedOverlayId = action.payload;
    },
    setCyElements(state, action) {
      state.cyElements = action.payload;
    },
    setSelectedElement(state, action) {
      state.selectedElementType = action.payload.selectedElementType;
      state.selectedCyElementData = JSON.stringify(
        action.payload.selectedCyElementData
      );
    },
    clearSelectedElement(state) {
      state.selectedElementType = elementTypes.eleNone;
      state.selectedCyElementData = JSON.stringify({});
    },
    setRedrawGraph(state, action) {
      state.redrawGraph = action.payload;
    },
  },
});

export const {
  setSelectedOverlayId,
  setCyElements,
  setSelectedElement,
  clearSelectedElement,
  setRedrawGraph,
} = evioSlice.actions;

export default evioSlice.reducer;
