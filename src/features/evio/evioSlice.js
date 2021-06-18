import { createSlice } from "@reduxjs/toolkit";

const evioSlice = createSlice({
  name: "evio",
  initialState: { overlayId: "", nodeId: "", tunnelId: "", cy: {} },
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
    setCy(state, action) {
      state.cy = action.payload;
    },
  },
});

export const { setOverlayId, setNodeId, setTunnelId, setCy } =
  evioSlice.actions;

export default evioSlice.reducer;
