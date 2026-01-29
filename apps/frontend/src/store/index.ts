import { configureStore } from "@reduxjs/toolkit";
import { jobFormReducer } from "./jobFormSlice";
import { jobApi } from "./jobApi";

export const store = configureStore({
  reducer: {
    jobForm: jobFormReducer,
    [jobApi.reducerPath]: jobApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(jobApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
