import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Web storage
import { encrypt, decrypt } from '@kplian/infrastructure/src/security/crypto';

// Transform to encrypt/decrypt state in persistence (Data Masking Rule)
const encryptTransform = createTransform(
  (inboundState: any) => {
    if (!inboundState) return inboundState;
    return encrypt(JSON.stringify(inboundState));
  },
  (outboundState: string) => {
    if (!outboundState) return outboundState;
    const decrypted = decrypt(outboundState);
    return JSON.parse(decrypted);
  }
);

const rootReducer = combineReducers({
  // Add reducers here (e.g., auth: authReducer)
});

const persistConfig = {
  key: 'root',
  storage,
  transforms: [encryptTransform],
  whitelist: ['auth'], // Only persist specific slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
