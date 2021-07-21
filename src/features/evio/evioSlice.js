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
    setRedrawGraph(state, action) {
      state.redrawGraph = action.payload;
    },
  },
});

export const {
  setSelectedOverlayId,
  setCyElements,
  setRedrawGraph,
} = evioSlice.actions;

export default evioSlice.reducer;
