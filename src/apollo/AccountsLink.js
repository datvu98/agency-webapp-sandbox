import { setContext } from '@apollo/client/link/context';


export const accountHeaders = async (prevHeaders = {}) => {
  let jwt = localStorage.getItem('accessToken');  

  return {
    headers: {
      ...prevHeaders,
      ...(!!jwt
        ? { authorization: `Bearer ${jwt}` }        
        : {}),
    },
  };
};

export const asyncAuthLink = setContext(
  async (_, { headers }) => await accountHeaders(headers),
);
