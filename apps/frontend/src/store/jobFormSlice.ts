/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface JobFormState {
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  openings: string;
  deadline: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  benefits: string;
}

const initialState: JobFormState = {
  title: "",
  department: "",
  location: "",
  jobType: "Full-time",
  experienceLevel: "Mid-level",
  salaryMin: "",
  salaryMax: "",
  openings: "1",
  deadline: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: [],
  benefits: "",
};

const jobFormSlice = createSlice({
  name: "jobForm",
  initialState,
  reducers: {
    updateField(
      state,
      action: PayloadAction<{ name: keyof JobFormState; value: any }>
    ) {
      state[action.payload.name] = action.payload.value;
    },

    setFormData(state, action: PayloadAction<Partial<JobFormState>>) {
      return { ...state, ...action.payload };
    },

    resetForm() {
      return initialState;
    },
  },
});

export const { updateField, setFormData, resetForm } =
  jobFormSlice.actions;

export const jobFormReducer = jobFormSlice.reducer;
