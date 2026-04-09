import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      traceId: string;
    }
  }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = uuidv4();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
}
