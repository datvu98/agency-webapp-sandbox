// import { useCallback, useMemo, useState } from "react";
// interface ResponseLoadmoreSelect<P> {
//   page?: number,
//   totalPage?: number,
//   loadmore?: (event: any, params: P) => void,
//   items: any,
//   queryList: (params: P) => void,
//   loadingList?: boolean
// }

// function GetTotalPage(
//   {
//     totalRecord, pageSize
//   }: { totalRecord: number, pageSize: number }
// ) {
//   return !!totalRecord ?
//     (totalRecord % pageSize == 0 ?
//       totalRecord / pageSize :
//       Math.floor((totalRecord / pageSize) + 1))
//     : 0
// }

// export function useLoadmore<R, P>(action: (params: P) => Action<R, P>): ResponseLoadmoreSelect<P> {
//   const [items, setItems] = useState<Array<any>>([])
//   const [totalPage, setTotalPage] = useState<number>(0);
//   const [page, setPage] = useState<number>(1);
//   const { query, payload, loading } = useParameterizedQuery<R, P>(action)

//   const _payload: any = useMemo(() => {
//     return payload
//   }, [payload])

//   const queryList = useCallback((params: P) => {
//     query(params)
//   }, [])
//   useMemo(() => {
//     if (!_payload) return
//     if (_payload?.data?.paginations?.meta?.current_page == 1) {
//       setItems(_payload?.data?.collection)
//     } else {
//       setItems((pre) => pre.concat(_payload?.data?.collection))
//     }
//     setPage(_payload?.data?.paginations?.meta?.current_page || 0)
//     setTotalPage(GetTotalPage(
//       {
//         pageSize: _payload?.data?.paginations?.meta?.per_page,
//         totalRecord: _payload?.data?.paginations?.meta?.total,
//       }
//     )
//     )
//   }, [(_payload)])

//   const loadmore = useCallback((event, params) => {
//     const { target } = event;
//     if ((page >= totalPage) || loading) {
//       return
//     }
//     if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
//       query({
//         ...params,
//         page: page + 1
//       })
//     }
//   }
//     , [page, totalPage, loading]);


//   return {
//     page, totalPage, loadmore, items,
//     queryList,
//     loadingList: loading
//   };
// };

export { }