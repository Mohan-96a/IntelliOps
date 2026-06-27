import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeIncidents: [],
  selectedIncident: null,
  realtimeConnected: false,
};

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setActiveIncidents(state, action) {
      state.activeIncidents = action.payload;
    },
    addIncident(state, action) {
      state.activeIncidents.unshift(action.payload);
    },
    updateIncident(state, action) {
      const idx = state.activeIncidents.findIndex((i) => i.incidentId === action.payload.incidentId);
      if (idx !== -1) state.activeIncidents[idx] = action.payload;
    },
    setSelectedIncident(state, action) {
      state.selectedIncident = action.payload;
    },
    setRealtimeConnected(state, action) {
      state.realtimeConnected = action.payload;
    },
  },
});

export const {
  setActiveIncidents,
  addIncident,
  updateIncident,
  setSelectedIncident,
  setRealtimeConnected,
} = incidentSlice.actions;
export default incidentSlice.reducer;
