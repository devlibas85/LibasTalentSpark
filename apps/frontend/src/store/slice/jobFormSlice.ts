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

type UpdateFieldPayload<K extends keyof JobFormState> = {
  name: K;
  value: JobFormState[K];
};

const jobFormSlice = createSlice({
  name: "jobForm",
  initialState,
  reducers: {
    updateField<K extends keyof JobFormState>(
      state: JobFormState,
      action: PayloadAction<UpdateFieldPayload<K>>
    ) {
      state[action.payload.name] = action.payload.value;
    },

    setFormData(
      state: JobFormState,
      action: PayloadAction<Partial<JobFormState>>
    ) {
      return { ...state, ...action.payload };
    },

    resetForm() {
      return initialState;
    },
  },
});

export const {
  updateField,
  setFormData,
  resetForm,
} = jobFormSlice.actions;

export const jobFormReducer = jobFormSlice.reducer;
