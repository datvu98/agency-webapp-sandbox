import { useMutation, useQuery } from '@apollo/client';
import { Flex, Spin } from 'antd';
import client from 'apollo';
import { useGlobalSliceSlice } from 'app/slice';

import mutateAuthSSO from 'graphql/mutations/mutate_authSSO';
import query_user from 'graphql/queries/query_user';
import NProgress from 'nprogress';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../../../../firebase';

const RedirectPage = () => {
    // const navigate = useNavigate();
    // const dispatch = useDispatch();
    // const [searchParams] = useSearchParams();
    // const { actions } = useGlobalSliceSlice();
    // const [mutationAuthen] = useMutation(mutateAuthSSO);

    // const onLogin = async (token) => {
    //     try {
    //         localStorage.setItem('accessToken', token);
    //         dispatch(actions.saveToken({
    //             token: token,
    //             email: localStorage.getItem('email'),
    //         }))

    //         const { data } = await client.query({
    //             query: query_user
    //         });

    //         if (!!data?.userMe) {
    //             localStorage.setItem('user', JSON.stringify(data?.userMe));
    //             dispatch(actions.saveUser({
    //                 user: data?.userMe
    //             }))
    //         };
    //         NProgress.done();
    //         navigate('/');
    //     } catch (error) {
    //         NProgress.done();
    //         navigate('/error/500');
    //     }
    // }

    // useMemo(async () => {
    //     try {
    //         NProgress.start();
    //         const [uid, token, isSubUser, refreshToken, customToken] = [searchParams.get('uid'), searchParams.get('token'), searchParams.get('isSubUser'), searchParams.get('refreshToken'), searchParams.get('customToken')] as string[];

    //         console.log({ uid, token, isSubUser, customToken })

    //         if (!!customToken && isSubUser != "true") {
    //             localStorage.removeItem('refresh_token');
    //             await auth.signInWithCustomToken(customToken).then(async (data: any) => {
    //                 if (!!data?.user) {
    //                     try {
    //                         let idToken = await data?.user?.getIdToken(true)
    //                         console.log({ uid: data?.user?.uid, idToken })

    //                         let res = await mutationAuthen({
    //                             variables: {
    //                                 firebase_id: data?.user?.uid,
    //                                 idToken,
    //                                 provider: data?.user?.providerData[0].providerId
    //                             }
    //                         })

    //                         if (!!res.data?.authSSO?.user_id) {
    //                             let newIdToken = await data?.user?.getIdToken(true);
    //                             onLogin(newIdToken);
    //                         } else {
    //                             NProgress.done();
    //                             navigate('/error/500');
    //                         }
    //                     } catch (error) {
    //                         auth.signOut();
    //                         NProgress.done();
    //                         navigate('/error/500');
    //                     }
    //                 } else {
    //                     NProgress.done();
    //                     navigate('/error/500');
    //                 }
    //             })
    //         } else {
    //             localStorage.setItem('refresh_token', refreshToken);
    //             onLogin(token);
    //         }
    //     } catch (error) {
    //         NProgress.done();
    //     }
    // }, [searchParams]);

    // return (
    //     <Flex align='center' justify='center' style={{ height: '100vh', width: '100vw' }}>
    //         <Spin size="large" />
    //     </Flex>
    // )
};

export default RedirectPage