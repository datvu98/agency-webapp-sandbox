/**
 * index.tsx
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import posthog from 'posthog-js';
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react';

import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
global.Buffer = global.Buffer || require('buffer').Buffer
import axios from "axios";
import setupAxios from 'setupAxios';

// Use consistent styling
import 'sanitize.css/sanitize.css';
import 'nprogress/nprogress.css';
// import 'react-chat-elements/dist/main.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Import root app
import { App } from 'app';
import { ConfigProvider } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { PersistGate } from 'redux-persist/integration/react'
import { configureAppStore } from 'store/configureStore';

import reportWebVitals from 'reportWebVitals';

// Initialize languages
import './locales/i18n';
import locale from 'antd/lib/locale/vi_VN';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import client from 'apollo';
import dayjs from 'dayjs';
require('dayjs/locale/vi');

moment.locale("vi");
moment.updateLocale('vi', {
  monthsShort: 'Tháng 1_Tháng 2_Tháng 3_Tháng 4_Tháng 5_Tháng 6_Tháng 7_Tháng 8_Tháng 9_Tháng 10_Tháng 11_Tháng 12'.split('_'),
  weekdaysShort: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  weekdays: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  weekdaysMin: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
});
dayjs.locale("vi");

posthog.init(process.env.REACT_APP_POSTHOG_TOKEN as string, {
  api_host: process.env.REACT_APP_POSTHOG_HOST,
  defaults: '2026-01-30',
});

if (process.env.NODE_ENV === "production") {
  console.log = function no_console() { };
}

const store = configureAppStore().store;
setupAxios(axios);
// const persistor = configureAppStore().persistor;
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

console.log(`THIEN CHECKED`)

root.render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary>
      <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}> */}
        <ApolloProvider client={client}>
          <HelmetProvider>
            <ConfigProvider
              locale={locale}
              theme={{
                token: {
                  colorPrimary: '#ff5629',
                }
              }}
            >
              <App />
              <ToastContainer
                position="top-right"
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </ConfigProvider>
          </HelmetProvider>
        </ApolloProvider>
        {/* </PersistGate> */}
      </Provider>
    </PostHogErrorBoundary>
  </PostHogProvider>
);

// Hot reloadable translation json files
if (module.hot) {
  module.hot.accept(['./locales/i18n'], () => {
    // No need to render the App again because i18next works with the hooks
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
