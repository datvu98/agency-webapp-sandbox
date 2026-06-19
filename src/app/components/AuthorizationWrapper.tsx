import React, { Fragment, memo, useMemo } from "react";

const AuthorizationWrapper = ({ keys, children }) => {
    const isHasPermission = useMemo(() => {
        return true
    }, [keys]);
    if (!isHasPermission) {
        return null;
    }

    return (
        <Fragment>
            {children}
        </Fragment>
    )
}

export default memo(AuthorizationWrapper);