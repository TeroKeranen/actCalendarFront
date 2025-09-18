
import { configureStore } from '@reduxjs/toolkit';

import userReducer from './features/user/userSlice';
import tenantReducer from './features/tenant/tenantSlice'


export const store = configureStore({
    reducer: {
        userState: userReducer,
        tenant: tenantReducer
    }
})