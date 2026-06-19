import React from 'react'
import { Modal } from 'antd'

interface VideoPreviewModalProps {
  open: boolean
  videoUrl?: string
  onCancel: () => void
}

const VideoPreviewModal = ({ open, videoUrl, onCancel }: VideoPreviewModalProps) => (
  <Modal
    open={open}
    onCancel={onCancel}
    footer={null}
    width={860}
    centered
    destroyOnClose
    title="Xem video"
  >
    <video
      src={videoUrl}
      controls
      autoPlay
      style={{ width: '100%', maxHeight: '70vh', background: '#000', borderRadius: 8 }}
    />
  </Modal>
)

export default VideoPreviewModal
