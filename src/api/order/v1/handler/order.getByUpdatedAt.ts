import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';
import { getConnection } from 'typeorm';

interface OrderGetByUpdatedAtParams {
  updatedAt: string;
}

export async function orderGetByUpdatedAtHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderGetByUpdatedAtParams = req.params as any;

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .getMany();

  const timeArray = params.updatedAt.split('-');
  const date = timeArray[0];
  const month = timeArray[1];
  const year = timeArray[2];

  console.log('test', timeArray);
  console.log('BASE date', orderList[0].updatedAt.getDate());
  console.log('BASE month', orderList[0].updatedAt.getMonth());
  console.log('BASE year', orderList[0].updatedAt.getFullYear());

  const result = orderList.filter(
    order =>
      order.updatedAt.getDate() === parseInt(date) &&
      order.updatedAt.getMonth() + 1 === parseInt(month) &&
      order.updatedAt.getFullYear() === parseInt(year),
  );

  if (!result) return sendError(404, 'order not found', next);

  res.status(200).json(result);
}
