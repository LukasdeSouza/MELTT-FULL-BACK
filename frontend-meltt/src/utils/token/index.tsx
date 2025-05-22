export const setToken = (token: string) => {
  localStorage.setItem("@meltt-user-token", token);
};

export const getToken = () => {
  const token = localStorage.getItem("@meltt-user-token");
  if (token) {
    return token;
  } else {
    return null;
  }
};

export const removeAllTokens = () => {
  localStorage.removeItem("@meltt-user-token");
  localStorage.removeItem("bling-access-token");
  localStorage.removeItem("bling-refresh-token");
}


export const setBlingAccessToken = (token: string) => {
  localStorage.setItem("bling-access-token", token);
};

export const getBlingAccessToken = () => {
  const access_token = localStorage.getItem("bling-access-token");
  if (access_token) {
    return access_token;
  } else {
    return null;
  }
};

export const setBlingRefreshToken = (token: string) => {
  localStorage.setItem("bling-refresh-token", token);
};
