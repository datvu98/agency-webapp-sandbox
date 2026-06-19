import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "types";
import { initialState } from ".";

const selectSlice = (state: RootState) => state.globalSlice || initialState;

export const selectGlobalSlice = createSelector(
  [selectSlice],
  (state) => state
);
