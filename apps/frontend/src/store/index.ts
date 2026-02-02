import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slice/authSlice";
import profileReducer from "../store/slice/profileSlice";
import { jobFormReducer } from "./slice/jobFormSlice";

import { jobApi } from "./api/jobApi";
import { referralApi } from "./api/refralApi";
import { profileApi } from "./api/profileApi";

/* ---------------- persist config ---------------- */

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "profile"], // ✅ only normal slices
};

/* ---------------- root reducer ---------------- */

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer, // ✅ FIXED
  jobForm: jobFormReducer,

  [jobApi.reducerPath]: jobApi.reducer,
  [referralApi.reducerPath]: referralApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
});

/* ---------------- persisted reducer ---------------- */

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ---------------- store ---------------- */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      jobApi.middleware,
      referralApi.middleware,
      profileApi.middleware
    ),
});

/* ---------------- persistor ---------------- */

export const persistor = persistStore(store);

/* ---------------- types ---------------- */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
