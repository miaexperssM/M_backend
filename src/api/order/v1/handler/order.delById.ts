import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface OrderDelByIdParams {
  id: number;
}

export async function orderDelByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderDelByIdParams = req.params as any;

  const order = await getRepository(Order).findOne({ id: params.id });
  if (!order) return sendError(404, 'order not found', next);
  order.isDeleted = true
  await getRepository(Order).save(order);

  res.status(200).end();
}
