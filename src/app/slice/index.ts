import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "utils/@reduxjs/toolkit";
import { useInjectReducer, useInjectSaga } from "utils/redux-injectors";
import { globalSliceSaga } from "./saga";
import { GlobalSliceState } from "./types";

export const initialState: GlobalSliceState = {
  inited: false,
  accessToken: '',
  email: '',
  user: null,
  roles: [],
  user_id: '',
  name: ''
};

const slice = createSlice({
  name: "globalSlice",
  initialState,
  reducers: {
    saveUserName(state, action: PayloadAction<any>) {
      return {
        ...state,
        name: action.payload
      }
    },


    saveUserId(state, action: PayloadAction<any>) {
      return {
        ...state,
        user_id: action.payload
      }
    },

    someAction(state, action: PayloadAction<any>) {
      return {
        ...state,
        inited: action.payload
      }
    },

    saveRole(state, action: PayloadAction<any>) {
      const { roles } = action.payload;
      return {
        ...state,
        roles
      }
    },
    saveUser(state, action: PayloadAction<any>) {
      const { user } = action.payload;
      return {
        ...state,
        user
      }
    },
    updateUser(state, action: PayloadAction<any>) {
      const { full_name, phone, avatar_url } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          full_name,
          phone,
          avatar_url
        }
      }
    },

    saveToken(state, action: PayloadAction<any>) {
      if (!action.payload) {
        return {
          ...state,
          inited: true,
          accessToken: action.payload
        }
      }
      const { token, email } = action.payload
      return {
        ...state,
        inited: true,
        accessToken: token,
        email
      }
    },
  },
});

export const { actions: globalSliceActions } = slice;

export const useGlobalSliceSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: globalSliceSaga });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useGlobalSliceSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
