import React from 'react'

import './PhotoMessage.css'

import { FaCloudDownloadAlt, FaExclamationTriangle } from 'react-icons/fa'
import { Flex, Image } from 'antd'

const PhotoMessage: React.FC<any> = props => {

  return (
    <div className='rce-mbox-photo'>
      <Flex vertical wrap="wrap" gap={12} align="center">
        {props?.data?.map(img => (
          <Image
            src={img?.uri}
            style={{ objectFit: 'contain' }}
            width={img?.width}
            height={img?.height}
          />
        ))}
      </Flex>
      {props?.text && <div className='rce-mbox-text'>{props.text}</div>}
    </div>
  )
}

export default PhotoMessage
