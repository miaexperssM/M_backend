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

  const maxLength = Math.min(query.limit || 100, 1000);

  const orderList = await getConnection()
    .createQueryBuilder()
    .select('order')
    .from(Order, 'order')
    .orderBy('id', 'DESC')
    .skip(query.offset)
    .take(maxLength)
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const zoneList = await getConnection()
    .createQueryBuilder()
    .select('zone')
    .from(Zone, 'zone')
    .where('isDeleted = :isDeleted', { isDeleted: false })
    .getMany();

  const resultList: any[] = [];

  console.log('orderList', orderList.length);

  await Promise.all(
    orderList.map(async order => {
      console.log('search order --- >>> ', order.id);
      if (order.zoneId && order.zoneId !== 0) {
        const zone = zoneList.find((zone)=>zone.id === order.zoneId)
        console.log("get zone", zone.id)
        resultList.push({ ...order, zone: zone || undefined });
      } else {
        const address = `${order.address}, ${order.comuna}, ${order.province}, ${order.region}, ${order.destinationCountry}`;
        const orderLoactionArray = await geoCodeing(address);
        if (orderLoactionArray.length !== 0) {
          const orderLoactionJson = orderLoactionArray[0];
          const zone = await findZoneByGooglePosition(orderLoactionJson, zoneList);
          if (zone) {
            const newOrder = {
              ...order,
              zoneId: zone.id,
              placeIdInGoogle: orderLoactionJson.place_id,
            };
            await getRepository(Order).save(newOrder);
            resultList.push({ ...order, zone, placeId: orderLoactionJson.place_id });
          } else {
            const newOrder = {
              ...order,
              zoneId: -1,
              placeIdInGoogle: orderLoactionJson.place_id,
            };
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

  console.log("return -> ", resultList.length)

  res.status(200).json(resultList);
}
