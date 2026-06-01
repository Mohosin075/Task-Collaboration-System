import jwt, { Secret } from 'jsonwebtoken';

const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
) => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret);
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
