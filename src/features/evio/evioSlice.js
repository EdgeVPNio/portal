import { createSlice } from "@reduxjs/toolkit";

export const elementTypes = {
  eleNode: "ElementTypeNode",
  eleTunnel: "ElementTypeTunnel",
  eleNone: "ElementTypeNone",
};

const evioSlice = createSlice({
  name: "evio",
  initialState: {
    selectedOverlayId: "",
    cyElements: [],
    selectedElementType: elementTypes.eleTypeNone,
    selectedCyElementData:  JSON.stringify({}),
    redrawGraph: "disable", // disable ,false , true
  },
  reducers: {
    setSelectedOverlayId(state, action) {
      state.selectedOverlayId = action.payload;
    },
    setCyElements(state, action) {
      state.cyElements = action.payload;
    },
    setSelectedElementData(state, action) {
      state.elementType = action.payload.elementType;
      state.selectedCyElementData = JSON.stringify(action.payload.selectedCyElementData)
    },
    clearSelectedElement(state) {
      state.elementType = elementTypes.eleNone;
      state.selectedCyElementData = JSON.stringify({});
    },
    setRedrawGraph(state, action) {
      state.redrawGraph = action.payload.redrawGraph;
    },
  },
});

export const {
  setSelectedOverlayId,
  setCyElements,
  setSelectedElementData,
  clearSelectedElement,
  setRedrawGraph,
} = evioSlice.actions;

export default evioSlice.reducer;
