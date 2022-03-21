declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      permissions: string | string[] | string[][];
      iat: number;
      exp: number;
    };
  }
}
