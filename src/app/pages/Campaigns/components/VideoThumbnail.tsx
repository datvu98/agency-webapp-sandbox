import React, { useState } from 'react'
import { PlayCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import VideoPreviewModal from './VideoPreviewModal'

interface VideoThumbnailProps {
  url?: string | null
  showCheck?: boolean // 👈 prop mới
}

const VideoThumbnail = ({ url, showCheck = false }: VideoThumbnailProps) => {
  const [open, setOpen] = useState(false)

  if (!url) return null

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: 90,
          height: 120,
          overflow: 'hidden',
          borderRadius: 6,
          background: '#000',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(true)}
      >
        <video
          src={url}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Nút play */}
        <PlayCircleOutlined
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 28,
            color: '#fff',
            pointerEvents: 'none',
          }}
        />

        {/* ✅ Tích xanh */}
        {showCheck && (
          <CheckCircleFilled
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              fontSize: 14,
              color: '#52c41a',
              background: '#fff',
              borderRadius: '50%',
            }}
          />
        )}
      </div>

      <VideoPreviewModal
        open={open}
        videoUrl={url}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

export default VideoThumbnail