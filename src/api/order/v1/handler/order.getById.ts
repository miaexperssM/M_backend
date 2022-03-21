import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderGetByIdParams {
  id: number;
}

export async function orderGetByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderGetByIdParams = req.params as any;

  const order = await getRepository(Order).findOne({ id: params.id, isDeleted: false });
  if (!order) return sendError(404, 'order not found', next);

  res.status(200).json(order);
}
