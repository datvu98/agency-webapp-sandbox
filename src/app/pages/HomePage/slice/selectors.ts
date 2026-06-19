import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) => state.loginSlice || initialState;

export const selectLoginSlice = createSelector([selectSlice], state => state);
