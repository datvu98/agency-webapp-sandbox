
import React, { memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import queryString from 'querystring';
import { PaginationWrapper } from './Pagination.styles'
import { LeftOutlined, RightOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';

const optionsPagination = [
    { label: 10, value: 10 },
    { label: 25, value: 25 },
    { label: 50, value: 50 },
    { label: 100, value: 100 },
];

export default memo(({
    page, totalPage, loading,
    limit, totalRecord, count, showOptions = true,
    basePath, emptyTitle = 'Danh sách trống.', isShowEmpty = true, options = []
}: any) => {
    const navigate = useNavigate()
    const params = queryString.parse(useLocation().search.slice(1, 100000))
    if (totalPage <= 0) {
        return <>
            {!loading && isShowEmpty && <div className='text-center my-8' ><span className="text-muted">{emptyTitle}</span></div>}
            <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="d-flex align-items-center py-3 px-3">
                    {
                        loading && <div className="d-flex align-items-center">
                            <div className="mr-2 text-muted">Đang tải...</div>
                            <div className="spinner spinner-success mr-10"></div>
                        </div>
                    }
                    <span className="text-muted">Hiển thị 0 - 0 của 0</span>
                </div>
            </div>
        </>
    };

    return (
        <PaginationWrapper>
            <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="d-flex align-items-center py-3 px-3">
                    {
                        loading && <div className="d-flex align-items-center">
                            <div className="mr-2 text-muted">Đang tải...</div>
                            <div className="spinner spinner-success mr-10"></div>
                        </div>
                    }

                    <select
                        className="form-control form-control-md text-primary font-weight-bold mr-4 border-0 bg-light-primary"
                        value={limit}
                        disabled={!showOptions}
                        onChange={e => {
                            navigate(`${basePath}?${queryString.stringify({
                                ...params,
                                page: 1,
                                limit: e.target.value
                            })}`)
                        }}
                    >
                        {(options?.length > 0 ? options : optionsPagination)?.map(
                            _option => <option
                                key={`option-pagination-${_option.value}`}
                                value={_option.value}
                            >
                                {`${_option.value} bản ghi/trang`}
                            </option>
                        )}
                    </select>
                    <span className="text-muted" style={{ minWidth: 150 }}>Hiển thị {(page - 1) * limit + 1} - {(page - 1) * limit + count} {!!totalRecord ? `của ${totalRecord}` : ''}</span>
                </div>
                <div className="d-flex flex-wrp py-2 mr-3">
                    {page > 1 && <Link to={`${basePath}?${queryString.stringify({
                        ...params,
                        page: 1,
                        limit
                    })}`} className="btn btn-icon btn-sm btn-light-primary mr-2 my-1"><DoubleLeftOutlined /></Link>}
                    {page > 1 && <Link to={`${basePath}?${queryString.stringify({
                        ...params,
                        page: page - 1,
                        limit
                    })}`} className="btn btn-icon btn-sm btn-light-primary mr-2 my-1"><LeftOutlined /></Link>}

                    {page > 3 && <a href="#" className="btn btn-icon btn-sm border-0 btn-hover-primary mr-2 my-1">...</a>}
                    {
                        [page - 1, page, page + 1, page + 2].filter(_page => _page > 0 && _page <= totalPage).map(_page => {
                            if (_page == page) {
                                return <Link key={`page--${_page}`} to={`${basePath}?${queryString.stringify({
                                    ...params,
                                    page: _page,
                                    limit
                                })}`} className="btn btn-icon btn-sm border-0 btn-hover-primary active mr-2 my-1">{_page}</Link>
                            }
                            return <Link key={`page--${_page}`} to={`${basePath}?${queryString.stringify({
                                ...params,
                                page: _page,
                                limit
                            })}`} className="btn btn-icon btn-sm border-0 btn-hover-primary mr-2 my-1">{_page}</Link>
                        })
                    }
                    {page < totalPage - 4 && <a href="#" className="btn btn-icon btn-sm border-0 btn-hover-primary mr-2 my-1">...</a>}

                    {page < totalPage && <Link to={`${basePath}?${queryString.stringify({
                        ...params,
                        page: page + 1,
                        limit
                    })}`} className="btn btn-icon btn-sm btn-light-primary mr-2 my-1"><RightOutlined /></Link>}
                    {page < totalPage && <Link to={`${basePath}?${queryString.stringify({
                        ...params,
                        page: totalPage,
                        limit
                    })}`} className="btn btn-icon btn-sm btn-light-primary mr-2 my-1"><DoubleRightOutlined /></Link>}
                </div>
            </div>
        </PaginationWrapper>
    )
})