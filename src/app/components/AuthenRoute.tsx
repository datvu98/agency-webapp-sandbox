/*
 * Created by duydatpham@gmail.com on 25/05/2023
 * Copyright (c) 2023 duydatpham@gmail.com
 */
import { selectGlobalSlice } from "app/slice/selectors";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default memo(({ children }: { children: JSX.Element }) => {

    const { accessToken } = useSelector(selectGlobalSlice)
    let location = useLocation();

    if (!accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    } else {
        return children;
    }
})