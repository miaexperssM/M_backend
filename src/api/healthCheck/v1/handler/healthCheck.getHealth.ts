import { NextFunction, Request, Response } from 'express';

export async function getHealthCheckHandler(req: Request, res: Response, next: NextFunction) {
  const healthCheck = {
    healthStatus: "healthy"
  }
  res.status(200).json(healthCheck);
}
