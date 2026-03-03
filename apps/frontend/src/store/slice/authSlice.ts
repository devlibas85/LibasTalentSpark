import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ✅ Lowercase to match DashboardLayout, Dashboard, and route role props
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
        // ✅ Accept uppercase from backend, normalize to lowercase
        role: "HR" | "EMPLOYEE" | "hr" | "employee";
      }>,
    ) => {
      state.isAuthenticated = true;
      state.name = action.payload.name;
      state.email = action.payload.email;
      // ✅ Always store lowercase so all components agree
      state.role = action.payload.role.toLowerCase() as Role;
    },
    logout: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
