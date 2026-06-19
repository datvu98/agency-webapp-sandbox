import { useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import query_affGetCrawCreatorInfo from 'graphql/queries/query_affGetCrawCreatorInfo'
import { ICreatorInfoResponse } from '../types/KOCVideoChanel.types'

export const useKocCreatorInfo = (creatorId?: number, open = false) => {
    const [creatorInfo, setCreatorInfo] = useState<ICreatorInfoResponse | null>(null)
    const [loading, setLoading] = useState(false)

    const [fetchCreatorInfo] = useLazyQuery(query_affGetCrawCreatorInfo, {
        fetchPolicy: 'network-only',
    })

    const loadCreatorInfo = useCallback(async () => {
        if (!creatorId) return

        setLoading(true)
        try {
            const { data } = await fetchCreatorInfo({
                variables: { creatorId },
            })

            const res = data?.affGetCrawCreatorInfo
            if (res?.success && res.data) {
                setCreatorInfo({
                    code: null,
                    message: res.message ?? null,
                    success: res.success,
                    data: res.data,
                })
            } else {
                setCreatorInfo(null)
            }
        } finally {
            setLoading(false)
        }
    }, [creatorId, fetchCreatorInfo])

    useEffect(() => {
        if (!open || !creatorId) {
            setCreatorInfo(null)
            setLoading(false)
            return
        }

        setCreatorInfo(null)
        loadCreatorInfo()
    }, [open, creatorId])

    return {
        creatorInfo,
        loading,
        refetchCreatorInfo: loadCreatorInfo,
    }
}
