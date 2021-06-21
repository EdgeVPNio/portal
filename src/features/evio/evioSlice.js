import { createSlice } from "@reduxjs/toolkit";

const evioSlice = createSlice({
  name: "evio",
  initialState: { overlayId: "", nodeId: "", tunnelId: "", cyElements: [], selectedElement: null, redrawGraph: false },
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
    setBreadcrumbDetails(state, action) {
      state.selectedElement = action.payload.selectedElement;
    },
    setRedrawGraph(state, action) {
      state.redrawGraph = action.payload.redrawGraph;
    },
  },
});

export const { setOverlayId, setNodeId, setTunnelId, setCyElements, setBreadcrumbDetails,  setRedrawGraph} =
  evioSlice.actions;

export default evioSlice.reducer;
