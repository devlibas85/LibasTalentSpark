import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Role = "hr" | "employee";

interface AuthState {
  isAuthenticated: boolean;
  name: string | null;
  email: string | null;
  role: Role | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  name: null,
  email: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        role: "HR" | "EMPLOYEE" | "hr" | "employee";
      }>,
    ) => {
      state.isAuthenticated = true;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role.toLowerCase() as Role;
    },
    logout: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
