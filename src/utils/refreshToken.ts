import client from "apollo";
import mutate_agencyRefreshToken from "graphql/mutations/mutate_agencyRefreshToken";

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!!refreshToken) {
      window.localStorage.removeItem('accessToken');
      const { data } = await client.mutate({
        mutation: mutate_agencyRefreshToken,
        variables: {
          token: refreshToken
        }
      });

      if (!!data?.agencyRefreshToken?.success) {
        localStorage.setItem('refresh_token', data?.agencyRefreshToken?.refreshToken);
        localStorage.setItem('accessToken', data?.agencyRefreshToken?.accessToken)
        return;
      }
    }


    if (!refreshToken) {
      return;
    }
  } catch (error) {
    return;
  }
}

export default refreshToken;