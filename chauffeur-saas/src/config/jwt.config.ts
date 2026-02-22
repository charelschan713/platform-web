export const jwtConfig = {
  accessToken: {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  },
  refreshToken: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
