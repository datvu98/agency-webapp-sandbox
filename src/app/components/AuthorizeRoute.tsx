/*
 * Created by duydatpham@gmail.com on 25/05/2023
 * Copyright (c) 2023 duydatpham@gmail.com
 */
import { selectGlobalSlice } from "app/slice/selectors";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default memo(({ children }: any) => {
    const { user } = useSelector(selectGlobalSlice);

    if (!!user?.is_subuser) {
        return <Navigate to="/error/403" replace />
    }

    return children;
})