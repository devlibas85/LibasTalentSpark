import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slice/authSlice";
import profileReducer from "../store/slice/profileSlice";
import { jobFormReducer } from "./slice/jobFormSlice";

import { jobApi } from "./api/jobApi";
import { referralApi } from "./api/refralApi";
import { profileApi } from "./api/profileApi";
import { authApi } from "./api/authApi";

/* ────────────────────────────────────────────────────────────
   Persist config
   - auth is intentionally NOT persisted — the httpOnly cookie
     is the source of truth; /auth/me rehydrates Redux on load
   - profile IS persisted to avoid a flash of empty profile UI
──────────────────────────────────────────────────────────── */
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["profile"],
};

/* ---------------- root reducer ---------------- */
const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  jobForm: jobFormReducer,

  [jobApi.reducerPath]: jobApi.reducer,
  [referralApi.reducerPath]: referralApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
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
      profileApi.middleware,
      authApi.middleware,
    ),
});

/* ---------------- persistor ---------------- */
export const persistor = persistStore(store);

/* ---------------- types ---------------- */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
