import { Order } from 'api/order/order.entity';
import { Zone } from 'api/zone/zone.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { findZoneByGooglePosition } from 'utils/calculationHelper';
import { geoCodeing } from 'utils/googleService';

interface OrderGetAllQuery {
  offset: number;
  limit?: number;
}

export async function orderGetAllHandler(req: Request, res: Response, next: NextFunction) {
  const query: OrderGetAllQuery = req.query;

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .skip(query.offset)
    .take(Math.min(query.limit, 100))
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const resultList: any[] = [];

  await Promise.all(
    orderList.map(async order => {
      if (order.zoneId && order.zoneId !== 0) {
        const zone = await getRepository(Zone).findOne({ id: order.zoneId, isDeleted: false });
        resultList.push({ ...order, zone: zone || undefined });
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
              placeIdInGoogle: orderLoactionArray.place_id,
            };
            console.log('got', newOrder);
            await getRepository(Order).save(newOrder);
            resultList.push({ ...order, zone, placeId: orderLoactionJson.place_id });
          } else {
            const newOrder = {
              ...order,
              zoneId: -1,
              placeIdInGoogle: orderLoactionArray.place_id,
            };
            console.log('no got', newOrder);
            await getRepository(Order).save(newOrder);
            resultList.push({ ...order, zone: undefined, placeId: orderLoactionJson.place_id });
          }
        } else {
          console.log("haven't found location by Google");
          resultList.push({ ...order, zone: undefined, placeId: '' });
        }
      }
    }),
  );

  console.log('result -->> ', resultList);

  res.status(200).json(resultList);
}
