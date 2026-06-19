import { CloseCircleFilled, FileImageOutlined, SendOutlined } from "@ant-design/icons";
import { useLazyQuery, useQuery } from "@apollo/client";
import { AutoComplete, Button, Col, Flex, Input, Modal, Row, Skeleton, Tooltip, Upload } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { selectCurrentConverstation } from "app/pages/ChatPage/slice/selectors";
import query_chatTplMessageEnableSuggest from "graphql/queries/query_chatTplMessageEnableSuggest";
import query_chatTplMessageSuggest from "graphql/queries/query_chatTplMessageSuggest";
import { debounce } from "lodash";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { hasPermissionAction, showAlert } from "utils/helper";

const ChatInputWrapper = styled.div`
    .toolbar-chat {
        padding: 6px 12px;
        border-bottom: 1px solid #F0F0F0; 
        background-color: #fff;

        .icon {
            cursor: pointer;
            font-size: 16px;
        }
    }

    .ant-input {
        border-radius: 0px;
    }

    .ant-input-outlined {
        border: none;
        &:focus-within {
            box-shadow: none;
        }        
    }

    .col-chat-icon {
        display: flex;
        align-items: end;
        justify-content: end;
        padding-bottom: 8px; 
        background-color: #fff;        
        height: 74px;
    }

    .chat-icon {
        background-color: #fff;        
    }

    .upload-wrapper {        
        border-top: 1px solid #F0F0F0; 
        background-color: #fff;

        .ant-upload-list-item-container {
            width: 60px !important;
            height: 60px !important;
        }
    
        .ant-upload-select {
            display: none;
        }

        .ant-upload-wrapper {
            width: unset;
        }
    }

    textarea {
        cursor: text !important;
    }

`;

const HEIGHT_TOOL_BAR = 77;

