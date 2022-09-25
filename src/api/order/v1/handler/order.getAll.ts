import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';

interface OrderGetAllQuery {
  offset: number;
  limit?: number;
}

export async function orderGetAllHandler(req: Request, res: Response, next: NextFunction) {
  const query: OrderGetAllQuery = req.query;

  const offset = query.offset || 0;

  const maxLength = Math.min(query.limit || 100, 5000);

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .skip(offset)
    .take(maxLength)
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const zoneList = await getConnection()
    .createQueryBuilder()
    .select('zone')
    .from(Zone, 'zone')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const resultList = [];

  await Promise.resolve(
    orderList.map(async order => {
      if (order.zoneId && order.zoneId !== 0) {
        const zone = zoneList.find(zone => zone.id === order.zoneId);
        resultList.push({ ...order, zone: zone ? { title: zone.title, description: zone.description } : undefined });
      } else {
        console.log("haven't found zone");
        resultList.push({ ...order, zone: undefined, placeId: '' });
      }
    }),
  );

  res.status(200).json(resultList);
}
