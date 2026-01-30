import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { jobFormReducer } from "./slice/jobFormSlice";
import { jobApi } from "./jobApi";
import { referralApi } from "./refralApi";
import authReducer from "./slice/authSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

/* ---------------- persist config ---------------- */

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], 
};

/* ---------------- root reducer ---------------- */

const rootReducer = combineReducers({
  auth: authReducer,
  jobForm: jobFormReducer,
  [jobApi.reducerPath]: jobApi.reducer,
  [referralApi.reducerPath]: referralApi.reducer,
});

/* ---------------- persisted reducer ---------------- */

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ---------------- store ---------------- */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(jobApi.middleware, referralApi.middleware),
});

/* ---------------- persistor ---------------- */

export const persistor = persistStore(store);

/* ---------------- types ---------------- */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
