import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
import authSlice from "./authSlice";
import classSlice from "./classSlice";

const rootReducer = combineReducers({
    auth: authSlice,
    class: classSlice,
});
const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["auth", "class"],
};

const persistedReducer = persistReducer(authPersistConfig, rootReducer);  

const store = configureStore({
    reducer: persistedReducer
});

const persistor = persistStore(store);

export { store, persistor };
