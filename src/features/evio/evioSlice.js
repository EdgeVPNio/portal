import { createSlice } from "@reduxjs/toolkit";

const evioSlice = createSlice({
  name: "evio",
  initialState: { overlayId: "", nodeId: "", tunnelId: "", cyElements: [] },
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
  },
});

export const { setOverlayId, setNodeId, setTunnelId, setCyElements } =
  evioSlice.actions;

export default evioSlice.reducer;
