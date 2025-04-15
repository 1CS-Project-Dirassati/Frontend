import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import resetPasswordReducer from "./features/auth/resetPasswordSlice"; 
import authReducer from "./features/auth/authSlice";

// Persist config for auth reducer
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'isAuthenticated'] // only these will be persisted
};
const resetPasswordPersistConfig = {
  key: 'resetPassword',
  storage,
  whitelist: ['isVerifiedOTP', 'email', 'otp'] // persist these fields
};

const rootReducer = {
  resetPassword: persistReducer(resetPasswordPersistConfig, resetPasswordReducer),
    auth: persistReducer(authPersistConfig, authReducer),
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);