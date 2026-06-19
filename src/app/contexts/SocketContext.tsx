/*
 * Created by duydatpham@gmail.com on 06/06/2023
 * Copyright (c) 2023 duydatpham@gmail.com
 */

import { useMutation } from "@apollo/client";
import { notification } from "antd";
import { useChatSliceSlice } from "app/pages/ChatPage/slice";
import messageAudio from 'assets/audio/message.mp3';
import mutate_chatNotificationRegisterDevice from "graphql/mutations/mutate_chatNotificationRegisterDevice";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { useDispatch } from "react-redux";
import { Socket, io } from "socket.io-client";
import refreshToken from "utils/refreshToken";

type ContextProps = {
    sendSocket: (topic: string, data: any) => void,
    setRefCurrentUserId: any,
    refCurrentUserId: string,
    optionsStore: any,
    currentSegmented: string,
    setCurrentSegmented: any,
    needReload: boolean, setNeedReload: any,
    currentTab: string, setCurrentTab: any
    refConversation: any,
};

const BASE_TITLE = "Tổng quan - Upbase";

export const SocketContext = React.createContext<Partial<ContextProps>>({});

export const SocketProvider = ({ children }: any) => {
    const dispatch = useDispatch()
    const { actions } = useChatSliceSlice()

    const accessToken = localStorage.getItem('accessToken');
    const audioPlayer = useRef(new Audio(messageAudio));
    const [refCurrentUserId, setRefCurrentUserId] = useState<string>('');
    const [needReload, setNeedReload] = useState<boolean>(false);
    const [currentSegmented, setCurrentSegmented] = useState<string>('customer');
    const [currentTab, setCurrentTab] = useState<string>('1');

    const _currentSocket = React.useRef<Socket>()
    const _sendSocket = useCallback((topic: string, data: any) => {
        _currentSocket.current?.emit(topic, data)
    }, [])

    const [chatNotificationRegisterDevice] = useMutation(mutate_chatNotificationRegisterDevice);
    const [_api, contextHolder] = notification.useNotification();
    const refCountNotificationBg = useRef<number>(0);
    const refConversation = useRef<any>();

    // One signal initialize
    React.useEffect(() => {
        OneSignal.init({
            appId: process.env.REACT_APP_ONESIGNAL_APP_ID as string,
            allowLocalhostAsSecureOrigin: true,
            // promptOptions: {
            //     enabled: true
            // },
            autoResubscribe: true,
            autoRegister: false,
            serviceWorkerParam: {
                scope: '/push/onesignal/'
            },
            serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
            notifyButton: {
                enable: true,
            },
        })

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refCountNotificationBg.current = 0;
                document.title = BASE_TITLE;
            }
        };

        // Đăng ký các sự kiện khi tab mất và lấy focus
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            OneSignal.Notifications.removeEventListener('foregroundWillDisplay', () => { });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }, []);

    // One signal check app forcus -> Mute sound & not replace 
    useEffect(() => {
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (data) => {
            console.log(data);
            refCountNotificationBg.current += 1;
            if (document.hidden) {
                // OneSignal.User.PushSubscription.optIn();
                document.title = `Có ${refCountNotificationBg.current} tin nhắn mới - Upbase`;
                audioPlayer.current.play()
                    .then(() => {
                    })
                    .catch(error => {
                        console.log(`[Play audio message error]: `, error);
                    });
            } else {
                // OneSignal.User.PushSubscription.optOut();
            }
        });

        OneSignal.Notifications.addEventListener("click", (e: any) => {
            e.preventDefault();
            console.log(`<<<<<< Notification click >>>>>>>`, e);
        });
    }, [OneSignal, audioPlayer?.current]);

    // One Signal register subscription
    React.useMemo(async () => {
        const deviceId = OneSignal.User?.PushSubscription?.id;

        if (deviceId) {
            await chatNotificationRegisterDevice({
                variables: {
                    deviceId
                }
            })
        }
        console.log(`[CHECK SUBCRIPTION ID]: `, deviceId)
    }, [OneSignal.User?.PushSubscription?.id]);


    // Connect & listen event socket, re-connecting socket when accessToken changed
    React.useEffect(() => {
        _currentSocket.current = io(process.env.REACT_APP_CHATTING_SOCKET_URL || '', {
            extraHeaders: {
                'authorization': `Bearer ${accessToken}`
            },
            reconnection: true
        });
        _currentSocket.current.on('connect', function () {
            console.log(`<<<<<<< CONNECTING SOCKET >>>>>>`);

        });
        _currentSocket.current.on('message', async function (data) {
            console.log(`<<<<<<< SOCKET EVENT >>>>>>`, data);
            try {
                if (data.event == "NEW_MESSAGE") {
                    const payloadConversation = {
                        ...data?.data?.conversation,
                        isSort: true,
                        cb: () => {
                            refConversation.current?.scrollTo({
                                index: 0,
                                behavior: 'smooth',
                            });
                        }
                    };

                    dispatch(actions.appendMessage([data.data]))
                    dispatch(actions.updateConversation(payloadConversation));
                    dispatch(actions.updateCurrentConversation(data?.data?.conversation));
                }

                if (data.event == "UPDATE_MESSAGE") {
                    dispatch(actions.updateMessage([data?.data]));
                    dispatch(actions.updateConversation(data?.data?.conversation));
                    dispatch(actions.updateCurrentConversation(data?.data?.conversation));
                }

                if (data.event == "NEW_CONVERASTION") {
                    dispatch(actions.appendConversation(data.data));
                }

                if (data.event == "CONVERASTION_CHANGE_INFO") {
                    dispatch(actions.markReadConversation(data?.data))
                    dispatch(actions.updateConversation(data.data));
                    dispatch(actions.updateCurrentConversation(data.data));
                }
            } catch (error) {
                console.log({ error })
            }
        });
        _currentSocket.current.on('exception', function (data) {
            console.log('event', data);
        });
        _currentSocket.current.on('disconnect', async function (err) {
            console.log('<<<<<<<<< SOCKET DISCONNECT >>>>>>>', err);
            await refreshToken();
        });
        _currentSocket.current.on('error', async function (err) {
            console.log('<<<<<<<<< SOCKET ERROR >>>>>>>', err);
            await refreshToken();
        });

        return () => {
            if (!!_currentSocket.current && _currentSocket.current.connected) {
                _currentSocket.current.disconnect()

                _currentSocket.current = undefined;

            }
        }

    }, [accessToken])

    useEffect(() => {
        if (!!accessToken) {
            _sendSocket('identity', 1)
        }
    }, [accessToken])

    const value = useMemo(() => {
        return {
            sendSocket: _sendSocket,
            setRefCurrentUserId,
            refCurrentUserId,
            currentSegmented, setCurrentSegmented,
            needReload, setNeedReload,
            currentTab, setCurrentTab,
            refConversation
        }
    }, [refCurrentUserId, needReload, currentSegmented, currentTab, refConversation]);

    return (
        <SocketContext.Provider value={value}>
            {contextHolder}
            <audio id="audio-message" ref={audioPlayer} src={messageAudio} />
            {children}
        </SocketContext.Provider>
    );
};
