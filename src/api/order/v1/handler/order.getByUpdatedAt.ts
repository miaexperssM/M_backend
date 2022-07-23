import { Order } from 'api/order/order.entity';
import { NextFunction, Request, Response } from 'express';
import sendError from 'utils/error';
import { getConnection, getRepository } from 'typeorm';
import dayjs from 'dayjs';
import { geoCodeing } from 'utils/googleService';
import { Zone } from 'api/zone/zone.entity';
import { findZoneByGooglePosition } from 'utils/calculationHelper';

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
    .getMany();

  const startDate = dayjs(params.from);
  const endDate = dayjs(params.to);

  const result = orderList.filter(
    order => dayjs(order.updatedAt.valueOf()).isAfter(startDate) && dayjs(order.updatedAt.valueOf()).isBefore(endDate),
  );
  if (!result || result.length === 0) return sendError(404, 'order not found', next);

  const resultList = [];
  await Promise.all(
    result.map(async order => {
      let result: any = order;
      if (order.zoneId && order.zoneId !== 0) {
        const zone = await getRepository(Zone).findOne({ id: order.zoneId, isDeleted: false });
        result = { ...order, zone: zone || undefined };
      } else {
        const address = `${order.address}, ${order.comuna}, ${order.province}, ${order.region}, ${order.destinationCountry}`;
        const orderLoactionArray = await geoCodeing(address);

        if (orderLoactionArray.length !== 0) {
          const orderLoactionJson = orderLoactionArray[0];
          const zone = await findZoneByGooglePosition(orderLoactionJson);
          if (zone) {
            const newOrder = {
              ...order,
              zoneId: zone.id,
              placeIdInGoogle: orderLoactionJson.place_id,
            };
            console.log('got', newOrder);
            await getRepository(Order).save(newOrder);
            result = { ...order, zone, placeId: orderLoactionJson.place_id };
          } else {
            const newOrder = {
              ...order,
              zoneId: -1,
              placeIdInGoogle: orderLoactionJson.place_id,
            };
            console.log('no got', newOrder);
            await getRepository(Order).save(newOrder);
            result = { ...order, zone: undefined, placeId: orderLoactionJson.place_id };
          }
        } else {
          console.log("haven't found location by Google");
          result = { ...order, zone: undefined, placeId: "" };
        }
      }
      resultList.push(result);
    }),
  );

  res.status(200).json(resultList);
}
