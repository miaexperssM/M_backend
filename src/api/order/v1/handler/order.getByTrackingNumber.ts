import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderGetByTrackingNumberParams {
  trackingNumber: string;
}

export async function orderGetByTrackingNumberHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderGetByTrackingNumberParams = req.params as any;

  const order = await getRepository(Order).findOne({ trackingNumber: params.trackingNumber, isDeleted: false });
  if (!order) return sendError(404, 'order not found', next);

  res.status(200).json(order);
}
