import { createSlice } from "@reduxjs/toolkit";

const topologySlice = createSlice({
  name: "topology",
  initialState: { current: {}, graph: {} },
  reducers: {
    setTopology(state, action) {
      state.current = action.payload;
      state.graph = action.payload.graph;
    },
  },
});

export const { setTopology } = topologySlice.actions;

export default topologySlice.reducer;
