import { createSlice } from '@reduxjs/toolkit';
import { AUTH_STORAGE_KEY } from '../../constants/auth';

function loadInitialAuth() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      isAuthenticated: Boolean(parsed.user && parsed.accessToken),
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };
  }
}

const initialState = loadInitialAuth();

const persistAuth = (state) => {
  if (state.user && state.accessToken) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    );
    localStorage.setItem('accessToken', state.accessToken);
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('accessToken');
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
      persistAuth(state);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      persistAuth(state);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
