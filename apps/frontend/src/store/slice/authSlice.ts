import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Role = "hr" | "employee";

interface AuthState{
    isAuthenticated:boolean;
    name:string|null;
    email:string|null;
    role:Role |null;
    token:string|null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  name: null,
  email: null,
  role: null,
  token: null,
};

const authSlice = createSlice({
    name:"auth",
    initialState,

    reducers:{
        setAuth:(
            state,
            action:PayloadAction<{
                name:string;
                email:string;
                role:Role;
                token:string;
            }>
        )=>{
            state.isAuthenticated=true;
            state.name=action.payload.name
              state.email = action.payload.email;
      state.role = action.payload.role;
      state.token = action.payload.token;
        },
         logout: (state) => {
      Object.assign(state, initialState);
      localStorage.clear();
    },
}

})

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;