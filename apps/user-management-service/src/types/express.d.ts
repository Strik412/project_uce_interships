declare namespace Express {
  export interface Request {
    user?: {
      sub?: string;
      userId?: string;
      email?: string;
      roles?: string[];
      [key: string]: any;
    };
  }
}
