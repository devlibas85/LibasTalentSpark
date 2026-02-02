// src/store/slices/profileSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ---------------- types ---------------- */

export interface ProfileState {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  position: string;
  joinDate: string;
  website: string;
  bio: string;
  avatarUrl: string;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

/* ---------------- initial state ---------------- */

const initialState: ProfileState = {
  id: null,
  name: "",
  email: "",
  phone: "",
  location: "",
  department: "",
  position: "",
  joinDate: "",
  website: "",
  bio: "",
  avatarUrl: "",
  isComplete: false,
  isLoading: false,
  error: null,
};

/* ---------------- helpers ---------------- */

// strictly typed required fields
const requiredFields: Array<
  "name" | "email" | "phone" | "location" | "department" | "position"
> = ["name", "email", "phone", "location", "department", "position"];

const checkProfileComplete = (state: ProfileState): boolean => {
  return requiredFields.every((field) => {
    const value = state[field];
    return typeof value === "string" && value.trim().length > 0;
  });
};

/* ---------------- slice ---------------- */

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      Object.assign(state, action.payload);
      state.isComplete = checkProfileComplete(state);
    },

    updateProfileField: (
      state,
      action: PayloadAction<{
        field: keyof ProfileState;
        value: string;
      }>
    ) => {
      const { field, value } = action.payload;

      if (typeof state[field] === "string") {
        state[field] = value as never;
      }

      state.isComplete = checkProfileComplete(state);
    },

    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setProfileError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearProfile: () => initialState,
  },
});

/* ---------------- exports ---------------- */

export const {
  setProfile,
  updateProfileField,
  setProfileLoading,
  setProfileError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