const ChatInput = ({ onSendMessage, onShowBlockImage }) => {
    const currentConversation = useSelector(selectCurrentConverstation);
    const [upload, setUpload] = useState<string>();
    const [loadingFile, setLoadingFile] = useState<boolean>(false);
    const [fileList, setFileList] = useState<any>([]);
    const [valueTextMessage, setValueTextMessage] = useState<string>('');
    const [openSuggest, setOpenSuggest] = useState<boolean>(false);
    const refTextArea = useRef<any>(null);
    const refUpload = useRef<any>(null);
    const [previewImage, setPreviewImage] = useState<{ src: string, open: boolean }>({
        src: '',
        open: false
    });
    const { data: dataGetEnable, refetch } = useQuery(query_chatTplMessageEnableSuggest, {
        variables: {
            smeId: currentConversation?.smeId
        },
        fetchPolicy: 'no-cache'
    });

    const [getMessageSuggest, { data: dataMessageSuggest }] = useLazyQuery(query_chatTplMessageSuggest, {
        variables: {
            smeId: currentConversation?.smeId
        },
        fetchPolicy: 'no-cache'
    });

    useMemo(() => {
        setFileList([]);
        setOpenSuggest(false);
        setValueTextMessage('');
    }, [currentConversation]);

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            showAlert.error('Bạn chỉ có thể tải lên file có định dạng là JPG/PNG');
            return;
        };

        if (fileList?.length > 7) {
            showAlert.error('Bạn chỉ có thể tải lên tối đa 8 ảnh');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showAlert.error('Ảnh gửi lên tối đa 2MB');
            return;
        }

        let formData = new FormData();
        formData.append('type', 'file')
        formData.append('file', file, file.name || 'file.jpg');
        setLoadingFile(true);
        if (fileList?.length == 0) {
            onShowBlockImage(HEIGHT_TOOL_BAR);
        }
        fetch(process.env.REACT_APP_URL_FILE_UPLOAD as string, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: formData
        }).then(function (response) {
            return response.json()
        }).then(function (response) {
            if (response?.success) {
                setFileList(prev => prev.concat({
                    uid: response?.data?.id,
                    name: file.name,
                    status: 'done',
                    url: response?.data?.source
                }))
            } else {
                if (fileList?.length > 0) {
                    onShowBlockImage(-HEIGHT_TOOL_BAR);
                }
            }
        }).finally(() => {
            setLoadingFile(false);
        });
    };

    const onGetMessageSuggest = useCallback(debounce((value) => {
        getMessageSuggest({
            variables: {
                text: value,
                storeId: currentConversation?.conversationStoreId
            }
        }).then(({ data }) => {
            if (data?.chatTplMessageSuggest?.length > 0) {
                setOpenSuggest(true)
            } else {
                setOpenSuggest(false)
            }
        }).catch(() => {
            setOpenSuggest(false);
        })
    }, 500), [currentConversation]);

    return <ChatInputWrapper>
        <Modal
            open={previewImage?.open}
            title={'Chi tiết ảnh'}
            onCancel={() => setPreviewImage({ src: '', open: false })}
            centered
            footer={null}
        >
            <img alt="example" style={{ width: '100%' }} src={previewImage?.src} />
        </Modal>
        <Row className="toolbar-chat">
            <Tooltip placement="bottom" title={'Thêm ảnh'}>
                <FileImageOutlined className="icon" onClick={() => {
                    if (!hasPermissionAction(['customer_service_chat_action'])) {
                        return;
                    }
                    if (!refUpload.current) return;
                    refUpload.current.click();
                }} />
            </Tooltip>
        </Row>
        <Row>
            <Col span={22}>
                <AutoComplete
                    open={!!dataGetEnable?.chatTplMessageEnableSuggest && openSuggest && dataMessageSuggest?.chatTplMessageSuggest?.length > 0}
                    options={[...new Set(dataMessageSuggest?.chatTplMessageSuggest)]?.map(item => ({
                        value: item,
                        label: item
                    }))}
                    value={valueTextMessage}
                    maxLength={2000}
                    onSelect={(value) => {
                        setValueTextMessage(value);
                        setOpenSuggest(false)
                    }}
                    style={{ width: '100%' }}
                >
                    <Input.TextArea
                        value={valueTextMessage}
                        placeholder="Nhập tin nhắn"
                        onChange={e => {
                            setOpenSuggest(false);
                            setValueTextMessage(e.target.value)
                            onGetMessageSuggest(e.target.value);
                        }}
                        onFocus={() => { refetch() }}
                        autoSize={{ minRows: 3, maxRows: 3 }}
                        onPressEnter={(e: any) => {
                            const mess = e.target.value?.trim();
                            if (!hasPermissionAction(['customer_service_chat_action'])) {
                                return;
                            }
                            if (e.keyCode == 13 && e.shiftKey) return;
                            if ((mess || fileList?.length > 0) && !openSuggest) {
                                onSendMessage({
                                    message: valueTextMessage || '',
                                    medias: fileList?.map(file => ({
                                        media_url: file?.url,
                                        media_type: 'image',
                                        file_id: file?.uid,
                                    }))
                                });
                                if (fileList?.length > 0) {
                                    onShowBlockImage(-HEIGHT_TOOL_BAR);
                                }
                                setValueTextMessage("");
                                setFileList([]);
                            }
                        }}
                        onKeyDown={e => {
                            if (e.keyCode == 13 && !e.shiftKey) e.preventDefault()
                        }}
                    />
                </AutoComplete>
            </Col>
            <Col span={2} className="col-chat-icon">
                <Tooltip placement="top" title={'Gửi tin nhắn'} arrow={true}>
                    <SendOutlined
                        className="chat-icon"
                        style={{ fontSize: 20 }}
                        onClick={() => {
                            if (!hasPermissionAction(['customer_service_chat_action'])) {
                                return
                            }
                            if (valueTextMessage?.trim() || fileList?.length > 0) {
                                onSendMessage({
                                    message: valueTextMessage,
                                    medias: fileList?.map(file => ({
                                        media_url: file?.url,
                                        media_type: 'image',
                                        file_id: file?.uid,
                                    }))
                                });
                                if (fileList?.length > 0) {
                                    onShowBlockImage(-HEIGHT_TOOL_BAR);
                                }
                                setValueTextMessage("");
                                setFileList([]);
                            }
                        }}
                    />
                </Tooltip>
            </Col>
        </Row>
        <Flex wrap="wrap" align="center" className="upload-wrapper" style={{ padding: fileList?.length > 0 ? '8px 12px 8px' : '' }}>
            <Upload
                beforeUpload={beforeUpload}
                accept="image/png, image/jpeg"
                listType="picture-card"
                name="file"
                multiple={false}
                // maxCount={8}
                fileList={fileList}
                onRemove={value => {
                    if (fileList?.length == 1) onShowBlockImage(-HEIGHT_TOOL_BAR);

                    setFileList(prev => prev?.filter(item => item?.uid != value?.uid))
                }}
                onPreview={file => {
                    setPreviewImage(prev => ({
                        ...prev,
                        src: file?.url as string,
                        open: true
                    }))
                }}
            >
                <Button ref={refUpload} style={{ display: 'none' }}>Tải lên</Button>
            </Upload>
            {loadingFile && <Skeleton.Image active style={{ width: 60, height: 60, margin: fileList?.length > 0 ? '0px 12px 8px' : '8px 12px' }} />}
        </Flex>
    </ChatInputWrapper >
};

export default memo(ChatInput);