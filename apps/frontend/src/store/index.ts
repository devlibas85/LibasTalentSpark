import { configureStore } from "@reduxjs/toolkit";
import { jobFormReducer } from "./jobFormSlice";
import { jobApi } from "./jobApi";
import { referralApi } from "./refralApi"; 

export const store = configureStore({
  reducer: {
    jobForm: jobFormReducer,
    [jobApi.reducerPath]: jobApi.reducer,
    [referralApi.reducerPath]: referralApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      jobApi.middleware,
      referralApi.middleware 
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
