import { Modal } from 'antd'
import React from 'react'
import TikTokVideoPlayer from './TikTokVideoPlayer'
import {
    DetailModalBody,
    DetailModalLayout,
    DetailModalSide,
    DetailPlayerFrame,
} from '../TikTokVideoDetailModal.styles'
import { ICreatorChannelVideo } from '../CampaignRegister/types/KOCVideoChanel.types'

export interface TikTokVideoDetailModalProps {
    open: boolean
    video: ICreatorChannelVideo | null
    onClose: () => void
    children?: React.ReactNode
}

const TikTokVideoDetailModal = ({
    open,
    video,
    onClose,
    children,
}: TikTokVideoDetailModalProps) => {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            destroyOnClose
            width={children ? 880 : 480}
            styles={{
                body: { padding: '8px 4px 4px' },
                content: { borderRadius: 12 },
            }}
        >
            {video && (
                <DetailModalBody>
                    <DetailModalLayout>
                        <DetailPlayerFrame>
                            <TikTokVideoPlayer
                                video={video}
                                isActive
                                autoPlay
                                showOverlay
                                showShopProducts
                                expandableDescription
                                style={{ width: '100%', height: '100%' }}
                            />
                        </DetailPlayerFrame>
                        {children ? <DetailModalSide>{children}</DetailModalSide> : null}
                    </DetailModalLayout>
                </DetailModalBody>
            )}
        </Modal>
    )
}

export default TikTokVideoDetailModal
