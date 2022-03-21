import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';

interface OrderGetAllQuery {
  offset: number;
  limit: number;
}

export async function orderGetAllHandler(req: Request, res: Response, next: NextFunction) {
  const query: OrderGetAllQuery = req.query;

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .skip(query.offset)
    .take(query.limit)
    .getMany();

  const notDeletedList = orderList.filter(order => !order.isDeleted);

  res.status(200).json(notDeletedList);
}
