import React from 'react'
import { STATUS_MAP } from '../CampaignRegister/constants/constant'

type StatusLabelProps = {
    status?: string
}

const StatusLabel = ({ status }: StatusLabelProps) => {
    const statusConfig = status ? STATUS_MAP[status] : undefined
    if (!statusConfig) return null

    return (
        <span style={{ color: statusConfig.color, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusConfig.color, display: 'inline-block' }}></span>
            {statusConfig.label}
        </span>
    )
}

export default StatusLabel