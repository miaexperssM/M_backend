import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import sendError from 'utils/error';
import { getConnection, getRepository } from 'typeorm';
import dayjs from 'dayjs';
import { Zone } from 'api/zone/zone.entity';

interface OrderGetByUpdatedAtParams {
  from: string;
  to: string;
}

export async function orderGetByUpdatedAtHandler(req: Request, res: Response, next: NextFunction) {
  const params: OrderGetByUpdatedAtParams = req.params as any;

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .take(10000)
    .getMany();

  const zoneList = await getConnection()
    .createQueryBuilder()
    .select('zone')
    .from(Zone, 'zone')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const startDate = dayjs(params.from);
  const endDate = dayjs(params.to);

  const result = orderList.filter(
    order => dayjs(order.updatedAt.valueOf()).isAfter(startDate) && dayjs(order.updatedAt.valueOf()).isBefore(endDate),
  );
  if (!result || result.length === 0) return sendError(404, 'order not found', next);

  const resultList = [];
  await Promise.resolve(
    result.map(async order => {
      let result: any = order;
      if (order.zoneId && order.zoneId !== 0) {
        const zone = zoneList.find(zone => zone.id === order.zoneId);
        result = {
          ...order,
          zone: zone ? { title: zone.title || undefined, description: zone.description || undefined } : undefined,
        };
        resultList.push(result);
      } else {
        const newOrder = {
          ...order,
          zoneId: -1,
          placeIdInGoogle: '',
        };
        await getRepository(Order).save(newOrder);
        resultList.push({ ...order, zone: undefined, placeId: '' });
      }
    }),
  );

  res.status(200).json(resultList);
}
