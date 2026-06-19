import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { loginSliceSaga } from './saga';
import { LoginSliceState } from './types';

export const initialState: LoginSliceState = {
  now: Date.now()
};

const slice = createSlice({
  name: 'loginSlice',
  initialState,
  reducers: {
    someAction(state, action: PayloadAction<any>) {
      return {
        ...state,
        now: Date.now()
      }
    },
  },
});

export const { actions: loginSliceActions } = slice;

export const useLoginSliceSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: loginSliceSaga });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useLoginSliceSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
