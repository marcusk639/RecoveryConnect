import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import authReducer from './slices/authSlice';
import groupsReducer from './slices/groupsSlice';
import transactionsReducer from './slices/transactionsSlice';
import treasuryReducer from './slices/treasurySlice';
import meetingsReducer from './slices/meetingsSlice';
import announcementsReducer from './slices/announcementsSlice';
import membersReducer from './slices/membersSlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    transactions: transactionsReducer,
    treasury: treasuryReducer,
    meetings: meetingsReducer,
    announcements: announcementsReducer,
    members: membersReducer,
    chat: chatReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // To allow Firebase objects in the store
    }),
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks for typed dispatch and selector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
