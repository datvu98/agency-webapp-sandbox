import { Breadcrumb } from 'antd';
import React, { memo } from 'react';
import { BreadcrumbProps, useLayoutContext } from '../../../contexts/LayoutContext';

const BreadcrumbList = () => {
    const { breadcrumbs } = useLayoutContext();

    return (
        <Breadcrumb separator={">"}>
            {breadcrumbs?.map(
                (_breadcrumb: BreadcrumbProps, index: number) => (
                    <Breadcrumb.Item
                        key={`breadcrumb-layout-${index}`}
                        href={_breadcrumb?.pathname}
                    >
                        {_breadcrumb?.title}
                    </Breadcrumb.Item>
                )
            )}
        </Breadcrumb>
    )
};

export default memo(BreadcrumbList);