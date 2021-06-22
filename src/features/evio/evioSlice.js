import { createSlice } from "@reduxjs/toolkit";

export const elementTypes = {
  eleNode: "ElementTypeNode",
  eleTunnel: "ElementTypeTunnel",
  eleNone: "ElementTypeNone",
};

const evioSlice = createSlice({
  name: "evio",
  initialState: {
    overlayId: "",
    nodeId: "",
    tunnelId: "",
    cyElements: [],
    elementType: elementTypes.eleTypeNone,
    selectedCyElement: null,
    redrawGraph: false,
  },
  reducers: {
    setOverlayId(state, action) {
      state.overlayId = action.payload;
    },
    setNodeId(state, action) {
      state.nodeId = action.payload;
    },
    setTunnelId(state, action) {
      state.tunnelId = action.payload;
    },
    setCyElements(state, action) {
      state.cyElements = action.payload;
    },
    setSelectedElement(state, action) {
      state.elementType = action.payload.elementType;
      state.nodeId = "";
      state.tunnelId = "";
      if (action.payload.elementType === elementTypes.eleNode) {
        state.nodeId = action.payload.nodeId;
      } else if (action.payload.elementType === elementTypes.eleTunnel) {
        state.tunnelId = action.payload.tunnelId;
      }
    },
    clearSelectedElement(state) {
      state.elementType = elementTypes.eleNone;
      state.nodeId = "";
      state.tunnelId = "";
    },
    setBreadcrumbDetails(state, action) {
      state.selectedCyElement = action.payload.selectedElement;
    },
    setRedrawGraph(state, action) {
      state.redrawGraph = action.payload.redrawGraph;
    },
  },
});

export const {
  setOverlayId,
  setNodeId,
  setTunnelId,
  setCyElements,
  setSelectedElement,
  clearSelectedElement,
  setBreadcrumbDetails,
  setRedrawGraph,
} = evioSlice.actions;

export default evioSlice.reducer;
