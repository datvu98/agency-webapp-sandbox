/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'antd/dist/reset.css';

import { GlobalStyle } from 'styles/global-styles';

import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { useTranslation } from 'react-i18next';
import Login from './pages/LoginPage';
import { useDispatch, useSelector } from 'react-redux';
import { selectGlobalSlice } from './slice/selectors';
import LoadingIndicator from './components/LoadingIndicator';
import { useGlobalSliceSlice } from './slice';
import AuthenRoute from './components/AuthenRoute';
import MainLayout from './pages/MainLayout';
import io, { Socket } from "socket.io-client";
// import RedirectPage from './pages/Authentication/RedirectPage';
import RedirectRoute from './components/RedirectRoute';
import { Flex, Spin } from 'antd';
import ReloginPage from './pages/Authentication/ReloginPage';
import ErrorPage from './pages/Authentication/ErrorPage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import SetPassword from './pages/ForgotPassword/SetPassword';

// const OneSignal = (window as any).OneSignal;

export function App() {
  const { i18n } = useTranslation();
  const { actions } = useGlobalSliceSlice()
  const dispatch = useDispatch()
  const { inited } = useSelector(selectGlobalSlice)

  React.useEffect(() => {
    dispatch(actions.saveUser({
      user: !!localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : {}
    }));
    dispatch(actions.saveToken({
      token: localStorage.getItem('accessToken'),
      email: localStorage.getItem('email'),
    }))
  }, [])


  if (!inited) {
    return <Flex justify='center' align='center' style={{ width: '100vw', height: '100vh' }} >
      <Spin size="large" />
    </Flex>
  }

  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="%s -  UpS"
        defaultTitle=" UpS"
        htmlAttributes={{ lang: i18n.language }}
      >
        <meta name="description" content=" UpS" />
      </Helmet>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/change-password" element={<SetPassword />} />
        <Route path={'/error/500'} element={<ErrorPage />} />
        <Route
          path="/*"
          element={
            <AuthenRoute>
              <MainLayout />
            </AuthenRoute>
          }
        />
      </Routes>
      <GlobalStyle />
    </BrowserRouter>
  );
}
