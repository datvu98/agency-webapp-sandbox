import { showAlert } from "utils/helper";
import refreshToken from "utils/refreshToken";

export default function setupAxios(axios) {
  axios.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (err) => Promise.reject(err),
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log(error, "Axios");
      const originalRequest = error.config;

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isAuthError(error)) {
        originalRequest._retry = true;

        try {
          await refreshToken();

          const newAccessToken = localStorage.getItem("accessToken");
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          showAlert.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
}

function isAuthError(error: any): boolean {
  const status = error?.response?.status || error?.response?.data?.statusCode;
  const message = (
    error?.response?.data?.message ||
    error?.message ||
    ""
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes("unauthorized") ||
    message.includes("authentication hook unauthorized this request")
  );
}
